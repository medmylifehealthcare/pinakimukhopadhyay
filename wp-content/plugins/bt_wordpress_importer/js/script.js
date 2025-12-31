(function( $ ) {
	
	var data;
	
	$( document ).ready(function() {

		function GetURLParameter(sParam) {
			let sPageURL = window.location.search.substring(1);
			let sURLVariables = sPageURL.split('&');
			for (let i = 0; i < sURLVariables.length; i++) {
				let sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] == sParam) {
					return sParameterName[1];
				}
			}
			return 0;
		}

		$('#bt_attachment_type').on('change', function() {
			if(this.value == "external"){
				$( '#bt_import_disable_image_processing_container' ).hide();
			} else {
				$( '#bt_import_disable_image_processing_container' ).show();
			}
		});
			
		$( '.bt_import_xml' ).on( 'click', function() {
			
			window.bt_import_file = $( this ).data( 'file' );
			
			//var bt_import_step = localStorage.getItem( 'bt_import_step' ) ? parseInt( localStorage.getItem( 'bt_import_step' ) ) : 0;
			
			window.bt_import_step = 0;
			
			window.bt_import_step_attempt = 1;
			
			window.force_download = GetURLParameter('force_download');
			
			window.bt_import_reader_index = 0;
			
			window.bt_attachment_type = bt_attachment_type.value;
			window.bt_import_disable_image_processing = bt_disable_image_processing.checked;
				
			data = {
				'action': 'bt_import_ajax',
				'file': window.bt_import_file,
				'step': window.bt_import_step,
				'disable_image_processing': window.bt_import_disable_image_processing,
				'bt_attachment_type': window.bt_attachment_type,
				'reader_index': 0,
				'force_download': window.force_download,
				'_ajax_nonce': window.bt_import_ajax_nonce
			}
			
			$( '.bt_import_select_xml' ).hide();
			
			bt_disable_image_processing.disabled = true;
			// bt_attachment_type.disabled = true;
			$('#bt_attachment_type').prop('disabled', true);
			
			if ( ! window.bt_import_disable_image_processing ) {
				$( '#bt_import_disable_image_processing_container' ).hide();
			}
			
			$( '.bt_import_xml_container' ).hide();

			$( '.bt_import_progress' ).show();
			
			window.bt_import_ajax( data );
			
		});
		
		window.bt_import_ajax = function( data ) {
			$.ajax({
				type: 'POST',
				url: window.bt_import_ajax_url,
				data: data,
				async: true,
				success: function( response ) {
					response = $.trim( response );
					if ( response.endsWith( 'bt_import_end' ) ) {
						$( '.bt_import_report' ).html( '<b>Import finished!</b>' );
						$( '.bt_import_progress' ).hide();

						data = {
							'action': 'bt_get_external',
							'_ajax_nonce': window.bt_import_ajax_nonce
						}
									
						window.bt_get_external_ajax( data );

					} else if ( response.startsWith( '<p><strong>Error' ) ) {
						window.bt_import_step_attempt++;
						$( '.bt_import_report' ).html( $( '.bt_import_report' ).html() + response );
						$( '.bt_import_progress' ).hide();
						//window.bt_import_ajax( data );
					} else {
						try {
							var json = JSON.parse( response );
							$( '.bt_import_progress span' ).html( json.progress );
							window.bt_import_reader_index = json.reader_index;
							window.bt_import_step++;
							window.bt_import_step_attempt = 1;
							data = {
								'action': 'bt_import_ajax',
								'file': window.bt_import_file,
								'step': window.bt_import_step,
								'disable_image_processing': window.bt_import_disable_image_processing,
								'bt_attachment_type': window.bt_attachment_type,
								'reader_index': json.reader_index,
								'force_download': window.force_download,
								'_ajax_nonce': window.bt_import_ajax_nonce
							}
							window.bt_import_ajax( data );
						} catch( err ) {
							$( '.bt_import_report' ).html( $( '.bt_import_report' ).html() + err.message + ' ' + response );
							$( '.bt_import_progress' ).hide();
						}
					}
				},
				error: function( xhr, status, error ) {
					//console.log( status + ' ' + error );
					window.bt_import_step_attempt++;
					//$( '.bt_import_report' ).html( $( '.bt_import_report' ).html() + '<span style="color:red;">' + status + ' ' + error + '</span>' + '<br/>' );
                    if ( xhr.status == 404 || bt_import_step_attempt > 2 ) {
						window.bt_import_step++;
						window.bt_import_reader_index++;
						window.bt_import_step_attempt = 1;
            			data = {
            				'action': 'bt_import_ajax',
            				'file': window.bt_import_file,
            				'step': window.bt_import_step,
							'disable_image_processing': window.bt_import_disable_image_processing,
							'bt_attachment_type': window.bt_attachment_type,
            				'reader_index': window.bt_import_reader_index,
            				'force_download': window.force_download,
            				'_ajax_nonce': window.bt_import_ajax_nonce
            			}
                    }
					window.bt_import_ajax( data );
				}
			});
		}

		$( '#bt_download_external' ).on( 'click', function() {

			$("#ext_down").hide();
			$( '.bt_import_select_xml' ).hide();
			
			bt_disable_image_processing.disabled = true;
			// bt_attachment_type.disabled = true;
			$('#bt_attachment_type').prop('disabled', true);

			$( '.bt_import_xml_container' ).hide();
			$( '#bt_ext_progress' ).show();

			window.bt_download_external_step = 0;
			window.bt_external_step_attempt = 1;

			var current_file = window.bt_extfiles[bt_download_external_step].url;
			var current_id = window.bt_extfiles[bt_download_external_step].id;

			$( '#bt_ext_progress' ).append( "<div id='bt_exp_id_" + current_id + "'>" + current_file + " - <span class='status'><b>Downloading (" + (window.bt_download_external_step + 1) + "/" + window.bt_extfiles_count + ")...</b></span></div>");

			data = {
				'action': 'bt_download_external',
				'file': current_file,
				'att_id': current_id,
				'_ajax_nonce': window.bt_import_ajax_nonce
			}

						
			window.bt_external_ajax( data );
		});

		window.bt_external_ajax = function( data ) {
			$.ajax({
				type: 'POST',
				url: window.bt_import_ajax_url,
				data: data,
				async: true,
				success: function( response ) {
					response = $.trim( response );
					if ( response.endsWith( 'bt_import_end' ) ) {
						
						$( '#bt_ext_progress' ).find( '#bt_exp_id_' + data.att_id + ' .status').html('<b>Done</b>');
						window.bt_download_external_step = window.bt_download_external_step + 1;

						if (window.bt_download_external_step < window.bt_extfiles.length) {
							var current_file = window.bt_extfiles[bt_download_external_step].url;
							var current_id = window.bt_extfiles[bt_download_external_step].id;
							$( '#bt_ext_progress' ).append( "<div id='bt_exp_id_" + current_id + "'>" + current_file + " - <span class='status'><b>Downloading (" + (window.bt_download_external_step + 1) + "/" + window.bt_extfiles_count + ")...</b></span></div>");
							data = {
								'action': 'bt_download_external',
								'file': current_file,
								'att_id': current_id,
								'_ajax_nonce': window.bt_import_ajax_nonce
							}
							
							window.bt_external_step_attempt = 1;			
							window.bt_external_ajax( data );
						} else {
							$( '#bt_ext_progress' ).append( "<span class='status'><b>Download finished!</b></span></div>");
						}

					} else if ( response.startsWith( '<strong>Error' ) ) {
						$( '#bt_ext_progress' ).find( '#bt_exp_id_' + data.att_id + ' .status').html(response);
						window.bt_download_external_step = window.bt_download_external_step + 1;

						if (window.bt_download_external_step < window.bt_extfiles.length) {
							var current_file = window.bt_extfiles[bt_download_external_step].url;
							var current_id = window.bt_extfiles[bt_download_external_step].id;
							$( '#bt_ext_progress' ).append( "<div id='bt_exp_id_" + current_id + "'>" + current_file + " - <span class='status'><b>Downloading (" + (window.bt_download_external_step + 1) + "/" + window.bt_extfiles_count + ")...</b></span></div>");
							data = {
								'action': 'bt_download_external',
								'file': current_file,
								'att_id': current_id,
								'_ajax_nonce': window.bt_import_ajax_nonce
							}			
							window.bt_external_ajax( data );
						} else {
							$( '#bt_ext_progress' ).append( "<span class='status'><b>Download finished!</b></span></div>");
						}
					} 
				},
				error: function( xhr, status, error ) {
					console.log(window.bt_external_step_attempt);
					window.bt_external_step_attempt++;
                    if ( xhr.status == 404 || window.bt_external_step_attempt > 2 ) {
						
						$( '#bt_ext_progress' ).find( '#bt_exp_id_' + data.att_id + ' .status').html('<b>Failed - JavaScript error while contacting the server</b>');
						window.bt_download_external_step++;

						if (window.bt_download_external_step < window.bt_extfiles.length) {

							var current_file = window.bt_extfiles[bt_download_external_step].url;
							var current_id = window.bt_extfiles[bt_download_external_step].id;
							$( '#bt_ext_progress' ).append( "<div id='bt_exp_id_" + current_id + "'>" + current_file + " - <span class='status'><b>Downloading (" + (window.bt_download_external_step + 1) + "/" + window.bt_extfiles_count + ")...</b></span></div>");
							data = {
								'action': 'bt_download_external',
								'file': current_file,
								'att_id': current_id,
								'_ajax_nonce': window.bt_import_ajax_nonce
							}
							
							window.bt_external_step_attempt = 1;
							window.bt_external_ajax( data );
						} else {
							$( '#bt_ext_progress' ).append( "<span class='status'><b>Download finished!</b></span></div>");
						}
                    } else {
						window.bt_external_ajax( data );
					}
				}
			});
		}
		
		window.bt_get_external_ajax = function( data ) {
			$.ajax({
				type: 'POST',
				url: window.bt_import_ajax_url,
				data: data,
				async: true,
				success: function( response ) {
					response = $.trim( response );
					resobj = JSON.parse(response);
					window.bt_extfiles_count = resobj.count;
					window.bt_extfiles = resobj.files;
					
					if(window.bt_extfiles_count > 0){
						$("#bt_get_ext").show();
						console.log($("#ext_num"));
						$("#ext_num").text(window.bt_extfiles_count);
					}
				},
				error: function( xhr, status, error ) {
					console.log('error');
				}
			});
		}

		data = {
			'action': 'bt_get_external',
			'_ajax_nonce': window.bt_import_ajax_nonce
		}

					
		window.bt_get_external_ajax( data );

	});
	
})( jQuery );

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}