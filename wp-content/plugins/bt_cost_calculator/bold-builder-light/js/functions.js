'use strict';

// PARSE DATA
window.bt_bb_parse_data = function( obj ) {
	window.bt_bb_parse_data_str = '';
	if ( obj.children.length > 0 ) {
		window.bt_bb_parse_data_helper( obj );
		if ( ! window.bt_bb.fe ) {
			window.switchEditors.go( 'content', 'tmce' );
			tinyMCE.get( 'content' ).setContent( window.switchEditors.wpautop( window.bt_bb_parse_data_str ) );
		}
		//tinyMCE.get( 'content' ).setContent( window.bt_bb_parse_data_str.replace( /\n/ig, '<br>' ) );
		//$( 'textarea#content' ).val( window.bt_bb_parse_data_str );
	} else {
		window.switchEditors.go( 'content', 'tmce' );
		tinyMCE.get( 'content' ).setContent( '' );
	}
}

window.bt_bb_parse_data_helper = function( obj ) {
	if ( obj.title == '_root' ) {
		obj = obj.children;
	}
	for ( var i = 0; i < obj.length; i++ ) {
		var is_content = false;
		if ( obj[ i ].title == '_content' ) {
			is_content = true;
		}
		if ( ! is_content ) {
			window.bt_bb_parse_data_str += '[' + obj[ i ].base;
			if ( obj[ i ].attr !== undefined && obj[ i ].attr.startsWith( '{' ) ) { // obj[ i ].attr.startsWith( '{' ) - handles empty attr in FE editor, e.g. [bt_bb_row]
				var attr_arr = attr_to_arr( obj[ i ].attr );
				for ( var k = 0; k < attr_arr.length; k++ ) {
					window.bt_bb_parse_data_str += ' ' + attr_arr[ k ][0] + '="' + attr_arr[ k ][1] + '"';
				}
			}
			window.bt_bb_parse_data_str += ']';
		} else {
			window.bt_bb_parse_data_str += obj[ i ].content;
		}
		if ( obj[ i ].children !== undefined ) {
			bt_bb_parse_data_helper( obj[ i ].children );
		}
		if ( ! is_content ) {
			window.bt_bb_parse_data_str += '[/' + obj[ i ].base + ']';
		}
	}
}

// get edit item value
window.bt_bb_get_edit_item_value = function( param_name, type, $item ) {
	const $ = jQuery;
	var val;
	if ( type == 'textfield' || type == 'datetime-local' || type == 'colorpicker' || type == 'link' ) {
		val = window.bt_bb_special_char_encode( $item.find( 'input' ).val() );
	} else if ( type == 'checkbox' ) {
		 if ( $item.find( 'input' ).prop( 'checked' ) ) {
			val = $item.find( 'input' ).val();
		 } else {
			val = '';
		 }
	} else if ( type == 'checkbox_group' || type == 'radio' ) {
		var checkbox_group_obj = [];
		$item.find( 'input' ).each(function() {
			if ( $( this ).prop( 'checked' ) ) {
				checkbox_group_obj.push( $( this ).val() );
			}
		});
		val = checkbox_group_obj.join( ' ' );
	} else if ( type == 'textarea' ) {
		val = window.bt_bb_special_char_encode( $item.find( 'textarea' ).val() );
	} else if ( type == 'textarea_object' ) {
		try {
			val = window.bt_bb_b64EncodeUnicode( $item.find( 'textarea' ).val() );
		} catch( e ) {
			val = $item.find( 'textarea' ).val();
		}
	} else if ( type == 'dropdown' ) {
		if ( $item.hasClass( 'bt_bb_dialog_item_responsive_override' ) ) {
			var val_arr = [];
			$item.find( 'select :selected' ).each(function() {
				val_arr.push( $( this ).val() );
			});
			val = val_arr.join( ',;,' );
		} else {
			val = $item.find( 'select :selected' ).val();
		}
	} else if ( type == 'iconpicker' ) {
		val = $item.find( '.bt_bb_iconpicker_select .bt_bb_icon_preview' ).data( 'icon' );
	} else if ( type == 'attach_image' ) {
		var this_val = $item.find( 'input[type="text"]' ).val();
		if ( $item.find( '.bt_bb_sortable_item' ).length == 0 ) {
			val = this_val;
		}
	} else if ( type == 'ai_prompt' ) {
		var ai_obj = {};
		ai_obj.keywords = $item.find( '.bt_bb_ai_keywords' ).val();
		ai_obj.tone = $item.find( '.bt_bb_ai_tone' ).val();
		ai_obj.language = $item.find( '.bt_bb_ai_language' ).val();
		var len_arr = [];
		$item.find( '.bt_bb_ai_length_container input' ).each(function() {
			len_arr.push( $( this ).val() );
		});
		ai_obj.length = JSON.stringify( len_arr );
		val = window.bt_bb_b64EncodeUnicode( JSON.stringify( ai_obj ) );
	} else { // custom
		if ( window[ 'bt_bb_cf_' + type + '_on_submit' ] !== undefined ) {
			val = window[ 'bt_bb_cf_' + type + '_on_submit' ]( $item );
		}
	}
	return val;
}

// iconpicker
window.bt_bb_iconpicker = function( options, icon ) {
	
	options = window.bt_bb_icons; // new: global icon object
	
	var content = '<div class="bt_bb_iconpicker">';
	
		var keys = Object.keys( options );
		var keys_inner;
		
		content += '<div class="bt_bb_iconpicker_select">';
			var icon_set = icon.slice( 0, -5 );
			var icon_code = icon.substr( -4 );
			
			var icon_name = '';
			
			for ( var c = 0; c < keys.length; c++ ) {
				keys_inner = Object.keys( options[ keys[ c ] ] );
				for ( var j = 0; j < keys_inner.length; j++ ) {
					if ( icon == options[ keys[ c ] ][ keys_inner[ j ] ] ) {
						icon_name = keys_inner[ j ];
					}
				}
			}
			if ( icon_code != '' ) {
				icon_code = '&#x' + icon_code;
			}
			if ( window.bt_bb.fe ) {
				content += '<div class="bt_bb_icon_preview bt_bb_icon_preview_' + icon_set + '" style="font-family:\'' + icon_set + '\';" data-icon="' + icon + '" data-icon-code="' + icon_code + '"></div>';
			} else {
				content += '<div class="bt_bb_icon_preview bt_bb_icon_preview_' + icon_set + '" data-icon="' + icon + '" data-icon-code="' + icon_code + '"></div>';
			}
			content += '<div class="bt_bb_iconpicker_select_text">' + icon_name + '</div>';
			var clear_display = icon_name != '' ? 'block' : 'none';
			//if ( ! window.bt_bb.fe ) {
				content += '<i class="fa fa-close bt_bb_iconpicker_clear" style="display:' + clear_display + '"></i>';
			//}
			content += '<i class="fa fa-angle-down"></i>';
		content += '</div>';
		
		content += '<div class="bt_bb_iconpicker_filter_container">';
			content += '<input type="text" class="bt_bb_filter" placeholder="' + window.bt_bb_text.filter + '">';
		content += '</div>';
			
		content += '<div class="bt_bb_iconpicker_icons">';
			
			for ( var n = 0; n < keys.length; n++ ) {
				
				content += '<div class="bt_bb_iconpicker_title" data-icon-set="' + keys[ n ].toLowerCase() + '">' + keys[ n ] + '</div>';

				keys_inner = Object.keys( options[ keys[ n ] ] );

				for ( var m = 0; m < keys_inner.length; m++ ) {
					var icon = options[ keys[ n ] ][ keys_inner[ m ] ];
					var icon_set = icon.slice( 0, -5 );
					var icon_code = icon.substr( -4 );
					if ( window.bt_bb.fe ) {
						content += '<div class="bt_bb_icon_preview bt_bb_icon_preview_' + icon_set + '" style="font-family:\'' + icon_set + '\';" data-icon="' + icon + '" data-icon-code="&#x' + icon_code + '" data-icon-set="' + icon_set + '" title="' + keys_inner[ m ] + '"></div>';
					} else {
						content += '<div class="bt_bb_icon_preview bt_bb_icon_preview_' + icon_set + '" data-icon="' + icon + '" data-icon-code="&#x' + icon_code + '" data-icon-set="' + icon_set + '" title="' + keys_inner[ m ] + '"></div>';
					}
				}

			}
		
		content += '</div>';
	
	content += '</div>';

	return content;
}

window.bt_bb_iconpicker_init = function( callback ) {
	
	const $ = jQuery;
	
	// toggle
	var toggle = function( e ) {
		$( this ).next().toggle();
		$( this ).next().next().toggle();
	}
	
	// select
	var select = function( e ) {
		var select_preview = $( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_select .bt_bb_icon_preview' );
		var icon = $( this ).data( 'icon' );
		select_preview.attr( 'data-icon', icon );
		select_preview.attr( 'data-icon-code', $( this ).data( 'icon-code' ) );
		select_preview.removeClass();
		select_preview.addClass( $( this ).attr( 'class' ) );
		
		if ( callback == 'widgets' ) {
			$( this ).closest( '.bt_bb_iconpicker_widget_container' ).find( 'input' ).val( $( this ).data( 'icon' ) );
			$( this ).closest( '.bt_bb_iconpicker_widget_container' ).find( 'input' ).trigger( 'change' ); // customize
			
		} else if ( callback == 'override' ) {
			var hidden_el = $( this ).closest( '.rwmb-boldthemestext-clone' ).find( 'input[type="hidden"]' );
			var key_el = $( this ).closest( '.rwmb-boldthemestext-clone' ).find( 'select' );
			var key = key_el.val();
			if ( key != '' ) {
				hidden_el.attr( 'value', key + ':' + $( this ).data( 'icon' ) );
			} else {
				hidden_el.attr( 'value', '' );
			}
		}
		
		if ( window.bt_bb.fe ) {
			select_preview.css( 'font-family', $( this ).css( 'font-family' ) );
		}
		
		$( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_select .bt_bb_iconpicker_select_text' ).html( $( this ).attr( 'title' ) );
		
		$( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_clear' ).show();
		
		$( this ).parent().hide();
		$( this ).parent().prev().find( 'input' ).val( '' ).trigger( 'keyup' );
		$( this ).parent().prev().hide();
		
		if ( window.bt_bb.fe ) {
			callback( select_preview );
		}
	}
	
	// clear
	var clear = function( e ) {
		e.stopPropagation();
		var select_preview = $( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_select .bt_bb_icon_preview' );
		select_preview.attr( 'data-icon', '' );
		select_preview.attr( 'data-icon-code', '' );
		select_preview.parent().find( '.bt_bb_iconpicker_select_text' ).html( '' );
		
		$( this ).closest( '.bt_bb_iconpicker' ).find( 'input' ).val( '' ); // bt_menu_admin.php (shoperific plugin)
		
		if ( callback == 'widgets' ) {
			$( this ).closest( '.bt_bb_iconpicker_widget_container' ).find( 'input' ).val( '' );
			$( this ).closest( '.bt_bb_iconpicker_widget_container' ).find( 'input' ).trigger( 'change' );
			
		} else if ( callback == 'override' ) {
			var hidden_el = $( this ).closest( '.rwmb-boldthemestext-clone' ).find( 'input[type="hidden"]' );
			hidden_el.attr( 'value', '' );
		}
		
		$( this ).parent().next().find( 'input' ).val( '' ).trigger( 'keyup' );
		$( this ).parent().next().hide();
		$( this ).parent().next().next().hide();
		
		$( this ).hide();
		
		if ( window.bt_bb.fe ) {
			callback( select_preview );
		}
	}
	
	// filter
	var filter = function( e ) {
		var val = $( this ).val();
		var iconpicker = $( this ).closest( '.bt_bb_iconpicker' );
		var title_show = [];
		iconpicker.find( '.bt_bb_iconpicker_icons .bt_bb_icon_preview' ).each(function() {
			var title = $( this ).attr( 'title' );
			var patt = new RegExp( val, 'i' );
			iconpicker.find( '.bt_bb_iconpicker_title' ).hide();
			if ( ! patt.test( title ) ) {
				$( this ).hide();
			} else {
				title_show.push( $( this ).data( 'icon-set' ) );
				$( this ).show();
			}
		});
		for ( const i in title_show ) {
			iconpicker.find( '.bt_bb_iconpicker_title[data-icon-set="' + title_show[ i ] + '"]' ).show();
			if ( title_show[ i ] == 'fa' ) {
				iconpicker.find( '.bt_bb_iconpicker_title[data-icon-set="font awesome"]' ).show(); // backward compatiblity (one of BB default icon sets)
			}
		}
	}
	
	// iconpicker toggle list
	if ( window.bt_bb.fe ) {
		$( bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( '.bt_bb_iconpicker_select' ) ).on( 'click', toggle );
	} else {
		if ( callback == 'widgets' ) {
			$( 'body' ).on( 'click', '.bt_bb_iconpicker_widget_container .bt_bb_iconpicker_select', toggle );
		} else {
			$( '.bt_bb_iconpicker_select' ).on( 'click', toggle );
		}
	}
	
	// iconpicker select
	if ( window.bt_bb.fe ) {
		$( bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( '.bt_bb_iconpicker_icons .bt_bb_icon_preview' ) ).on( 'click', select );
	} else {
		if ( callback == 'widgets' ) {
			$( 'body' ).on( 'click', '.bt_bb_iconpicker_icons .bt_bb_icon_preview', select );
		} else {
			$( '.bt_bb_iconpicker_icons .bt_bb_icon_preview' ).on( 'click', select );
		}
	}
	
	// iconpicker clear
	if ( window.bt_bb.fe ) {
		$( bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( '.bt_bb_iconpicker .bt_bb_iconpicker_clear' ) ).on( 'click', clear );
	} else {
		if ( callback == 'widgets' ) {
			$( 'body' ).on( 'click', '.bt_bb_iconpicker_widget_container .bt_bb_iconpicker_clear', clear );
		} else {
			$( '.bt_bb_iconpicker .bt_bb_iconpicker_clear' ).on( 'click', clear );
		}
	}
	
	// iconpicker filter
	if ( window.bt_bb.fe ) {
		$( bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( '.bt_bb_iconpicker .bt_bb_filter' ) ).on( 'keyup', filter );
	} else {
		if ( callback == 'widgets' ) {
			$( 'body' ).on( 'keyup', '.bt_bb_iconpicker_widget_container .bt_bb_filter', filter );
		} else {
			$( '.bt_bb_iconpicker .bt_bb_filter' ).on( 'keyup', filter );
		}
	}

}

window.bt_bb_image_sortable = function( container, attr_obj ) {
	
	if ( ! container.length ) return; // attach_image (single image)
	
	const $ = jQuery;
	
	// https://github.com/SortableJS/Sortable
	new window.bt_bb_sortable.Sortable(container[0], {
		animation: 150,
		onSort: function( evt ) {
			var dialog_item = $( evt.item ).closest( '.bt_bb_dialog_item' );
			var this_param_name = dialog_item.data( 'param_name' );
			var ids = '';
			dialog_item.find( '.bt_bb_sortable_item' ).each(function() {
				ids += $( this ).data( 'id' ) + ',';
			});
			ids = ids.slice( 0, -1 );
			attr_obj[ this_param_name ] = ids;
			if ( window.bt_bb.fe ) {
				window.bt_bb.editing_elements.data( 'bt-bb-fe-atts', attr_obj );
				window.bt_bb.editing_elements_atts = attr_obj;
				window.bt_bb_fe_ajax_preview( [] );
			}
		}
	});
}

window.bt_bb_delete_images = function( that, attr_obj ) {
	
	const $ = jQuery;
	
	var param_name = $( that ).closest( '.bt_bb_dialog_item' ).data( 'param_name' );
	var container = $( that ).closest( '.bt_bb_dialog_image_container' );
	$( that ).parent().remove();
	var ids = '';
	container.find( '.bt_bb_sortable_item' ).each(function() {
		ids += $( this ).data( 'id' ) + ',';
	});
	ids = ids.slice( 0, -1 );
	if ( ids == '' ) {
		container.parent().find( 'input[type="text"]' ).prop( 'disabled', false );
	}
	attr_obj[ param_name ] = ids;
}

window.bt_bb_select_images = function( that, attr_obj, callback ) {
	
	const $ = jQuery;
	
	var key = window.bt_bb_get_key();
	
	var root = $( that ).closest( '.bt_bb_dialog_item' );
	
	var container = root.find( '.bt_bb_dialog_image_container' );
	
	var param_name = root.data( 'param_name' );
	
	var type = root.data( 'type' );
	
	var multiple_option = 'add';
	if ( type == 'attach_image' ) {
		multiple_option = false;
	}
	
	var insertImage = wp.media.controller.Library.extend({
		defaults: _.defaults({
			id: key,
			title: window.bt_bb_text.select_images,
			allowLocalEdits: false,
			displaySettings: false,
			displayUserSettings: false,
			multiple: multiple_option,
			type: 'image'
		}, wp.media.controller.Library.prototype.defaults )
	});

	var frame = wp.media({
		button: { text: window.bt_bb_text.select },
		state: key,
		states: [
			new insertImage()
		]
	});

	// close
	frame.on( 'select', function() {

		var selection = frame.state( key ).get( 'selection' );
		
		var content = '';
		var ids = '';
		selection.each(function( img ) {
			if ( img.attributes.sizes !== undefined ) {
				var img_url = '';
				if ( img.attributes.sizes.thumbnail !== undefined ) {
					img_url = img.attributes.sizes.thumbnail.url;
				} else {
					img_url = img.attributes.sizes.full.url;
				}
				ids += img.id + ',';
				window.bt_bb.cache[ img.id ] = {};
				window.bt_bb.cache[ img.id ].url = img_url;
				window.bt_bb.cache[ img.id ].title = img.attributes.title;
				content += '<div class="bt_bb_sortable_item" data-id="' + img.id + '" style="background-image:url(\'' + img_url + '\');background-size:cover;"><i class="fa fa-times"></i></div>';

				container.html( content );
			}
		});

		ids = ids.slice( 0, -1 );
		
		if ( ids != '' ) {
			root.find( 'input[type="text"]' ).prop( 'disabled', true );
			attr_obj[ param_name ] = ids;
			if ( window.bt_bb.fe ) {
				callback( selection );
				$( 'body' ).addClass( 'bt_bb_fe_save_on' );
			}
		}

	});
	
	// open
	frame.on( 'open', function() {
		var selection = frame.state( key ).get( 'selection' );
		
		container.find( '.bt_bb_sortable_item' ).each(function() {
			var attachment = wp.media.attachment( $( this ).data( 'id' ) );
			selection.add( attachment );
		});
	});

	frame.open();
}

window.bt_bb_search_link_init = function() {
	
	const $ = jQuery;
	
	var get_links = function( search, $root, page ) {
		$root.find( '.spinner' ).show();
		$root.find( '.spinner' ).css( 'visibility', 'visible' );
		var data = {
			'action': 'bt_bb_search_links',
			'search': search,
			'page': page
		};
		$.ajax({
			type: 'POST',
			url: window.bt_bb_ajax_url,
			data: data,
			async: true,
			success: function( response ) {
				var links = JSON.parse( response );
				if ( links.length < 20 ) {
					$root.data( 'thats_all', true );
				}
				var $results = $root.find( '.bt_bb_search_link_results' )
				if ( page == 1 ) {
					$results.empty();
					$results[0].scrollTo( 0, 0 );
				}
				links.forEach(function( item, i ) {
					var link = item.permalink;
					if ( window.bt_bb_settings.slug_url == 1 ) {
						link = item.slug;
					}
					$results.append( '<div data-link="' + link + '" title="' + link + '">' + item.title + '<span>' + item.info + '</span>' + '</div>' );
				});
				$root.find( '.spinner' ).hide();
				$root.data( 'page', page );
			}
		});
	}
	
	if ( window.bt_bb.fe ) {
		var s = $( bt_bb_fe_dialog_content.shadowRoot.querySelectorAll( 'div[data-type="link"]' ) );
	} else {
		var s = $( 'div[data-type="link"]' );
	}
	
	s.each(function() {
		var $root = $( this );
		get_links( '', $root, 1 );
		$( this ).find( '.bt_bb_search_link' ).on( 'input', function( e ) {
			var now = new Date().getTime();
			if ( $root.data( 'last_input_time' ) !== undefined && ( now - $root.data( 'last_input_time' ) ) < 500 ) return;
			$root.data( 'thats_all', false );
			setTimeout(function() { get_links( $root.find( '.bt_bb_search_link' ).val(), $root, 1 ); }, 500 );
			$root.data( 'last_input_time', new Date().getTime() );
		});
		$( this ).find( '.bt_bb_search_link' ).on( 'focus', function( e ) {
			$root.find( '.bt_bb_search_link_results' ).show();
		});
		$( this ).find( '.bt_bb_search_link' ).on( 'blur', function( e ) {
			setTimeout(function() { $root.find( '.bt_bb_search_link_results' ).hide(); }, 200 );
		});
		$( this ).on( 'click', '.bt_bb_search_link_results div', function() {
			$root.find( 'input[type="text"]' ).val( $( this ).data( 'link' ) );
			if ( window.bt_bb.fe ) {
				$root.find( 'input[type="text"]' ).trigger( 'input' );
			}
		});
		$( this ).find( '.bt_bb_search_link_results' ).on( 'scroll', function( e ) {
			var now = new Date().getTime();
			if ( $root.data( 'last_scroll_time' ) !== undefined && ( now - $root.data( 'last_scroll_time' ) ) < 500 ) return;
			if ( this.scrollTop > .8 * ( this.scrollHeight - this.clientHeight ) && ! $root.data( 'thats_all' ) ) {
				get_links( $( this ).val(), $root, $root.data( 'page' ) + 1 );
				$root.data( 'last_scroll_time', new Date().getTime() );
			}
		});
	});
}

window.bt_bb_special_char_encode = function( str ) {
	
	var regex = /([\s\S]*?<[a-zA-Z]+?)(\s[^<]*?)(>[\s\S]*)/; // strip attributes (and format opening tags)
	var m;

	while ( ( m = regex.exec( str ) ) !== null ) {
		str = str.replace( regex, '$1$3' );
	}

	regex = /<\/\s*([a-zA-Z]+)\s*>/g; // format closing tags
	str = str.replace( regex, '</$1>' );

	var allowed = ['address','b','big','cite','code','del','em','i','ins','pre','small','strong','sub','sup','s','u','ul','ol','li'];

	regex = /<\/?([a-zA-Z]+)?>/g; // strip unwanted tags

	while ( ( m = regex.exec( str ) ) !== null ) {
		if ( ! allowed.includes( m[1] ) ) {
			str = str.replace( m[0], '' );
		}
	}

	regex = /<([a-zA-Z]+)?>/g; // strip unclosed tags 1
	while ( ( m = regex.exec( str ) ) !== null ) {
		if ( str.indexOf( '</' + m[1] + '>' ) == -1 ) {
			str = str.replace( m[0], '' );
		}
	}

	regex = /<\/?([a-zA-Z]+)?>/g; // strip unopened tags 1
	while ( ( m = regex.exec( str ) ) !== null ) {
		if ( str.indexOf( '<' + m[1] + '>' ) == -1 ) {
			str = str.replace( m[0], '' );
		}
	}
  
	regex = /<([a-zA-Z]+)?>/g; // strip unclosed tags 2
	while ( ( m = regex.exec( str ) ) !== null ) {
		var last_index = str.lastIndexOf( '<' + m[1] + '>' );
		if ( last_index > str.lastIndexOf( '</' + m[1] + '>' ) ) {
			var str1 = str.substring( 0, last_index );
			var str2 = str.substring( last_index + 2 + m[1].length );
			str = str1 + str2;
		}
	}
  
	// balance tags

	regex = /<([a-zA-Z]+)?>/g;
	var arr_o = Array();
	while ( ( m = regex.exec( str ) ) !== null ) {
		arr_o.push( m[1] );
	}
	
	regex = /<([a-zA-Z]+)?>/g;
	var arr_c = Array();
	while ( ( m = regex.exec( str ) ) !== null ) {
		arr_c.push( m[1] );
	}
	
	arr_o.forEach(function( tag ) {
		var count_o = ( str.match( new RegExp( '<' + tag + '>', 'g' ) ) || [] ).length;
		var count_c = ( str.match( new RegExp( '</' + tag + '>', 'g' ) ) || [] ).length;
		if ( count_o > count_c ) {
			var index = str.indexOf( '<' + tag + '>' );
			var str1 = str.substring( 0, index );
			var str2 = str.substring( index + 2 + tag.length );
			str = str1 + str2;
		}
	});
	
	arr_c.forEach(function( tag ) {
		var count_o = ( str.match( new RegExp( '<' + tag + '>', 'g' ) ) || [] ).length;
		var count_c = ( str.match( new RegExp( '</' + tag + '>', 'g' ) ) || [] ).length;
		if ( count_o < count_c ) {
			var index = str.indexOf( '</' + tag + '>' );
			var str1 = str.substring( 0, index );
			var str2 = str.substring( index + 3 + tag.length );
			str = str1 + str2;
		}
	});
	
	var r = str.replace( /"/gmi, '``' );
	r = r.replace( /\[/gmi, '`{`' );
	r = r.replace( /\]/gmi, '`}`' );

	return r;
};

window.bt_bb_special_char_decode = function( str ) {
	var r = str.replace( /``/gmi, '&quot;' );
	r = r.replace( /`{`/gmi, '[' );
	r = r.replace( /`}`/gmi, ']' );
	r = r.replace( /"/gmi, '&quot;' ); // XSS
	
	return r;
};

// HTMLSPECIALCHARS DECODE
/*function bt_bb_htmlspecialchars_decode(string, quote_style) {
  var optTemp = 0,
    i = 0,
    noquotes = false;
  if (typeof quote_style === 'undefined') {
    quote_style = 2;
  }
  string = string.toString()
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  var OPTS = {
    'ENT_NOQUOTES': 0,
    'ENT_HTML_QUOTE_SINGLE': 1,
    'ENT_HTML_QUOTE_DOUBLE': 2,
    'ENT_COMPAT': 2,
    'ENT_QUOTES': 3,
    'ENT_IGNORE': 4
  };
  if (quote_style === 0) {
    noquotes = true;
  }
  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
    quote_style = [].concat(quote_style);
    for (i = 0; i < quote_style.length; i++) {
      // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
      if (OPTS[quote_style[i]] === 0) {
        noquotes = true;
      } else if (OPTS[quote_style[i]]) {
        optTemp = optTemp | OPTS[quote_style[i]];
      }
    }
    quote_style = optTemp;
  }
  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
    // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
  }
  if (!noquotes) {
    string = string.replace(/&quot;/g, '"');
  }
  // Put this in last place to avoid escape being double-decoded
  string = string.replace(/&amp;/g, '&');

  return string;
}*/

// JSON ENCODE
window.bt_bb_json_encode = function (string) {
  var escapable =
	/[\b\t\n\f\r\\\"\/\u00A1-\uFFFF]/g;
  var meta = {
	// table of character substitutions
	'\b': '\\b',
	'\t': '\\t',
	'\n': '\\n',
	'\f': '\\f',
	'\r': '\\r',
	'"': '\\"',
	'\\': '\\\\',
	'/': '\\/'
  };

  escapable.lastIndex = 0;
  return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	var c = meta[a];
	return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0)
	  .toString(16))
	  .slice(-4);
  }) + '"' : '"' + string + '"';
};

// startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.lastIndexOf(searchString, position) === position;
  };
}

// endsWith
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

// CREATE DOM ELEMENT
window.bt_bb_create_dom_element = function( element, attr_arr ) {
	var el = document.createElement( element );
	var attr;
	for ( var i = 0; i < attr_arr.length; i++ ) {
		attr = document.createAttribute( attr_arr[ i ][0] );
		attr.value = attr_arr[ i ][1];
		el.setAttributeNode( attr );
	}
	return el;
}

// ATTR TO ARRAY
window.attr_to_arr = function( str ) {
	var attr_obj = JSON.parse( str );
	var attr_arr = [];
	for ( var j in attr_obj ) { 
		attr_arr.push( [ j, attr_obj [ j ] ] );
	}
	return attr_arr;
}

// ATTR TO OBJECT
window.attr_to_obj = function( str ) {
	var attr_obj = JSON.parse( str );
	return attr_obj;
}

// SORTABLE BACKGROUND
window.bt_bb_sortable_background = function( id ) {
	const $ = jQuery;
	if ( window.bt_bb.cache[ id ] === undefined ) {
		var attachment = wp.media.attachment( id );
		attachment.fetch().done( function( img ) {
			var img_url = '';
			if ( img.sizes.thumbnail !== undefined ) {
				img_url = img.sizes.thumbnail.url;
			} else {
				img_url = img.sizes.full.url;
			}
			if ( window.bt_bb.fe ) {
				$( bt_bb_fe_dialog_content.shadowRoot ).find( '.bt_bb_sortable_item[data-id="' + img.id + '"]' ).css( 'background-image', 'url("' + img_url + '")' );
				$( bt_bb_fe_dialog_content.shadowRoot ).find( '.bt_bb_sortable_item[data-id="' + img.id + '"]' ).css( 'background-size', 'cover' );
			} else {
				$( '.bt_bb_sortable_item[data-id="' + img.id + '"]' ).css( 'background-image', 'url("' + img_url + '")' );
				$( '.bt_bb_sortable_item[data-id="' + img.id + '"]' ).css( 'background-size', 'cover' );
			}
			window.bt_bb.cache[ img.id ] = {};
			window.bt_bb.cache[ img.id ].url = img_url;
			window.bt_bb.cache[ img.id ].title = img.title;
		});
	} else {
		if ( window.bt_bb.fe ) {
			$( bt_bb_fe_dialog_content.shadowRoot ).find( '.bt_bb_sortable_item[data-id="' + id + '"]' ).css( 'background-image', 'url("' + window.bt_bb.cache[ id ].url + '")' );
			$( bt_bb_fe_dialog_content.shadowRoot ).find( '.bt_bb_sortable_item[data-id="' + id + '"]' ).css( 'background-size', 'cover' );
		} else {
			$( '.bt_bb_sortable_item[data-id="' + id + '"]' ).css( 'background-image', 'url("' + window.bt_bb.cache[ id ].url + '")' );
			$( '.bt_bb_sortable_item[data-id="' + id + '"]' ).css( 'background-size', 'cover' );
		}
	}
}

//

window.bt_bb_get_key = function() {
	var key = 'bt_bb_' + Math.random().toString();
	key = key.replace( '.', '' );
	return key;
}

window.bt_bb_b64EncodeUnicode = function(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

window.bt_bb_b64DecodeUnicode = function(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
}