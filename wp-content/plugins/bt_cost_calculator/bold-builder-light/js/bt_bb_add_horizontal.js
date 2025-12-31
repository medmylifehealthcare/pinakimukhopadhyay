'use strict';

window.bt_bb_add_horizontal = function( obj, layout ) {
	let $ = jQuery;
	if ( layout !== undefined ) {
		var responsive_layout_arr = [];
		// layout validataion
		var validate_layout = function( layout, count ) {
			responsive_layout_arr.push( layout );
			var layout_error = false;
			layout = layout.replace( /\s/gm, '' );
			if ( layout == '' && count > 0 ) {
				layout_error = false;
			} else if ( layout == '' ) {
				layout_error = true;
			} else {
				var arr1 = layout.split( '+' );
				if ( arr1.length > 12 ) {
					layout_error = true;
				} else {
					var sum = 0;
					var up_arr = [];
					var down_arr = [];
					for ( let i = 0; i < arr1.length; i++ ) {
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
						for ( let n = 0; n < up_arr.length; n++ ) {
							var w_item = 12 * up_arr[ n ] / down_arr[ n ];
							if ( ( ! Number.isInteger( w_item ) && window.bt_bb_custom_elements ) || ( ! Number.isInteger( w_item ) && ! Number.isInteger( w_item / 2.4 ) ) ) {
								layout_error = true;
								break;
							}
							sum = sum + w_item;
						}

						if ( ( sum != 12 && count == 0 ) || ! Number.isInteger( sum / 12 ) ) { // xxl responsive not allowed, other must fit the grid
							layout_error = true;
						}
					}
				}
			}
			return ! layout_error;
		}
		
		var get_column_number = function( layout ) {
			return ( layout.match( /\+/g) || [] ).length;
		}

		var layout_error = false;
		for ( var l = 0; l < layout.length; l++ ) {
			if ( ! validate_layout( layout[ l ], l ) ) {
				layout_error = true;
				break;
			}
		}

		/*if ( ! layout_error && ( layout[ layout.length - 1 ].match( /-/g) || [] ).length > 0 ) { // xxl responsive not allowed
			layout_error = true;
			l = 4;
		}*/
		
		$( '.bt_bb_dialog_enter_layout' ).parent().removeClass( 'bt_bb_layout_error_alert' );

		if ( layout_error ) {
			//$( '.bt_bb_dialog_enter_layout' ).parent().removeClass( 'bt_bb_layout_error_alert' );
			$( '.bt_bb_dialog_enter_layout' ).eq( l ).parent().addClass( 'bt_bb_layout_error_alert' );
			setTimeout( function() { alert( window.bt_bb_text.layout_error ); }, 300 );
			return false;
		} else {
			var col_num = get_column_number( layout[ 0 ] );
			for ( let l = 1; l < layout.length; l++ ) {
				let col_num_current_layout = get_column_number( layout[ l ] );
				if ( col_num != col_num_current_layout && col_num_current_layout > 0 ) {
					$( '.bt_bb_dialog_enter_layout' ).parent().removeClass( 'bt_bb_layout_error_alert' );
					$( '.bt_bb_dialog_enter_layout' ).eq( l ).parent().addClass( 'bt_bb_layout_error_alert' );
					setTimeout( function() { alert( window.bt_bb_text.number_columns ); }, 300 );
					return false;
				}
			}
		}
		
		var id = window.bt_bb_from;
		
		var xxl_arr = responsive_layout_arr[0].split( '+' );
		var xl_arr = responsive_layout_arr[1].split( '+' );
		var lg_arr = responsive_layout_arr[2].split( '+' );
		var md_arr = responsive_layout_arr[3].split( '+' );
		var sm_arr = responsive_layout_arr[4].split( '+' );
		var xs_arr = responsive_layout_arr[5].split( '+' );

		for ( let i = 0; i < obj.children.length; i++ ) {
			if ( id.bt_ends_with( obj.children[ i ].key ) ) {
				var children_count = obj.children[ i ].children.length;
				if ( children_count > 0 ) { // has children
					if ( xxl_arr.length >= children_count ) { // new child count >= old child count
						for ( let n = 0; n < children_count; n++ ) {
							for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
							var w_param = window.bt_bb_map[ base ].width_param;
							var attr_obj = attr_to_obj( obj.children[ i ].children[ n ].attr );
							attr_obj[ w_param ] = xxl_arr[ n ];
							attr_obj[ 'width_xl' ] = xl_arr[ n ];
							attr_obj[ 'width_lg' ] = lg_arr[ n ];
							attr_obj[ 'width_md' ] = md_arr[ n ];
							attr_obj[ 'width_sm' ] = sm_arr[ n ];
							attr_obj[ 'width_xs' ] = xs_arr[ n ];
							obj.children[ i ].children[ n ].attr = JSON.stringify( attr_obj );
						}
						for ( let n = children_count; n < xxl_arr.length; n++ ) { // add new children
							var add_element = {};
							for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
							add_element.title = base;
							add_element.base = base;
							add_element.key = bt_bb_get_key();
							add_element.children = [];
							var w_param = window.bt_bb_map[ base ].width_param;
							add_element.attr = '{"' + w_param + '":' + bt_bb_json_encode( xxl_arr[ n ] ) + ', "width_xl":' + bt_bb_json_encode( xl_arr[ n ] ) + ', "width_lg":' + bt_bb_json_encode( lg_arr[ n ] ) + ', "width_md":' + bt_bb_json_encode( md_arr[ n ] ) + ', "width_sm":' + bt_bb_json_encode( sm_arr[ n ] ) + ', "width_xs":' + bt_bb_json_encode( xs_arr[ n ] ) + '}';

							var attr_obj = attr_to_obj( add_element.attr );
							if ( window.bt_bb_map[ add_element.base ] !== undefined && window.bt_bb_map[ add_element.base ].params !== undefined ) {
								$.each( window.bt_bb_map[ add_element.base ].params, function( index, param ) {
									if ( param.hasOwnProperty( 'value' ) && typeof param.value === 'string' ) {
										attr_obj[ param.param_name ] = bt_bb_special_char_encode( param.value );
									} else if ( param.hasOwnProperty( 'value' ) && param.hasOwnProperty( 'default' ) ) {
										attr_obj[ param.param_name ] = param.default;	
									}
								});
							}

							add_element.attr = JSON.stringify( attr_obj );

							bt_bb_insert_inside( obj, window.bt_bb_from, add_element );
						}						
					} else { // new child count < old child count
						for ( let n = 0; n < xxl_arr.length; n++ ) {
							for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
							var w_param = window.bt_bb_map[ base ].width_param;
							var attr_obj = attr_to_obj( obj.children[ i ].children[ n ].attr );
							attr_obj[ w_param ] = xxl_arr[ n ];
							attr_obj[ 'width_xl' ] = xl_arr[ n ];
							attr_obj[ 'width_lg' ] = lg_arr[ n ];
							attr_obj[ 'width_md' ] = md_arr[ n ];
							attr_obj[ 'width_sm' ] = sm_arr[ n ];
							attr_obj[ 'width_xs' ] = xs_arr[ n ];								
							obj.children[ i ].children[ n ].attr = JSON.stringify( attr_obj );
						}					
						bt_bb_delete_obj( obj, obj.children[ i ].children[ xxl_arr.length ].key, children_count - xxl_arr.length );
					}
				} else { // no children
					for ( let n = 0; n < xxl_arr.length; n++ ) {
						var add_element = {};
						for ( var base in window.bt_bb_map[ window.bt_bb_base ].accept ) {}
						add_element.title = base;
						add_element.base = base;
						add_element.key = bt_bb_get_key();
						add_element.children = [];
						var w_param = window.bt_bb_map[ base ].width_param;
						add_element.attr = '{"' + w_param + '":' + bt_bb_json_encode( xxl_arr[ n ] ) + ', "width_xl":' + bt_bb_json_encode( xl_arr[ n ] ) + ', "width_lg":' + bt_bb_json_encode( lg_arr[ n ] ) + ', "width_md":' + bt_bb_json_encode( md_arr[ n ] ) + ', "width_sm":' + bt_bb_json_encode( sm_arr[ n ] ) + ', "width_xs":' + bt_bb_json_encode( xs_arr[ n ] ) + '}';

						var attr_obj = attr_to_obj( add_element.attr );
						if ( window.bt_bb_map[ add_element.base ] !== undefined && window.bt_bb_map[ add_element.base ].params !== undefined ) {
							$.each( window.bt_bb_map[ add_element.base ].params, function( index, param ) {
								if ( param.hasOwnProperty( 'value' ) && typeof param.value === 'string' ) {
									attr_obj[ param.param_name ] = bt_bb_special_char_encode( param.value );			
								} else if ( param.hasOwnProperty( 'value' ) && param.hasOwnProperty( 'default' ) ) {
									attr_obj[ param.param_name ] = param.default;	
								}
							});
						}

						add_element.attr = JSON.stringify( attr_obj );

						bt_bb_insert_inside( obj, window.bt_bb_from, add_element );
					}
				}
				window.bt_bb_action = 'refresh';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );

				return true;
			}
			var r = bt_bb_add_horizontal( obj.children[ i ], layout );
			if ( r === true ) {
				return true;
			}
		}
		
	} else {
		//window.bt_bb_state = obj;
		window.bt_bb_dialog.show( 'add_horizontal' );
	}

}