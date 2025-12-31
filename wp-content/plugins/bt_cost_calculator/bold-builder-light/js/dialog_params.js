'use strict';

(function( $ ) {

	window.bt_bb_dialog_param = {

		attach_image: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ],
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			content += '<div class="bt_bb_dialog_image_container">';
			
			if ( Number.isInteger( parseInt( obj.attr_value ) ) ) {
				content += '<div class="bt_bb_sortable_item" data-id="' + obj.attr_value + '"><i class="fa fa-times"></i></div>';
				setTimeout( window.bt_bb_sortable_background, 100, obj.attr_value );
			}
			
			content += '</div>';
			content += '<div class="bt_bb_dialog_inline_buttons bt_bb_left">';
				content += '<input type="button" class="bt_bb_dialog_select_images_button button button-small" value="' + window.bt_bb_text.select + '">';
			content += '</div>';
			
			content += '<div>';
				if ( ! Number.isInteger( parseInt( obj.attr_value ) ) ) {
					content += '<input type="text" placeholder="' + window.bt_bb_text.or_enter_image_url + '" value="' + obj.attr_value + '">';
				} else {
					content += '<input disabled type="text" placeholder="' + window.bt_bb_text.or_enter_image_url + '">';
				}
			content += '</div>';
			
			div.innerHTML = content;
			
			return div;
		},
		
		attach_images: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ],
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			content += '<div class="bt_bb_dialog_image_container">';
				var img_arr = obj.attr_value.split( ',' );
				if ( img_arr[0] != '' ) {
					for ( var j = 0; j < img_arr.length; j++ ) {
						if ( Number.isInteger( parseInt( img_arr[ j ] ) ) ) {
							content += '<div class="bt_bb_sortable_item" data-id="' + img_arr[ j ] + '"><i class="fa fa-times"></i></div>';
							setTimeout( window.bt_bb_sortable_background, 100, img_arr[ j ] );
						}
					}
				}
			content += '</div>';
			content += '<div class="bt_bb_dialog_inline_buttons bt_bb_left">';
				content += '<input type="button" class="bt_bb_dialog_select_images_button button button-small" value="' + window.bt_bb_text.select + '">';
			content += '</div>';
			
			div.innerHTML = content;
			
			return div;
		},

		textfield: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );

			var html = '';
			if ( obj.attr_value == '' ) {
				if ( obj.param.value !== undefined ) {
					html = obj.param.value;
					html = bt_bb_special_char_decode( html );
				}
			} else {
				html = bt_bb_special_char_decode( obj.attr_value );
			}
			
			var placeholder = '';
			if ( obj.param.placeholder !== undefined ) {
				placeholder = obj.param.placeholder;
				placeholder = ' ' + 'placeholder="' + placeholder + '"';
			}
			
			div.innerHTML = '<b>' + obj.param.heading + '</b><input type="text" value="' + html + '"' + placeholder + '>';

			return div;

		},
		
		datetime_local: function( obj ) {
			
			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );

			var html = '';
			if ( obj.attr_value == '' ) {
				if ( obj.param.value !== undefined ) {
					html = obj.param.value;
					html = bt_bb_special_char_decode( html );
				}
			} else {
				html = bt_bb_special_char_decode( obj.attr_value );
			}

			div.innerHTML = '<b>' + obj.param.heading + '</b><input type="datetime-local" value="' + html + '">';
			
			return div;
			
		},

		textarea: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			div.innerHTML = '<b>' + obj.param.heading + '</b><textarea rows="5">' + bt_bb_special_char_decode( obj.attr_value ) + '</textarea>';

			return div;

		},

		textarea_object: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			try {
				div.innerHTML = '<b>' + obj.param.heading + '</b><textarea rows="5">' + window.bt_bb_b64DecodeUnicode( obj.attr_value ) + '</textarea>';
			} catch( e ) {
				div.innerHTML = '<b>' + obj.param.heading + '</b><textarea rows="5">' + obj.attr_value + '</textarea>';
			}

			return div;
		},

		dropdown: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			if ( obj.param.responsive_override ) {
				$( div ).addClass( 'bt_bb_dialog_item_responsive_override' );
			}
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			
			var get_select = function( attr_value, responsive_override ) {
				
				var html = '<select>';
				
				if ( responsive_override ) {
					html += '<option value="">---</option>';
				}
				
				var options = obj.param.value;
				var keys = Object.keys( options );
				
				var has_selected = false;
				
				for ( var n = 0; n < keys.length; n++ ) {
					if ( attr_value == options[ keys[ n ] ] ) {
						has_selected = true;
						break;
					}
				}

				for ( var n = 0; n < keys.length; n++ ) {
					if ( ( has_selected && attr_value == options[ keys[ n ] ] ) || ( ! has_selected && options[ keys[ n ] ] == obj.param.default && ! responsive_override ) ) {
						html += '<option value="' + options[ keys[ n ] ] + '" selected>' + keys[ n ] + '</option>';
					} else {
						html += '<option value="' + options[ keys[ n ] ] + '">' + keys[ n ] + '</option>';
					}
				}
				html += '</select>';
				
				return html;
			}
			
			if ( obj.attr_value.includes( '%$%' ) ) {
				var attr_arr = obj.attr_value.split( '%$%' );
			} else {
				var attr_arr = obj.attr_value.split( ',;,' );
			}
			
			if ( attr_arr.length != 5 && attr_arr.length != 6 ) {
				attr_arr = [ attr_arr[0], '', '', '', '', '' ];
			} else if ( attr_arr.length == 5 ) {
				attr_arr = [ attr_arr[0], attr_arr[1], attr_arr[1], attr_arr[2], attr_arr[3], attr_arr[4] ];
			}
			
			content += get_select( attr_arr[0] );
			
			content += '<div class="bt_bb_responsive_override_container">';
			
			if ( obj.param.responsive_override ) {
				content += '<div class="bt_bb_responsive_override"><span class="bt_bb_ro bt_bb_ro_xl" title="1200-1400px"></span>';
				content += get_select( attr_arr[1], true );
				content += '</div>';
				content += '<div class="bt_bb_responsive_override"><span class="bt_bb_ro bt_bb_ro_lg" title="993-1200px"></span>';
				content += get_select( attr_arr[2], true );
				content += '</div>';
				content += '<div class="bt_bb_responsive_override"><span class="bt_bb_ro bt_bb_ro_md" title="769-992px"></span>';
				content += get_select( attr_arr[3], true );
				content += '</div>';
				content += '<div class="bt_bb_responsive_override"><span class="bt_bb_ro bt_bb_ro_sm" title="481-768px"></span>';
				content += get_select( attr_arr[4], true );
				content += '</div>';
				content += '<div class="bt_bb_responsive_override"><span class="bt_bb_ro bt_bb_ro_xs" title="&le;480px"></span>';
				content += get_select( attr_arr[5], true );
				content += '</div>';
			}
			
			content += '</div>';
			
			div.innerHTML = content;

			return div;
		},

		iconpicker: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			
			content += window.bt_bb_iconpicker( obj.param.value, obj.attr_value );
			
			div.innerHTML = content;

			return div;
		},

		colorpicker: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item bt_bb_colorpicker' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			content += '<input type="text" class="bt_bb_color_picker" value="' + bt_bb_special_char_decode( obj.attr_value ) + '" data-alpha-enabled="true">';
			
			div.innerHTML = content;

			return div;
		},
		
		link: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );

			var html = '';
			if ( obj.attr_value == '' ) {
				if ( obj.param.value !== undefined ) {
					html = obj.param.value;
					html = bt_bb_special_char_decode( html );
				}
			} else {
				html = bt_bb_special_char_decode( obj.attr_value );
			}
			
			div.innerHTML = '<b>' + obj.param.heading + '</b><input type="text" value="' + html + '">';
			div.innerHTML += '<input type="search" placeholder="' + window.bt_bb_text.search_content + '" class="bt_bb_search_link"><span class="spinner"></span>';
			div.innerHTML += '<div class="bt_bb_search_link_results" data-empty-text="' + window.bt_bb_text.no_results + '"></div>';

			return div;
		},

		checkbox: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			var options = obj.param.value;
			var keys = Object.keys( options );
			var checked = '';
			if ( obj.attr_value == options[ keys[0] ] ) {
				checked = ' ' + 'checked';
			}
			content += '<label for="bt_' + obj.base + '_' + obj.param.param_name + '"><input id="bt_' + obj.base + '_' + obj.param.param_name + '" type="checkbox" value="' + options[ keys[0] ] + '"' + checked + '><span>' + keys[0] + '</span></label>';
			
			div.innerHTML = content;

			return div;
		},
		
		checkbox_group: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			
			var options = obj.param.value;
			var keys = Object.keys( options );

			var attr_array = obj.attr_value.split( ' ' );
			
			var el_obj = window.bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
			var el_attr_obj = {};
			if ( el_obj.attr !== undefined ) {
				el_attr_obj = window.attr_to_obj( el_obj.attr );
			}
			
			var lg_checked = false;
			
			for ( var n = 0; n < keys.length; n++ ) {
				var checked = '';
				if ( $.inArray( options[ keys[ n ] ], attr_array ) != -1 ) {
					checked = ' ' + 'checked';
					if ( options[ keys[ n ] ] == 'hidden_lg' ) {
						lg_checked = true;
					}
				}
				if ( lg_checked && options[ keys[ n ] ] == 'hidden_xl' && ! el_attr_obj.bb_version ) {
					checked = ' ' + 'checked';
				}
				content += '<label for="' + obj.base + '_' + obj.param.param_name + n + '"><input id="' + obj.base + '_' + obj.param.param_name + n + '" type="checkbox" value="' + options[ keys[ n ] ] + '"' + checked + '><span>' + keys[ n ] + '</span></label>';
			}
			
			div.innerHTML = content;

			return div;
		},
		
		radio: function( obj ) {

			var div = bt_bb_create_dom_element( 'div', 
			[
				[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
				[ 'data-param_name', obj.param.param_name ],
				[ 'data-type', obj.param.type ]
			] );
			
			var content = '';
			
			content += '<b>' + obj.param.heading + '</b>';
			
			var options = obj.param.value;
			var keys = Object.keys( options );

			var attr_array = obj.attr_value.split( ' ' );
			
			var el_obj = window.bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
			var el_attr_obj = {};
			if ( el_obj.attr !== undefined ) {
				el_attr_obj = window.attr_to_obj( el_obj.attr );
			}
			
			for ( var n = 0; n < keys.length; n++ ) {
				var checked = '';
				if ( $.inArray( options[ keys[ n ] ], attr_array ) != -1 ) {
					checked = ' ' + 'checked';
				}
				content += '<label for="' + obj.base + '_' + obj.param.param_name + n + '"><input id="' + obj.base + '_' + obj.param.param_name + n + '" name="' + obj.base + '_' + obj.param.param_name + '" type="radio" value="' + options[ keys[ n ] ] + '"' + checked + '><span>' + keys[ n ] + '</span></label>';
			}
			
			div.innerHTML = content;

			return div;
		},
		
		ai_prompt: function( obj ) {
			
			const fragment = document.createDocumentFragment();
			
			var _content = false;
			
			if ( typeof obj.group_class !== 'undefined' ) {
				var div = bt_bb_create_dom_element( 'div', 
				[
					[ 'class', 'bt_bb_dialog_item' + obj.group_class ], 
					[ 'data-param_name', obj.param.param_name ],
					[ 'data-type', obj.param.type ],
					[ 'data-system_prompt', obj.param.system_prompt ],
					[ 'data-target', JSON.stringify( obj.param.target ) ],
				] );
			} else { // _content (text) context
				_content = true;
				var div = bt_bb_create_dom_element( 'div',
				[
					[ 'class', 'bt_bb_dialog_item' ],
					[ 'data-type', 'ai_prompt' ],
					[ 'data-target', '_content' ],
				] );
			}
			
			var keywords = '';
			var tone = '';
			var language = '';
			var len = false;
			if ( obj.attr_value != '' && typeof obj.attr_value !== 'undefined' ) {
				var ai_obj = JSON.parse( window.bt_bb_b64DecodeUnicode( obj.attr_value ) );
				keywords = ai_obj.keywords ? ai_obj.keywords : '';
				tone = ai_obj.tone ? ai_obj.tone : '';
				if ( localStorage.getItem( 'bt_bb_ai_tone' ) ) {
					tone = localStorage.getItem( 'bt_bb_ai_tone' );
				}
				language = ai_obj.language ? ai_obj.language : '';
				if ( localStorage.getItem( 'bt_bb_ai_language' ) ) {
					language =  localStorage.getItem( 'bt_bb_ai_language' );
				}

				if ( ! _content ) {
					len = JSON.parse( ai_obj.length );
				} else {
					len = ai_obj.length.length;
				}
			}
			
			var ai_open = false;
			if ( localStorage.getItem( 'bt_bb_ai_open' ) && localStorage.getItem( 'bt_bb_ai_open' ) === 'true' ) {
				ai_open = true;
			}
			
			// Open/close
			var open_close = document.createElement( 'div' );
			var ai_open_class = '';
			if ( ai_open ) {
				div.classList.add( 'bt_bb_ai_open' );
				ai_open_class = ' bt_bb_ai_open';
			}
			open_close.innerHTML = '<div class="bt_bb_ai_switch' + ai_open_class + '" title="' + window.bt_bb_text.ai_content_generator + '">' + window.bt_bb_text.ai_content_generator + ' <a href="https://documentation.bold-themes.com/bold-builder/ai-features/" target="_blank" title="' + window.bt_bb_text.help + '">?</a></div>';
			
			// Keywords
			div.innerHTML += '<div class="bt_bb_dialog_item_inner bt_bb_dialog_item_inner_ai_keywords"><b>' + window.bt_bb_text.keywords + '</b><input type="text" value="' + keywords + '" class="bt_bb_ai_keywords"></div>';
			
			// Length
			var length_html = '<div class="bt_bb_dialog_item_inner bt_bb_dialog_item_inner_ai_length"><b>' + window.bt_bb_text.desired_length + '</b><i>' + window.bt_bb_text.leave_empty + '</i><div class="bt_bb_ai_length_container">';
			var i = 0;
			if ( ! _content ) {
				for ( const[ key, item ] of Object.entries( obj.param.target ) ) {
					var item_len = '';
					if ( Array.isArray( len ) ) {
						item_len = len[ i ];
					}
					length_html += '<div><b>' + item.title + '</b><input type="number" value="' + item_len + '" data-target="' + key + '"></div>';
					i++;
				}
			} else {
				length_html += '<div><input type="number" value="' + len + '" data-target="_content"></div>';
			}
			length_html += '</div></div>';
			div.innerHTML += length_html;
			
			// Tone
			var tone_html = '<div class="bt_bb_dialog_item_inner bt_bb_dialog_item_inner_ai_tone"><b>' + window.bt_bb_text.tone + '</b><select class="bt_bb_ai_tone">';
			var selected_bold = ( tone == 'bold' ) ? ' selected' : '';
			var selected_conversational = ( tone == 'conversational' ) ? ' selected' : '';
			var selected_passionate = ( tone == 'passionate' ) ? ' selected' : '';
			var selected_proffesional = ( tone == 'proffesional' ) ? ' selected' : '';
			var selected_witty = ( tone == 'witty' ) ? ' selected' : '';
			tone_html += '<option value="">' + window.bt_bb_text._tone.default + '</option>';
			tone_html += '<option value="bold"' + selected_bold + '>' + window.bt_bb_text._tone.bold + '</option>';
			tone_html += '<option value="conversational"' + selected_conversational + '>' + window.bt_bb_text._tone.conversational + '</option>';
			tone_html += '<option value="passionate"' + selected_passionate + '>' + window.bt_bb_text._tone.passionate + '</option>';
			tone_html += '<option value="proffesional"' + selected_proffesional + '>' + window.bt_bb_text._tone.proffesional + '</option>';
			tone_html += '<option value="witty"' + selected_witty + '>' + window.bt_bb_text._tone.witty + '</option>';
			tone_html += '</select>';
			div.innerHTML += tone_html;
			
			// Language
			div.innerHTML += '<div class="bt_bb_dialog_item_inner bt_bb_dialog_item_inner_ai_language"><b>' + window.bt_bb_text.language + '</b><input type="text" value="' + language + '" class="bt_bb_ai_language" placeholder="' + window.bt_bb_text.english + '"></div>';
			
			// Buttons
			var buttons_html = '<div class="bt_bb_dialog_item_inner bt_bb_dialog_item_inner_ai_buttons">';
			buttons_html += '<span class="bt_bb_ai_counter">0/0</span>';
			buttons_html += '<input type="button" class="bt_bb_ai_prev_button button button-small" disabled value="&#8249;">';
			buttons_html += '<input type="button" class="bt_bb_ai_next_button button button-small" disabled value="&#8250;">';
			buttons_html += '<input type="button" class="bt_bb_ai_regenerate_button button button-small" value="' + window.bt_bb_text.generate + '">';
			buttons_html += '</div>';
			div.innerHTML += buttons_html;
			
			// Error
			var error_html = '<div class="bt_bb_dialog_item_inner bt_bb_dialog_item_inner_ai_error"><span>';
			error_html += window.bt_bb_text.ai_error;
			error_html += '</span></div>';
			div.innerHTML += error_html;
			
			fragment.appendChild( open_close.firstChild );
			fragment.appendChild( div );

			return fragment;

		}

	}
	
	//window.bt_bb_dialog_param.attach_images = window.bt_bb_dialog_param.attach_image;
	window.bt_bb_dialog_param.dropdown_color = window.bt_bb_dialog_param.dropdown;

	window.bt_bb_get_dialog_param = function( obj ) {
		var div = window.bt_bb_dialog_param[ obj.param.type.replaceAll( '-', '_' ) ]( obj );
		if ( obj.param.description !== undefined ) {
			var desc = bt_bb_create_dom_element( 'i', [] );
			desc.innerHTML = obj.param.description;
			div.appendChild( desc );
		}
		return div;
	}

}( jQuery ));