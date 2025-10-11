(function (GravityFlowInbox, $) {

	$(document).ready(function () {

		$('.gravityflow-actions-unlock').click( function() {
			var $this = $(this),
				$lock = $this.siblings('.gravityflow-actions-lock'),
				$noteContainer = $this.siblings('.gravityflow-actions-note-field-container'),
				$actionButtons = $this.siblings('.gravityflow-actions');
			$this.hide();
			$lock.show();
			$noteContainer.hide();
			$actionButtons.hide();
			$this.parent('.gravityflow-actions').addClass( 'gravityflow-actions-locked' );
		});

		$('.gravityflow-action').click( function() {
			var $this = $(this),
				$unlock = $this.siblings('.gravityflow-actions-unlock'),
				$lock = $this.siblings('.gravityflow-actions-lock'),
				$noteContainer = $this.siblings('.gravityflow-actions-note-field-container'),
				$noteField = $noteContainer.find('textarea'),
				showNoteField = $this.data('note_field');


			if ( $this.hasClass( 'gravityflow-action-processed' ) ) {
				return;
			}

			if ( $this.parent('.gravityflow-actions').hasClass( 'gravityflow-actions-locked' ) ) {
				$this.parent('.gravityflow-actions').removeClass( 'gravityflow-actions-locked' );
				$lock.hide();
				$unlock.show();

				if ( showNoteField ) {
					$noteContainer.show();
					$noteField.focus();
					$(document).keyup(function(e) {
						var KEYCODE_ESC = 27;
						if (e.keyCode == KEYCODE_ESC) {
							$unlock.click();
						}
					});
				} else {
					setTimeout(function () {
						if ( ! $this.hasClass( 'gravityflow-action-processing' ) && ! $this.hasClass( 'gravityflow-action-processed' ) ) {
							$this.parent('.gravityflow-actions').addClass( 'gravityflow-actions-locked' );
							$lock.show();
							$unlock.hide();
						}
					}, 2000);
				}
				return;
			}

			var entryId = parseInt($this.data('entry_id')),
				restBase = $this.data('rest_base'),
				action = $this.data('action'),
				url = gravityflow_inbox_strings.restUrl,
				nonce = gravityflow_inbox_strings.nonce,
				$spinner = $this.siblings('.gravityflow-actions-spinner');

			$.ajax({
				method: "POST",
				url: url + 'gf/v2/entries/' + entryId + '/workflow/' + restBase,
				data: { 'action' : action, 'gravityflow_note' : $noteField.val() },
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', nonce );
					$this.siblings().andSelf().hide();
					$this.addClass('gravityflow-action-processing');
					$spinner.show();
				},
				success : function( response ) {
					$spinner.hide();
					$this.removeClass('gravityflow-action-processing');
					if ( response.status == 'success' ) {
						$this.addClass('gravityflow-action-processed');
						$this.prop('title', response.feedback);
						$this.show();
						$this.parent('.gravityflow-actions').removeClass( 'gravityflow-actions-locked' );
					} else {
						$this.parent('.gravityflow-actions').addClass( 'gravityflow-actions-locked' );
						$this.siblings('.gravityflow-action').andSelf().show();
						$lock.show();
						alert( response.feedback );
					}
				},
				fail : function( response ) {
					$spinner.hide();
					$unlock.hide();
					$lock.show();
					$this.removeClass('gravityflow-action-processing');
					$this.siblings('.gravityflow-actions').andSelf().show();
					alert( response );
				}

			});
		});

		// Prevent the conditional logic from resetting the field values when the form is displayed in the inbox to save users from accidentally deleting data.
		gform.addFilter("gform_reset_pre_conditional_logic_field_action", function (reset, formId, targetId, defaultValues, isInit) {
			return false;
		});
	});

}(window.GravityFlowInbox = window.GravityFlowInbox || {}, jQuery));

/**
 * @function handleApprovalStepButtonClick
 * @description sets the new approval status by adding a hidden input wich has the same value of the button clicked.
 * When the form is handled by the submission handler it prevents the submit event then eventually
 * uses jQuery.trigger( 'submit' ) which doesn't include the clicked button value in the posted values.
 *
 * @since 2.9.11
 *
 * @param {HTMLElement} button The clicked button.
 */
handleApprovalStepButtonClick = function ( button ) {
	var hiddenInput = document.getElementById( 'gravityflow_approval_new_status_step' );
	hiddenInput.value = button.value;
	maybeTriggerHandleButtonClick( button );
}

/**
 * @function maybeTriggerHandleButtonClick
 * @description calls handleButtonClick if gravityforms version supports it, otherwise, just submits the form.
 *
 * @since 2.9.11
 *
 * @param {HTMLElement} button The clicked button.
 */
maybeTriggerHandleButtonClick = function ( button ) {
	if ( gform && gform.submission ) {
		gform.submission.handleButtonClick( button );
	} else {
		button.form.submit();
	}
}