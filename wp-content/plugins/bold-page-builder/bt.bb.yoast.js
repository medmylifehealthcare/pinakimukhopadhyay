( function( $ ) {

	var BTBBYoastCompatibilityPlugin = function() {
        YoastSEO.app.registerPlugin('BTBBYoastCompatibilityPlugin', { status: 'loading'});
        this.getAndSetHTMLContent();
    };

    BTBBYoastCompatibilityPlugin.prototype.getAndSetHTMLContent = function() {	
	
		var _self = this;
		
		var data = {
			'action': 'bt_bb_get_html',
			'nonce': window.bt_bb_ajax.nonce,
			'post_id': post_ID.value,
			'content': content.value
		}
		
		$.ajax({
			method: 'POST',
			url: window.bt_bb_ajax_url,
			data: data,
		}).done( function( response ) {
			window.bt_bb_yoast_check_finished = true;
			_self.html_content = response;
		});

        YoastSEO.app.pluginReady( 'BTBBYoastCompatibilityPlugin' );

        YoastSEO.app.registerModification( 'content', $.proxy( _self.getCustomContent, _self ), 'BTBBYoastCompatibilityPlugin', 5 );

    };


    BTBBYoastCompatibilityPlugin.prototype.getCustomContent = function( content ) {
      // console.log( this.html_content );
	  return this.html_content !== undefined ? this.html_content : content;
    };

    $( window ).on( 'YoastSEO:ready', function () {
	  new BTBBYoastCompatibilityPlugin();
    });

	
})( jQuery );

