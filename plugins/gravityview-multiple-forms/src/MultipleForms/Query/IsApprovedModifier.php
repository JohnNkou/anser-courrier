<?php

namespace GravityKit\MultipleForms\Query;

use GF_Query;
use GF_Query_Column;
use GF_Query_Condition;
use GF_Query_Literal;
use GravityKit\MultipleForms\AbstractSingleton;
use GravityView_Entry_Approval;
use GravityView_Entry_Approval_Status;
use GV\View;
use GVCommon;

/**
 * Class IsApprovedModifier
 *
 * @since   0.3
 *
 * @package GravityKit\MultipleForms\Query
 */
class IsApprovedModifier extends AbstractSingleton {
	/**
	 * Registering happens after the singleton instance has been set up, which is after the extension was confirmed to
	 * have its requirements met and after `plugins_loaded@P20`
	 *
	 * @since 0.3
	 */
	protected function register(): void {
		add_filter(
			'gk/multiple-forms/query/handler/join/conditions',
			[ $this, 'update_approved_join_condition' ],
			10,
			3
		);
	}

	/**
	 * Add a condition for all joined forms to only return approved entries.
	 *
	 * @since 0.5.0
	 *
	 * @param GF_Query_Condition[]                                   $conditions The current conditions.
	 * @param View                                                   $view       The View.
	 * @param array{form_id:int, query:GF_Query, join_column:string} $context    The context for the hook.
	 *
	 * @return GF_Query_Condition[] THe updated conditions.
	 */
	public function update_approved_join_condition( array $conditions, View $view, array $context ): array {
		// Add a join for the required condition.
		$is_admin_and_can_view =
			$view->settings->get( 'admin_show_all_statuses' )
			&& GVCommon::has_cap( 'gravityview_moderate_entries', $view->ID );

		$is_approved_only =
			$view->settings->get( 'show_only_approved', 0 )
			&& $view->settings->get( 'show_only_approved_joined', 0 );

		if ( $is_admin_and_can_view || ! $is_approved_only ) {
			return $conditions;
		}

		$conditions[] = new GF_Query_Condition(
			new GF_Query_Column( GravityView_Entry_Approval::meta_key, $context['form_id'] ?? 0 ),
			GF_Query_Condition::EQ,
			new GF_Query_Literal( GravityView_Entry_Approval_Status::APPROVED )
		);

		return $conditions;
	}
}
