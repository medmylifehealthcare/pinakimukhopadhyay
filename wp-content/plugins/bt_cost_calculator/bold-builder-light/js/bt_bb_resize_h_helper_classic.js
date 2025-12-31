'use strict';

window.bt_bb_resize_h_helper_classic = function( obj ) {
	if ( obj.title == '_root' ) {
		obj = obj.children;
	}
	for ( var i = 0; i < obj.length; i++ ) {
		if ( window.bt_bb_map[ obj[ i ].title ] !== undefined ) {
			if ( window.bt_bb_map[ obj[ i ].title ].container == 'horizontal' ) {
				if ( obj[ i ].children !== undefined ) {
				
					var width_param_missing = false;
					var layout_error = false;
					
					var up = [];
					var down = [];
					
					for ( var k = 0; k < obj[ i ].children.length; k++ ) {
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
					for ( var n = 0; n < up.length; n++ ) {
						var w_item = 12 * up[ n ] / down[ n ];
						if ( w_item != Math.floor( w_item ) && ( w_item != 2.4 || window.bt_bb_custom_elements ) ) {
							layout_error = true;
							break;
						}
						sum = sum + w_item;
					}
					
					if ( ! width_param_missing && ( sum != 12 || layout_error ) ) {
						for ( var k = 0; k < obj[ i ].children.length; k++ ) {
							var w_param = window.bt_bb_map[ obj[ i ].children[ k ].title ].width_param;
							var attr_obj = attr_to_obj( obj[ i ].children[ k ].attr );
							attr_obj[ w_param ] = '1/' + obj[ i ].children.length;
							up[ k ] = 1;
							down[ k ] = obj[ i ].children.length;
							obj[ i ].children[ k ].attr = JSON.stringify( attr_obj );
						}
					}
					
					layout_error = false;
					for ( var n = 0; n < up.length; n++ ) {
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