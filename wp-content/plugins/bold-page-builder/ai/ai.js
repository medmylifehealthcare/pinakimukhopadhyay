'use strict';

(function( $ ) {
	
	var response_arr = [];
	var current_index = 0;
	var len_arr = [];
	
	function update_buttons() {
		let prev_button;
		let next_button;
		let counter;
		if ( typeof( bt_bb_fe_dialog_content ) !== 'undefined' ) {
			prev_button = bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( '.bt_bb_ai_prev_button' )[0];
			next_button = bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( '.bt_bb_ai_next_button' )[0];
			counter = bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( '.bt_bb_ai_counter' )[0];
		} else {
			prev_button = document.getElementsByClassName( 'bt_bb_ai_prev_button' )[0];
			next_button = document.getElementsByClassName( 'bt_bb_ai_next_button' )[0];
			counter = document.getElementsByClassName( 'bt_bb_ai_counter' )[0];
		}
		
		// Disable the 'prev' button if we're at the start of the array
		if ( current_index === 0 ) {
			prev_button.disabled = true;
		} else {
			prev_button.disabled = false;
		}

		// Disable the 'next' button if we're at the end of the array
		if ( current_index === response_arr.length - 1 ) {
			next_button.disabled = true;
		} else {
			next_button.disabled = false;
		}
		
		counter.innerHTML = ( current_index + 1 ) + '/' + response_arr.length;
		
		if ( window.bt_bb.editing_element ) { // FE
			$( window.bt_bb.editing_element ).data( 'ai_history_index', current_index );
		} else { // BE
			$( '[data-reactid="' + window.bt_bb_from + '"]' ).data( 'ai_history_index', current_index );
		}
		
	}	
	
	var ai_request = function( that, modify = false ) {
		
		$( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_dialog_item_inner_ai_error' ).removeClass( 'bt_bb_ai_error_show' );
		
		var target = $( that ).closest( '.bt_bb_dialog_item' ).data( 'target' );
		
		len_arr = [];
		
		var content_obj = {};
		var item_content;

		var i = 0;
		$( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_length_container input' ).each(function() {
			var item_len = $( this ).val();
			var this_target = $( this ).data( 'target' );
			if ( item_len == '' || modify ) {
				if ( target != '_content' ) {
					item_content = $( that ).closest( '.bt_bb_dialog_item' ).siblings( '[data-param_name="' + this_target + '"]' ).find( 'input[type="text"], textarea' ).val();
				} else {
					if ( window.bt_bb.editing_element ) { // FE
						item_content = window.bt_bb.tinymce.getContent();
					} else { // BE
						item_content = tinyMCE.get( 'bt_bb_tinymce' ).getContent()
					}
					
				}
				item_len = item_content.length + 'c'; // characters, not words
				content_obj[ this_target ] = item_content;
			}
			len_arr.push( item_len );
			i++;	
		});
		
		if ( modify ) {
			var no_content = true;
			for ( const[ k, v ] of Object.entries( content_obj ) ) {
				if ( v != '' ) {
					no_content = false;
					break;
				}
			}
			if ( no_content ) {
				alert( window.bt_bb_text.no_content );
				return;
			}
		}
		
		$( that ).closest( '.bt_bb_dialog_item' ).addClass( 'bt_bb_ai_loading' );
		
		var data = {
			'action': 'bt_bb_ai',
			'nonce': window.bt_bb_ajax_nonce,
			'keywords': $( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_keywords' ).val(),
			'system_prompt': $( that ).closest( '.bt_bb_dialog_item' ).data( 'system_prompt' ),
			'target': JSON.stringify( target ),
			'tone': $( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_tone' ).val(),
			'mode': $( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_mode' ).val(),
			'language': $( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_language' ).val(),
			'length': JSON.stringify( len_arr ),
			'content': JSON.stringify( {} ),
			'modify': false
		};
		
		if ( modify ) {
			data.content = JSON.stringify( content_obj );
			data.modify = true;
		}
		
		$.ajax({
			method: 'POST',
			url: window.bt_bb_ajax.url,
			data: data,
		}).done(function( response ) {
			$( that ).closest( '.bt_bb_dialog_item' ).removeClass( 'bt_bb_ai_loading' );
			var response_obj;
			try {
				response_obj = JSON.parse( response );
			} catch ( e ) {
				response_obj = null;
			}
			if ( response_obj !== null ) {
				response_arr.push( response_obj );
				current_index = response_arr.length - 1;
				
				if ( window.bt_bb.editing_element ) { // FE
					$( window.bt_bb.editing_element ).data( 'ai_history', response_arr );
					$( window.bt_bb.editing_element ).data( 'ai_history_index', current_index );
				} else { // BE
					$( '[data-reactid="' + window.bt_bb_from + '"]' ).data( 'ai_history', response_arr );
					$( '[data-reactid="' + window.bt_bb_from + '"]' ).data( 'ai_history_index', current_index );
				}
				
				update_buttons();
				update_target( that );
				
				localStorage.setItem( 'bt_bb_ai_tone', $( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_tone' ).val() );
				localStorage.setItem( 'bt_bb_ai_mode', $( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_mode' ).val() );
				localStorage.setItem( 'bt_bb_ai_language', $( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_language' ).val() );
				localStorage.setItem( 'bt_bb_ai_length_' + window.bt_bb.editing_base, len_arr );
				
			} else {
				console.log( response ); // error message
				$( that ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_dialog_item_inner_ai_error' ).addClass( 'bt_bb_ai_error_show' );
			}
		});
	}
	
	function update_target( that ) {
		var all_empty = true;
		len_arr.forEach( ( element ) => {
			if ( element != '0c' ) {
				all_empty = false;
				return false;
			}
		});
		var i = 0;
		for ( const[ k, v ] of Object.entries( response_arr[ current_index ] ) ) {
			var len = len_arr[ i ];
			var len_int = Number.parseInt( len );
			i++;
			if ( ( len_int <= 0 || len == '0c' ) && ! all_empty ) {
				continue;
			}
			if ( k == '_content' ) {
				if ( window.bt_bb.editing_element ) { // FE
					window.switchEditors.go( 'bt_bb_fe_dialog_tinymce','tmce' );
					window.bt_bb.tinymce_dirty = true;
					window.bt_bb.tinymce.setContent( window.switchEditors.wpautop( v ) );
				} else { // BE
					window.switchEditors.go( 'bt_bb_tinymce', 'tmce' );
					tinyMCE.get( 'bt_bb_tinymce' ).setContent( window.switchEditors.wpautop( v ) );
				}
			} else {
				$( that ).closest( '.bt_bb_dialog_item' ).siblings( '[data-param_name="' + k + '"]' ).find( 'input[type="text"], textarea' ).val( v ).trigger( 'input' );
			}
		}
	}
	
	$( document ).ready(function() {
		
		$( document ).on( 'bt_bb_edit_element bt_bb_edit_content', function() {
			response_arr = [];
			current_index = 0;
			if ( window.bt_bb.editing_element ) { // FE
				if ( $( window.bt_bb.editing_element ).data( 'ai_history' ) ) {
					response_arr = $( window.bt_bb.editing_element ).data( 'ai_history' );
					current_index = $( window.bt_bb.editing_element ).data( 'ai_history_index' );
				}
			} else { // BE
				if ( $( '[data-reactid="' + window.bt_bb_from + '"]' ).data( 'ai_history' ) ) {
					response_arr = $( '[data-reactid="' + window.bt_bb_from + '"]' ).data( 'ai_history' );
					current_index = $( '[data-reactid="' + window.bt_bb_from + '"]' ).data( 'ai_history_index' );
				}
			}
			if ( response_arr.length > 0 ) {
				setTimeout(() => {
					update_buttons();
				}, '0' );
			}
		});
		
		//// BE
		
		$( 'body' ).on( 'click', '.bt_bb_ai_regenerate_button', function( e ) {
			var mode = $( this ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_mode' ).val();
			if ( mode == 'generate' ) {
				ai_request( this );
			} else {
				ai_request( this, true );
			}
		});
		
		$( 'body' ).on( 'click', '.bt_bb_ai_prev_button', function( e ) {
			if ( current_index > 0 ) {
				current_index--;
				update_target( this );
			}
			update_buttons();
		});
		
		$( 'body' ).on( 'click', '.bt_bb_ai_next_button', function( e ) {
			if ( current_index < response_arr.length - 1 ) {
				current_index++;
				update_target( this );
			}
			update_buttons();
		});
		
		// Switch
		
		$( 'body' ).on( 'click', '.bt_bb_ai_switch', function( e ) {
			if ( $( e.target )[0].tagName == 'A' ) return;
			if ( $( this ).hasClass( 'bt_bb_ai_open' ) ) {
				$( this ).removeClass( 'bt_bb_ai_open' );
				$( this ).next().removeClass( 'bt_bb_ai_open' );
				localStorage.setItem( 'bt_bb_ai_open', false );
				if ( ! window.bt_bb.editing_element ) { // BE
					$( '.bt_bb_dialog_tinymce_editor_container' ).height( '' );
				}
			} else {
				$( this ).addClass( 'bt_bb_ai_open' );
				$( this ).next().addClass( 'bt_bb_ai_open' );
				localStorage.setItem( 'bt_bb_ai_open', true );
				if ( ! window.bt_bb.editing_element ) { // BE
					$( '.bt_bb_dialog_tinymce_editor_container' ).height( '220px' );
				}
			}
			$( '.bt_bb_group_tab' ).first().click();
		});
		
		//// FE
		
		document.addEventListener( 'click', function( e ) {
			if ( typeof( bt_bb_fe_dialog_content ) !== 'undefined' && e.composedPath()[0].className.includes( 'bt_bb_ai_regenerate_button' ) ) {
				var mode = $( e.composedPath()[0] ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_mode' ).val();
				if ( mode == 'generate' ) {
					ai_request( e.composedPath()[0] );
				} else {
					ai_request( e.composedPath()[0], true );
				}
			}
		});
		
		document.addEventListener( 'click', function( e ) {
			if ( typeof( bt_bb_fe_dialog_content ) !== 'undefined' && e.composedPath()[0].className.includes( 'bt_bb_ai_prev_button' ) ) {
				if ( current_index > 0 ) {
					current_index--;
					update_target( e.composedPath()[0] );
				}
				update_buttons();
			}
		});
		
		document.addEventListener( 'click', function( e ) {
			if ( typeof( bt_bb_fe_dialog_content ) !== 'undefined' && e.composedPath()[0].className.includes( 'bt_bb_ai_next_button' ) ) {
				if ( current_index < response_arr.length - 1 ) {
					current_index++;
					update_target( e.composedPath()[0] );
				}
				update_buttons();
			}
		});
		
		// Switch
		
		document.addEventListener( 'click', function( e ) {
			if ( typeof( bt_bb_fe_dialog_content ) !== 'undefined' && e.composedPath()[0].className.includes( 'bt_bb_ai_switch' ) ) {
				if ( $( e.composedPath()[0] ).hasClass( 'bt_bb_ai_open' ) ) {
					$( e.composedPath()[0] ).removeClass( 'bt_bb_ai_open' );
					$( e.composedPath()[0] ).next().removeClass( 'bt_bb_ai_open' );
					localStorage.setItem( 'bt_bb_ai_open', false );
				} else {
					$( e.composedPath()[0] ).addClass( 'bt_bb_ai_open' );
					$( e.composedPath()[0] ).next().addClass( 'bt_bb_ai_open' );
					localStorage.setItem( 'bt_bb_ai_open', true );
				}
			}
		});
		
		//// BE/FE
		
		window.bt_bb_ai_mode_callback = function( e ) {
			if ( e.val == 'generate' ) {
				$( e.el ).closest( '.bt_bb_dialog_item' ).find( 'input, select' ).not( '.bt_bb_ai_prev_button, .bt_bb_ai_next_button' ).attr( 'disabled', false );
			} else {
				$( e.el ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_keywords' ).attr( 'disabled', true );
				$( e.el ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_length_container input' ).attr( 'disabled', true );
				$( e.el ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_tone' ).attr( 'disabled', true );
				$( e.el ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_language' ).attr( 'disabled', true );
				if ( e.val == 'translate' ) {
					$( e.el ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_language' ).attr( 'disabled', false );
				} else if ( e.val == 'rephrase' ) {
					$( e.el ).closest( '.bt_bb_dialog_item' ).find( '.bt_bb_ai_tone' ).attr( 'disabled', false );
				}
			}
		}
		
	});
	
}( jQuery ));