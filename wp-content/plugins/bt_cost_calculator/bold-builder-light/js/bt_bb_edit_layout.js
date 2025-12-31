'use strict';

window.bt_bb_edit_layout = function() {
	let $ = jQuery;
	var obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
	var current_layout = '';
	var current_layout_xl = '';
	var current_layout_lg = '';
	var current_layout_md = '';
	var current_layout_sm = '';
	var current_layout_xs = '';
	for ( let i = 0; i < obj.children.length; i++ ) {
		var w_param = window.bt_bb_map[ obj.children[ i ].base ].width_param;
		var attr_obj = attr_to_obj( obj.children[ i ].attr );
		if ( attr_obj !== undefined && attr_obj[ w_param ] !== undefined ) current_layout += attr_obj[ w_param ];
		if ( attr_obj !== undefined && attr_obj[ 'width_xl' ] !== undefined ) current_layout_xl += attr_obj[ 'width_xl' ];
		if ( attr_obj !== undefined && attr_obj[ 'width_lg' ] !== undefined ) current_layout_lg += attr_obj[ 'width_lg' ];
		if ( attr_obj !== undefined && attr_obj[ 'width_md' ] !== undefined ) current_layout_md += attr_obj[ 'width_md' ];
		if ( attr_obj !== undefined && attr_obj[ 'width_sm' ] !== undefined ) current_layout_sm += attr_obj[ 'width_sm' ];
		if ( attr_obj !== undefined && attr_obj[ 'width_xs' ] !== undefined ) current_layout_xs += attr_obj[ 'width_xs' ];
		if ( i < obj.children.length - 1 ) {
			if ( attr_obj !== undefined && attr_obj[ w_param ] !== undefined && attr_obj[ w_param ] !== '' ) current_layout += '+';
			if ( attr_obj !== undefined && attr_obj[ 'width_xl' ] !== undefined && attr_obj[ 'width_xl' ] !== '' ) current_layout_xl += '+';
			if ( attr_obj !== undefined && attr_obj[ 'width_lg' ] !== undefined && attr_obj[ 'width_lg' ] !== '' ) current_layout_lg += '+';
			if ( attr_obj !== undefined && attr_obj[ 'width_md' ] !== undefined && attr_obj[ 'width_md' ] !== '' ) current_layout_md += '+';
			if ( attr_obj !== undefined && attr_obj[ 'width_sm' ] !== undefined && attr_obj[ 'width_sm' ] !== '' ) current_layout_sm += '+';
			if ( attr_obj !== undefined && attr_obj[ 'width_xs' ] !== undefined && attr_obj[ 'width_xs' ] !== '' ) current_layout_xs += '+';
		}
	}

	$( '#bt_bb_dialog' ).addClass( 'bt_bb_dialog_add_horizontal' );
	var content = '';
	content += '<div class="bt_bb_dialog_pick_layout_container">';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_11" title="1/1"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_12_12" title="1/2+1/2"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_13_13_13" title="1/3+1/3+1/3"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_14_14_14_14" title="1/4+1/4+1/4+1/4"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_15_15_15_15_15" title="1/5+1/5+1/5+1/5+1/5"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_23_13" title="2/3+1/3"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_13_23" title="1/3+2/3"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_34_14" title="3/4+1/4"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_14_34" title="1/4+3/4"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_14_24_14" title="1/4+2/4+1/4"></span>';
	content += '</div>';
	content += '<div class="bt_bb_dialog_enter_layout_container">';
		content += '<div class="bt_bb_edit_layout_xxl"><b>&gt;1400px</b><input type="text" class="bt_bb_dialog_enter_layout bt_bb_dialog_enter_layout_xxl"></div>';
		content += '<div class="bt_bb_edit_layout_xl"><b>1201-1400px</b><input type="text" class="bt_bb_dialog_enter_layout bt_bb_dialog_enter_layout_xl" placeholder="---"></div>';
		content += '<div class="bt_bb_edit_layout_lg"><b>993-1200px</b><input type="text" class="bt_bb_dialog_enter_layout bt_bb_dialog_enter_layout_lg" placeholder="---"></div>';
		content += '<div class="bt_bb_edit_layout_md"><b>769-992px</b><input type="text" class="bt_bb_dialog_enter_layout bt_bb_dialog_enter_layout_md" placeholder="---"></div>';
		content += '<div class="bt_bb_edit_layout_sm"><b>481-768px</b><input type="text" class="bt_bb_dialog_enter_layout bt_bb_dialog_enter_layout_sm" placeholder="---"></div>';
		content += '<div class="bt_bb_edit_layout_xs"><b>&le;480px</b><input type="text" class="bt_bb_dialog_enter_layout bt_bb_dialog_enter_layout_xs" placeholder="---"></div>';
	content += '</div>';
	$( '#bt_bb_dialog .bt_bb_dialog_content' ).html( content );
	
	$( '#bt_bb_dialog' ).append( '<input type="button" class="bt_bb_dialog_button bt_bb_edit button button-small" value="' + window.bt_bb_text.submit + '">' );
	
	if ( current_layout != '' ) $( '.bt_bb_dialog_enter_layout_xxl' ).val( current_layout );

	if ( current_layout_xl != '' ) {
		$( '.bt_bb_dialog_enter_layout_xl' ).val( current_layout_xl );
	} else if ( current_layout != '' ) {
		$( '.bt_bb_dialog_enter_layout_xl' ).val( current_layout );
	}
	
	if ( current_layout_lg != '' ) $( '.bt_bb_dialog_enter_layout_lg' ).val( current_layout_lg );
	if ( current_layout_md != '' ) $( '.bt_bb_dialog_enter_layout_md' ).val( current_layout_md );
	if ( current_layout_sm != '' ) $( '.bt_bb_dialog_enter_layout_sm' ).val( current_layout_sm );
	if ( current_layout_xs != '' ) $( '.bt_bb_dialog_enter_layout_xs' ).val( current_layout_xs );
	
	/*if ( attr_obj[ 'width_lg' ] === undefined ) {
		
		let arr = current_layout.split( '+' );
		let resp_arr = { 'lg': [], 'md': [], 'sm': [], 'xs': [] };
		
		arr.forEach(function( width ) {
			
			let arr1 = width.split( '/' );
			
			let width1;

			if ( arr1.length != 2 || arr1[0] == 0 || arr1[1] == 0 ) {
				width1 = 12;
			} else {
				let top = arr1[0];
				let bottom = arr1[1];
				
				width1 = 12 * top / bottom;

				if ( width1 == 2.4 ) {
					width1 = '1_5';
				} else if ( ! Number.isInteger( width1 ) || width1 < 1 || width1 > 12 ) {
					width1 = 12;
				} 
			}

			if ( width1 == 2 ) {
				//$class[] = 'col-md-2 col-sm-4 col-ms-12';
				resp_arr.lg.push( '1/6' );
				resp_arr.md.push( '1/6' );
				resp_arr.sm.push( '1/6' );
				resp_arr.xs.push( '1/1' );
			} else if ( width1 == 3 ) {
				//$class[] = 'col-md-3 col-sm-6 col-ms-12';
				resp_arr.lg.push( '1/6' );
				resp_arr.md.push( '1/6' );
				resp_arr.sm.push( '1/6' );
				resp_arr.xs.push( '1/1' );
			} else if ( width1 == 4 ) {
				//$class[] = 'col-md-4 col-ms-12';
				resp_arr.lg.push( '1/6' );
				resp_arr.md.push( '1/6' );
				resp_arr.sm.push( '1/6' );
				resp_arr.xs.push( '1/1' );
			} else if ( width1 == 6 ) {
				//$class[] = 'col-md-6 col-sm-12';
				resp_arr.lg.push( '1/6' );
				resp_arr.md.push( '1/6' );
				resp_arr.sm.push( '1/6' );
				resp_arr.xs.push( '1/1' );
			} else if ( width1 == 8 ) {
				//$class[] = 'col-md-8 col-ms-12';
				resp_arr.lg.push( '1/6' );
				resp_arr.md.push( '1/6' );
				resp_arr.sm.push( '1/6' );
				resp_arr.xs.push( '1/1' );
			} else {
				//$class[] = 'col-md-' . width . ' ' . 'col-ms-12';
			}
			
		});
	}*/
	
	$( '.bt_bb_dialog_pick_layout' ).click(function( e ) {
		var base_layout = $( this ).attr( 'title' ).replace( /\s/gm, '' );
		$( '.bt_bb_dialog_enter_layout' ).parent().removeClass( 'bt_bb_layout_error_alert' );;
		$( '.bt_bb_dialog_enter_layout' ).val( base_layout );

		if ( window.bt_bb_base == 'bt_bb_row' || window.bt_bb_base == 'bt_bb_row_inner' || ( window.bt_bb_responsive_layout_extra_elements && window.bt_bb_responsive_layout_extra_elements.includes( window.bt_bb_base ) ) ) {
			if ( base_layout == '1/2+1/2' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/3+1/3+1/3' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1+1/1' );
			} else if ( base_layout == '1/4+1/4+1/4+1/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/2+1/2+1/2+1/2' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/2+1/2+1/2+1/2' );
			} else if ( base_layout == '2/3+1/3' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/3+2/3' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
			} else if ( base_layout == '3/4+1/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/4+3/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/4+2/4+1/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1+1/1' );
			} else if ( base_layout == '1/5+1/5+1/5+1/5+1/5' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1+1/1+1/1+1/1' );
			}
		} /*else if ( window.bt_bb_base == 'bt_bb_row_inner' ) {
			if ( base_layout == '1/2+1/2' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/3+1/3+1/3' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1+1/1' );
			} else if ( base_layout == '1/4+1/4+1/4+1/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/2+1/2+1/2+1/2' );
				$( '.bt_bb_dialog_enter_layout_lg' ).val( '1/2+1/2+1/2+1/2' );
			} else if ( base_layout == '2/3+1/3' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/3+2/3' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
			} else if ( base_layout == '3/4+1/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_lg' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/4+3/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_lg' ).val( '1/1+1/1' );
			} else if ( base_layout == '1/4+2/4+1/4' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_lg' ).val( '1/1+1/1+1/1' );
			} else if ( base_layout == '1/5+1/5+1/5+1/5+1/5' ) {
				$( '.bt_bb_dialog_enter_layout_xs' ).val( '1/1+1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_sm' ).val( '1/1+1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_md' ).val( '1/1+1/1+1/1+1/1+1/1' );
				$( '.bt_bb_dialog_enter_layout_lg' ).val( '1/1+1/1+1/1+1/1+1/1' );
			}
		}*/
	});
	
	$( '.bt_bb_dialog_enter_layout' ).keypress(function( e ) {
		if ( e.which == 13 ) {
			e.preventDefault();
		}
	});
	
	$( '.bt_bb_dialog_add_horizontal .bt_bb_dialog_button' ).click(function( e ) {
		var r = bt_bb_add_horizontal( window.bt_bb_state_current, [ $( '.bt_bb_dialog_enter_layout_xxl' ).val(), $( '.bt_bb_dialog_enter_layout_xl' ).val(), $( '.bt_bb_dialog_enter_layout_lg' ).val(), $( '.bt_bb_dialog_enter_layout_md' ).val(), $( '.bt_bb_dialog_enter_layout_sm' ).val(), $( '.bt_bb_dialog_enter_layout_xs' ).val() ] );
		if ( r ) {
			window.bt_bb_dialog.hide();
		}
	});
}