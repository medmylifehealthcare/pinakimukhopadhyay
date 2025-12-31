(function( $ ) {
	
	$( document ).ready(function() {
		
		var $pages = $( 'section.step' );
		var pagesCount = $pages.length;
		
		var current = 0;

		$( '.btContent' ).attr( 'id', 'impress' );
		
		impress().init();

		var api = impress();
		
		$( '.btPageWrap' ).append( btGetNavHTML( pagesCount ) );
		
		$( '.btAnimNav li.btAnimNavDot' ).first().addClass( 'active' );

		$( '.btAnimNav li' ).on( 'click', function( e ) {
			
			if ( ( ! $( this ).hasClass( 'active' ) || $( this ).hasClass( 'btAnimNavPrev' ) || $( this ).hasClass( 'btAnimNavNext' ) ) ) {
				
				if ( e.originalEvent !== undefined ) { // human
					clearInterval( window.bt_autoplay_interval );
				}
				
				if ( $( this ).hasClass( 'btAnimNavPrev' ) ) {
					var next = current - 1;
				} else if ( $( this ).hasClass( 'btAnimNavNext' ) ) {
					var next = current + 1;
				} else {
					var next = parseInt( $( this ).data( 'count' ) );
				}
				
				if ( next < 0 ) {
					next = pagesCount - 1;
				} else if ( next > pagesCount - 1 ) {
					next = 0;
				}				
				
				$( '.btAnimNav li' ).removeClass( 'active' );
				$( '.btAnimNav li.btAnimNavDot' ).eq( next ).addClass( 'active' );
				
				api.goto( next );
				
				current = next;
				
			}
			
		});
		
		// mouse wheel & keydown
		$( window ).on( 'mousewheel DOMMouseScroll keydown', function( e ) {
			if ( e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 || e.which == '38' || e.which == '37' ) {
				$( 'li.btAnimNavPrev' ).trigger( 'click' );
				clearInterval( window.bt_autoplay_interval );
			} else if ( e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0 || e.which == '40' || e.which == '39' || e.which == '32' || e.which == '13' ) {
				$( 'li.btAnimNavNext' ).trigger( 'click' );
				clearInterval( window.bt_autoplay_interval );
			}
			e.preventDefault();
		});
		
		bt_swipedetect( window, function( swipedir ) { // "none", "left", "right", "top", or "down"
			if ( swipedir == 'left' || swipedir == 'top' ) {
				$( 'li.btAnimNavPrev' ).trigger( 'click' );
				clearInterval( window.bt_autoplay_interval );
			} else if ( swipedir == 'right' || swipedir == 'down' ) {
				$( 'li.btAnimNavNext' ).trigger( 'click' );
				clearInterval( window.bt_autoplay_interval );
			}
		});
		
	});
	
})( jQuery );