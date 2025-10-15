<?php

namespace GravityKit\MultipleForms\Query;

use Closure;
use GF_Query;
use GF_Query_Call;
use GF_Query_Column;
use GF_Query_Condition;
use GravityKit\MultipleForms\AbstractSingleton;
use GravityKit\MultipleForms\Models\Join;
use GravityKit\MultipleForms\Query;
use GravityKit\MultipleForms\View;
use GravityView_Cache;
use GV\GF_Field;
use GV\GF_Form;
use GV\Internal_Field;
use GV\Join as GV_Join;
use GV\Plugin;
use GV\View as GV_View;

/**
 * Class Handler
 *
 * @since   0.3
 *
 * @package GravityKit\MultipleForms
 */
class Handler extends AbstractSingleton {
	/**
	 * Holds whether the Query is being retrieved from the cache.
	 *
	 * @since 0.5.0
	 *
	 * @var bool
	 */
	private static $from_cache = false;

	/**
	 * Holds whether the Handler is currently recording the cache status.
	 *
	 * Used to prevent infinite loops.
	 *
	 * @since 0.5.0
	 *
	 * @var bool
	 */
	private static $is_recording = false;

	/**
	 * Returns the joins grouped by the target form ID.
	 *
	 * @since 0.5.0
	 *
	 * @param Join[] $joins The joins
	 *
	 * @return array<int, Join[]> The joins per form ID.
	 */
	private static function get_joins_by_form( array $joins ): array {
		$result = [];

		foreach ( $joins as $join ) {
			$target_form_id              = $join->get_join_form_id();
			$result[ $target_form_id ][] = $join;
		}

		return $result;
	}

	/**
	 * Registering happens after the singleton instance has been set up, which is after the extension was confirmed to
	 * have its requirements met and after `plugins_loaded@P20`
	 *
	 * @since 0.3
	 *
	 * @return void
	 */
	protected function register(): void {
		// The overwritten Query Class is very custom, and shall probably not be replaced in the future!
		add_filter( 'gravityview/query/class', [ $this, '_patch_query' ], 10, 2 );
		add_action( 'gravityview/view/query', [ $this, 'include_joins' ], 1024, 2 ); // Late execution!
		add_action( 'gravityview/plugin/feature/' . Plugin::FEATURE_JOINS, '__return_true' );
		add_filter(
			'gravityview/view/get_entries/should_apply_legacy_join_is_approved_query_conditions',
			'__return_false'
		);

		// These conditions are already included in the new Join.
		add_filter( 'gk/gravityview/view/entries/join-conditions', '__return_null' );
	}

	/**
	 * Joins the forms with a generated sub SELECT.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query $query The main Query object. Note: Passed by reference to replace in Gravity View.
	 * @param GV_View  $view  The View object.
	 */
	public function include_joins( GF_Query &$query, GV_View $view ): void {
		if ( ! $query instanceof Query ) {
			return;
		}

		$post = $view->get_post();

		if ( ! $post ) {
			return;
		}

		$joined_forms = View::get_join_data( $post );

		if ( ! $joined_forms ) {
			return;
		}

		$form_id   = $view->form->ID;
		$id_column = new GF_Query_Column( 'id', $form_id );
		$select    = [ 'SELECT SQL_CALC_FOUND_ROWS DISTINCT ' . $this->get_value_column_sql( $id_column, $query ) ];

		$parts      = $query->_introspect();
		$conditions = [ $parts['where'] ];

		// Split `ORDER BY` columns by source.
		$order_columns = $this->get_order_by_columns_by_form( $query );

		// Reset Query to remove unwanted joins.
		$query = new $query( $form_id );
		$query->limit( $parts['limit'] ?? null )->offset( $parts['offset'] ?? null );

		// When ignoring `null` joins (strict mode), we do a `JOIN` instead of a `LEFT JOIN`.
		$left = $view->settings->get( 'multiple_forms_disable_null_joins', 0 ) ? '' : 'LEFT ';

		$joins_sql            = []; // Records the SELECT statement for every joined form.
		$joined_forms_aliases = []; // Records the aliases of the joined forms (t2, t3, etc.).

		foreach ( self::get_joins_by_form( $joined_forms ) as $target_form_id => $joins ) {
			$joined_alias                            = $query->_alias( '', $target_form_id, 't' );
			$joined_forms_aliases[ $target_form_id ] = $joined_alias;

			$join_order_columns = [];
			$join_field_ids     = [];
			$join_conditions    = [];

			foreach ( $joins as $join ) {
				$main_column = new GF_Query_Column( $join->get_base_form_field_id(), $join->get_base_form_id() );
				// Adding an empty condition ensures the meta_value is joined on the query.
				if ( ! $main_column->is_entry_column() ) {
					$conditions[] = new GF_Query_Condition( $main_column );
				}

				$join_field_ids[]     = $join->get_join_form_field_id();
				$join_order_columns[] = $order_columns[ $join->get_join_form_id() ] ?? [];
				$join_conditions[]    = sprintf(
					'%s = `%s`.`%s`',
					$this->get_value_column_sql( $main_column, $query ),
					$joined_alias,
					$join->get_join_form_field_id()
				);
			}
			// Flatten back in to a single array.
			$join_order_columns = array_merge( ...$join_order_columns );

			// Retrieve the full query for the joined form, to use as a JOIN.
			$joins_sql[] = sprintf(
				$left . 'JOIN (%s) as `%s` ON (%s)',
				$this->get_joined_sql(
					$target_form_id,
					$join_field_ids,
					array_column( $join_order_columns, 0 ),
					$view
				),
				$joined_alias,
				implode( ' AND ', $join_conditions )
			);

			// Select the entry ID from entry on the joined form.
			$select[] = sprintf( '`%s`.`id` as `%s_id`', $joined_alias, $joined_alias );

			foreach ( $join_order_columns as $order_column ) {
				// This doesn't actually sort, but is needed for caching purposes.
				[ $main_column, $sort ] = $order_column;
				$query->order( new GF_Query_Call( '', [ $main_column->field_id ] ), $sort );
			}
		}

		/**
		 * Get the ORDER BY section.
		 */
		$order_by = array_map(
			function ( $order_column ) use ( $query, $joined_forms_aliases ) {
				[ $column, ] = $order_column;
				$unwrapped = self::unwrap_column( $column );
				$alias     = $joined_forms_aliases[ $unwrapped->source ] ?? '';

				return $this->get_order_by_sql( $query, $order_column, $alias );
			},
			array_values( $parts['order'] ?? [] )
		);

		// Separate loop to add additional order statements at the end of the array. Used to get consistent results.
		foreach ( $joined_forms as $join ) {
			$joined_alias = $query->_alias( '', $join->get_join_form_id(), 't' );

			$order_by[] = sprintf( '`%s`.id ASC', $joined_alias );
		}

		// Add table aliases to query.
		add_filter(
			'gk/multiple-forms/query/explicit-join-aliases',
			$cb = static function ( array $aliases, Query $passed_query ) use (
				$query,
				$joined_forms_aliases,
				&$cb
			): array {
				if ( $passed_query !== $query ) {
					return $aliases;
				}

				remove_filter( 'gk/multiple-forms/query/explicit-join-aliases', $cb );

				// Array merge will reindex because the keys are numeric.
				foreach ( $joined_forms_aliases as $form_id => $alias ) {
					$aliases[ $form_id ] = $alias;
				}

				return $aliases;
			},
			10,
			2
		);

		// Restore conditions on the new Query and replace source aliases.
		$where = self::deep_replace_conditions( GF_Query_Condition::_and( ...$conditions ), $query );
		$query->where( $where );

		// Add the required joins for the conditions, but remove the ones of the joined forms; already got those.
		foreach ( $query->_join_infer( $where ) as $extra_join ) {
			if ( strpos( $extra_join, 'ON `%s`.`id` = `%s`.`entry_id`' ) !== false ) {
				continue;
			}

			$joins_sql[] = 'LEFT JOIN ' . $extra_join;
		}

		// Apply the sorting columns of the main query, in order for the potentially required SQL JOINS to be added.
		foreach ( $order_columns[ $form_id ] ?? [] as [$main_column, $sort] ) {
			$query->order( $main_column, $sort );
		}

		// At this stage we record if the query is going to be run; or if we have a cache ready. Using that later on.
		$this->record_cached_query();

		// Update the actual SQL Query with the newly created joins and updated sorting.
		add_filter(
			'gform_gf_query_sql',
			$cb = static function ( $sql, $query = null ) use ( $joins_sql, $select, $order_by, &$cb ) {
				// Note that the $query is only applied on this filter for our Own Query object!
				remove_filter( 'gform_gf_query_sql', $cb );

				if ( ! $query instanceof Query ) {
					return $sql;
				}

				// Remove any duplicate JOIN statements.
				$joins     = explode( 'LEFT JOIN', $sql['join'] );
				$joins     = array_map(
					static function ( string $join ): string {
						if ( preg_match( '/AS `m\d+` ON `m\d+`.`meta_key`/', $join ) ) {
							return '';
						}

						return trim( 'LEFT JOIN' . $join );
					},
					array_filter( $joins )
				);
				$joins_sql = array_filter( array_unique( array_merge( $joins, $joins_sql ) ) );
				$order_by  = array_unique( $order_by );

				// If the query is cached, it will not run; so this will not affect the next query.
				if ( ! self::$from_cache ) {
					$sql['join']   = implode( ' ', $joins_sql );
					$sql['select'] = implode( ', ', $select );
					$sql['order']  = $order_by ? 'ORDER BY ' . implode( ', ', $order_by ) : '';
				}

				return $sql;
			},
			10,
			2
		);
	}

	/**
	 * Overwrite the Query to our custom Query with additional hooks.
	 *
	 * @param GV_View|null $view  The View that we will use this Query for.
	 *
	 * @param string       $query Previous query class name.
	 *
	 * @return string The class name of the query to use for a GravityView query ("\GF_Patched_Query").
	 * @internal
	 *
	 */
	public function _patch_query( $query, ?GV_View $view = null ) {
		if ( null === $view ) {
			return $query;
		}

		$view_post = $view->get_post();

		// Invalid view for some reason arrived here.
		if ( null === $view_post ) {
			return $query;
		}

		// There is no reason to use the patched query if there are no joins.
		if ( ! View::has_active_joins( $view_post ) ) {
			return $query;
		}

		return Query::class;
	}

	/**
	 * Returns the SELECT statement for the joined form with its own conditions.
	 *
	 * @since 0.5.0
	 *
	 * @param int               $form_id            The form ID.
	 * @param string[]          $join_columns       The columns on which are being joined on this form.
	 * @param GF_Query_Column[] $additional_columns Additional columns to select.
	 * @param GV_View           $view
	 *
	 * @return string The SELECT statement for the joined form.
	 */
	private function get_joined_sql(
		int $form_id,
		array $join_columns,
		array $additional_columns,
		GV_View $view
	): string {
		// We start a new Query object, with at least active entries.
		$query = new GF_Query( $form_id, [ 'status' => 'active' ] );
		foreach ( $join_columns as $join_column ) {
			$additional_columns[] = new GF_Query_Column( $join_column, $form_id );
		}

		$parts      = $query->_introspect();
		$conditions = [ $parts['where'] ];

		foreach ( $additional_columns as $column ) {
			$column = self::unwrap_column( $column );

			if ( ! $column || $column->is_entry_column() ) {
				continue;
			}

			// Additional columns might be used for ordering; and for that we need meta fields to be JOINed to the query.
			$conditions[] = new GF_Query_Condition( $column );
		}

		$context = compact( 'form_id', 'join_columns', 'query' );

		/**
		 * Modifies conditions for a joined form query.
		 *
		 * @filter `gk/multiple-forms/query/handler/join/conditions`
		 *
		 * @since  0.5.0
		 *
		 * @param GF_Query_Condition[] $conditions The current conditions
		 * @param GV_View              $view       The View object.
		 * @param array                $context    An array with additional context.
		 */
		$conditions = apply_filters(
			'gk/multiple-forms/query/handler/join/conditions',
			$conditions,
			$view,
			$context
		);

		$query->where( GF_Query_Condition::_and( ...$conditions ) );

		// We need at least the joined entry ID in order to join it to the main entry.
		$id_column     = new GF_Query_Column( 'id', $form_id );
		$status_column = new GF_Query_Column( 'status', $form_id );
		$query->order( $id_column, 'ASC' ); // For consistent ordering.

		$sql    = $this->get_sql_from_query( $query );
		$select = [];

		// Remove any duplicates, to avoid [Duplicate column name 'x'] errors.
		$select_columns = array_map(
			Closure::fromCallable( [ self::class, 'unwrap_column' ] ),
			array_merge( [ $id_column, $status_column ], $additional_columns )
		);

		// We also need all additional columns to be selected, so we can order by them on the main query,
		// through the joined form alias.
		foreach ( array_unique( $select_columns, SORT_REGULAR ) as $column ) {
			$select[] = sprintf( '%s AS `%s`', $this->get_value_column_sql( $column, $query ), $column->field_id );
		}

		$sql['select'] = 'SELECT DISTINCT ' . implode( ', ', $select );

		return implode( ' ', $sql );
	}

	/**
	 * Returns the "final" sql parts from a {@see GF_Query} object.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query $query The query object.
	 *
	 * @return array The SQL parts.
	 */
	private function get_sql_from_query( GF_Query $query ): array {
		$sql = [];

		add_filter(
			'gform_gf_query_sql',
			$select = static function ( $original_sql ) use ( &$sql, &$select ) {
				// get a copy of the query;
				$sql = $original_sql;
				remove_filter( 'gform_gf_query_sql', $select );

				// Prevent the original query from running.
				return [];
			}
		);

		$clone = clone $query; // prevent calls on the actual query.

		// Trigger SQL.
		$clone->get();

		unset ( $sql['paginate'], $sql['order'] );

		return $sql;
	}

	/**
	 * Returns the SQL needed for a Column on a Query.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query_Column $column The column.
	 * @param GF_Query        $query  The query object.
	 *
	 * @return string The column SQL with the proper alias.
	 */
	private function get_value_column_sql( GF_Query_Column $column, GF_Query $query ): string {
		return $column->is_entry_column()
			? $column->sql( $query )
			: sprintf( "`%s`.`%s`", $query->_alias( $column->field_id, 0, 'm' ), 'meta_value' );
	}

	/**
	 * Returns the source (form ID) of a column, even if it is wrapped.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query_Column|GF_Query_Call $column The (wrapped) column.
	 *
	 * @return string The source.
	 */
	private static function get_column_source( $column ): string {
		$column = self::unwrap_column( $column );

		return (string) ( $column->source ?? '' );
	}

	/**
	 * Returns the actual {@see GF_Query_Column} object from a potential {@See GF_Query_Call}.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query_Column|GF_Query_Call $column The column or call.
	 *
	 * @return GF_Query_Column|null The wrapped column.
	 */
	private static function unwrap_column( $column ): ?GF_Query_Column {
		if ( $column instanceof GF_Query_Call ) {
			$columns = $column->columns;

			$column = 1 === count( $columns ) ? reset( $columns ) : null;
		}

		return $column instanceof GF_Query_Column ? $column : null;
	}

	/**
	 * Returns the ORDER BY clause for a (possibly wrapped) column.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query                             $query       The Query object.
	 * @param array{0: GF_Query_Column, 1: string} $column_sort The array containing the column and the sort order.
	 * @param string                               $alias       The alias for the joined form.
	 *
	 * @return string The SQL.
	 */
	private function get_order_by_sql( GF_Query $query, array $column_sort, string $alias = '' ) {
		[ $column, $sort ] = $column_sort;

		$unwrapped = self::unwrap_column( $column );

		if ( ! $unwrapped ) {
			return '';
		}

		$field_id = $alias
			? sprintf( '`%s`.`%s`', $alias, $unwrapped->field_id )
			: $this->get_value_column_sql( $unwrapped, $query );

		// Replace the generated alias with the one we already calculated from the joined form.
		if ( $column instanceof GF_Query_CALL ) {
			$field_id = preg_replace(
				'/\(.+? AS/is',
				'(' . $field_id . ' AS',
				$column->sql( $query )
			);
		}

		return sprintf( '%s %s', $field_id, $sort );
	}

	/**
	 * Transforms a Multiple Forms Join Model into a GravityView Join object.
	 *
	 * @since 0.5.0
	 *
	 * @param Join $mf_join The Join model object.
	 *
	 * @return GV_Join|null The GravityView Join object.
	 */
	private static function transform_join_to_gv_join( $mf_join ): ?GV_Join {
		if ( ! $mf_join instanceof Join ) {
			return null;
		}

		[ $join, $join_column, $join_on, $join_on_column ] = $mf_join->to_legacy_format();

		$join    = GF_Form::by_id( $join );
		$join_on = GF_Form::by_id( $join_on );

		$join_column = is_numeric( $join_column )
			? GF_Field::by_id( $join, $join_column )
			: Internal_Field::by_id( $join_column );

		$join_on_column = is_numeric( $join_on_column )
			? GF_Field::by_id( $join_on, $join_on_column )
			: Internal_Field::by_id( $join_on_column );

		return new GV_Join( $join, $join_column, $join_on, $join_on_column );
	}

	/**
	 * Returns an array of the order by columns by the form ID.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query $query The query object.
	 *
	 * @return array{int, array{int, GF_Query_Call|GF_Query_Column} The columns by form ID.
	 */
	private function get_order_by_columns_by_form( GF_Query $query ): array {
		if ( ! method_exists( $query, '_introspect' ) ) {
			return [];
		}

		$parts = $query->_introspect();

		$order_columns = [];

		foreach ( $parts['order'] as [$column, $sort] ) {
			$form_id = self::get_column_source( $column );

			$order_columns[ $form_id ][] = [ $column, $sort ];
		}

		return $order_columns;
	}

	/**
	 * Records whether the query is being retrieved from the cache, instead of being run.
	 *
	 * If we do not check this, the SQL changes are applied on the **next** query, which will break other plugins.
	 *
	 * @since 0.5.0
	 */
	private function record_cached_query(): void {
		self::$is_recording = false;

		/**
		 * @param bool              $use_cache
		 * @param GravityView_Cache $cache
		 *
		 * @return bool
		 */
		$cb = static function ( $use_cache, $cache ) use ( &$cb ) {
			// Prevent infinite recursion.
			if ( self::$is_recording ) {
				return $use_cache;
			}

			// Should run only once.
			remove_filter( 'gravityview_use_cache', $cb );

			self::$from_cache   = false; // Reset in cache status.
			self::$is_recording = true;

			if ( $use_cache ) {
				$result           = $cache->get();
				self::$from_cache = $result !== null && $result !== false;
			}

			self::$is_recording = false;

			return $use_cache;
		};

		add_filter( 'gravityview_use_cache', $cb, 100, 2 );
	}

	/**
	 * Recursively replaces explicit aliases with ones from the correct Query object.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query_Condition $condition The original condition tree.
	 * @param GF_Query           $query     The Query object.
	 *
	 * @return GF_Query_Condition The updated query tree with replaced aliases.
	 */
	public static function deep_replace_conditions(
		GF_Query_Condition $condition,
		GF_Query $query
	): GF_Query_Condition {
		if ( in_array( $condition->operator, [ GF_Query_Condition::_AND, GF_Query_Condition::_OR ], true ) ) {
			$expressions = array_map( function ( GF_Query_Condition $expression ) use ( $query ) {
				return self::deep_replace_conditions( $expression, $query );
			}, $condition->expressions ?? [] );

			return $condition->operator === GF_Query_Condition::_AND
				? GF_Query_Condition::_and( ...$expressions )
				: GF_Query_Condition::_or( ...$expressions );
		}

		$new_condition_parts = [
			'left'     => $condition->left,
			'operator' => $condition->operator,
			'right'    => $condition->right,
		];

		$changed = false;

		foreach ( [ 'left', 'right' ] as $position ) {
			$column = $condition->{$position};

			if ( ! $column instanceof GF_Query_Column ) {
				continue;
			}

			$replaced_column = self::replace_column_alias( $column, $query );

			if ( $column !== $replaced_column ) {
				$changed = true;

				$new_condition_parts[ $position ] = $replaced_column;
			}
		}

		if ( ! $changed ) {
			return $condition;
		}

		return new GF_Query_Condition(
			$new_condition_parts['left'],
			$new_condition_parts['operator'],
			$new_condition_parts['right']
		);
	}

	/**
	 * Replaces an explicit column alias with one from the correct Query.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query_Column $column The column object.
	 * @param GF_Query        $query  The Query object.
	 *
	 * @return GF_Query_Column A Query column with a correct alias.
	 */
	public static function replace_column_alias(
		GF_Query_Column $column,
		GF_Query $query
	): GF_Query_Column {
		$alias = $column->alias;

		if ( ! $alias ) {
			return $column;
		}

		if ( ! preg_match( '/([tmoc])\d+/', $alias, $matches ) ) {
			return $column;
		}

		$prefix = $matches[1];

		return new GF_Query_Column(
			$column->field_id,
			$column->source,
			$query->_alias( $column->field_id, $column->source, $prefix )
		);
	}
}
