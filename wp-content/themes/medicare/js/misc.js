'use strict';

window.addEventListener("pageshow", function(evt){
        if(evt.persisted){
        setTimeout(function(){
            window.location.reload();
        },10);
    }
}, false);

window.onunload = function(){};

window.bt_loaded = false;

(function( $ ) {

	function bt_video_resize() {
		$( 'iframe' ).not( '.twitter-tweet' ).not( '.instagram-media' ).not( "[src*='soundcloud']" ).each(function() {
			if ( ! $( this ).parent().hasClass( 'boldPhotoBox' ) ) {
				$( this ).css( 'width', '100%' );
				$( this ).css( 'height', $( this ).width() * 9 / 16 );
			}
		});
		
		$( 'embed' ).each(function() {
			if ( ! $( this ).parent().hasClass( 'boldPhotoBox' ) ) {
				$( this ).css( 'width', '100%' );
				$( this ).css( 'height', $( this ).width() * 9 / 16 );
			}
		});	
	}
	
	/* position on screen */

	jQuery.fn.isOnScreen = function( delta ) {
		var element = this.get( 0 );
		if ( element == undefined ) return false;
		if( delta == undefined ) delta = 50;
		var bounds = element.getBoundingClientRect();
		return bounds.top + delta < window.innerHeight && bounds.bottom > 0;
	}

	$( document ).ready(function() {

		$('.btDropdownSelect, .wpcf7-select').fancySelect({forceiOS: true});
		
		bt_video_resize();
		
		$( '.btSidebar select, select.orderby' ).fancySelect().on('change.fs', function() {
			$(this).trigger('change.$');
		});
		
		if ( $( '.btGhost' ).length > 0 ) {
			$( 'body' ).append( $( '.btGhost' ) );
			$( 'body' ).addClass( 'btHasGhost' );
		}
		
		$( '.btQuoteSlider' ).wrap( '<div class="btQuoteWrapper"></div>' );

		$( '.btHasGhost .btGhostSliderThumb a' ).on( 'click', function( e ) {
			// e.preventDefault();
			$( '.single-portfolio .btGhost' ).removeClass( 'btRemoveGhost' );
			$( '.btHasGhost .btGhostSliderThumb' ).removeClass( 'btMarkedImage' );
			bt_disable_scroll();
			$( '.btGhost .slick-slider' ).slick( 'slickGoTo', $( this ).closest( '.btGhostSliderThumb' ).data( 'order-num' ) );
		});
		
		if ( $( window ).scrollTop() > 0 || $( 'html' ).hasClass( 'no-csstransforms3d' ) ) {
			$( '.btGhost' ).addClass( 'btRemoveGhost' );
		}
		
		window.bt_theme_loaded = false;
		
		window.bt_disable_scroll = function() {
			window.onmousewheel = document.onmousewheel = function() {
				if ( window.bt_theme_loaded ) {
					$( '.btCloseGhost' ).trigger( 'click' );
				}
				if ( ! window.bt_theme_loaded || ! window.bt_theme_allow_scroll ) {
					// return false;
				}
			};
			$( window ).on( 'DOMMouseScroll', function( e ) {
				if ( window.bt_theme_loaded ) {
					$( '.btCloseGhost' ).trigger( 'click' );
				}			
				if ( ! window.bt_theme_loaded || ! window.bt_theme_allow_scroll ) {
					// e.preventDefault();
				}
			});		
		}
		
		window.bt_enable_scroll = function() {
			window.onmousewheel = document.onmousewheel = null;
		}
		
		var articleWithGhost = $( '.btPostOverlay' ).length > 0;
		
		if ( $( '.btRemoveGhost' ).length == 0 && $( '.btGhost' ).length > 0  ) {
			window.bt_theme_allow_scroll = false;
			bt_disable_scroll();
		}
		
		btAnimateRows();
		if ( ! $( 'body' ).hasClass( 'impress-enabled' ) ) {
			$( window ).scroll(function() {
				btAnimateRows();
			});
		}

	});

	$( window ).load(function() {
		window.bt_theme_loaded = true;
		
		// remove preloader
		$( '#btPreloader' ).addClass( 'removePreloader' );
		
		// trigger custom load event
		setTimeout( function() { $( window ).trigger( 'btload' ); window.bt_loaded = true; }, 1000 );

		//close mobile menu on # item click
		
		$('.btMenuVertical nav ul.menu a').on( 'click', function() {
			$('.btVerticalMenuTrigger').trigger( 'click' );
		});
                
		/*$( '.btCartWidgetIcon' ).off('click').on( 'click', function ( e ) {
			$(this).parent().parent().toggleClass( 'on' );
			$('body').toggleClass( 'btCartDropdownOn' );
		});*/
		
		initRefreshCart();
		
	});
	
	$( window ).resize(function() {
		bt_video_resize();
	});
	

	
	// lazy image load
	window.bt_bb_lazy_load_images = function() {
		var $elems = $( 'img.btLazyLoadImage:not(.btLazyLoaded)' );
		//console.log($elems);
		$elems.each(function() {
			var $elm = $(this);
			//console.log($elm);
			if ( $elm.isOnScreen( -200 ) ) {
				$elm.addClass( 'btLazyLoaded' );
				//console.log($elm.data( 'image_src' ));
				$elm.attr( 'src', $elm.data( 'image_src' ));
			}
		});
		var $elems = $( '.btLazyLoadBackground:not(.btLazyLoaded)' );
		$elems.each(function() {
			var $elm = $(this);
			if ( $elm.isOnScreen( -200 ) ) {
				$elm.addClass( 'btLazyLoaded' );
				$elm.css( 'background-image', 'url(' + $elm.data( 'background_image_src' ) + ')' );
			}
		});
	}

	/* Animate elements */

	function btAnimateRows() {
		var winheight = $( window ).height();
		var fullheight = $( document ).height();
		var $elems = $( 'body:not(.btPageTransitions) .rowItem.animate:not(.animated), body:not(.btPageTransitions) .headline .animate, article.animate' ).not( '.slided .animate' );
		// classic animations
		$elems.each(function() {
			var $elm = $( this );
			if ( 
			( $elm.isOnScreen() && ! $( 'body' ).hasClass( 'impress-enabled' ) ) ||
			( $elm.isOnScreen() && $( 'body' ).hasClass( 'impress-enabled' ) && $elm.closest( '.boldSection' ).hasClass( 'active' ) )
			) {
				$elm.addClass( 'animated' );
			}
		});
		bt_bb_lazy_load_images();
	}

	$( window ).on( 'btload', function() {
		// autoplay
		if ( $( 'li.btAnimNavNext' ).length && $( 'body' ).data( 'autoplay' ) > 0 ) {
			window.bt_autoplay_interval = setInterval( function(){ $( 'li.btAnimNavNext' ).trigger( 'click' ); }, $( 'body' ).data( 'autoplay' ) );
		}		
	});
	
	$( window ).on( 'bt_section_animation_out', function( e, el ) {
		$( el ).find( '.rowItem.animated' ).removeClass( 'animated' );
	});
	
	$( window ).on( 'bt_section_animation_end', function( e, el ) {
		$( el ).find( '.rowItem.animate' ).addClass( 'animated' );
	});		

	$( document ).ready(function() {
		
		var dropdown = $( 'select.fancified' );
		dropdown.each(function( index ) {
			function onCatChange() {
				if ( $( this )[0].options[ $( this )[0].selectedIndex ].value > 0  ) {
					$( this ).closest( 'form' )[0].submit();
				}
			}
			function onSelectChange() {
				if ( $( this )[0].options[ $( this )[0].selectedIndex ].value !== '' ) {
				document.location.href = $( this )[0].options[ $( this )[0].selectedIndex ].value
				}
			}

			if($( this )[0].name  == 'archive-dropdown'){
				$( this )[0].onchange = onSelectChange;
			} else {
				$( this )[0].onchange = onCatChange;
			}
		});			

		var doc = document.documentElement;
		doc.setAttribute('data-useragent', navigator.userAgent);

		// basic functions

		if ( ! String.prototype.startsWith ) {
			String.prototype.startsWith = function(searchString, position) {
				position = position || 0;
				return this.lastIndexOf(searchString, position) === position;
			};
		}

		if ( ! String.prototype.endsWith ) {
			String.prototype.endsWith = function(searchString, position) {
				var subjectString = this.toString();
				if (position === undefined || position > subjectString.length) {
					position = subjectString.length;
				}
				position -= searchString.length;
				var lastIndex = subjectString.indexOf(searchString, position);
				return lastIndex !== -1 && lastIndex === position;
			};
		}

		/* scroll handlers */

		function scrollPage() {
			var fromTop = $( this ).scrollTop();
			$( '.btCloseGhost' ).trigger( 'click' );
		}

		function scrollPageTo( val ) {
			val = parseInt( val );
			$( 'body, html' ).animate({ scrollTop: val + 'px' }, 500 );
		}

		function scrollPageToId(id) {
			if ( $( id ).length == 0 ) return false;
			var topOffset = $( id ).offset().top;
			if ( stickyEnabled && topOffset > stickyOffset ) {
				topOffset -= $( '.mainHeader' ).height();
				
			}
			$( 'html, body' ).animate({ scrollTop: topOffset }, 500);
		}

		/* init scroll listener */

		window.addEventListener( 'scroll', scrollPage );
	 	
		// delay click to allow on page leave screen

		$( document ).on( 'click', 'a', function() {
			if ( ! $( this ).hasClass( 'lightbox' ) && ! $( this ).hasClass( 'add_to_cart_button' ) ) {
				var href = $( this ).attr( 'href' );
				if ( href !== undefined ) {
					if ( location.href.split('#')[0] != href.split('#')[0] && ! href.startsWith( '#' ) && ! href.startsWith( 'mailto' )  && ! href.startsWith( 'callto' ) )  {
						if ( $( this ).attr( 'target' ) != '_blank' && ! href.endsWith( '#respond' )) {
							if ( $( '#btPreloader' ).length ) {
								$( '#btPreloader' ).removeClass( 'removePreloader' );
								setTimeout( function() { window.location = href }, 1500 );
								return false;
							}
						}
					} else if ( href != "#" ) {
						if( $(this).parent().parent().attr('class') != 'tabsHeader' ) scrollPageToId( href );
						return false;
					}
				}
			}
		});

		// Vertical alignment fix

		$( '.rowItem.btTopVertical, .rowItem.btMiddleVertical, .rowItem.btBottomVertical' ).parent().addClass( 'btTableRow' );

		/* Footer widgets count and column set */

		$( '#boldSiteFooterWidgetsRow' ).children().addClass( 'rowItem col-md-' + 12 / $( '#boldSiteFooterWidgetsRow' ).children().length + ' col-sm-12' );

		// Gallery slider info bar toggler

		$( '.btGetInfo' ).on( 'click', function (){
			$(this).toggleClass( 'on' ).next().toggleClass( 'open' );
			return false;
		});	

		// Close gallery slider

		$( '.btCloseGhost' ).on('click', function () {
			if ( ! $( '.btGhost' ).hasClass( 'btRemoveGhost' ) ) {
				$( '.btGhost' ).addClass( 'btRemoveGhost' );
				$( window ).trigger( 'resize' );
				var pos = $( this ).parent().find( '.slick-slider' ).first().slick( 'slickCurrentSlide' );
				var num_slides = $( this ).parent().find( '.slick-slider' ).find( '.slick-slide' ).length;
				var thumbs = $( '.btGridGallery' ).first().find( '.btGhostSliderThumb' );
				if ( thumbs.length > 0 ) {
					var num_thumbs = thumbs.length;
					if ( num_slides > num_thumbs && pos > 0 ) {
						$( thumbs[ pos - 1 ] ).addClass( 'btMarkedImage' );
						$( 'html, body' ).animate({
							scrollTop: $( thumbs[ pos - 1 ] ).offset().top + $( thumbs[ pos - 1 ] ).height() * .5 - window.innerHeight * 0.5
						}, 0 );
					} else if ( num_slides == num_thumbs ) {
						$( thumbs[ pos ] ).addClass( 'btMarkedImage' );
						$( 'html, body' ).animate({
							scrollTop: $( thumbs[ pos ] ).offset().top + $( thumbs[ pos ] ).height() * .5 - window.innerHeight * 0.5
						}, 0 );
					}
				}
				setTimeout( function() { window.bt_theme_allow_scroll = true; $( '.btMarkedImage' ).removeClass( 'btMarkedImage' ) }, 800 );
				return false;
			}
		});
		
		// magnific-popup grid gallery
		
		$( '.tilesWall.lightbox' ).each(function() {
			$( this ).find( 'a' ).magnificPopup({
				type: 'image',
				// other options
				gallery:{
					enabled:true
				},
				closeMarkup:'<button class="mfp-close" type="button"><i class="mfp-close-icn">&times;</i></button>',
				image: {
					titleSrc: 'data-title'
				},
				closeBtnInside:false		
			});
		});

		// magnific-popup product gallery
		$( 'body.single-product .product .images' ).each(function() {
			$( this ).find( 'a' ).magnificPopup({
				type: 'image',
				// other options
				callbacks: {
					beforeClose: function() {
						var photo = $( this.st.el ).closest( '.bpgPhoto' );
						photo.removeClass( 'out-top' );
						photo.removeClass( 'out-right' );
						photo.removeClass( 'out-bottom' );
						photo.removeClass( 'out-left' );						
					}
				},
				gallery:{
					enabled:true
				},
				closeMarkup:'<button class="mfp-close" type="button"><i class="mfp-close-icn">&times;</i></button>',
				image: {
					titleSrc: 'data-title'
				},
				closeBtnInside:false		
			});
		});

		// Google Map with info pane
		$('.btGoogleMapsContent').parent().addClass('wInfoPane');

		// Info over Google map slide
		$('.btInfoPaneToggler').on( 'click', function(){
			$(this).parent().toggleClass('closed');
		});

		// Photo with icon over it
		$('.btTextCenter').each(function(){
			if($(this).next().is('.btIconsHalfHoverPosition, .btIconsFullHoverPosition')){
				$(this).addClass('wIconOver');
			}
		});

		// FancySelect overflow hidden issue
		$('.btDropdownSelect').closest('.rowItem').addClass('btOverOthers');

		// Checkboxes

		/*$('input[type=checkbox]').parent().addClass('wCheckBox');
		$('input[type=checkbox]input:checked').parent().addClass('checked');

		$('input[type=checkbox]').change(function () {
			$(this).parent().toggleClass('checked');
		});*/

		// Radios

		/*$('input[type=radio]').parent().addClass('wRadio');
		$('input[type=radio]input:checked').parent().addClass('on');

		$('input[type=radio]').on( 'click', function () {
			$('input:not(:checked)').parent().removeClass('on');
			$('input:checked').parent().addClass('on');
		});*/

		/* Date inpu wrapper */
		$('form.wpcf7-form input[type=date]').wrap('<span class="btDateTypeInput"></span>');
                
                // remove preloader
		if(!$( 'body' ).hasClass( 'btRemovePreloader' )) {
                    $( 'body' ).addClass( 'btRemovePreloader' );
                }
                
                initPreloader();
                
	});
        
        function initPreloader() {
            $('body.bodyPreloader .mainHeader .menu').off('click').on( 'click', 'a', function() {  
                var href = $( this ).attr( 'href' );
				if ( href !== undefined ) {
					if ( href.startsWith( 'tel' ) ){
						setTimeout( function() { window.location = href }, 750 );
						return false;
					}
											
					if ( 
							href !== undefined && 
							! href.startsWith( 'tel' ) &&
							! href.startsWith( '#' ) && 
							! href.startsWith( 'mailto' ) &&  
							! href.startsWith( 'callto' ) && 
							! $( this ).hasClass( 'lightbox' ) && 
							! $( this ).hasClass( 'add_to_cart_button' ) && 
							$( this ).attr( 'target' ) != '_blank'
					) {   
							$( 'body' ).removeClass( 'btRemovePreloader' );
							$( '#btPreloader' ).removeClass( 'removePreloader' );
							setTimeout( function() { window.location = href }, 750 );
							return false;
					}
				}
            });
		}
        
	
})( jQuery );

function bt_swipedetect( el, callback ) {
  
    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 150, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function( swipedir ) {}
  
    touchsurface.addEventListener( 'touchstart', function( e ) {
        var touchobj = e.changedTouches[0];
        swipedir = 'none';
        //dist = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
        startTime = new Date().getTime(); // record time when finger first makes contact with surface
        //e.preventDefault();
    }, false );
  
    touchsurface.addEventListener( 'touchmove', function( e ) {
       // e.preventDefault(); // prevent scrolling when inside DIV
    }, false );
  
    touchsurface.addEventListener( 'touchend', function( e ) {
        var touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;// get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface

        elapsedTime = new Date().getTime() - startTime; // get time elapsed
        if ( elapsedTime <= allowedTime ) { // first condition for awipe met
            if ( Math.abs( distX ) >= threshold && Math.abs( distY ) <= restraint ) { // 2nd condition for horizontal swipe met
                swipedir = ( distX < 0 ) ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
            } else if ( Math.abs( distY ) >= threshold && Math.abs( distX ) <= restraint ) { // 2nd condition for vertical swipe met
                swipedir = ( distY < 0 ) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
            }
        }

        handleswipe( swipedir );
        //e.preventDefault();
    }, false );
}

function initRefreshCart() {
		jQuery( '.cart-contents' ).each(function() {
			bt_refresh_cart();
		});
		var cart_node = jQuery( '.widget_shopping_cart' )[0];
		if ( cart_node !== undefined ) {
			var config = { attributes: true, childList: true, subtree: true };
			var callback = function( mutationsList, observer ) {
				// for ( var mutation of mutationsList ) {
				for (var index = 0; index < mutationsList.length; index) {
					var mutation = mutationsList[index];
					if ( mutation.type == 'childList' ) {
						jQuery( '.btCartWidgetIcon' ).off( 'click' ).on( 'click', function ( e ) { jQuery( this ).parent().parent().toggleClass( 'on' ); jQuery('body').toggleClass( 'btCartDropdownOn' ); });
						jQuery( '.verticalMenuCartToggler' ).off( 'click' ).on( 'click', function ( e ) { jQuery( this ).closest( '.widget_shopping_cart_content' ).removeClass( 'on' ); jQuery('body').removeClass('.btCartDropdownOn'); });
					}
					index++;
				}
			};
			var observer = new MutationObserver( callback );
			observer.observe( cart_node, config );
		}
	}

function bt_refresh_cart() {
	jQuery( '.btCartWidgetIcon' ).off('click').on( 'click', function ( e ) {
		jQuery(this).parent().parent().toggleClass( 'on' );
		jQuery('body').toggleClass( 'btCartDropdownOn' );
	});
	jQuery('.verticalMenuCartToggler').off('click').on( 'click', function() {
		jQuery(this).closest('.widget_shopping_cart_content').removeClass('on');
		jQuery('body').removeClass('.btCartDropdownOn');
	});
}