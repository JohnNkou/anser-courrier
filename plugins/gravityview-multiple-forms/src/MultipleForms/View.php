<?php

namespace GravityKit\MultipleForms;

use GravityKit\MultipleForms\Models\Join;
use GravityKit\MultipleForms\Query\Sort;
use WP_Post;

/**
 * Class Form
 *
 * @since 0.3
 *
 * @package GravityKit\MultipleForms
 */
class View extends AbstractSingleton {
	/**
	 * Where the view joins are stored in the Meta table.
	 *
	 * @since 0.3
	 *
	 * @var string
	 */
	public const KEY_FORM_JOINS = '_gravityview_form_joins';

	/**
	 * Joins Forms that were already fetch from the DB.
	 *
	 * @since 0.3
	 *
	 * @var array
	 */
	public static $join_forms_cache = [];

	/**
	 * Joins Data that were already fetch from the DB.
	 *
	 * @since 0.3
	 *
	 * @var array
	 */
	public static $join_data_cache = [];

	/**
	 * A cache with the original IDs to return after changing the label.
	 *
	 * @since 0.4.0
	 *
	 * @var array{string|int,string|int}
	 */
	private static $original_ids = [];

	/**
	 * Registering happens after the singleton instance has been set up, which is after the extension was confirmed to have
	 * its requirements met and after `plugins_loaded@P20`
	 *
	 * @since 0.3
	 *
	 * @return void
	 */
	protected function register(): void {
		add_filter(
			'gk/gravityview/view/entries/query/sorting-parameters',
			[ self::class, 'update_sorting_parameters' ]
		);

		add_filter(
			'gravityview/template/field/label',
			[ self::class, 'update_field_id' ],
			90, // Below 100 that `add_columns_sort_links` uses.
			2
		);

		add_filter(
			'gravityview/template/field/label',
			[ self::class, 'reset_field_id' ],
			110, // After 100 that `add_columns_sort_links` uses.
			2
		);
	}

	/**
	 * Get the Join Data directly from the View Meta.w
	 *
	 * @since 0.3
	 *
	 * @param WP_Post $post
	 *
	 * @return array<Join|\WP_Error>
	 */
	public static function get_join_data( WP_Post $post ): array {
		// We found cache.
		if ( isset( static::$join_data_cache[ $post->ID ] ) ) {
			return static::$join_data_cache[ $post->ID ];
		}

		$view = \GV\View::from_post( $post );

		if ( ! $view ) {
			return [];
		}

		$joins = get_post_meta( $view->ID, static::KEY_FORM_JOINS, true );

		if ( empty( $joins ) || ! is_array( $joins ) ) {
			static::$join_data_cache[ $post->ID ] = [];
			return static::$join_data_cache[ $post->ID ];
		}

		return static::$join_data_cache[ $post->ID ] = array_map( [ Join::class, 'from_legacy_array' ], $joins );
	}

	/**
	 * Prevent Inactive or Trashed Forms from being included on the Join Data.
	 *
	 * @since 0.3
	 *
	 * @param WP_Post $post
	 *
	 * @return array
	 */
	public static function get_active_form_joins( WP_Post $post ): array {
		$join_data = static::get_join_data( $post );

		/**
		 * Filters the forms use to only the active ones.
		 * @param Join|\WP_Error $join
		 */
		return array_filter( $join_data, static function( $join ) {

			if ( is_wp_error( $join ) ) {
				do_action( 'gravityview_log_error', 'Fetching Joins failed: ' . $join->get_error_message(), __METHOD__, $join );
				return false;
			}

			return $join->has_active_forms();
		} );
	}

	/**
	 * Gets which are the other forms that needs to be joined on this view.
	 *
	 * @since 0.3
	 *
	 * @param WP_Post $post
	 *
	 * @return array
	 */
	public static function get_join_form_ids( WP_Post $post ): array {
		$joins = static::get_join_data( $post );
		if ( empty( $joins ) ) {
			return [];
		}

		$form_ids = [];

		// This can be replaced once we are using PHP 7.4 with:
		// $form_ids = array_merge( ...array_map( static function( $join ) { return $join->get_form_ids() }, $joins ) );
		foreach ( $joins as $join ) {

			// Sanity check.
			if( ! $join instanceof Join ) {
				continue;
			}

			foreach ( $join->get_form_ids() as $form_id ) {
				$form_ids[] = $form_id;
			}
		}

		return array_unique( $form_ids );
	}

	/**
	 * Filter the Active Forms from the Join forms.
	 *
	 * @since 0.3
	 *
	 * @param WP_Post $post
	 *
	 * @return array
	 */
	public static function get_join_active_form_ids( WP_Post $post ): array {
		return Form::get_active_form_ids( static::get_join_form_ids( $post ) );
	}

	/**
	 * Given a Post, determine if there are any active joins on the View.
	 *
	 * @since 0.3.6
	 *
	 * @param WP_Post $post
	 *
	 * @return bool
	 */
	public static function has_active_joins( WP_Post $post ): bool {
		$form_ids = static::get_join_active_form_ids( $post );
		return ! empty( $form_ids );
	}

	/**
	 * Rewrites the sorting parameters to take multiple forms into account.
	 *
	 * @since 0.4.0
	 *
	 * @param array $sorting The current sorting parameters.
	 *
	 * @return array The updated sorting parameters.
	 */
	public static function update_sorting_parameters( $sorting ) {
		if ( ! is_array( $sorting ) ) {
			return $sorting;
		}

		$processed = [];

		foreach ( $sorting as $i => $sort ) {
			$original_id = $sort['_original_id'] ?? '';
			if ( strpos( $original_id, 'form:' ) !== 0 ) {
				continue;
			}

			if ( in_array( $original_id, $processed ) ) {
				unset( $sorting[ $i ] );
				continue;
			}

			$sort['id'] = $original_id;
			unset( $sort['_original_id'] );

			$sorting[ $i ] = $sort;
			$processed[]   = $original_id;
		}

		return array_values( $sorting );
	}

	/**
	 * Temporarily updates the field ID so the sorting link uses the correct sorting key.
	 *
	 * @since 0.4.0
	 *
	 * @param string               $label   The current label.
	 * @param \GV\Template_Context $context The template context containing the field and view.
	 *
	 * @return string The unaltered label.
	 */
	public static function update_field_id( $label, $context ) {
		if (
			isset( $context->field->field->formId, $context->view->form )
			&& $context->field->field->formId !== $context->view->form->ID
		) {
			$combined_id = Sort::instance()
				->format_join_field( $context->field->ID, $context->field->field->formId );

			self::$original_ids[ $combined_id ] = $context->field->ID;
			$context->field->ID                 = $combined_id;
		}

		return $label;
	}

	/**
	 * Resets the field ID after the label was generated.
	 *
	 * @since 0.4.0
	 *
	 * @param string               $label   The original label.
	 * @param \GV\Template_Context $context The template context that holds the field.
	 *
	 * @return string The unaltered label.
	 */
	public static function reset_field_id( $label, $context ) {
		$context->field->ID = self::$original_ids[ $context->field->ID ] ?? $context->field->ID;

		return $label;
	}
}
