'use strict';

window.bt_bb_add_horizontal_classic = function( obj, layout ) {
	let $ = jQuery;
	if ( layout !== undefined ) {
		// layout validataion
		var layout_error = false;
		layout = layout.replace( /\s/gm, '' ).replace( /<\/?[^>]+(>|$)/gm, '' );
		if ( layout == '' ) {
			layout_error = true;
		} else {
			var arr1 = layout.split( '+' );
			if ( arr1.length > 12 ) {
				layout_error = true;
			} else {
				var sum = 0;
				var up_arr = [];
				var down_arr = [];
				for ( var i = 0; i < arr1.length; i++ ) {
					var arr2 = arr1[ i ].split( '/' );
					if ( arr2.length != 2 ) {
						layout_error = true;
						break;
					}
					var up = parseInt( arr2[0] );
					up_arr.push( up );
					var down = parseInt( arr2[1] );
					down_arr.push( down );
					if ( up < 1 || up > 12 || down < 1 || down > 12 ) {
						layout_error = true;
						break;
					}
				}
				
				if ( ! layout_error ) {
					for ( var n = 0; n < up_arr.length; n++ ) {
						var w_item = 12 * up_arr[ n ] / down_arr[ n ];
						if ( w_item != Math.floor( w_item ) && ( w_item != 2.4 || window.bt_bb_custom_elements ) ) {
							layout_error = true;
							break;
						}
						sum = sum + w_item;
					}
					
					if ( sum != 12 ) {
						layout_error = true;
					}
				}
			}
		}
		
		if ( layout_error ) {
			alert( window.bt_bb_text.layout_error );
			return;
		}
		
		var id = window.bt_bb_from;

		for ( var i = 0; i < obj.children.length; i++ ) {
			if ( id.bt_ends_with( obj.children[ i ].key ) ) {
				var children_count = obj.children[ i ].children.length;
				if ( children_count > 0 ) { // has children
					if ( arr1.length >= children_count ) {
						for ( var n = 0; n < children_count; n++ ) {
							for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
							var w_param = window.bt_bb_map[ base ].width_param;
							var attr_obj = attr_to_obj( obj.children[ i ].children[ n ].attr );
							attr_obj[ w_param ] = arr1[ n ];
							obj.children[ i ].children[ n ].attr = JSON.stringify( attr_obj );
						}
						for ( var n = children_count; n < arr1.length; n++ ) {
							var add_element = {};
							for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
							add_element.title = base;
							add_element.base = base;
							add_element.key = bt_bb_get_key();
							add_element.children = [];
							var w_param = window.bt_bb_map[ base ].width_param;
							add_element.attr = '{"' + w_param + '":' + bt_bb_json_encode( arr1[ n ] ) +  '}';
							bt_bb_insert_inside( obj, window.bt_bb_from, add_element );
						}						
					} else {
						for ( var n = 0; n < arr1.length; n++ ) {
							for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
							var w_param = window.bt_bb_map[ base ].width_param;
							var attr_obj = attr_to_obj( obj.children[ i ].children[ n ].attr );
							attr_obj[ w_param ] = arr1[ n ];
							obj.children[ i ].children[ n ].attr = JSON.stringify( attr_obj );
						}					
						bt_bb_delete_obj( obj, obj.children[ i ].children[ arr1.length ].key, children_count - arr1.length );
					}
				} else { // no children
					for ( var n = 0; n < arr1.length; n++ ) {
						var add_element = {};
						for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
						add_element.title = base;
						add_element.base = base;
						add_element.key = bt_bb_get_key();
						add_element.children = [];
						var w_param = window.bt_bb_map[ base ].width_param;
						add_element.attr = '{"' + w_param + '":' + bt_bb_json_encode( arr1[ n ] ) +  '}';
						bt_bb_insert_inside( obj, window.bt_bb_from, add_element );
					}
				}
				window.bt_bb_action = 'refresh';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				
				return true;
			}
			var r = bt_bb_add_horizontal_classic( obj.children[ i ], layout );
			if ( r === true ) {
				return true;
			}
		}
		
	} else {
		//window.bt_bb_state = obj;
		window.bt_bb_dialog.show( 'add_horizontal' );
	}
}