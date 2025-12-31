jQuery( document ).ready( function( $ ) { "use strict";
	$( '#aiko-developer-after-title' ).show();
	// Variables
	var postID = $( '#post_ID' ).val();
	var ajaxUrl = aiko_developer_object.ajax_url
	var apiKey = aiko_developer_object.api_key;
	var settingsPage = aiko_developer_object.link;
	const messages = aiko_developer_object.plugin_messages;
	const selectedModel = aiko_developer_object.selected_model;

	// Corner box
	$( '.aiko-developer-corner-box-close' ).on( 'click', function() {
		$( '.aiko-developer-corner-box' ).fadeOut();
		document.cookie = "aiko_developer_corner_box_dont_show=true; max-age=" + (10 * 24 * 60 * 60) + "; path=/";
	});

	var corner_box_dont_show_cookie = document.cookie
		.split('; ')
		.find(row => row.startsWith('aiko_developer_corner_box_dont_show='))
		?.split('=')[1] || '';

	if ( $( '#aiko-developer-first' ).val() !== '1' ) {
		if ( corner_box_dont_show_cookie === 'true' ) {
			$( '.aiko-developer-corner-box' ).css( 'display', 'none' );
		} else {
			$( '.aiko-developer-corner-box' ).css( 'display', 'block' );
		}
	}

	const cornerBoxObserver = new MutationObserver(() => {
		if ( $( '#aiko-developer-first' ).val() !== '1' && $( '#aiko-developer-submitted' ).val() !== '1' ) {
			if ( corner_box_dont_show_cookie === 'true' ) {
				$( '.aiko-developer-corner-box' ).css( 'display', 'none' );
			} else {
				if ($('body').hasClass('aiko-developer-disabled')) {
					$('.aiko-developer-corner-box').fadeOut();
				} else {
					$('.aiko-developer-corner-box').fadeIn();
				}
			}
		}
	});
	cornerBoxObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

	const loaderObserver = new MutationObserver(() => {
        if ( $( '.aiko-developer-popup' ).is( ':visible' ) ) {
            $( 'body' ).addClass( 'aiko-developer-disabled' );
        } else {
            $( 'body' ).removeClass( 'aiko-developer-disabled' );
        }
    });

    const observeConfig = { attributes: true, attributeFilter: ['style', 'class'], subtree: false };

    $( '.aiko-developer-popup' ).each( function () {
        const popup = $( this )[0];
        loaderObserver.observe( popup, observeConfig );
    });

	$( '.aiko-developer-corner-box-button, #aiko-developer-submit-a-prompt-meta-box' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-submit-prompt-popup-overlay' ).fadeIn();
	});

	$( '#aiko-developer-submit-prompt-popup-submit' ).on( 'click', function() {
		event.preventDefault();

		$( '#aiko-developer-submit-prompt-popup-overlay' ).fadeOut();
		$( '#aiko-developer-loader-overlay' ).fadeIn();

		var fr = $( '#aiko-developer-submit-prompt-fr-val' ).text().trim();
		var ai = $( '#aiko-developer-submit-prompt-ai-val' ).text().trim();
		var model = $( '#aiko-developer-submit-prompt-model-val' ).text().trim();
		var temp = $( '#aiko-developer-submit-prompt-temp-val' ).text().trim();
		var comment = $( '#aiko-developer-submit-prompt-comment-val' ).val().trim();
		var anonymous = $( '#aiko-developer-submit-prompt-accept-val' ).is( ':checked' ) ? '1' : '0';

		$.ajax({
			url: ajaxUrl,
			type: 'POST',
			data: {
				action: 'submit_prompt_send',
				nonce: $( '#aiko_developer_nonce_field' ).val(),
				functional_requirements: revert_text( fr ),
				ai: ai,
				model: model,
				temperature: temp,
				comment: comment,
				post_id: postID,
				anonymous: anonymous
			},
			success: function( response ) {
				$( '#aiko-developer-loader-overlay' ).fadeOut();
				$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
				$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data ) );
				$( '#aiko-developer-alert-ok' ).attr( 'data-action', response.data );
				$( '#aiko-developer-submit-prompt-comment-val' ).val( '' );
				$( '#aiko-developer-submit-prompt-accept-val' ).prop('checked', false);
				$( '#aiko-developer-submitted' ).val( '1' );
			}
		});
	});

	$( '#aiko-developer-submit-prompt-popup-close' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-submit-prompt-popup-overlay' ).fadeOut();
		$( '#aiko-developer-submit-prompt-comment-val' ).val( '' );
		$( '#aiko-developer-submit-prompt-accept-val' ).prop('checked', false);
	});

	function aiko_developer_code_not_generated() {
		var code_not_generated = $( '#aiko-developer-after-title' ).data( 'code-not-generated' );
		if ( $( '#aiko-developer-first' ).val() !== '1' ) {
			if ( code_not_generated === 1 ) {
				$( '#aiko-developer-code-not-generated-wrapper' ).addClass( "aiko-developer-notice-show" );
			} else {
				$( '#aiko-developer-code-not-generated-wrapper' ).removeClass( "aiko-developer-notice-show" );
			}
		} else {
			$( '#aiko-developer-code-not-generated-wrapper' ).removeClass( "aiko-developer-notice-show" );
		}
	}

	// Get message from array
	function aiko_developer_get_message( code ) {
		return messages[code];
	}

	// Hidden meta boxes before first prompt
	function aiko_developer_toggle_meta_boxes() {
		var postStatus = $( '#original_post_status' ).val();

		if ( postStatus === 'publish' && $( '#aiko-developer-first' ).val() !== '1' ) {
			$( '#aiko-developer-download-meta-box, #aiko-developer-php-output-meta-box, #aiko-developer-js-output-meta-box, #aiko-developer-css-output-meta-box, #aiko-developer-functional-requirements-output, #aiko-developer-improvements-wrapper' ).show();
			$( '#aiko-developer-user-prompt-rephrase-wrapper' ).hide();
			$( '.aiko-developer-improvements-suggestions-wrapper' ).hide();

			// Notice when codes are empty
			var phpCode = $( '#aiko-developer-php-output-meta-box pre' ).text();
			var jsCode = $( '#aiko-developer-js-output-meta-box pre' ).text();
			var cssCode = $( '#aiko-developer-css-output-meta-box pre' ).text();
			if ( ! phpCode.trim() && ! jsCode.trim() && ! cssCode.trim() && ! $( '#aiko-developer-published-notice' ).hasClass( 'aiko-developer-notice-show' ) ) {
				var code_not_generated_is_shown = $( '#aiko-developer-code-not-generated-wrapper' ).hasClass( 'aiko-developer-notice-show' );
				$( '.aiko-developer-notice-show' ).removeClass( 'aiko-developer-notice-show' );
				if ( code_not_generated_is_shown ) {
					$( '#aiko-developer-code-not-generated-wrapper' ).addClass( 'aiko-developer-notice-show' );
				}
				var api_not_present_is_shown = $( '#aiko-developer-api-not-present-wrapper' ).hasClass( 'aiko-developer-notice-show' );
				if ( api_not_present_is_shown ) {
					$( '#aiko-developer-api-not-present-wrapper' ).addClass( 'aiko-developer-notice-show' );
				}
				$( '#aiko-developer-empty-codes-notice' ).addClass( 'aiko-developer-notice-show' );
				$( '#aiko-developer-php-output-meta-box, #aiko-developer-js-output-meta-box, #aiko-developer-css-output-meta-box' ).hide();
			}
		} else {
			$( '#aiko-developer-download-meta-box, #aiko-developer-php-output-meta-box, #aiko-developer-js-output-meta-box, #aiko-developer-css-output-meta-box, #aiko-developer-functional-requirements-output, #aiko-developer-improvements-wrapper' ).hide();
			$( '#aiko-developer-user-prompt-rephrase-wrapper' ).show();
			$( '.aiko-developer-improvements-suggestions-wrapper' ).show();
		}
	}

	// Notices show after refresh
	function aiko_developer_show_notices_after_refresh() {
		$( '#aiko-developer-published-notice-text' ).text( aiko_developer_get_message( $( '#aiko-developer-published-notice-text' ).data( 'message' ) ) );
		$( "#aiko-developer-edited-code-notice-text" ).text( aiko_developer_get_message( $( '#aiko-developer-edited-code-notice-text' ).data( 'message' ) ) );
	}
	
	aiko_developer_toggle_meta_boxes();
	aiko_developer_show_notices_after_refresh();
	aiko_developer_code_not_generated();

	function format_text( input ) {
		let formatted = input.replace( /\*\*(.*?)\*\*/g, "<b>$1</b>" );
		
		formatted = formatted.replace( /(?:^|\n)\s*-/g, "\n&emsp;-" );
		
		formatted = formatted.replace( /(?<!^)\n/g, "<br>" );
		
		return formatted;
	}

	function revert_text( formatted ) {
		let reverted = formatted.replace( /<b>(.*?)<\/b>/g, "**$1**" );
		
		reverted = reverted.replace( /&emsp;-/g, "   -" );
		
		reverted = reverted.replace( /<br>/g, "\n" );
		
		return reverted;
	}

	// Title enter bug
	$( '#title' ).on( 'keypress', function( e ) {
		if ( e.which === 13 ) {
			e.preventDefault();
		}
	});

	// Slug enter bug
	$( '#aiko-developer-post-slug' ).on( 'keypress', function( e ) {
		if ( e.which === 13 ) {
			e.preventDefault();
		}
	});

	// Close notification
	$( '.aiko-developer-notice .aiko-developer-notice-close' ).on( 'click', function() { 
		$( this ).parent().removeClass( 'aiko-developer-notice-show' );
	});
	
	// Alert OK
	$( '#aiko-developer-alert-ok' ).on( 'click', function() {
		event.preventDefault();
		if ( $( this ).data( 'action' ) === 'openai-api-url' ) {
			window.open( settingsPage, '_blank', 'noopener, noreferrer' );
			$( '#aiko-developer-refresh-popup-overlay' ).fadeIn();
			$( '#aiko-developer-refresh-text' ).text( aiko_developer_get_message( 'notice-refresh-after-api-key' ) );
			$( '#aiko-developer-alert-popup-overlay' ).fadeOut();
		} else if ( $( this ).data( 'action' ) === 'openai-api-url' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeOut();
		} else if ( $( this ).data( 'action' ) === 'error-no-title' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeOut();
		} else if ( $( this ).data( 'action' ) === 'error-no-slug' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeOut();
		} else if ( $( this ).data( 'action' ) === 'error-empty-fr' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeOut();
		}  else if ( $( this ).data( 'action' ) === 'error-empty-comment-rephrase' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeOut();
		} else {
			$( '#aiko-developer-alert-popup-overlay' ).fadeOut();
			$( '#aiko-developer-rephrase-comments-error-text' ).text( aiko_developer_get_message( 'error-general' ) );
		}
		
	});

	// Refresh page
	$( '#aiko-developer-refresh' ).on( 'click', function() {
		$( '#aiko-developer-refresh-popup-overlay' ).fadeOut();
		$( '#aiko-developer-status' ).val( '4' );
		$( '#aiko-developer-loader-overlay' ).fadeIn();
	});

	// Trigger publish
	$( '.aiko-developer-publish' ).on( 'click', function() {
		event.preventDefault();
		$( '#publish' ).trigger( 'click' );
	});

	// Publish actions
	$( '#publish' ).on( 'click', function() {
		if ( $( '#title' ).val() === '' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-no-title" ) );
			$( '#aiko-developer-alert-ok' ).data( 'action', 'error-no-title' );
			$( '#title' ).focus();
			event.preventDefault();
			return;
		} else if ( $( '#aiko-developer-post-slug' ).val() === '' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-no-slug" ) );
			$( '#aiko-developer-alert-ok' ).data( 'action', 'error-no-slug' );
			$( '#aiko-developer-post-slug' ).focus();
			event.preventDefault();
			return;
		} else if ( ! $( '#aiko-developer-input' ).val() && $( '#aiko-developer-first' ).val() === '1' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-empty-fr" ) );
			$( '#aiko-developer-alert-ok' ).data( 'action', 'error-empty-fr' );
			event.preventDefault();
			return;
		} else if ( apiKey === '' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-no-api-key" ) );
			$( '#aiko-developer-alert-ok' ).data( 'action', 'openai-api-url' );
			event.preventDefault();
			return;
		} else {
			if ( $( '#aiko-developer-after-title' ).attr( 'data-rephrased-flag' ) === '1' ) {
				$( '#aiko-developer-publish-confirm-popup-overlay' ).fadeIn();
				event.preventDefault();
			} else {
				$( '#aiko-developer-loader-overlay' ).fadeIn();
			}
		}
	});

	$( '#aiko-developer-publish-confirm-yes' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-after-title' ).attr( 'data-rephrased-flag', '0' );
		$( '#publish' ).trigger( 'click' );
		$( '#aiko-developer-publish-confirm-popup-overlay' ).fadeOut();
	});

	// Download ZIP
	$( '.aiko-developer-download-zip' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-loader-overlay' ).fadeIn();
		
		var phpCode = $( '#aiko-developer-php-output-meta-box pre' ).text();
		var jsCode = $( '#aiko-developer-js-output-meta-box pre' ).text();
		var cssCode = $( '#aiko-developer-css-output-meta-box pre' ).text();

		$.ajax({
			url: ajaxUrl,
			type: 'POST',
			data: {
				action: 'download_zip',
				nonce: $( '#aiko_developer_nonce_field' ).val(),
				php_code: phpCode,
				js_code: jsCode,
				css_code: cssCode,
				post_id: postID
			},
			success: function( response ) {
				if ( response.success ) {
					window.location.href = response.data;
				} else {
					$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
					$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data ) );
				}
				$( '#aiko-developer-loader-overlay' ).fadeOut();
			}
		});
	});

	// Edit
	$( '.aiko-developer-edit' ).on( 'click', function() {
		event.preventDefault();
		if ( $( this ).data( 'type' ) !== 'functional-requirements' ) {
			var metaBox = '#aiko-developer-' + $( this ).data( 'type' ) + '-output-meta-box ';
			var field = 'pre';
		} else {
			var metaBox = '#aiko-developer-functional-requirements-output ';
			var field = 'p.aiko-developer-block-content';
		}
		$( '#aiko-developer-edit-popup-overlay' ).fadeIn();
		$( '#aiko-developer-edit-textarea' ).val( $( metaBox + field ).text().trim() );
		$( '#aiko-developer-edit-submit' ).data( 'type', $( this ).data( 'type' ) );
		$( '#aiko-developer-edit-cancel' ).data( 'type', $( this ).data( 'type' ) );
	});

	// Submit edit
	$( '#aiko-developer-edit-submit' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-edit-popup-overlay' ).fadeOut();
		$( '#aiko-developer-status' ).val( $( '#aiko-developer-edit-submit' ).data( 'type' ) === 'functional-requirements' ? '2' : '1' );
		
		if ( $( '#aiko-developer-edit-submit' ).data( 'type' ) === 'functional-requirements' && ! $( '#aiko-developer-edit-textarea' ).val() ) {
			var code_not_generated_is_shown = $( '#aiko-developer-code-not-generated-wrapper' ).hasClass( 'aiko-developer-notice-show' );
			$( '.aiko-developer-notice-show' ).removeClass( 'aiko-developer-notice-show' );
			if ( code_not_generated_is_shown ) {
				$( '#aiko-developer-code-not-generated-wrapper' ).addClass( 'aiko-developer-notice-show' );
			}
			var api_not_present_is_shown = $( '#aiko-developer-api-not-present-wrapper' ).hasClass( 'aiko-developer-notice-show' );
			if ( api_not_present_is_shown ) {
				$( '#aiko-developer-api-not-present-wrapper' ).addClass( 'aiko-developer-notice-show' );
			}
			$( '#aiko-developer-empty-edit-notice' ).addClass( 'aiko-developer-notice-show' );
			$( '#aiko-developer-empty-edit-notice-text' ).text( aiko_developer_get_message( "error-empty-edit" ) );
			event.preventDefault();
		} else {
			$( '#aiko-developer-loader-overlay' ).fadeIn();
			$.ajax({
				url: ajaxUrl,
				type: 'POST',
				data: {
					action: 'edit',
					nonce: $( '#aiko_developer_nonce_field' ).val(),
					edited: $( '#aiko-developer-edit-textarea' ).val(),
					type: $( '#aiko-developer-edit-submit' ).data( 'type' ),
					post_id: postID
				},
				success: function( response ) {
					if ( response.success ) {
						$( '#aiko-developer-status' ).val( '5' );
						$( '#publish' ).trigger( 'click' );
					} else {
						$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
						$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data ) );
						$( '#aiko-developer-loader-overlay' ).fadeOut();
					}
				}
			});
		}
	});

	// Cancel edit
	$( '#aiko-developer-edit-cancel' ).on( 'click', function() {
		event.preventDefault();
		if ( $( this ).data( 'type' ) !== 'functional-requirements' ) {
			var metaBox = '#aiko-developer-' + $( this ).data( 'type' ) + '-output-meta-box ';
			var field = 'pre';
		} else {
			var metaBox = '#aiko-developer-functional-requirements-output ';
			var field = 'p.aiko-developer-block-content';
		}
		var beforeEdit = $( metaBox + field ).text().trim();
		var afterEdit = $( '#aiko-developer-edit-textarea' ).val().trim();
		if ( beforeEdit !== afterEdit ) {
			$( '#aiko-developer-confirm-popup-overlay' ).fadeIn();
			$( '#aiko-developer-confirm-text' ).text( aiko_developer_get_message( "confirm-cancel-edit" ) );
		}
		$( '#aiko-developer-edit-popup-overlay' ).fadeOut();
	});

	// Confirm cancel yes
	$( '#aiko-developer-confirm-yes' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-edit-textarea' ).val( '' );
		$( '#aiko-developer-edit-submit' ).data( 'type', '' );
		$( '#aiko-developer-confirm-popup-overlay' ).fadeOut();
	});

	// Confirm cancel no
	$( '#aiko-developer-confirm-no' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-confirm-popup-overlay' ).fadeOut();
		$( '#aiko-developer-edit-popup-overlay' ).fadeIn();
	});

	// Rephrase functional requirements (without adding)
	$( '#aiko-developer-functional-requirements-rephrase' ).on( 'click', function() {
		event.preventDefault();

		if ( apiKey === '' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-no-api-key" ) );
			$( '#aiko-developer-alert-ok' ).data( 'action', 'openai-api-url' );
			return;
		}

		if ( $( '#aiko-developer-functional-requirements-output #aiko-developer-functional-requirements-text' ).text() ) {
			$( '#aiko-developer-loader-overlay' ).fadeIn();
			$( '#aiko-developer-rephrase-submit' ).data( 'type', 'without' );
			$.ajax({
				url: ajaxUrl,
				type: 'POST',
				data: {
					action: 'self_rephrase_functional_requirements',
					nonce: $( '#aiko_developer_nonce_field' ).val(),
					functional_requirements: $( '#aiko-developer-functional-requirements-output #aiko-developer-functional-requirements-text' ).text(),
					post_id: postID
				},
				success: function( response ) {
					if ( response.success ) {
						$( '#aiko-developer-rephrased-popup-overlay' ).fadeIn();
						// $( '#aiko-developer-old-text' ).html( format_text( response.data.old ) );
						$( '#aiko-developer-current-text' ).html( format_text( response.data.rephrased ) );
					} else {
						if ( response.data.code ) {
							$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
							$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data.code ) + response.data.message );
						} else {
							$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
							$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data ) );
						}
					}
					$( '#aiko-developer-loader-overlay' ).fadeOut();
				}
			});
		} else {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-empty-fr-rephrase" ) );
		}
	});

	// Submit rephrased functional requirements
	$( '#aiko-developer-rephrase-submit' ).on( 'click', function() {
		if ( $( this ).attr( 'data-type' ) === 'first' ) {
			event.preventDefault();
			$( '#aiko-developer-rephrased-popup-overlay' ).fadeOut();
			$( '#aiko-developer-input' ).val( revert_text( $( '#aiko-developer-current-text' ).html().trim() ) );
			var code_not_generated_is_shown = $( '#aiko-developer-code-not-generated-wrapper' ).hasClass( 'aiko-developer-notice-show' );
			$( '.aiko-developer-notice-show' ).removeClass( 'aiko-developer-notice-show' );
			if ( code_not_generated_is_shown ) {
				$( '#aiko-developer-code-not-generated-wrapper' ).addClass( 'aiko-developer-notice-show' );
			}
			var api_not_present_is_shown = $( '#aiko-developer-api-not-present-wrapper' ).hasClass( 'aiko-developer-notice-show' );
			if ( api_not_present_is_shown ) {
				$( '#aiko-developer-api-not-present-wrapper' ).addClass( 'aiko-developer-notice-show' );
			}
			$( '#aiko-developer-rephrase-comments-notice' ).addClass( 'aiko-developer-notice-show' );
		} else {
			$( '#aiko-developer-status' ).val( '3' );
			$( '#aiko-developer-loader-overlay' ).fadeIn();
			$( '#aiko-developer-rephrased-popup-overlay' ).fadeOut();
			$( '#aiko-developer-rephrase-submit' ).data( 'type', '' );
		}
	});

	// Undo rephrase of functional requirements
	$( '#aiko-developer-rephrase-undo' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-loader-overlay' ).fadeIn();

		$.ajax({
			url: ajaxUrl,
			type: 'POST',
			data: {
				action: 'undo_rephrase',
				nonce: $( '#aiko_developer_nonce_field' ).val(),
				functional_requirements: $( '#aiko-developer-functional-requirements-output #aiko-developer-functional-requirements-text' ).text(),
				post_id: postID,
				old_code_not_generated: $( '#aiko-developer-old-code-not-generated' ).val()
			},
			success: function( response ) {
				$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
				$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data ) );
				$( '#aiko-developer-rephrased-popup-overlay' ).fadeOut();
				$( '#aiko-developer-loader-overlay' ).fadeOut();
				$( '#aiko-developer-comment-not-added' ).hide();
				$( '#aiko-developer-comment-not-added-text' ).text( '' );
			}
		});
	});

	// Rephrase user prompt
	$( '#aiko-developer-user-prompt-rephrase, #aiko-developer-show-rephrase' ).on( 'click', function() {
		event.preventDefault();

		if ( apiKey === '' ) {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-no-api-key" ) );
			$( '#aiko-developer-alert-ok' ).data( 'action', 'openai-api-url' );
			return;
		}

		$( '#aiko-developer-after-title' ).attr( 'data-rephrased-flag', '0' );

		if ( $( this ).attr( 'id' ) === 'aiko-developer-show-rephrase' ) {
			$( '#aiko-developer-publish-confirm-popup-overlay' ).fadeOut();
		}

		if ( $( '#aiko-developer-input' ).val() ) {
			$( '#aiko-developer-loader-overlay' ).fadeIn();

			$.ajax({
				url: ajaxUrl,
				type: 'POST',
				data: {
					action: 'rephrase_user_prompt',
					user_prompt: $( '#aiko-developer-input' ).val(),
					nonce: $( '#aiko_developer_nonce_field' ).val(),
					post_id: postID
				},
				success: function( response ) {
					if ( response.success ) {
						$( '#aiko-developer-rephrased-popup-overlay' ).fadeIn();
						// $( '#aiko-developer-old-user-prompt-text' ).html( format_text( response.data.old ) );
						$( '#aiko-developer-current-text' ).html( format_text( response.data.rephrased ) );
						$( '#aiko-developer-rephrase-submit' ).attr( 'data-type', 'first' );
					} else {
						if ( response.data.code ) {
							$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
							$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data.code ) + response.data.message );
						} else {
							$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
							$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( response.data ) );
							
						}
						$( '#aiko-developer-rephrase-comments-error-text' ).text( aiko_developer_get_message( 'error-rephrase' ) );
					}
					$( '#aiko-developer-loader-overlay' ).fadeOut();
				}
			});
		} else {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-empty-comment-rephrase" ) );
			$( '#aiko-developer-alert-ok' ).data( 'action', 'error-empty-comment-rephrase' );
			$( '#aiko-developer-input' ).focus();
		}
	});

	// Undo rephrase of user prompt
	$( '#aiko-developer-rephrase-user-prompt-undo' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-rephrased-popup-overlay' ).fadeOut();
	});

	// Copy code
	$( '.aiko-developer-copy-code' ).on( 'click', function() {
		event.preventDefault();

		var code = $( '#aiko-developer-' + $( this ).data( 'type' ) + '-output-meta-box pre' ).text();
		if ( code.trim() !== '' ) {
			copyToClipboard( code );
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "success-copy" ) );
		} else {
			$( '#aiko-developer-alert-popup-overlay' ).fadeIn();
			$( '#aiko-developer-alert-text' ).text( aiko_developer_get_message( "error-empty-copy" ) );
		}
	});

	// Copy function
	function copyToClipboard( text ) {
		if ( navigator.clipboard ) {
			navigator.clipboard.writeText( text ).then( function() {
				console.log( 'Text copied to clipboard' );
			}).catch( function( err ) {
				console.error( 'Error copying text: ', err );
			});
		} else {
			fallbackCopyToClipboard( text );
		}
	}

	function fallbackCopyToClipboard( text ) {
		var textArea = document.createElement( "textarea" );
		textArea.value = text;

		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";

		document.body.appendChild( textArea );
		textArea.focus();
		textArea.select();

		try {
			var successful = document.execCommand( 'copy' );
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log( 'Fallback: Copying text command was ' + msg );
		} catch ( err ) {
			console.error( 'Fallback: Oops, unable to copy', err );
		}

		document.body.removeChild( textArea );
	}

	// Start the WordPress Playground test of generated plugin
	$( '.aiko-developer-test-start' ).on( 'click', function() {
		event.preventDefault();
		
		var php = $( '#aiko-developer-php-output-meta-box pre' ).text().replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' ).replace( /\n/g, '\\n' );
		var js = $( '#aiko-developer-js-output-meta-box pre' ).text().replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' ).replace( /\n/g, '\\n' );
		var css = $( '#aiko-developer-css-output-meta-box pre' ).text().replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' ).replace (/\n/g, '\\n' );
		var bluePrint = btoa( '{ "preferredVersions": { "php": "latest", "wp": "latest" }, "landingPage": "/wp-admin/plugins.php", "phpExtensionBundles": [ "kitchen-sink" ], "features": { "networking": true }, "steps": [ { "step": "login", "username": "admin", "password": "password" }, { "step": "mkdir", "path": "/wordpress/wp-content/plugins/my-plugin" }, { "step": "writeFile", "path": "/wordpress/wp-content/plugins/my-plugin/plugin-file.php", "data": "' + php + '" }, { "step": "writeFile", "path": "/wordpress/wp-content/plugins/my-plugin/plugin-scripts.js", "data": "' + js + '" }, { "step": "writeFile", "path": "/wordpress/wp-content/plugins/my-plugin/plugin-styles.css", "data": "' + css + '" }, { "step": "activatePlugin", "pluginPath": "/wordpress/wp-content/plugins/my-plugin" } ] }' );
		var url = "https://playground.wordpress.net/#" + bluePrint;
		window.open( url, '_blank', 'noopener, noreferrer' );
	});

	// Prompt base
	$( '#aiko-developer-import-prompt' ).on( 'click', function() {
		event.preventDefault();
		const prompt_base_empty = $( '#aiko-developer-prompt-base-empty' ).val();
		if ( prompt_base_empty === 'false' ) {
			$( '.aiko-developer-prompt-base-container' ).removeClass( 'aiko-developer-prompt-base-selected' );
			$( '.aiko-developer-prompt-base-tab[data-tag="all"]' ).trigger( 'click' );
			$( '#aiko-developer-prompt-base-preview' ).children().remove();
			$( '#aiko-developer-prompt-base-overlay' ).fadeIn();
		} else {
			$( '#aiko-developer-prompt-base-empty-popup-overlay' ).fadeIn();
		}
	});
	
	$( '.aiko-developer-prompt-base-tab' ).on( 'click', function() {
		$( '.aiko-developer-prompt-base-tab' ).removeClass( 'aiko-developer-prompt-base-active' );
		$( this ).addClass( 'aiko-developer-prompt-base-active' );

		const tag = $( this ).data( 'tag' );

		$( '.aiko-developer-prompt-base-container' ).each( function() {
			const tags = $( this ).data( 'tags' ).split( ', ' );
			if ( tag === 'all' || tags.includes( tag ) ) {
				$( this ).show();
			} else {
				$( this ).hide();
			}
		});
	});

	$( '.aiko-developer-prompt-base-container' ).on( 'click', function() {
		if ( ! $( this ).hasClass( 'aiko-developer-prompt-base-pro-only' ) ) {
			$( '.aiko-developer-prompt-base-container' ).removeClass( 'aiko-developer-prompt-base-selected' );
			
			$( this ).addClass( 'aiko-developer-prompt-base-selected' );

			const title = $( this ).find( '.aiko-developer-prompt-base-prompt-title' ).text();
			const description = $( this ).find( '.aiko-developer-prompt-base-prompt-description' ).text();
			const tags = $( this ).data( 'tags' );
			const model = $ ( this ).find( '.aiko-developer-prompt-base-prompt-span-model' ).text();
			const promptText = $( this ).find( '.aiko-developer-prompt-base-prompt-text' ).val();
			const playground = $( this ).find( '.aiko-developer-prompt-base-playground' ).val();
			const screenshots = $( this ).find( '.aiko-developer-prompt-base-screenshots' ).val();

			$( '#aiko-developer-prompt-base-preview' ).children().remove();
			$( '#aiko-developer-prompt-base-preview' ).html( `
				<div id="aiko-developer-importing-selected">
					<div id="aiko-developer-importing-selected-heading">
						<h3 id="aiko-developer-importing-selected-title">${title}</h3>
						<p id="aiko-developer-importing-selected-description">${description}</p>
					</div>
					<div id="aiko-developer-importing-selected-prompt-wrapper">
						<p class="aiko-developer-prompt-base-prompt-tags"><strong>${aiko_developer_get_message( 'tags' )}:</strong> ${tags}</p>
						<p class="aiko-developer-prompt-base-prompt-model"><strong>Model:</strong> <span id="aiko-developer-importing-selected-model"${model !== selectedModel ? ' class="aiko-developer-not-matching"' : ''}>${model}</span>
						${model !== selectedModel ? '<span class="aiko-developer-tooltip-container aiko-developer-prompt-base-prompt-warning aiko-developer-prompt-base-model-warning"><i class="dashicons dashicons-info aiko-developer-rephrase-info" aria-hidden="true"></i><span class="aiko-developer-tooltip-text">' + aiko_developer_get_message( 'model-not-matching' ) + '</span></span>' : ''}</p>
						<p class="aiko-developer-importing-selected-prompt-text"><strong>${aiko_developer_get_message( 'fr' )}:</strong> <span id="aiko-developer-importing-selected-prompt">${format_text( promptText )}</p>
						<input type="hidden" class="aiko-developer-importing-selected-screenshots" value="${screenshots}" />
					</div>
					<div id="aiko-developer-importing-buttons">
						<button class="button button-large button-primary" id="aiko-developer-prompt-base-submit">${aiko_developer_get_message( 'use-this' )}</button>
						${screenshots ? '<button id="open-gallery" class="button button-large button-secondary">' + aiko_developer_get_message( 'screenshots' ) + '</button>' : '<button class="button button-large button-secondary" disabled>' + aiko_developer_get_message( 'screenshots' ) + '</button>'}
						${playground ? '<a class="button button-secondary" href="' + playground + '" target="_blank" rel="noopener noreferrer">Open Playground</a>' : '<a class="button button-secondary" disabled>' + aiko_developer_get_message( 'open-playground' ) + '</a>' }
					</div>
				</div>
			` );
		} else {
			$( '.aiko-developer-prompt-base-container' ).removeClass( 'aiko-developer-prompt-base-selected' );
			$( '#aiko-developer-prompt-base-preview' ).children().remove();
			$( this ).addClass( 'aiko-developer-prompt-base-selected' );
			$( '#aiko-developer-prompt-base-preview' ).html( `
				<div id="aiko-developer-buy-full-wrapper" class="aiko-developer-block aiko-developer-buy-full-main aiko-developer-buy-full-import">
					<h2 id="aiko-developer-buy-full-title">${aiko_developer_get_message( 'buy-full-title' )}</h2>
					<p id="aiko-developer-buy-full-description">${aiko_developer_get_message( 'buy-full-description' )}</p>
					<p id="aiko-developer-buy-full-call-to action"><a href="https://codecanyon.net/item/aiko-instant-plugins-ai-developer/54220020" target="_blank" rel="noopener noreferrer" class="button button-primary">${aiko_developer_get_message( 'buy-full-button' )}</a></p>
				</div>
			` );
			$( '.aiko-developer-buy-full-import' ).addClass( 'aiko-developer-blinker' );
			setTimeout( () => $( '.aiko-developer-buy-full-import' ).removeClass( 'aiko-developer-blinker' ), 600 );
		}
	});

	$( document ).on( 'click', '#open-gallery', function() {
		event.preventDefault();
		var urlArray = $( '.aiko-developer-importing-selected-screenshots' ).val().split( ',' );
		var itemsArray = urlArray.map( function( url ) {
			return { src: url };
		});		
		$.magnificPopup.open({
            items: itemsArray,
            gallery: {
                enabled: true
            },
            type: 'image'
        });
    });

	$( '.aiko-developer-prompt-base-tab[data-tag="all"]' ).trigger( 'click' );

	$( '#aiko-developer-prompt-base-close' ).on( 'click', function() {
		$( '#aiko-developer-prompt-base-preview' ).children().remove();
		$( '#aiko-developer-prompt-base-overlay' ).fadeOut();
	});

	$( document ).on( 'click', '#aiko-developer-prompt-base-submit', function() {
		event.preventDefault();
		$( '#aiko-developer-input' ).val( revert_text( $( '#aiko-developer-importing-selected-prompt' ).html() ) );
		$( '#aiko-developer-prompt-base-overlay' ).fadeOut();
		if ( $( '#title' ).val() === '' || $( '#title' ).val().includes( '(Imported)' ) ) {
			$( '#title' ).val( $( '#aiko-developer-importing-selected-title' ).text() + ' (Imported)' );
			$( '#title-prompt-text' ).addClass( 'screen-reader-text' );
		}
		$( '#aiko-developer-after-title' ).attr( 'data-rephrased-flag', '0' );
		$( '#aiko-developer-prompt-imported-notice' ).addClass( 'aiko-developer-notice-show' );
	});

	$( '#aiko-developer-prompt-base-empty-popup-ok' ).on( 'click', function() {
		event.preventDefault();
		$( '#aiko-developer-prompt-base-empty-popup-overlay' ).fadeOut();
	});

	const textareaTargetNode = $( '#aiko-developer-input' );

	textareaTargetNode.on('input', function() {
		if ( textareaTargetNode.val().trim() !== '' ) {
			$( '#aiko-developer-user-prompt-rephrase' ).removeClass( 'button-secondary' ).removeClass( 'aiko-developer-button-secondary' ).addClass( 'button-primary' );
			$( '#aiko-developer-import-prompt' ).removeClass( 'button-primary' ).addClass( 'button-secondary' ).addClass( 'aiko-developer-button-secondary' );
		} else {
			$( '#aiko-developer-user-prompt-rephrase' ).removeClass( 'button-primary' ).addClass( 'button-secondary' ).addClass( 'aiko-developer-button-secondary' );
			$( '#aiko-developer-import-prompt' ).removeClass( 'button-secondary' ).removeClass( 'aiko-developer-button-secondary' ).addClass( 'button-primary' );
		}
	});
});