"use strict";

class bt_bb_css_post_grid {
	
	static initialized = false;
		
	static bt_bb_css_post_grid_load_images( root ) {
		root.each(function() {
			var page_bottom = jQuery( window ).scrollTop() + jQuery( window ).height();
			jQuery( this ).find( '.bt_bb_grid_item' ).each(function() {
				var this_top = jQuery( this ).offset().top;
				if ( this_top < page_bottom + jQuery( window ).height() ) {
					var img_src = jQuery( this ).data( 'src' );
					if ( img_src !== '' && jQuery( this ).find( '.bt_bb_grid_item_post_thumbnail a' ).html() == '' ) {
						jQuery( this ).find( '.bt_bb_grid_item_post_thumbnail a' ).html( '<img src="' + img_src + '" alt="' + jQuery( this ).data( 'alt' ) + '">' );
					}
				}
			});
		});
	}

	static bt_bb_css_post_grid_load_items( root ) {
		root.each(function() {			
			var loading = root.data( 'loading' );
			if ( loading === undefined || ( loading != 'loading' && loading != 'no_more' ) ) {
				var page_bottom = jQuery( window ).scrollTop() + jQuery( window ).height();
				jQuery( this ).find( '.bt_bb_grid_item' ).each(function() {
					var this_top = jQuery( this ).offset().top;
					if ( this_top < page_bottom + jQuery( window ).height() ) {
						if ( jQuery( this ).is( ':last-child' ) ) {
							var root_data_offset = root.attr( 'data-offset' );							
							var offset = parseInt( root_data_offset === undefined ? 0 : root_data_offset ) + parseInt( root.data( 'number' ) );
							bt_bb_css_post_grid.bt_bb_css_post_grid_load_posts( root, offset );
							return false;							
						}
					}
				});
			}
		});
	}

	static bt_bb_css_post_grid_load_posts( root, offset ) {
		if ( offset == 0 ) {
			root.addClass( 'bt_bb_grid_hide' );
			root.find( '.bt_bb_grid_item' ).remove();
		}
		
		root.parent().find( '.bt_bb_post_grid_loader' ).show();
		root.parent().addClass( 'bt_bb_grid_loading' );
		root.parent().addClass( 'bt_bb_grid_first_load_passed' );
		
		root.parent().find( '.bt_bb_css_post_grid_message' ).remove();

		var action = 'bt_bb_get_css_grid';

		var root_data_number = root.data( 'number' );
		
		var data = {
			'action': action,
			'number': root_data_number,
			'category': root.data( 'category' ),
			'bt-bb-css-post-grid-nonce': root.data( 'bt-bb-css-post-grid-nonce' ),
			'post-type': root.data( 'post-type' ),
			'ignore-nonce': root.data( 'ignore-nonce' ),
			'offset': offset,
			'show': root.data( 'show' ),
			'show_superheadline': root.data( 'show-superheadline' ),
			'show_subheadline': root.data( 'show-subheadline' ),
			'format': root.data( 'format' ),
			'title_html_tag': root.data( 'title-html-tag' ),
			'img_base_size': root.data( 'img-base-size' )
		};

		root.data( 'loading', 'loading' );
		
		jQuery.ajax({
			type: 'POST',
			url: ajax_object.ajax_url,
			data: data,
			async: true,
			success: function( response ) {
				if ( response == '' ) {
					root.data( 'loading', 'no_more' );
					root.parent().find( '.bt_bb_post_grid_loader' ).hide();
					if ( offset == 0 ) {
						root.parent().find( '.bt_bb_css_post_grid_content' ).after( '<p class="bt_bb_css_post_grid_message">' + jQuery( '.bt_bb_css_post_grid_content' ).data( 'no-posts-text' ) + '</p>' );
					}
					return;
				} else {
					root.parent().removeClass( 'bt_bb_grid_loading' );
				}

				var $content = jQuery( response );
				root.append( $content );

				root.attr( 'data-offset', offset );

				root.parent().find( '.bt_bb_post_grid_loader' ).hide();
				root.removeClass( 'bt_bb_grid_hide' );
				root.parent().find( '.bt_bb_grid_container' ).css( 'height', 'auto' );

				bt_bb_css_post_grid.bt_bb_css_post_grid_load_images( root );

				if ( root.data( 'auto-loading' ) == 'auto_loading' ) {
					root.data( 'loading', '' );
				} else {
					root.data( 'loading', 'no_more' );
				}

			},
			error: function( response ) {
				root.parent().find( '.bt_bb_post_grid_loader' ).hide();
				root.removeClass( 'bt_bb_grid_hide' );			
			}
		});
	}

	static init() {
		if ( ! bt_bb_css_post_grid.initialized ) {
			jQuery( window ).on( 'scroll', function() {	
				jQuery( '.bt_bb_css_post_grid' ).each(function() {	
					jQuery( this ).find( '.bt_bb_css_post_grid_content' ).each(function() {	
						if ( bt_bb_css_post_grid.bt_bb_css_post_grid_isOnScreen( jQuery( this ), -200 ) ){
							bt_bb_css_post_grid.bt_bb_css_post_grid_load_images( jQuery( this ) );
							bt_bb_css_post_grid.bt_bb_css_post_grid_load_items( jQuery( this ) );
						}
					});
				});
			});
			bt_bb_css_post_grid.initialized = true;
		}
	}
	
	static reinit() {
		jQuery( '.bt_bb_css_post_grid' ).not( '.bt_bb__inited' ).each(function() {
			
			jQuery( this ).addClass( 'bt_bb__inited' );
			
			jQuery( this ).find( '.bt_bb_css_post_grid_button' ).on( 'click', function() {
				var root = jQuery( this ).parent().siblings('.bt_bb_css_post_grid_content');
				var root_data_offset = root.attr( 'data-offset' );							
				var offset = parseInt( root_data_offset === undefined ? 0 : root_data_offset ) + parseInt( root.data( 'number' ) );
				bt_bb_css_post_grid.bt_bb_css_post_grid_load_posts( root, offset );
			});
			
			jQuery( this ).find( '.bt_bb_css_post_grid_content' ).each(function() {
				bt_bb_css_post_grid.bt_bb_css_post_grid_load_posts( jQuery( this ), 0 );
			});
			
			jQuery( this ).find( '.bt_bb_css_post_grid_filter_item' ).on( 'click', function() {
				var root = jQuery( this ).closest( '.bt_bb_grid_container' );
				root.height( root.height() );
				jQuery( this ).parent().find( '.bt_bb_css_post_grid_filter_item' ).removeClass( 'active' ); 
				jQuery( this ).addClass( 'active' );
				var grid_content = jQuery( this ).closest( '.bt_bb_css_post_grid' ).find( '.bt_bb_css_post_grid_content' );
				grid_content.data( 'category', jQuery( this ).data( 'category' ) );
				bt_bb_css_post_grid.bt_bb_css_post_grid_load_posts( grid_content, 0 );
			});
			
		});
	}

	// isOnScreen fixed
	
	static bt_bb_css_post_grid_iOSversion() {
	  if (/iP(hone|od|ad)/.test(navigator.platform)) {
		// supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
		var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
	  } else {
		  return false;
	  }
	}
	
	// isOnScreen
	
	static bt_bb_css_post_grid_isOnScreen( elem, top_offset ) {
		var ver = bt_bb_css_post_grid.bt_bb_css_post_grid_iOSversion();
		if ( ver && ver[0] == 13 ) return true;
		top_offset = ( top_offset === undefined ) ? 75 : top_offset;
		var element = elem.get( 0 );
		if ( element == undefined ) return false;
		var bounds = element.getBoundingClientRect();
		var output = bounds.top + top_offset < window.innerHeight && bounds.bottom > 0;

		return output;
	}
	
}

jQuery( document ).ready(function() {
	bt_bb_css_post_grid.init();
	bt_bb_css_post_grid.reinit();
});

function bt_bb_css_post_grid_reinit() {
	bt_bb_css_post_grid.reinit();
}
