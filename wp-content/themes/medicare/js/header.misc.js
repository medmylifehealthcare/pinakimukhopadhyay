'use strict';

var stickyOffset;
var stickyEnabled;

var bt_enquire = {};

bt_enquire.sizes = {};

(function( $ ) {
	
	bt_enquire.register = function( size, handler ) {
		size = parseInt( size.split( ':' )[1] );
		bt_enquire.sizes[ size ] = {};
		bt_enquire.sizes[ size ].handler = handler;
	}

	bt_enquire.handle = function() {
		var width = ( window.innerWidth > 0 ) ? window.innerWidth : screen.width;
		$.each( bt_enquire.sizes, function( size, obj ) {
			if ( width <= size ) {
				if ( obj.state != 'matched' ) {
					obj.handler.match();
					obj.state = 'matched';
				}
			} else {
				if ( obj.state == 'matched' ) {
					obj.handler.unmatch();
					obj.state = 'unmatched';
				}
			}
		});
	}
	
	var verticalMenuScroll = null;

	$( document ).ready(function() {		
		
		var isTouchDevice = ( 'ontouchstart' in window ) || ( navigator.MaxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 );
		
		if ( isTouchDevice ) {
			$( 'html' ).addClass( 'touch' );
			$( 'html' ).removeClass( 'no-touch' );
		} else {
			$( 'html' ).addClass( 'no-touch' );
			$( 'html' ).removeClass( 'touch' );
		}
		
		var hasCentralMenu = $( 'body' ).hasClass( 'btMenuCenterEnabled' );
		var verticalMenuEnabled = $( 'body' ).hasClass( 'btMenuVerticalLeftEnabled' ) || $( 'body' ).hasClass( 'btMenuVerticalRightEnabled' );
		var belowMenu = $( 'body' ).hasClass( 'btBelowMenu' );
		var touchDevice = $( 'html' ).hasClass( 'touch' );
		stickyEnabled = $( 'body' ).hasClass( 'btStickyEnabled' );
		stickyOffset = 250;
		var swapHeaderStyle = belowMenu && stickyEnabled && $( '.btAltLogo' ).length > 0; // If alt logo exists we will swap header skin

		var skinToSwap = $( 'body' ).hasClass( 'btDarkSkin' ) ? "btLightSkin" : "btDarkSkin";
		$( '.btPageWrap .btAltLogo' ).hide( );
		$( '.btPageWrap .btMainLogo' ).show( );
		
		function divide_menu() {
			if ( ! hasCentralMenu ) return false;
			
			if ( $( '.mainHeader .logo .btMainLogo' ).data( 'hw' ) === undefined ) {
				var logoWidth = $( '.mainHeader .logo' ).width();
			} else {
				var logoWidth = $( '.mainHeader .logo' ).height() * $( '.mainHeader .logo .btMainLogo' ).data( 'hw' );
			}
			
			$( '.menuPort nav' ).addClass( 'leftNav' );
			$( '.menuPort' ).append( '<nav class="rightNav"><ul></ul></nav>' );
			var halfItems = Math.ceil( $( '.mainHeader nav.leftNav ul>li:not(li li)' ).length * .5 );
			$( '.mainHeader nav.rightNav > ul' ).append( $( '.mainHeader nav.leftNav > ul > li' ).slice ( halfItems ) );
			$( '.mainHeader nav.leftNav > ul > li' ).slice ( halfItems ).remove();
			
			$( '.mainHeader .logo' ).css( 'transform', 'translateX(' + Math.round(-logoWidth * .5) + 'px)' );
			$( '.mainHeader nav.leftNav' ).css( 'margin-right', Math.round(logoWidth * .5) + 'px' );
			$( '.mainHeader nav.rightNav' ).css( 'margin-left', Math.round(logoWidth * .5) + 'px' );
		}

		function undivide_menu() {
			if ( ! hasCentralMenu ) return false;
			$( '.mainHeader nav.leftNav>ul:not(ul ul)' ).append( $( '.mainHeader nav.rightNav ul>li:not(li li)' ) );
			$( '.mainHeader nav.rightNav' ).remove();
			$( '.mainHeader .leftNav' ).removeAttr( 'style' );
			$( '.menuPort nav' ).removeClass( 'leftNav' );
			$( '.mainHeader .logo' ).removeAttr( 'style' );
		}

		/* Vertical menu setup */

		function init_menu() {
			if ( verticalMenuEnabled ) {
				if ( $( 'body' ).hasClass( 'btMenuVerticalLeftEnabled' )) $( 'body' ).addClass( 'btMenuVerticalLeft btMenuVertical' );
				if ( $( 'body' ).hasClass( 'btMenuVerticalRightEnabled' )) $( 'body' ).addClass( 'btMenuVerticalRight btMenuVertical' );
				move_menu_to_vertical();
			} else {
				$( 'body' ).removeClass( 'btMenuVerticalLeft btMenuVerticalRight btMenuVertical btMenuVerticalOn' );
				if ( $( 'body' ).hasClass( 'btMenuLeftEnabledCenter' )) $( 'body' ).addClass( 'btMenuLeft btMenuHorizontal btMenuCenter' );
				if ( $( 'body' ).hasClass( 'btMenuRightEnabled' )) $( 'body' ).addClass( 'btMenuRight btMenuHorizontal' );
				if ( $( 'body' ).hasClass( 'btMenuLeftEnabled' )) $( 'body' ).addClass( 'btMenuLeft btMenuHorizontal' );
				if ( $( 'body' ).hasClass( 'btMenuCenterEnabled' )) $( 'body' ).addClass( 'btMenuCenter btMenuHorizontal' );				
			}	
			boldthemes_activate_sticky();
		}

		function move_menu_to_vertical() {
			$( '.menuPort' ).prependTo( 'body' );
			$( '.mainHeader .logo' ).clone().prependTo( '.menuPort' );
			$( '.menuPort' ).prepend( '<div class="btCloseVertical"></div>');
			$( '.btCloseVertical' ).on( 'click', function() {
				$( 'body' ).toggleClass( 'btMenuVerticalOn' );
			});
			$( '.mainHeader .topBar' ).appendTo( '.menuPort' );
			$( 'body' ).removeClass( 'btStickyHeaderActive' );
			if ( ! belowMenu ) $( '.btContentWrap' ).css( 'padding-top', $( '.mainHeader' ).height() +'px');
			
			$( 'li.current-menu-ancestor, li.current_menu_item').each(function() {
				$( this ).find( '.subToggler' ).parent().addClass( 'on' );
			});

			// Vertical Menu Desktop Scroll

			if ( $( 'body' ).hasClass( 'btMenuVertical' ) && $( 'html' ).hasClass( 'no-touch' ) ) {

				$( '.no-touch .btMenuVertical .menuPort' ).wrapInner( '<div class="menuScrollPort"></div>' );
				
				if ( verticalMenuScroll === null ) {
					if ( $( '.no-touch .btMenuVertical .menuPort' ).length > 0 )
					{
						verticalMenuScroll = new IScroll( '.no-touch .btMenuVertical .menuPort', {
							scrollbars: true,
							mouseWheel: true,
							click: true,
							interactiveScrollbars: true,
							shrinkScrollbars: 'scale',
							fadeScrollbars: true
						});
					}
					
				}
			}
		}

		function reset_menu_to_original() {
			init_menu();
			$( '.menuPort .sub-menu' ).removeAttr( 'style' );
			$( '.menuPort .logo' ).remove();
			$( '.menuPort .btCloseVertical' ).remove();			
			$( '.menuPort' ).appendTo( '.menuHolder' );
			$( '.menuPort .topBar' ).prependTo( '.mainHeader' );
			$( 'body' ).removeClass( 'btStickyHeaderActive' );
			divide_menu();
			if ( ! belowMenu ) $( '.btContentWrap' ).css( 'padding-top', $( '.mainHeader' ).height() +'px');
			$('.menuPort .menuScrollPort').contents().unwrap();
			/*if ( typeof verticalMenuScroll !== 'undefined' && verticalMenuScroll !== null ) verticalMenuScroll.destroy();
			verticalMenuScroll = null;*/
			$( 'nav li').each(function() {
				$( this ).find( '.subToggler' ).parent().removeClass( 'on' );
			});
		}

		/* activate sticky */
		
		window.boldthemes_activate_sticky = function() {			
			var fromTop = $( window ).scrollTop();			
			if ( stickyEnabled ) {
				if ( fromTop > stickyOffset ) {
					$( 'body' ).addClass( 'btStickyHeaderActive' );
					if( swapHeaderStyle ) {
						$( '.mainHeader' ).removeClass( skinToSwap );
						$( '.btPageWrap .btAltLogo' ).hide( );
						$( '.btPageWrap .btMainLogo' ).show( );
					}
					setTimeout( function() { $( 'body' ).addClass( 'btStickyHeaderOpen' ) }, 100 );
				} else {
					$( 'body' ).removeClass( 'btStickyHeaderOpen btStickyHeaderActive' );
					if( swapHeaderStyle ) {
						$( '.mainHeader' ).addClass( skinToSwap );	
						if ( swapHeaderStyle )	{
							$( '.btPageWrap .btAltLogo' ).show( );	
							$( '.btPageWrap .btMainLogo' ).hide( );
						}
					}
				}
			}
		}

		/* Wide menu setup btMenuWideDropdown */

		var maxChildItems = 0;
		$( 'li.btMenuWideDropdown > ul > li > ul' ).each(function( index ) {
			if ( $( this ).children().length > maxChildItems ) {
				maxChildItems = $( this ).children().length;
			}
		});

		$( 'li.btMenuWideDropdown > ul > li > ul' ).each(function( index ) {
			if ( $( this ).children().length < maxChildItems ) {
				for ( var i = 0; i <= maxChildItems - $( this ).children().length; i++ ) {
					$( this ).append( '<li class="btEmptyElement"><a>&nbsp;</a></li>' );
				} 
			}
		});

		/* Show hide menu */

		$( '.btHorizontalMenuTrigger' ).on( 'click', function (){
			$( '.menuHolder' ).toggleClass( 'btShowMenu' );
			return false;
		});

		/* responsive menu toggler */

		$( '.btVerticalMenuTrigger' ).on('click', function() {
			$( 'body' ).toggleClass( 'btMenuVerticalOn' );
		});

		/* Top tools search */
		
		/*$('.btTopBox .btSearchInner').prependTo('body').addClass( 'btFromTopBox' );*/

		$( '.btSearch .btIco, .btSearchInnerClose' ).on( 'click', function (){
			$( 'body' ).toggleClass( 'btTopToolsSearchOpen' );
			return false;
		});

		/* Top bar toggler */

		$('.infoToggler').on( 'click', function(){
			$(this).toggleClass('on').next().slideToggle(250);
		});

		/* Vertical menu setup */
		
		init_menu();
		setTimeout( function() { $( '.menuPort' ).css( 'visibility', 'visible' ); }, 500 );

		/* Load enquire */

		// turn on responsive menu for all touch devices

		var responsiveResolution = '1023';
		
		if ( $( window ).width() > responsiveResolution ) {
			$( '.topBarInLogoAreaCell' ).show();
		}
		
		bt_enquire.register( 'screen and (max-width:' + responsiveResolution + 'px)', {
			match: function() {
				/* Force vertical menu */
				if ( ! verticalMenuEnabled ) {
					undivide_menu();
					$( 'body' ).addClass( 'btMenuVerticalLeft btMenuVertical' ).removeClass( 'btMenuLeft btMenuCenter btMenuRight btMenuHorizontal btMenuVerticalRight' );
					move_menu_to_vertical();
				}
			},
			unmatch: function () {
				if ( ! verticalMenuEnabled ) {
					reset_menu_to_original();
				}
			}
		})
		bt_enquire.register( 'screen and (max-width: 992px)', {
			match: function() {
				// Pack Header Info
				// $('.topBarInLogoArea').prepend('<span class="infoToggler"></span>');
				$('.topBarInLogoAreaCell').hide();

			},
			unmatch: function () {
				// Unpack Header Info
				// $('.infoToggler').off('click').remove();
				$('.topBarInLogoAreaCell').show();
			}
		})
		bt_enquire.register( 'screen and (max-width: 620px)', {
			match: function() {
				// Set avatar in mediabox
				$('.wPhoto .articleSideGutter').each(function(){
					$(this).parents('.boldCell').find('.btMediaBox').append(this);
				});
			},
			unmatch: function () {
				// Unset avatar from mediabox
				$('.wPhoto .articleSideGutter').each(function(){
					$(this).parents('.boldCell').find('.btArticleListBody').before(this);
				});
			}
		})
		
		/* menu split */
		if ( hasCentralMenu ) divide_menu();

		// move content bellow menu

		if ( ! belowMenu ) {
			$( '.btContentWrap' ).css( 'padding-top', $( '.mainHeader' ).height() + 'px' );
			$( window ).resize(function() {
				undivide_menu();
				divide_menu();
				$( '.btContentWrap' ).css( 'padding-top', $( '.mainHeader' ).height() + 'px' );
			});
			$( window ).scroll(function() {
				$( '.btContentWrap' ).css( 'padding-top', $( '.mainHeader' ).height() + 'px' );
			});			
		} else {
			if ( swapHeaderStyle ) {
				$( '.mainHeader' ).addClass( skinToSwap );
				$( '.btPageWrap .btAltLogo' ).show( );	
				$( '.btPageWrap .btMainLogo' ).hide( );
			}
		}
		
		/* responsive menu sub togglers */
		$( '.menuPort ul ul' ).parent().prepend( '<div class="subToggler"></div>');

		$( '.menuPort ul li' ).on( 'mouseover mouseout', function (e) {
			if ( $( 'body' ).hasClass( 'btMenuVertical' ) || $( 'html' ).hasClass( 'touch' ) ) {
				return false;
			}
			e.preventDefault();
			$( this ).siblings().removeClass( 'on' );
			$( this ).toggleClass( 'on' );
		});

		$( 'div.subToggler' ).on( 'click', function( e ) {
			var parent = $( this ).parent();
			parent.siblings().removeClass( 'on' );
			parent.toggleClass( 'on' );
			if ( $( 'body' ).hasClass( 'btMenuVertical' ) ) {
				parent.find( 'ul' ).first().slideToggle( 200 );
				setTimeout(function () {
					if ( verticalMenuScroll !== null ) {
						verticalMenuScroll.refresh();
					}
				}, 280 );
			}
		});
		
		bt_enquire.handle();
		
		$( window ).resize(function() {
			
			bt_enquire.handle();
			
		});		

	});
	
	$( window ).on( 'load', function() {	
		
		//boldthemes_activate_sticky(); 
		$( window ).scroll(function() {
			boldthemes_activate_sticky();
		});

	});

})( jQuery );