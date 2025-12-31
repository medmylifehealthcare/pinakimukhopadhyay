'use strict';

window.bt_bb_edit_layout_classic = function() {
	let $ = jQuery;
	var obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
	var current_layout = '';
	for ( var i = 0; i < obj.children.length; i++ ) {
		var w_param = window.bt_bb_map[ obj.children[ i ].base ].width_param;
		var attr_obj = attr_to_obj( obj.children[ i ].attr );
		current_layout += attr_obj[ w_param ];
		if ( i < obj.children.length - 1 ) current_layout += '+';
	}

	$( '#bt_bb_dialog' ).addClass( 'bt_bb_dialog_add_horizontal bt_bb_dialog_add_horizontal_classic' );
	var content = '';
	content += '<div class="bt_bb_dialog_pick_layout_container">';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_11" title="1/1"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_12_12" title="1/2+1/2"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_13_13_13" title="1/3+1/3+1/3"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_14_14_14_14" title="1/4+1/4+1/4+1/4"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_23_13" title="2/3+1/3"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_13_23" title="1/3+2/3"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_34_14" title="3/4+1/4"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_14_34" title="1/4+3/4"></span>';
	content += '<span class="bt_bb_dialog_pick_layout bt_bb_dialog_14_24_14" title="1/4+2/4+1/4"></span>';
	content += '</div>';
	content += '<div class="bt_bb_dialog_enter_layout_container">';
	content += '<div contenteditable="true" class="bt_bb_dialog_enter_layout">1/1</div>';
	content += '</div>';
	$( '#bt_bb_dialog .bt_bb_dialog_content' ).html( content );
	
	$( '#bt_bb_dialog' ).append( '<input type="button" class="bt_bb_dialog_button bt_bb_edit button button-small" value="' + window.bt_bb_text.submit + '">' );
	
	if ( current_layout != '' ) {
		$( '.bt_bb_dialog_enter_layout' ).html( current_layout );
	}
	
	$( '.bt_bb_dialog_pick_layout' ).click(function( e ) {
		$( '.bt_bb_dialog_enter_layout' ).html( $( this ).attr( 'title' ).replace( /\s/gm, '' ) );
		$( '.bt_bb_dialog_enter_layout' ).focus();
	});
	
	$( '.bt_bb_dialog_enter_layout' ).keypress(function( e ) {
		if ( e.which == 13 ) {
			e.preventDefault();
			bt_bb_add_horizontal_classic( window.bt_bb_state_current, $( this ).html() );
			window.bt_bb_dialog.hide();
		}
	});
	
	$( '.bt_bb_dialog_add_horizontal .bt_bb_dialog_button' ).click(function( e ) {
		bt_bb_add_horizontal_classic( window.bt_bb_state_current, $( '.bt_bb_dialog_enter_layout' ).html() );
		window.bt_bb_dialog.hide();
	});
}