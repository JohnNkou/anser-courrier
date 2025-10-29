<?php 
	/**
	 * 
	 */

	class Anser_GravityView extends \GV\Shortcodes\gravityview
	{

		public $name = 'anser_gravityview';
		public static $current_view;
		public static $callstack = array();

		public static function shortcode($passed_atts, $content = null){
			$request = gravityview()->request;error_log("Request ".json_encode($request));
			error_log("Request class ".get_class($request));
			$shortcode = new Anser_GravityView();

			if ( $request->is_admin() ) {
				return '';
			}

			if(isset($passed_atts['filters'])){
				$passed_atts['filters'] = explode(",", $passed_atts['filters']);
			}

			error_log("Passed attrs ".json_encode($passed_atts));
			$atts = wp_parse_args(
				$passed_atts,
				array(
					'id'      => 0,
					'view_id' => 0,
					'detail'  => null,
					'class'   => '',
				)
			);
			error_log("Attrs ".json_encode($atts));

			if ( ! $view_id = $atts['id'] ? : $atts['view_id'] ) {
				if ( $atts['detail'] && $view = $request->is_view() ) {
					$view_id = $view->ID;
				}
			}

			$atts['view_id'] = $view_id;
			$view            = $shortcode->get_view_by_atts( $atts );

			if ( is_wp_error( $view ) ) {
				return $shortcode->handle_error( $view );
			}

			if ( ! $view ) {
				gravityview()->log->error( 'View does not exist #{view_id}', array( 'view_id' => $view_id ) );
				return '';
			}

			/*
			@TODO: implement infinite loop check
			 * @see https://github.com/GravityKit/GravityView/pull/1911#commits-pushed-343168f
			 *
			 *
			 *  static $rendered_views = [];
			 *  // Prevent infinite loops
			 *  if ( in_array( $view_id, $rendered_views, true ) ) {
			 *      gravityview()->log->error( 'Infinite loop detected: View #{view_id} is being rendered inside itself.', array( 'view_id' => $view_id ) );
			 *      $title = sprintf( __( 'Error: The View #%d is being rendered inside itself.', 'gk-gravityview' ), $view_id );
			 *      $message = strtr(
			 *      // translators: Do not translate [shortcode], [link], or [/link]; they are placeholders for HTML and links to documentation.
			 *          esc_html__( 'This error occurs when a [shortcode] shortcode is embedded inside a Custom Content field. [link]Learn more about this error.[/link]', 'gk-gravityview' ),
			 *          [
			 *              '[shortcode]' => '<code>[gravityview]</code>',
			 *              '[link]'      => '<a href="https://docs.gravitykit.com/article/960-infinite-loop" target="_blank">',
			 *              '[/link]'     => '<span class="screen-reader-text"> ' . esc_html__( 'This link opens in a new window.', 'gk-gravityview' ) . '</span></a>',
			 *          ]
			 *      );
			 *      $message .= ' ' . esc_html__( 'You can only see this message because you are able to edit this View.', 'gk-gravityview' );
			 *      return \GVCommon::generate_notice( '<h3>' . $title . '</h3>' . wpautop( $message ), 'notice' );
			 *  }
			 *
			 * $rendered_views[] = $view_id;
			 */

			$post = get_post( $view->ID );

			$gv_view_data = \GravityView_View_Data::getInstance();

			if ( ! $gv_view_data->views->contains( $view->ID ) ) {
				$gv_view_data->views->add( $view );
			}

			/**
			 * Runs before the GV shortcode is processed; can be used to load additional scripts/styles.
			 *
			 * @since  2.13.4
			 *
			 * @param \GV\View $view GV View
			 * @param \WP_Post $post Associated WP post
			 */
			do_action( 'gravityview/shortcode/before-processing', $view, $post );

			$shortcode::$current_view = $view;
			gravityview()->views->set( $view );

			/**
			 * When this shortcode is embedded inside a View we can only display it as a directory. There's no other way.
			 * Try to detect that we're not embedded to allow edit and single contexts.
			 */
			$is_reembedded = false; // Assume not embedded unless detected otherwise.
			if ( in_array( get_class( $request ), array( 'GV\Frontend_Request', 'GV\Mock_Request' ) ) ) {

				if ( ( $_view = $request->is_view() ) && $_view->ID !== $view->ID ) {
					$is_reembedded = true;

				} elseif ( $request->is_entry( $view->form ? $view->form->ID : 0 ) && self::$callstack ) {
					$is_reembedded = true;
				}
			}
			error_log("Request is reembedded ".$is_reembedded);
			array_push( self::$callstack, true );
			/**
			 * Remove Widgets on a nested embedded View.
			 */
			if ( $is_reembedded ) {
				$view->widgets = new \GV\Widget_Collection();
			}

			/* Custom

			Editied because of call to private function 
			$atts = $shortcode->_parse_and_sanitize_atts( $atts );
			error_log("Sanitized atts ".json_encode($atts));

			*/
			/**
			 * Assign all `shortcode_atts` settings to the View so they can be used by layouts and extensions.
			 * @used-by GV_Extension_DataTables_Data::get_datatables_script_configuration()
			 */
			$view->settings->update( array( 'shortcode_atts' => $atts ) );
			$view->settings->update( $atts );

			/**
			 * Check permissions.
			 */
			while ( $error = $view->can_render( array( 'shortcode' ), $request ) ) {
				if ( ! is_wp_error( $error ) ) {
					break;
				}
				error_log("HAS ERROR ".json_encode($error));
				switch ( str_replace( 'gravityview/', '', $error->get_error_code() ) ) {
					case 'post_password_required':
						return self::_return( get_the_password_form( $view->ID ) );
					case 'no_form_attached':
						/**
						 * This View has no data source. There's nothing to show really.
						 * ...apart from a nice message if the user can do anything about it.
						 */
						if ( \GVCommon::has_cap( array( 'edit_gravityviews', 'edit_gravityview' ), $view->ID ) ) {
							return self::_return( sprintf( __( 'This View is not configured properly. Start by <a href="%s">selecting a form</a>.', 'gk-gravityview' ), esc_url( get_edit_post_link( $view->ID, false ) ) ) );
						}
						break;
					case 'in_trash':

						if ( ! current_user_can( 'delete_post', $view->ID ) ) {
							return self::_return( '' ); // Do not give a hint that this content exists, for security purposes.
						}

						/** @see WP_Posts_List_Table::handle_row_actions() Grabbed the link generation from there. */
						$untrash_link = wp_nonce_url( admin_url( sprintf( 'post.php?post=%d&amp;action=untrash', $view->ID ) ), 'untrash-post_' . $view->ID );

						// Translators: The first %s is the beginning of the HTML. The second %s is the end of the HTML.
						$notice = sprintf(
							__( 'This View is in the Trash. %sClick to restore the View%s.', 'gk-gravityview' ),
							sprintf(
								'<a href="%s" onclick="return confirm(\'%s\');">',
								esc_url( $untrash_link ),
								esc_js( __( 'Are you sure you want to restore this View? It will immediately be removed from the trash and set to draft status.', 'gk-gravityview' ) )
							),
							'</a>'
						);

						return self::_return( \GVCommon::generate_notice( '<p>' . $notice . '</p>', 'notice', array( 'delete_post' ), $view->ID ) );
					case 'no_direct_access':
					case 'embed_only':
					case 'not_public':
					default:
						return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
				}
			}

			$is_admin_and_can_view = $view->settings->get( 'admin_show_all_statuses' ) && \GVCommon::has_cap( 'gravityview_moderate_entries', $view->ID );

			/**
			 * View details.
			 */
			if ( $atts['detail'] ) { error_log("Returning after details");
				$entries = $view->get_entries( $request );
				return self::_return( $shortcode->detail( $view, $entries, $atts ) );

				/**
				 * Editing a single entry.
				 */
			} elseif ( ! $is_reembedded && ( $entry = $request->is_edit_entry( $view->form ? $view->form->ID : 0 ) ) ) {error_log("Editing an entry");

				/**
				 * When editing an entry don't render multiple views.
				 */
				if ( ( $selected = \GV\Utils::_GET( 'gvid' ) ) && $view->ID != $selected ) {
					gravityview()->log->notice(
						'Entry ID #{entry_id} not rendered because another View ID was passed using `?gvid`: #{selected}',
						array(
							'entry_id' => $entry->ID,
							'selected' => $selected,
						)
					);
					return self::_return( '' );
				}

				if ( 'active' != $entry['status'] ) {
					gravityview()->log->notice( 'Entry ID #{entry_id} is not active', array( 'entry_id' => $entry->ID ) );
					return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
				}

				if ( apply_filters( 'gravityview_custom_entry_slug', false ) && $entry->slug != get_query_var( \GV\Entry::get_endpoint_name() ) ) {
					gravityview()->log->error( 'Entry ID #{entry_id} was accessed by a bad slug', array( 'entry_id' => $entry->ID ) );
					return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
				}

				if ( $view->settings->get( 'show_only_approved' ) && ! $is_admin_and_can_view ) {
					if ( ! \GravityView_Entry_Approval_Status::is_approved( gform_get_meta( $entry->ID, \GravityView_Entry_Approval::meta_key ) ) ) {
						gravityview()->log->error( 'Entry ID #{entry_id} is not approved for viewing', array( 'entry_id' => $entry->ID ) );
						return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
					}
				}

				$renderer = new \GV\Edit_Entry_Renderer();
				return self::_return( $renderer->render( $entry, $view, $request ) );

				/**
				 * Viewing a single entry.
				 */
			} elseif ( ! $is_reembedded && ( $entry = $request->is_entry( $view->form ? $view->form->ID : 0 ) ) ) { error_log("Viewing a single entry");
				/**
				 * When viewing an entry don't render multiple views.
				 */
				if ( ( $selected = \GV\Utils::_GET( 'gvid' ) ) && $view->ID != $selected ) {
					return self::_return( '' );
				}

				$entryset = $entry->is_multi() ? $entry->entries : array( $entry );
				error_log("Entry to view is ".json_encode($entry));
				error_log("Entry class ".get_class($entry));
				error_log("Entryset is ".json_encode($entryset));
				foreach ( $entryset as $e ) {
					if ( 'active' != $e['status'] ) {
						gravityview()->log->notice( 'Entry ID #{entry_id} is not active', array( 'entry_id' => $e->ID ) );
						return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
					}

					if ( apply_filters( 'gravityview_custom_entry_slug', false ) && $e->slug != get_query_var( \GV\Entry::get_endpoint_name() ) ) {
						gravityview()->log->error( 'Entry ID #{entry_id} was accessed by a bad slug', array( 'entry_id' => $e->ID ) );
						return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
					}

					if ( $view->settings->get( 'show_only_approved' ) && ! $is_admin_and_can_view ) {
						if ( ! \GravityView_Entry_Approval_Status::is_approved( gform_get_meta( $e->ID, \GravityView_Entry_Approval::meta_key ) ) ) {
							gravityview()->log->error( 'Entry ID #{entry_id} is not approved for viewing', array( 'entry_id' => $e->ID ) );
							return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
						}
					}

					$error = \GVCommon::check_entry_display( $e->as_entry(), $view );

					if ( is_wp_error( $error ) ) {
						gravityview()->log->error(
							'Entry ID #{entry_id} is not approved for viewing: {message}',
							array(
								'entry_id' => $e->ID,
								'message'  => $error->get_error_message(),
							)
						);
						return self::_return( __( 'You are not allowed to view this content.', 'gk-gravityview' ) );
					}
				}

				$renderer = new \GV\Entry_Renderer();
				return self::_return( $renderer->render( $entry, $view, $request ) );

				/**
				 * Just this view.
				 */
			} else {error_log("Other kind of entry");
				/**
				 * When viewing a specific View don't render the other Views.
				 */
				$selected_view = (int) \GV\Utils::_GET( 'gvid',0 );
				if ( $selected_view && (int) $view->ID !== $selected_view ) {
					return self::_return( '' );
				}

				if ( $is_reembedded ) {

					// Mock the request with the actual View, not the global one
					$mock_request                           = new \GV\Mock_Request();
					$mock_request->returns['is_view']       = $view;
					$mock_request->returns['is_entry']      = $request->is_entry( $view->form ? $view->form->ID : 0 );
					$mock_request->returns['is_edit_entry'] = $request->is_edit_entry( $view->form ? $view->form->ID : 0 );
					$mock_request->returns['is_search']     = $request->is_search();

					$request = $mock_request;
				}
				error_log("Choose laned ");
				$renderer = new ANSER\GV\View_Renderer();
				return $renderer->render( $view, $request );
			}
		}
	}


?>