'use strict';

window.bt_bb_map = {};
window.bt_bb_map_primary = {};
window.bt_bb_map_secondary = {};

window.addEventListener( 'beforeunload', function( e ) {
	if ( window.bt_bb_dirty ) { // prompts the user before unloading
		// Cancel the event
		e.preventDefault();
		// Chrome requires returnValue to be set
		e.returnValue = '';
	}
});

(function( $ ) {

	$( document ).ready(function() {
		
		try {
			window.bt_bb_alo = JSON.parse( localStorage.getItem( 'bt_bb_alo' ) );
		} catch ( error ) {
			console.error( error );
			window.bt_bb_alo = {};
		}
		if ( ! window.bt_bb_alo ) {
			window.bt_bb_alo = {};
		}
		
		$( window ).unload(function() {
			if ( ! window.bt_bb_alo ) {
				window.bt_bb_alo = {};
			}
			localStorage.setItem( 'bt_bb_alo', JSON.stringify( window.bt_bb_alo ) );
		});

		window.bt_bb_mouse = {};
		window.bt_bb_drag_item = null;
		
		if ( $( '#bt_bb' ).length > 0 ) {
			if ( window.bt_bb_data.children.length > 0 ) {
				if ( window.bt_bb_map[window.bt_bb_data.children[0].base] === undefined || window.bt_bb_map[window.bt_bb_data.children[0].base].root !== true ) {
					window.bt_bb_data.children = [];
					window.bt_bb.is_bb_content = false;
				}
			}
		}

		if ( $( '#postdivrich' ).length > 0 && $( '#bt_bb' ).length > 0 ) {

			$( '#postdivrich' ).before( '<div id="bt_bb_editor_toolbar"></div>' );

			if ( window.bt_bb.is_bb_content ) {
				window.bt_bb.editor = 'bb';
				$( '#postdivrich' ).addClass( 'bt_bb_hidden' );
				$( '#bt_bb_editor_toolbar' ).addClass( 'bt_bb_is_bb_editor' );
			} else {
				window.bt_bb.editor = 'wp';
				$( '#bt_bb_sectionid' ).hide();
			}

			var enable_custom_css = window.bt_bb.editor == 'bb' ? true : false;

			$( '#bt_bb_editor_toolbar' ).html( '<button type="button" class="button bt_bb_switch_editor">' + window.bt_bb_text.switch_editor + '</button> <button type="button" class="button bt_bb_custom_css" disabled>' + window.bt_bb_text.custom_css + '</button>' );

			var data = {
				'action': 'bt_bb_get_custom_css',
				'post_id': $( '#post_ID' ).val()
			};

			$.ajax({
				type: 'POST',
				url: window.bt_bb_ajax_url,
				data: data,
				async: true,
				success: function( response ) {
					window.bt_bb_custom_css = window.bt_bb_b64EncodeUnicode( response );
					if ( enable_custom_css ) {
						$( '.bt_bb_custom_css' ).removeAttr( 'disabled' );
					}
					if ( response != '' ) {
						$( '.bt_bb_custom_css' ).addClass( 'button-primary' );
					}
				}
			});

		}

		$( '#publish, #post-preview, #save-post, #save' ).on( 'click', function( e ) {
			window.bt_bb_dirty = false;
			if ( window.bt_bb.editor == 'bb' ) {

				$( '#bt_bb_front_end_preview iframe' ).remove();
				$( '#bt_bb_front_end_preview' ).append( '<iframe name="bt_bb_front_end_preview_iframe"></iframe>' );
				$( '#bt_bb_front_end_preview' ).hide();

				window.bt_bb_action = 'update_wp_editor';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
			}
		});
		
		// MOUSEDOWN
		window.bt_bb_item_mousedown = function() {
			$( '.bt_bb_item' ).each(function() {
				$( this ).unbind( 'mousedown' );
				$( this ).on( 'mousedown', function( e ) {
					e.stopPropagation();
					var rect = this.getBoundingClientRect();
					var offsetX = e.clientX - rect.left;
					var offsetY = e.clientY - rect.top;
					window.bt_bb_mouse.initOffsetX = offsetX;
					window.bt_bb_mouse.initOffsetY = offsetY;
					
					window.bt_bb_action = null;
					
					window.bt_bb_drag_item = $( this );
					
					$( '.bt_bb_toolbar_tools_visible' ).removeClass( 'bt_bb_toolbar_tools_visible' );
					
					var bound = $( this ).parent()[0].getBoundingClientRect(); // decimal height
					$( this ).parent().css( 'height', bound['height'] );
					
					$( this ).parent().addClass( 'bt_bb_wrap_drag' );
					$( this ).addClass( 'bt_bb_drag' );
					$( this ).find( '.bt_bb_horizontal' ).css( 'height', 'auto' );
					$( this ).find( '.bt_bb_width .bt_bb_item' ).css( 'height', 'auto' );
					$( this ).css( 'width', $( this ).width() );
					if ( ! $( this ).hasClass( 'bt_bb_toggled' ) ) {
						bound = $( this )[0].getBoundingClientRect();
						$( this ).css( 'height', bound['height'] );
					}
					$( this ).css( 'position', 'fixed' );
					$( this ).css( 'zIndex', '100000' );
					//$( this ).css( 'opacity', window.bt_bb_drag_opacity );
					$( this ).css( 'top', bt_bb_mouse.y - bt_bb_mouse.initOffsetY );
					$( this ).css( 'left', bt_bb_mouse.x - bt_bb_mouse.initOffsetX );
				});
			});
		}
		
		bt_bb_item_mousedown();
		
		// MOUSEUP
		$( document ).mouseup(function( e ) {
			
			$( '.bt_bb_marker' ).removeClass( 'bt_bb_marker' );
			
			if ( window.bt_bb_drag_item != null ) {
			
				window.bt_bb_dialog.hide();
			
				$( '.bt_bb_toolbar_tools' ).css( 'opacity', '' );
			
				if ( window.bt_bb_action != null && window.bt_bb_action.startsWith( 'move' ) ) {
					window.bt_bb_ctrl = e.ctrlKey;
					bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				}
				
				window.bt_bb_drag_item.parent().css( 'height', '' );
				window.bt_bb_drag_item.parent().removeClass( 'bt_bb_wrap_drag' );
				
				window.bt_bb_drag_item.removeClass( 'bt_bb_drag' );
				window.bt_bb_drag_item.find( '.bt_bb_horizontal' ).css( 'height', '' );
				window.bt_bb_drag_item.find( '.bt_bb_width .bt_bb_item' ).css( 'height', '' );

				window.bt_bb_drag_item.css( 'position', '' );
				window.bt_bb_drag_item.css( 'zIndex', '' );
				window.bt_bb_drag_item.css( 'opacity', '' );
				window.bt_bb_drag_item.css( 'width', '' );
				if ( ! window.bt_bb_drag_item.hasClass( 'bt_bb_toggled' ) ) {
					window.bt_bb_drag_item.css( 'height', '' );
				}
				window.bt_bb_drag_item.css( 'top', '' );
				window.bt_bb_drag_item.css( 'left', '' );
			
			}
			window.bt_bb_drag_item = null;
		});

		// MOUSEMOVE
		$( document ).mousemove(function( e ) {
			
			//bt_bb_mouse.prev_x = bt_bb_mouse.x;
			//bt_bb_mouse.prev_y = bt_bb_mouse.y;
			
			bt_bb_mouse.x = e.clientX;
			bt_bb_mouse.y = e.clientY;
			
			if ( window.bt_bb_drag_item != null ) {
			
				window.bt_bb_drag_item.css( 'top', bt_bb_mouse.y - bt_bb_mouse.initOffsetY );
				window.bt_bb_drag_item.css( 'left', bt_bb_mouse.x - bt_bb_mouse.initOffsetX );
				
				var target = bt_bb_get_action();
				
				$( '.bt_bb_marker' ).removeClass( 'bt_bb_marker bt_bb_marker_up bt_bb_marker_down bt_bb_marker_left bt_bb_marker_right bt_bb_marker_inside' );
				if ( window.bt_bb_action != null ) {
					if ( target[1] == 'up' ) {
						target[0].addClass( 'bt_bb_marker bt_bb_marker_up' );
					} else if ( target[1] == 'down' ) {
						target[0].addClass( 'bt_bb_marker bt_bb_marker_down' );
					} else if ( target[1] == 'left' ) {
						target[0].addClass( 'bt_bb_marker bt_bb_marker_left' );
					} else if ( target[1] == 'right' ) {
						target[0].addClass( 'bt_bb_marker bt_bb_marker_right' );						
					} else if ( target[1] == 'inside' ) {
						target[0].addClass( 'bt_bb_marker bt_bb_marker_inside' );
					}
				}
			}
			/*$( '.bt_bb_item' ).each(function() {
				if ( bt_bb_point_coll_top( $( this ), bt_bb_mouse.x, bt_bb_mouse.y ) ) {
					//if ( window.bt_bb_drag_item === null || ( $( this ).data( 'reactid' ) != window.bt_bb_drag_item.data( 'reactid' ) ) ) {
					if ( window.bt_bb_drag_item === null ) {
						$( this ).parents( '.bt_bb_item' ).removeClass( 'bt_bb_item_mouseover' );
						$( this ).addClass( 'bt_bb_item_mouseover' );
					}
				} else {
					$( this ).removeClass( 'bt_bb_item_mouseover' );
				}
			});*/
			/*$( '.bt_bb_item' ).each(function() {
				if ( bt_bb_point_coll_top( $( this ), bt_bb_mouse.x, bt_bb_mouse.y ) ) {
					//if ( Math.abs( bt_bb_mouse.x - bt_bb_mouse.prev_x ) < 2 && Math.abs( bt_bb_mouse.y - bt_bb_mouse.prev_y ) < 2 ) {
					if ( ! window.bt_bb_dialog.is_mouseover ) {
						var tools = $( this ).find( '.bt_bb_toolbar_tools' ).first();
						if ( window.bt_bb_drag_item === null ) {
							if ( ! tools.hasClass( 'bt_bb_toolbar_tools_visible' ) ) {
								tools.addClass( 'bt_bb_toolbar_tools_visible' );
							}
						}
					}
					//}
				} else {
					$( this ).find( '.bt_bb_toolbar_tools' ).first().removeClass( 'bt_bb_toolbar_tools_visible' );
					$( this ).find( '.bt_bb_toolbar_tools' ).first().hide().show(0);
				}
			});*/
		});
		
		$( document ).on( 'mouseover', '#bt_bb_dialog', function( e ) {
			e.stopPropagation();
			window.bt_bb_dialog.is_mouseover = true;
			$( '.bt_bb_toolbar_tools_visible' ).removeClass( 'bt_bb_toolbar_tools_visible' );
		});
		
		$( document ).on( 'mouseleave', '#bt_bb_dialog', function( e ) {
			window.bt_bb_dialog.is_mouseover = false;
		});
		
		// ADD TO ROOT
		$( '#bt_bb_add_root' ).click(function( e ) {
			e.preventDefault();
			window.bt_bb_dialog.hide();
			window.bt_bb_action = 'add_root';
			bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
		});
		
		//// MAIN TOOLBAR

		// undo
		$( '#bt_bb_main_toolbar .bt_bb_undo' ).click(function( e ) {
			bt_bb_undo();
		});
		
		// redo
		$( '#bt_bb_main_toolbar .bt_bb_redo' ).click(function( e ) {
			bt_bb_redo();
		});

		// paste main toolbar
		$( '#bt_bb_main_toolbar .bt_bb_paste_root' ).click(function( e ) {
			bt_bb_paste_main_toolbar();
		});
		
		// manage clipboard
		$( '#bt_bb_main_toolbar .bt_bb_manage_clipboard' ).click(function( e ) {
			window.bt_bb_dialog.hide();
			window.bt_bb_dialog.show( 'manage_cb' );
		});
		
		// shortcode mapper
		$( '#bt_bb_main_toolbar .bt_bb_sc_mapper' ).click(function( e ) {
			window.bt_bb_dialog.hide();
			window.bt_bb_dialog.show( 'sc_mapper' );
		});

		// switch
		$( '#bt_bb_editor_toolbar .bt_bb_switch_editor' ).click(function( e ) {
			if ( window.bt_bb.editor == 'bb' ) {
				window.bt_bb.editor = 'wp';
				window.bt_bb_action = 'update_wp_editor';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				$( '#postdivrich' ).removeClass( 'bt_bb_hidden' );
				$( '#bt_bb_sectionid' ).hide();
				$( '#postdivrich' ).hide().show( 0 );
				$( this ).parent().removeClass( 'bt_bb_is_bb_editor' );
				$( '.bt_bb_custom_css' ).attr( 'disabled', '' );
			} else {
				if ( confirm( window.bt_bb_text.switch_editor_confirm ) ) {
					window.bt_bb.editor = 'bb';
					$( '#postdivrich' ).addClass( 'bt_bb_hidden' );
					$( '#bt_bb_sectionid' ).show( 0 );
					$( this ).parent().addClass( 'bt_bb_is_bb_editor' );
					$( '.bt_bb_custom_css' ).removeAttr( 'disabled' );
					//$( '#publish' ).click();
				}
			}
		});
		
		// custom css
		$( '#bt_bb_editor_toolbar .bt_bb_custom_css' ).on( 'click', function( e ) {
			window.bt_bb_dialog.hide();
			window.bt_bb_dialog.show( 'custom_css' );
			$( '#bt_bb_dialog' ).addClass( 'bt_bb_dialog_custom_css' );
		});
		
		// preview
		$( '#bt_bb_main_toolbar .bt_bb_preview' ).on( 'click', function( e ) {
			$( '#post-preview' ).click();
		});
		
		// save
		$( '#bt_bb_main_toolbar .bt_bb_save' ).on( 'click', function( e ) {
			$( '#publish' ).click();
		});
		
		//// TOOLBAR
		window.bt_bb_toolbar = function() {
		
			$( document ).unbind( 'keydown.bt_bb' );
			$( document ).unbind( 'keyup.bt_bb' );
			$( '.bt_bb_toolbar' ).unbind( 'mouseover' );
			$( '.bt_bb_toolbar' ).unbind( 'mouseout' );
			$( '.bt_bb_toolbar i' ).unbind( 'mousedown' );
			$( '.bt_bb_toolbar i' ).unbind( 'click' );
		
			/*// MOUSEOVER
			$( '.bt_bb_item' ).mouseover(function( e ) {
				e.stopPropagation();
				var toolbar = $( this ).find( '.bt_bb_toolbar_tools' ).first();
				if ( ! toolbar.hasClass( 'bt_bb_toolbar_tools_visible' ) ) {
					$( this ).parents( '.bt_bb_item' ).last().find( '.bt_bb_toolbar_tools' ).removeClass( 'bt_bb_toolbar_tools_visible' );
					toolbar.addClass( 'bt_bb_toolbar_tools_visible' );
				}
			});
			
			// MOUSELEAVE
			$( '.bt_bb_item' ).mouseleave(function( e ) {
				$( this ).find( '.bt_bb_toolbar_tools' ).first().removeClass( 'bt_bb_toolbar_tools_visible' );
			});*/
			
			//// BUTTONS
			$( '.bt_bb_toolbar i' ).mousedown(function( e ) {
				e.stopPropagation();
			});
			
			$( '.bt_bb_toolbar .bt_bb_order' ).mousedown(function( e ) {
				e.stopPropagation();
			});		

			// TOGGLE
			$( '.bt_bb_toolbar .bt_bb_toggle' ).on( 'click', function( e ) {
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				if ( $( this ).closest( '.bt_bb_item' ).hasClass( 'bt_bb_toggled' ) ) {
					//$( this ).closest( '.bt_bb_item' ).removeClass( 'bt_bb_toggled' );
					window.bt_bb_action = 'toggle_off';
					//$( this ).closest( '.bt_bb_item' ).css( 'height', '' );
				} else {
					//$( this ).closest( '.bt_bb_item' ).addClass( 'bt_bb_toggled' );
					window.bt_bb_action = 'toggle_on';
					//$( this ).closest( '.bt_bb_item' ).css( 'height', $( this ).parent().height() + window.bt_bb.padding * 2 );
				}
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
			});
			
			// DELETE
			$( '.bt_bb_toolbar .bt_bb_delete' ).click(function( e ) {
				window.bt_bb_action = 'delete';
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
			});
			
			// ADD
			$( '.bt_bb_toolbar .bt_bb_add' ).click(function( e ) {
				e.preventDefault();
				window.bt_bb_dialog.hide();
				if ( $( this ).closest( '.bt_bb_item' ).data( 'container' ) == 'horizontal' ) {
					window.bt_bb_action = 'add_horizontal';
				} else {
					window.bt_bb_action = 'add';		
				}
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				window.bt_bb_base = $( this ).closest( '.bt_bb_item' ).data( 'base' );
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
			});
			
			// EDIT
			$( '.bt_bb_toolbar .bt_bb_edit' ).click(function( e ) {
				e.preventDefault();
				window.bt_bb_dialog.hide();
				window.bt_bb_action = 'edit';
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				window.bt_bb_base = $( this ).closest( '.bt_bb_item' ).data( 'base' );
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );				
			});
			
			// CLONE
			$( '.bt_bb_toolbar .bt_bb_clone' ).click(function( e ) {
				e.preventDefault();
				window.bt_bb_action = 'clone';
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );	
			});
			
			// COPY
			$( '.bt_bb_toolbar .bt_bb_copy' ).click(function( e ) {
				e.preventDefault();
				window.bt_bb_action = 'copy';
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				if ( e.ctrlKey ) {
					window.bt_bb_action = 'delete';
					window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
					bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				}
			});
			
			// COPY PLUS
			$( '.bt_bb_toolbar .bt_bb_copy_plus' ).click(function( e ) {
				e.preventDefault();
				window.bt_bb_action = 'copy_plus';
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				if ( e.ctrlKey ) {
					window.bt_bb_action = 'delete';
					window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
					bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				}
			});
			
			// PASTE
			$( '.bt_bb_toolbar .bt_bb_paste' ).click(function( e ) {
				e.preventDefault();
				if ( e.ctrlKey ) {
					window.bt_bb_action = 'paste_before';
				} else {
					window.bt_bb_action = 'paste';
				}
				window.bt_bb_from = $( this ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );	
			});
			
			// PREVIEW FRONT END (SECTION)
			$( '.bt_bb_toolbar .bt_bb_order' ).click(function( e ) {
				e.preventDefault();
				
				window.bt_bb_dialog.hide();
				
				var order = $( this ).find( '.bt_bb_order_inner' ).html();
				
				$( '#bt_bb_front_end_preview' ).show();
				$( '#bt_bb_front_end_preview' ).append( '<div class="bt_bb_front_end_preview_loading"><div class="bt_bb_fe_loader"><div class="sk-cube sk-cube1"></div><div class="sk-cube sk-cube2"></div><div class="sk-cube sk-cube3"></div><div class="sk-cube sk-cube4"></div><div class="sk-cube sk-cube5"></div><div class="sk-cube sk-cube6"></div><div class="sk-cube sk-cube7"></div><div class="sk-cube sk-cube8"></div><div class="sk-cube sk-cube9"></div></div><!-- /bt_bb_fe_loader --></div>' );
				
				$( '#bt_bb_front_end_preview iframe' ).remove();
				$( '#bt_bb_front_end_preview' ).append( '<iframe name="bt_bb_front_end_preview_iframe"></iframe>' );
				
				$( '#bt_bb_front_end_preview iframe' ).css( 'opacity', '0' );
				
				$( '#bt_bb_front_end_preview iframe' ).load(function() {
					var frameContents;
					frameContents = $( '#bt_bb_front_end_preview iframe' ).contents();
					frameContents.find( '#wpadminbar' ).hide();
					frameContents.find( 'html' ).attr( 'style', 'margin-top: 0px !important' );
					frameContents.find( 'body' ).removeClass( 'admin-bar' );
					frameContents.find( 'body' ).imagesLoaded().always( function( instance ) {
						$( '#bt_bb_front_end_preview .bt_bb_front_end_preview_loading' ).remove();
						var arr1 = frameContents.find( '.bt_bb_fe_wrap' );
						var arr2 = [];
						arr1.each(function( index, item ) {
							if ( item.closest( '.menu' ) === null ) {
								arr2.push( item );
							}
						});
						$( '#bt_bb_front_end_preview iframe' ).css( 'opacity', '1' );
						frameContents.find( 'html, body' ).scrollTop( $( arr2[ order - 1 ] ).offset().top );
					});
				});
				
				window.bt_bb_resize_front_end_preview();
				
				window.bt_bb_action = 'update_wp_editor';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
			
				// Submit the form saving a draft or an autosave, and show a preview in a new tab
				//$('#post-preview').on( 'click.post-preview', function( event ) {
					
					var $form = $('form#post');
					
					$('<input>').attr({
						type: 'hidden',
						value: 'true',
						name: 'bt_bb_fe_preview'
					}).appendTo($form);
					
					var $previewField = $('input#wp-preview');
					var target = 'bt_bb_front_end_preview_iframe';
					var ua = navigator.userAgent.toLowerCase();

					if ( wp.autosave ) {
						wp.autosave.server.tempBlockSave();
					}

					$previewField.val('dopreview');
					$form.attr( 'target', target ).submit().attr( 'target', '' );
					
					$('input[name="bt_bb_fe_preview"]').remove();

					// Workaround for WebKit bug preventing a form submitting twice to the same action.
					// https://bugs.webkit.org/show_bug.cgi?id=28633
					if ( ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 ) {
						$form.attr( 'action', function( index, value ) {
							return value + '?t=' + ( new Date() ).getTime();
						});
					}

					$previewField.val('');
				//});

			});
			
			$( '.bt_bb_front_end_preview_close' ).click(function( e ) {
				$( '#bt_bb_front_end_preview' ).hide();
			});
			
		};
		
		window.bt_bb_toolbar();
		
		if ( $( '#bt_bb' ).length > 0 ) { // is back end
			window.bt_bb_init_number_items();
		}
		
		function getParameterByName( name ) {
			var url = window.location.href;
			name = name.replace( /[\[\]]/g, '\\$&' );
			var regex = new RegExp( '[?&]' + name + '(=([^&#]*)|&|#|$)' );
			var results = regex.exec( url );
			if ( ! results ) return null;
			if ( ! results[2] ) return '';
			return decodeURIComponent( results[2].replace( /\+/g, ' ' ) );
		}
		
		//$( document ).ready(function() {
			if ( Number.isInteger( parseInt( getParameterByName( 'bt_bb_order' ) ) ) ) {
				var order = parseInt( getParameterByName( 'bt_bb_order' ) );
				setTimeout(function() { $( 'html, body' ).scrollTop( $( '.bt_bb_order' ).eq( order - 1 ).offset().top - $( '#wpadminbar' ).height() - 24 ) }, 500 );
			}
		//});
		
		$( '#bt_bb_front_end_preview' ).on( 'click', '.bt_bb_front_end_preview_resize', function( e ) {
			$( '#bt_bb_front_end_preview' ).removeClass( 'bt_bb_front_end_preview_xxl' );
			$( '#bt_bb_front_end_preview' ).removeClass( 'bt_bb_front_end_preview_xl' );
			$( '#bt_bb_front_end_preview' ).removeClass( 'bt_bb_front_end_preview_lg' );
			$( '#bt_bb_front_end_preview' ).removeClass( 'bt_bb_front_end_preview_md' );
			$( '#bt_bb_front_end_preview' ).removeClass( 'bt_bb_front_end_preview_sm' );
			$( '#bt_bb_front_end_preview' ).removeClass( 'bt_bb_front_end_preview_xs' );
			$( this ).siblings().removeClass( 'bt_bb_front_end_preview_selected' );
			$( this ).addClass( 'bt_bb_front_end_preview_selected' );
			
			var size = $( this ).data( 'preview-size' );
			$( '#bt_bb_front_end_preview' ).addClass( 'bt_bb_front_end_preview_' + size );
			
			var width = false;
			if ( size == 'xxl' ) {
				width = Math.round( $( window ).width() * .9 );
				if ( width < 1400 ) {
					width = 1400;
				}
				width += 'px';
			} else if ( size == 'xl' ) {
				width = '1400px';
			} else if ( size == 'lg' ) {
				width = '1200px';
			} else if ( size == 'md' ) {
				width = '992px';
			} else if ( size == 'sm' ) {
				width = '768px';
			} else if ( size == 'xs' ) {
				width = '480px';
			}
			
			$( '#bt_bb_front_end_preview' ).data( 'width', width );
			
			window.bt_bb_resize_front_end_preview();
		});
		
	});
	
	window.bt_bb_get_action = function() {
		var x = bt_bb_mouse.x;
		var y = bt_bb_mouse.y;
		window.bt_bb_action = null;
		var marker_target = null;
		var marker = null;
		if ( ! bt_bb_point_coll( bt_bb_drag_item.parent(), x, y ) ) {
			
			var drag_base = bt_bb_drag_item.data( 'base' );
			
			var set = $( '.bt_bb_item' ).not( '.bt_bb_drag' ).not( '.bt_bb_drag .bt_bb_item' );
			if ( drag_base == 'bt_bb_section' || drag_base == 'bt_section' ) {
				set = $( '.bt_bb_item[data-base="bt_bb_section"],.bt_bb_item[data-base="bt_section"]' ).not( '.bt_bb_drag' ).not( '.bt_bb_drag .bt_bb_item' );
			}
			
			var closest = bt_bb_get_closest( set, x, y );
			
			if ( closest != null ) {
				var closest_pos = bt_bb_get_position( closest );
				window.bt_bb_from = bt_bb_drag_item.parent().data( 'reactid' );
				window.bt_bb_to = closest.parent().data( 'reactid' );

				if ( closest_pos == 'inside' ) {
					var target_parent_base = closest.data( 'base' );
					var target = closest;
				} else {
					var target_parent_base = closest.parent().closest( '.bt_bb_item' ).data( 'base' );
					var target = closest.parent().closest( '.bt_bb_item' );
				}
				
				marker_target = closest;
				
				var allow_action = false;
				
				// root
				if ( closest.parent().parent().hasClass( 'bt_bb_item_list' ) && closest_pos != 'inside' ) {
					if ( window.bt_bb_map[ drag_base ] !== undefined && window.bt_bb_map[ drag_base ].root === true ) {
						allow_action = true;
					} else {
						allow_action = false;
					}
				} else if ( window.bt_bb_map[ target_parent_base ] === undefined || window.bt_bb_map[ target_parent_base ].accept === undefined ) {
					allow_action = false;
				} else if ( window.bt_bb_map[ target_parent_base ].accept[ drag_base ] === true ) {
					allow_action = true;
				} else if ( window.bt_bb_map[ target_parent_base ].accept[ drag_base ] === false ) {
					allow_action = false;
				} else if ( window.bt_bb_map[ target_parent_base ].accept_all === true ) {
					allow_action = true;
				} else if ( window.bt_bb_map[ target_parent_base ].accept_all === false ) {
					allow_action = false;
				}
				
				// max horizontal items
				if ( target.find( '.bt_bb_horizontal' ).length > 0 ) {
					if ( target.find( '.bt_bb_horizontal' )[0].children.length >= 12 ) {
						allow_action = false;
					}
				}						
				
				if ( allow_action ) {
					if ( closest_pos == 'down' ) {
						window.bt_bb_action = 'move_down';
						marker = 'down';
						if ( marker_target.parent().hasClass( 'bt_bb_width' ) ) marker = 'right';
					} else if ( closest_pos == 'up' ) {
						window.bt_bb_action = 'move_up';
						marker = 'up';
						if ( marker_target.parent().hasClass( 'bt_bb_width' ) ) marker = 'left';
					} else if ( closest_pos == 'left' ) {
						window.bt_bb_action = 'move_up';
						marker = 'up';
						if ( marker_target.parent().hasClass( 'bt_bb_width' ) ) marker = 'left';
					} else if ( closest_pos == 'right' ) {
						window.bt_bb_action = 'move_down';
						marker = 'down';
						if ( marker_target.parent().hasClass( 'bt_bb_width' ) ) marker = 'right';
					} else if ( closest_pos == 'inside' ) {
						window.bt_bb_action = 'move_inside';
						marker = 'inside';
					}
				}
			}
		}
		var ret = [marker_target, marker];
		return ret;
	}
	
	window.bt_bb_point_coll = function( element, x, y ) {
		var top = element.offset().top - $( window ).scrollTop();
		var left = element.offset().left;
		var w = element.innerWidth();
		var h = element.innerHeight();
		return bt_bb_point_coll_base( top, left, w, h, x, y );
	}
	
	window.bt_bb_point_coll_top = function( element, x, y ) {
		var top = element.offset().top - $( window ).scrollTop();
		var left = element.offset().left;
		var w = element.innerWidth();
		var h = element.find( '.bt_bb_toolbar' ).height() + window.bt_bb.padding * 2;
		return bt_bb_point_coll_base( top, left, w, h, x, y );
	}
	
	window.bt_bb_point_coll_base = function( top, left, w, h, x, y ) {
		var thisX = [ left, left, left + w, left + w ];
		var thisY = [ top, top + h, top + h, top ];
		var collision = true;
		var A, B, C;
		for ( var i = 0; i < 4; i++ ) {
			if ( i == 3 ) {
				A = - ( thisY[0] - thisY[ i ] );
				B = thisX[0] - thisX[ i ];
				C = - ( A * thisX[ i ] + B * thisY[ i ] );
			} else {
				A = - ( thisY[ i + 1 ] - thisY[ i ] );
				B = thisX[ i + 1 ] - thisX[ i ];
				C = - ( A * thisX[ i ] + B * thisY[ i ] );
			}

			if ( A * x + B * y + C > 0 ) {
				collision = false;
			}
		}
		return collision;
	}	
	
	window.bt_bb_point_dist = function( element, x, y ) {
		var top = element.offset().top - $( window ).scrollTop();
		var left = element.offset().left;	
		var bottom = top + element.innerHeight();
		var right = left + element.innerWidth();
		if (  x > left && x < right && y > top && y < bottom ) {
			return Math.min( Math.min( Math.abs( y - top ), Math.abs( y - bottom ) ), Math.min( Math.abs( x - left ), Math.abs( x - right ) ) );
		} else if ( x > left && x < right ) {
			return Math.min( Math.abs( y - top ), Math.abs( y - bottom ) );
		} else if ( y > top && y < bottom ) {
			return Math.min( Math.abs( x - left ), Math.abs( x - right ) );
		} else {
			return null;
		}
	}
	
	window.bt_bb_get_closest = function( set, x, y ) {
		var d = 100000;
		var element = null;
		set.each(function() {
			var td = bt_bb_point_dist( $( this ), x, y );
			if ( td != null && td <= d ) {
				d = td;
				element = $( this );
			}
		});
		
		var drag_base = bt_bb_drag_item.data( 'base' );
		
		if ( element !== null && element.data( 'base' ) == 'bt_bb_column' && drag_base != 'bt_bb_column' && element.find( $( '.bt_bb_item' ) ).length ) {
			element = window.bt_bb_get_closest( element.find( $( '.bt_bb_item' ).not( '.bt_bb_drag' ).not( '.bt_bb_drag .bt_bb_item' ) ), x, y );
		}
		
		return element;
	}
	
	window.bt_bb_get_position = function( element ) {
		var top = element.offset().top - $( window ).scrollTop();
		var left = element.offset().left;	
		var bottom = top + element.innerHeight();
		var right = left + element.innerWidth();
		if ( bt_bb_mouse.y < top ) {
			var pos = 'up';
		} else if ( bt_bb_mouse.y > bottom ) {
			var pos = 'down';
		} else if ( bt_bb_mouse.x < left ) {
			var pos = 'left';
		} else if ( bt_bb_mouse.x > right ) {
			var pos = 'right';
		} else {
			var pos = 'inside';
		}
		return pos;
	}
	
	window.bt_bb_event = function( e ) {
		window.bt_bb_action = e;
		bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
	}
	
	window.bt_bb_resize_dialog = function( e ) {
		var ih = $( window ).innerHeight();
		if ( ih < 800 ) {
			var mh = Math.round( $( window ).innerHeight() * .5 );
		} else {
			var mh = Math.round( $( window ).innerHeight() * .65 );
		}
		$( '#bt_bb_dialog .bt_bb_dialog_content' ).css( 'max-height', mh );
		
		$( '#bt_bb_dialog' ).css( 'width', Math.round( $( window ).width() * .5 ) + 'px' );
		
		var dw = $( '#bt_bb_dialog' ).width();
		//var dh = $( '#bt_bb_dialog' ).height();
		
		$( '#bt_bb_dialog' ).css( { 'transform': 'translateX(' + Math.round( - dw * .5 ) + 'px)' } );

	}
	
	window.bt_bb_resize_front_end_preview = function() {
		
		var width = $( '#bt_bb_front_end_preview' ).data( 'width' );

		if ( width ) {
			$( '#bt_bb_front_end_preview' ).css( 'width', width );
		} else {
			$( '#bt_bb_front_end_preview' ).css( 'width', Math.round( $( window ).width() * .9 ) + 'px' );
		}
		
		$( '#bt_bb_front_end_preview' ).css( 'height', Math.round( $( window ).innerHeight() * .8 ) );
		
		if ( width ) {
			var dw = parseFloat( width );
		} else {
			var dw = $( '#bt_bb_front_end_preview' ).width();
		}

		var dh = $( '#bt_bb_front_end_preview' ).height();
		
		//$( '#bt_bb_front_end_preview' ).css( { 'transform': 'translate(' + Math.round( - dw * .5 ) + 'px,' + Math.round( - dh * .5 ) + 'px)' } );

	}
	
	// RESIZE
	$( window ).resize(function() {
		window.bt_bb_resize_dialog();
		window.bt_bb_resize_front_end_preview();
	});	
	
}( jQuery ));
