'use strict';

window.bt_bb_resize_h_helper = function( obj ) {
	if ( obj.title == '_root' ) {
		obj = obj.children;
	}
	for ( let i = 0; i < obj.length; i++ ) {
		if ( window.bt_bb_map[ obj[ i ].title ] !== undefined ) {
			if ( window.bt_bb_map[ obj[ i ].title ].container == 'horizontal' ) {
				if ( obj[ i ].children !== undefined ) {

					var width_param_missing = false;
					var layout_error = false;

					var up = [];
					var down = [];
					
					var children_count = obj[ i ].children.length;

					for ( let k = 0; k < children_count; k++ ) {
						if ( window.bt_bb_map[ obj[ i ].children[ k ].title ] !== undefined && window.bt_bb_map[ obj[ i ].children[ k ].title ].width_param !== undefined ) {
							var w_param = window.bt_bb_map[ obj[ i ].children[ k ].title ].width_param;
							if ( obj[ i ].children[ k ].attr === undefined ) {
								obj[ i ].children[ k ].attr = '{}';
							}
							var attr_obj = attr_to_obj( obj[ i ].children[ k ].attr );
							if ( ! attr_obj.hasOwnProperty( w_param ) ) {
								attr_obj[ w_param ] = '1/12';
							}
							
							var w = attr_obj[ w_param ].split( '/' );
							up.push( parseInt( w[0] ) );
							down.push( parseInt( w[1] ) );
							
						} else {
							width_param_missing = true;
							//console.log( 'bt_bb: width_param missing from shortcode mapping for shortcode inside horizontal container' );
							break;
						}
					}

					var sum = 0;
					for ( let n = 0; n < up.length; n++ ) {
						var w_item = 12 * up[ n ] / down[ n ];
						if ( w_item != Math.floor( w_item ) && ( w_item != 2.4 || window.bt_bb_custom_elements ) ) {
							layout_error = true;
							break;
						}
						sum = sum + w_item;
					}

					if ( ! width_param_missing && ( sum != 12 || layout_error ) ) {
						for ( let k = 0; k < children_count; k++ ) {
							var w_param = window.bt_bb_map[ obj[ i ].children[ k ].title ].width_param;
							var attr_obj = attr_to_obj( obj[ i ].children[ k ].attr );
							attr_obj[ w_param ] = '1/' + children_count;
							attr_obj[ 'width_xl' ] = attr_obj[ w_param ];
							if ( children_count == 12 ) {
								attr_obj[ 'width_lg' ] = '1/6';
								attr_obj[ 'width_md' ] = '1/1';
								attr_obj[ 'width_sm' ] = '1/1';
								attr_obj[ 'width_xs' ] = '1/1';
							} else if ( children_count == 6 ) {
								attr_obj[ 'width_lg' ] = '1/3';
								attr_obj[ 'width_md' ] = '1/1';
								attr_obj[ 'width_sm' ] = '1/1';
								attr_obj[ 'width_xs' ] = '1/1';
							} else if ( children_count == 5 ) {
								attr_obj[ 'width_lg' ] = '1/5';
								attr_obj[ 'width_md' ] = '1/1';
								attr_obj[ 'width_sm' ] = '1/1';
								attr_obj[ 'width_xs' ] = '1/1';
							} else if ( children_count == 4 ) {
								attr_obj[ 'width_lg' ] = '1/4';
								attr_obj[ 'width_md' ] = '1/2';
								attr_obj[ 'width_sm' ] = '1/2';
								attr_obj[ 'width_xs' ] = '1/1';
							} else if ( children_count == 3 ) {
								attr_obj[ 'width_lg' ] = '1/3';
								attr_obj[ 'width_md' ] = '1/1';
								attr_obj[ 'width_sm' ] = '1/1';
								attr_obj[ 'width_xs' ] = '1/1';
							} else if ( children_count == 2 ) {
								attr_obj[ 'width_lg' ] = '1/2';
								attr_obj[ 'width_md' ] = '1/2';
								attr_obj[ 'width_sm' ] = '1/2';
								attr_obj[ 'width_xs' ] = '1/1';
							} else {
								attr_obj[ 'width_lg' ] = '1/1';
								attr_obj[ 'width_md' ] = '1/1';
								attr_obj[ 'width_sm' ] = '1/1';
								attr_obj[ 'width_xs' ] = '1/1';
							}

							up[ k ] = 1;
							down[ k ] = children_count;
							obj[ i ].children[ k ].attr = JSON.stringify( attr_obj );
						}
					}

					layout_error = false;
					for ( let n = 0; n < up.length; n++ ) {
						var w_item = 12 * up[ n ] / down[ n ];
						if ( w_item != Math.floor( w_item ) && ( w_item != 2.4 || window.bt_bb_custom_elements ) ) {
							layout_error = true;
							break;
						}
					}

					if ( layout_error ) {
						obj[ i ].has_alert = 'bt_bb_item_alert';
					} else {
						obj[ i ].has_alert = undefined;
					}
				}
			}
		}
		if ( obj[ i ].children !== undefined ) {
			bt_bb_resize_h( obj[ i ].children );
		}

	}
}