'use strict';

window.bt_bb = {};

window.bt_bb.cache = {};

window.bt_bb.min_width = 200; // min element horizontal width (backend responsive)
window.bt_bb.padding = 10; // element padding (value from css)
//window.bt_bb_drag_opacity = .3;

window.bt_bb_state = [];
window.bt_bb_state_pointer = -1;
window.bt_bb_state_current = null;

window.bt_bb_dirty = false;

(function( $ ) {

	var BTBBElement = BTReact.createClass({
		render: function() {
		
			// mapped params
			var class_name_children = '';
			var class_name_wrap = 'bt_bb_wrap';
			var class_name = 'bt_bb_item';
			
			var element_icon = '';
		
			if ( this.props.data.has_alert !== undefined ) {
				class_name = class_name + ' bt_bb_item_alert';
			}
			
			if ( this.props.data.extra_class !== undefined ) {
				class_name = class_name + ' ' + this.props.data.extra_class;
			}
			
			if ( this.props.data.attr !== undefined ) {
				var attr = JSON.parse( this.props.data.attr );
				if ( attr['bt_bb_toggled'] === 'true' ) {
					class_name = class_name + ' bt_bb_toggled';
				}
			}
			
			if ( window.bt_bb_map[ this.props.data.base ] !== undefined ) {
				if ( window.bt_bb_map[ this.props.data.base ].container !== undefined ) {
					if ( window.bt_bb_map[ this.props.data.base ].container == 'horizontal' ) {
						class_name_children = 'bt_bb_horizontal';
					}
				}
				
				if ( window.bt_bb_map[ this.props.data.base ].highlight !== undefined ) {
					if ( window.bt_bb_map[ this.props.data.base ].highlight === true ) {
						class_name = class_name + ' bt_bb_item_highlight';
					}
				}
				
				if ( window.bt_bb_map[ this.props.data.base ].icon !== undefined ) {
					class_name = class_name + ' ' + 'bt_bb_icon' + ' ' + window.bt_bb_map[ this.props.data.base ].icon;
				}
				
				if ( window.bt_bb_map[ this.props.data.base ].width_param !== undefined ) {
					if ( this.props.data.attr !== undefined ) {
						var attr = JSON.parse( this.props.data.attr );
						var w = attr[ window.bt_bb_map[ this.props.data.base ].width_param ];
						if ( w !== undefined ) {
							w = w.split( '/' );
							w = Math.round( 12 * w[0] / w[1] );
							class_name_wrap = class_name_wrap + ' ' + 'bt_bb_is_width bt_bb_width bt_bb_width' + w;
						}
					}
				}
			}

			var this_key = this.props.data.key;
			var this_base = this.props.data.base;
			var nodes = this.props.data.children.map(function( item, i ) {
				if ( item.key === undefined ) {
					item.key = 'bt_bb_' + bt_bb_get_key();
				}
				return (
					<BTBBElement key={item.key} data={item} p_key={this_key} p_base={this_base}></BTBBElement>
				);
			});

			this.props.data['p_key'] = this.props.p_key;
			this.props.data['p_base'] = this.props.p_base;
			
			if ( window.bt_bb_state_current ) {
				var el_obj = window.bt_bb_get_obj_by_id( window.bt_bb_state_current, this_key );
				var el_attr_obj = {};
				if ( el_obj.attr !== undefined ) {
					el_attr_obj = window.attr_to_obj( el_obj.attr );
				}
			}

			if ( this.props.data.base == '_content' ) {
				return (
					<div className={class_name_wrap}><div className={class_name} data-base={this.props.data.base}><div className="bt_bb_toolbar">]...[<BTBBToolbar has_params="true"></BTBBToolbar></div><div className="bt_bb_content" dangerouslySetInnerHTML={{__html: window.switchEditors.wpautop(this.props.data.content)}}></div></div></div>
				);
			} else {
				var has_params = window.bt_bb_map[ this.props.data.base ] !== undefined && window.bt_bb_map[ this.props.data.base ].params !== undefined && window.bt_bb_map[ this.props.data.base ].params.length > 0 ? 'true' : 'false';
				
				var extra_data = '';
				
				var extra_data_arr = [];
				
				if ( has_params == 'true' ) {
					var p = bt_bb_get_param( this.props.data.base, 'params' );
					
					var has_image_preview = false;
					var key_class = '';
					
					for ( var k = 0; k < p.length; k++ ) {
						if ( p[ k ].preview !== undefined || ( p[ k ].holder !== undefined && p[ k ].holder != '' ) ) { // preview
							var param_value = '';
							var param_name = p[ k ].param_name;
							if ( this.props.data.attr !== undefined ) {
								var attr = JSON.parse( this.props.data.attr );
							}
							if ( this.props.data.attr !== undefined && attr[ p[ k ].param_name ] !== undefined ) {
								param_value = attr[ p[ k ].param_name ];
							} else { // no attr
								if ( p[ k ].type == 'checkbox' || p[ k ].type == 'checkbox_group' || p[ k ].type == 'radio' ) {
									if ( p[ k ].default !== undefined ) {
										param_value = p[ k ].default;
									} else {
										param_value = '';
									}
								} else if ( typeof p[ k ].value == 'object' ) {
									if ( p[ k ].default !== undefined ) {
										param_value = p[ k ].default;
									} else {
										var keys = Object.keys( p[ k ].value );
										param_value = p[ k ].value[ keys[0] ];
									}
								} else if ( p[ k ].value !== undefined ) {
									param_value = p[ k ].value;
								}
							}

							if ( p[ k ].type == 'attach_image' && ! has_image_preview ) {
								
								var key_class = this.props.data.key;
								var image_id = param_value;

								var image_url = localStorage.getItem( 'bt_bb_cache_' + image_id );
								if ( image_url !== null ) {
									if ( window.bt_bb.cache[ image_id ] === undefined ) {
										window.bt_bb.cache[ image_id ] = {};
									}
									window.bt_bb.cache[ image_id ].url = image_url;
								}

								if ( image_id == '' ) {
									$( '.' + key_class + '>' + '.bt_bb_toolbar' ).css( 'background-image', '' );
								} else if ( window.bt_bb.cache[ image_id ] !== undefined ) {
									setTimeout( function() { $( '.' + key_class + '>' + '.bt_bb_toolbar' ).css( 'background-image', 'url(' + window.bt_bb.cache[ image_id ].url + ')' ); }, 100 );
								} else {
									$( window ).load(function() {
										wp.media.ajax( { data: { action: 'get-attachment', id: image_id } } ).done( function( resp, status, xhr ) {
											if ( resp.sizes !== undefined ) {
												var url = '';
												if ( resp.sizes.thumbnail !== undefined ) {
													url = resp.sizes.thumbnail.url;
												} else if ( resp.sizes.full !== undefined ) {
													if ( resp.sizes.full.width <= 300 && resp.sizes.full.height <= 300 ) {
														url = resp.sizes.full.url;
													}
												}
												if ( url != '' ) {
													$( '.' + key_class + '>' + '.bt_bb_toolbar' ).css( 'background-image', 'url(' + url + ')' );
													window.bt_bb.cache[ resp.id ] = {};
													window.bt_bb.cache[ resp.id ].url = url;
													localStorage.setItem( 'bt_bb_cache_' + resp.id, url );
												} else {
													localStorage.removeItem( 'bt_bb_cache_' + resp.id );
												}
											}
										});
									});
								}
								
								param_value = '';
								has_image_preview = true;
							}
							
							if ( p[ k ].type == 'iconpicker' ) {
								if ( typeof param_value == 'string' && param_value != '' ) {
									var icon = param_value;
									var icon_set = icon.slice( 0, -5 );
									var icon_code = icon.substr( -4 );
									param_value = '<span class="bt_bb_icon_preview bt_bb_icon_preview_' + icon_set + '" data-icon-code="&#x' + icon_code + '"></span>';
								} else {
									param_value = '';
								}
							} else if ( p[ k ].type == 'colorpicker' ) {
								param_value = '<span style="color:' + param_value + ';font-weight: bold;">' + param_value + '</span>';
							} else if ( p[ k ].type == 'textarea_object' ) {
								try {
									param_value = window.bt_bb_b64DecodeUnicode( param_value );
								} catch( e ) {
									
								}
							} else { // custom
								if ( window[ 'bt_bb_cf_' + p[ k ].type + '_param_value_preview' ] !== undefined ) {
									param_value = window[ 'bt_bb_cf_' + p[ k ].type + '_param_value_preview' ]( param_value );
								}
							}
							
							if ( typeof param_value == 'string' ) {
								if ( param_value.includes( '%$%' ) ) {
									param_value = param_value.split( '%$%' )[0];
								} else {
									param_value = param_value.split( ',;,' )[0];
								}
							}
							
							if ( p[ k ].preview_strong !== undefined ) {
								param_value = '<span class="bt_bb_preview_strong bt_bb_preview_param_' + param_name + '">' + param_value + '</span>';
							} else {
								if ( el_attr_obj ) {
									if ( ! el_attr_obj.hasOwnProperty( 'bb_version' ) && param_name == 'responsive' && param_value.includes( 'hidden_lg' ) ) {
										param_value += ' ' + 'hidden_xl';
									}
								}
								param_value = '<span class="bt_bb_preview_normal bt_bb_preview_param_' + param_name + '">' + param_value + '</span>';
							}

							extra_data = extra_data + bt_bb_special_char_decode( param_value );
							
						}
					}
				}
				
				var toggle = window.bt_bb_map[ this.props.data.base ] !== undefined && window.bt_bb_map[ this.props.data.base ].toggle == true > 0 ? 'true' : 'false';
				
				var name = this.props.data.base;
				if ( window.bt_bb_map[ this.props.data.base ] !== undefined 
					&& window.bt_bb_map[ this.props.data.base ].name !== undefined 
					&& window.bt_bb_settings.tag_as_name != '1' ) {
						name = window.bt_bb_map[ this.props.data.base ].name;
				}
				
				extra_data = '<span class="bt_bb_preview_name">' + name + '</span>' + extra_data;
				
				if ( has_image_preview ) {
					class_name = class_name + ' bt_bb_image_preview ' + key_class;
				}

				if ( window.bt_bb_map[ this.props.data.base ] !== undefined && window.bt_bb_map[ this.props.data.base ].container !== undefined ) { // container
					var container = window.bt_bb_map[ this.props.data.base ].container;
					return (
						<div className={class_name_wrap}><div className={class_name} data-base={this.props.data.base} data-container={container}><div className='bt_bb_toolbar'><span className="bt_bb_preview" dangerouslySetInnerHTML={{__html: extra_data}}></span><BTBBToolbar container={container} mapped="true" has_params={has_params} toggle={toggle}></BTBBToolbar></div><div className={class_name_children}>{nodes}</div></div></div>
					);
				} else {
					var m = window.bt_bb_map[ this.props.data.base ];
					var tb_class = 'bt_bb_toolbar';
					var mapped = 'true';
					if ( m == undefined || m.is_mapped === false ) { // not mapped
						mapped = 'false';
						window.bt_bb_map[ this.props.data.base ] = {};
						window.bt_bb_map[ this.props.data.base ].is_mapped = false;
						window.bt_bb_map[ this.props.data.base ].show_settings_on_create = false;
						window.bt_bb_map[ this.props.data.base ].base = this.props.data.base;
						window.bt_bb_map[ this.props.data.base ].description = this.props.data.base;
						window.bt_bb_map[ this.props.data.base ].name = this.props.data.base;
						window.bt_bb_map[ this.props.data.base ].params = [];
						tb_class = 'bt_bb_toolbar bt_bb_alert';
					}
					return (
						<div className={class_name_wrap}><div className={class_name} data-base={this.props.data.base}><div className={tb_class}>{extra_data != '' ? <span className="bt_bb_preview" dangerouslySetInnerHTML={{__html: extra_data}}></span> : ''}<BTBBToolbar has_params={has_params} toggle={toggle} mapped={mapped}></BTBBToolbar></div><div className={class_name_children}>{nodes}</div></div></div>
					);
				}
			}
		}
	});

	var BTBBElementList = BTReact.createClass({
		getInitialState: function() {
			return {data: this.props.data};
		},
		render: function() {
			var nodes = this.state.data.children.map(function( item, i ) {
				return (
					<BTBBElement key={item.key} data={item}></BTBBElement>
				);
			});
			return (
				<div className="bt_bb_item_list">
					{nodes}
				</div>
			);
		},
		componentDidMount: function() {
			this.getDOMNode().addEventListener( 'bt_bb_event', this.handle );
			window.bt_bb_state_current = this.state.data;
		},
		componentDidUpdate: function() {
			var order = 0;
			$( '.bt_bb_item_list > .bt_bb_wrap' ).each(function() { // top level elements
				order++;
				var title = $( this ).find( '.bt_bb_preview_name' ).first().data( 'title' );
				if ( title === undefined ) {
					title = $( this ).find( '.bt_bb_preview_name' ).first().html();
					$( this ).find( '.bt_bb_preview_name' ).first().data( 'title', title );
				}
				$( this ).find( '.bt_bb_preview_name' ).first().html( '<span class="bt_bb_order" title="' + window.bt_bb_text.preview + '"><span class="bt_bb_order_inner">' + order + '</span></span>' + title );
			});
		},
		componentWillUnmount: function() {
			this.getDOMNode().removeEventListener( 'bt_bb_event', this.handle );
		},
		handle: function( e ) {
			
			if ( window.bt_bb_alo[ window.bt_bb_action ] === undefined ) {
				window.bt_bb_alo[ window.bt_bb_action ] = 1;
			} else {
				window.bt_bb_alo[ window.bt_bb_action ]++;
			}
			
			window.bt_bb_callback_action = null;

			if ( window.bt_bb_action == 'move_up' ) {
				var ins_obj = bt_bb_get_obj_copy_by_id( this.state.data, window.bt_bb_from );
				bt_bb_insert_before( this.state.data, window.bt_bb_to, ins_obj );
				if ( ! window.bt_bb_ctrl ) {
					bt_bb_delete_obj( this.state.data, window.bt_bb_from );
				}
			} else if ( window.bt_bb_action == 'move_down' ) {
				var ins_obj = bt_bb_get_obj_copy_by_id( this.state.data, window.bt_bb_from );
				bt_bb_insert_after( this.state.data, window.bt_bb_to, ins_obj );
				if ( ! window.bt_bb_ctrl ) {
					bt_bb_delete_obj( this.state.data, window.bt_bb_from );
				}
			} else if ( window.bt_bb_action == 'move_inside' ) {
				if ( bt_bb_insert_inside( this.state.data, window.bt_bb_to, bt_bb_get_obj_copy_by_id( this.state.data, window.bt_bb_from ) ) ) {
					if ( ! window.bt_bb_ctrl ) {
						bt_bb_delete_obj( this.state.data, window.bt_bb_from );
					}
				}
			} else if ( window.bt_bb_action == 'delete' ) {
				bt_bb_delete_obj( this.state.data, window.bt_bb_from );
			} else if ( window.bt_bb_action == 'add_root' || window.bt_bb_action == 'add_root_from_dialog' ) {
				if ( window.bt_bb_action == 'add_root' ) {
					var ret = bt_bb_add_root( this.state.data );
					if ( ret !== undefined && window.bt_bb_map[ ret[1] ]['auto_add'] !== undefined ) {
						var add_element = {};
						add_element.title = window.bt_bb_map[ ret[1] ]['auto_add'];
						add_element.base = window.bt_bb_map[ ret[1] ]['auto_add'];
						add_element.key = bt_bb_get_key();
						add_element.children = [];
						bt_bb_insert_inside( this.state.data, ret[0], add_element );
					}
				} else {
					var ret = bt_bb_add_root( this.state.data, window.bt_bb_base );
				}
				if ( ret !== undefined && bt_bb_get_param( ret[1], 'show_settings_on_create' ) !== false ) {
					window.bt_bb_from = ret[0];
					window.bt_bb_callback_action = 'edit';
				}
			} else if ( window.bt_bb_action == 'add' || window.bt_bb_action == 'add_from_dialog' ) {
				if ( window.bt_bb_action == 'add' ) {
					var ret = bt_bb_add( this.state.data );				
				} else {
					var ret = bt_bb_add( this.state.data, window.bt_bb_base );
				}
				if ( ret !== undefined && bt_bb_get_param( ret[1], 'show_settings_on_create' ) !== false ) {
					window.bt_bb_from = ret[0];
					window.bt_bb_callback_action = 'edit';
				} else if ( ret !== undefined && bt_bb_get_param( ret[1], 'show_settings_on_create' ) !== true ) {
					var accept = bt_bb_get_param( ret[1], 'accept' );
					var key, count = 0;
					for ( key in accept ) {
						if ( accept.hasOwnProperty( key ) ) {
							count++;
						}
					}
					if ( accept !== undefined && accept._content === true && count == 1 ) {
						window.bt_bb_from = ret[0];
						window.bt_bb_base = ret[1];
						window.bt_bb_callback_action = 'add';
					}
				}				
			} else if ( window.bt_bb_action == 'add_horizontal' ) {
				if ( window.bt_bb_custom_elements || ! window.bt_bb_responsive_override_layout ) {
					bt_bb_add_horizontal_classic( this.state.data );
				} else {
					bt_bb_add_horizontal( this.state.data );
				}
			} else if ( window.bt_bb_action == 'edit' ) {
				bt_bb_edit( this.state.data, window.bt_bb_from );
			} else if ( window.bt_bb_action == 'clone' ) {
				bt_bb_clone( this.state.data, window.bt_bb_from );			
			} else if ( window.bt_bb_action == 'update_state' ) {
				this.replaceState({data: window.bt_bb_state_current}, window.bt_bb_state_callback );
			} else if ( window.bt_bb_action == 'copy' ) {
				bt_bb_copy( this.state.data, window.bt_bb_from );
				$( '.bt_bb_cb_items' ).addClass( 'bt_bb_cb_items_flash' ).delay( 500 ).queue(function( next ) {
					$( this ).removeClass( 'bt_bb_cb_items_flash' );
					next();
				});
			} else if ( window.bt_bb_action == 'copy_plus' ) {
				bt_bb_copy_plus( this.state.data, window.bt_bb_from );
				$( '.bt_bb_cb_items' ).addClass( 'bt_bb_cb_items_flash' ).delay( 500 ).queue(function( next ) {
					$( this ).removeClass( 'bt_bb_cb_items_flash' );
					next();
				});
			} else if ( window.bt_bb_action == 'paste' ) {
				bt_bb_paste( this.state.data, window.bt_bb_from );
			} else if ( window.bt_bb_action == 'paste_before' ) {
				bt_bb_paste( this.state.data, window.bt_bb_from, true );
			} else if ( window.bt_bb_action == 'toggle_on' ) {
				var obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
				var attr_obj = {};
				if ( obj.attr !== undefined ) {
					attr_obj = attr_to_obj( obj.attr );
				}
				attr_obj[ 'bt_bb_toggled' ] = 'true';
				obj.attr = JSON.stringify( attr_obj );
			} else if ( window.bt_bb_action == 'toggle_off' ) {
				var obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
				var attr_obj = {};
				if ( obj.attr !== undefined ) {
					attr_obj = attr_to_obj( obj.attr );
				}
				attr_obj[ 'bt_bb_toggled' ] = 'false';
				obj.attr = JSON.stringify( attr_obj );
			}
			
			if ( window.bt_bb_action != null && window.bt_bb_action != 'edit' && window.bt_bb_action != 'copy' && window.bt_bb_action != 'copy_plus' ) {
				bt_bb_resize_h( this.state.data );
				if ( window.bt_bb_action != 'update_state' ) {
					bt_bb_push_state( this.state.data );
					this.replaceState( {data: this.state.data}, window.bt_bb_state_callback );
				}
				if ( this.state.data.children.length >= 0 && window.bt_bb_action == 'update_wp_editor' ) {
					bt_bb_parse_data( this.state.data );
				}
				if ( window.bt_bb_action != 'refresh_on_ready' && window.bt_bb_action != 'update_wp_editor' ) {
					window.bt_bb_dirty = true;
				}
				bt_bb_item_mousedown();
				bt_bb_toolbar();
			}

		}
	});

	var BTBBToolbar = BTReact.createClass({
		render: function() {
			var add_text = window.bt_bb_text.add;
			if ( this.props.container == 'horizontal' ) {
				add_text = window.bt_bb_text.edit_layout;
			}
			return (
				<div className="bt_bb_toolbar_tools">
				{this.props.toggle == 'true' ? <i className="bt_bb_toggle" title={window.bt_bb_text.toggle}></i> : ''}
				{this.props.container == 'vertical' ? <i className="bt_bb_add" title={add_text}></i> : ''}
				{this.props.container == 'horizontal' ? <i className="bt_bb_add bt_bb_edit_layout" title={add_text}></i> : ''}
				{this.props.has_params == 'true' ? <i className="bt_bb_edit" title={window.bt_bb_text.edit}></i> : ''}<i className="bt_bb_clone" title={window.bt_bb_text.clone}></i>
				{this.props.mapped == 'true' ? <i className="bt_bb_copy" title={window.bt_bb_text.copy}></i> : ''}
				{this.props.mapped == 'true' ? <i className="bt_bb_copy_plus" title={window.bt_bb_text.copy_plus}></i> : ''}
				{this.props.mapped == 'true' ? <i className="bt_bb_paste" title={window.bt_bb_text.paste}></i> : ''}
				<i className="bt_bb_delete" title={window.bt_bb_text.delete}></i>
				</div>
			);
		}
	});

	// AUTO RESIZE HORIZONTAL ELEMENTS
	window.bt_bb_resize_h = function( obj ) {
		if ( window.bt_bb_custom_elements || ! window.bt_bb_responsive_override_layout ) {
			window.bt_bb_resize_h_helper_classic( obj );
		} else {
			window.bt_bb_resize_h_helper( obj );
		}
	}

	// GET OBJECT COPY
	window.bt_bb_get_obj_copy_by_id = function( obj, id ) {
		var ret = bt_bb_get_obj_by_id( obj, id );
		var copy = JSON.parse( JSON.stringify( ret ) );
		if ( copy != null ) {
			copy = bt_bb_set_new_keys( copy );
		}
		return copy;
	}

	// SET NEW KEYS
	window.bt_bb_set_new_keys = function( obj ) {
		obj.key = bt_bb_get_key();
		for ( var i = 0; i < obj.children.length; i++ ) {
			bt_bb_set_new_keys( obj.children[ i ] );
		}
		return obj;
	}

	// DELETE OBJECT
	window.bt_bb_delete_obj = function( obj, id, count ) {
		if ( obj.title != '_content' ) {
			for ( var i = 0; i < obj.children.length; i++ ) {
				if ( id.bt_ends_with( obj.children[ i ].key ) ) {
					if ( count !== undefined ) {
						obj.children.splice( i, count );
					} else {
						obj.children.splice( i, 1 );
					}
					break;
				}
				bt_bb_delete_obj( obj.children[ i ], id, count );
			}
		}
	}

	// INSERT BEFORE
	window.bt_bb_insert_before = function( obj, id, ins_obj ) {
		if ( obj.title != '_content' ) {
			for ( var i = 0; i < obj.children.length; i++ ) {
				if ( id.bt_ends_with( obj.children[ i ].key ) ) {
					obj.children.splice( i, 0, ins_obj );
					break;
				}
				bt_bb_insert_before( obj.children[ i ], id, ins_obj );
			}
		}
	}

	// INSERT AFTER
	window.bt_bb_insert_after = function( obj, id, ins_obj ) {
		if ( obj.title != '_content' ) {
			for ( var i = 0; i < obj.children.length; i++ ) {
				if ( id.bt_ends_with( obj.children[ i ].key ) ) {
					obj.children.splice( i + 1, 0, ins_obj );
					break;
				}
				bt_bb_insert_after( obj.children[ i ], id, ins_obj );
			}
		}
	}

	// INSERT INSIDE
	window.bt_bb_insert_inside = function( obj, id, ins_obj ) {
		if ( obj.title != '_content' ) {
			for ( var i = 0; i < obj.children.length; i++ ) {
				if ( id.bt_ends_with( obj.children[ i ].key ) ) {
					if ( obj.children[ i ].children !== undefined ) {
						obj.children[ i ].children.push( ins_obj );
						if ( window.bt_bb_action != 'paste' && window.bt_bb_action != 'paste_before' && window.bt_bb_action != 'move_inside' && window.bt_bb_map[ ins_obj.base ] !== undefined /* ! _content */ && window.bt_bb_map[ ins_obj.base ]['auto_add'] !== undefined ) {
							var add_element = {};
							add_element.title = window.bt_bb_map[ ins_obj.base ]['auto_add'];
							add_element.base = window.bt_bb_map[ ins_obj.base ]['auto_add'];
							add_element.key = bt_bb_get_key();
							add_element.children = [];
	
							var attr_obj = {};

							if ( window.bt_bb_map[ add_element.base ] !== undefined && window.bt_bb_map[ add_element.base ].params !== undefined ) {
								$.each( window.bt_bb_map[ add_element.base ].params, function( index, param ) {
									if ( param.hasOwnProperty( 'value' ) && typeof param.value == 'string' ) {
										attr_obj[ param.param_name ] = bt_bb_special_char_encode( param.value );
									} else if ( param.hasOwnProperty( 'value' ) && param.hasOwnProperty( 'default' ) ) {
										attr_obj[ param.param_name ] = param.default;
									}
								});
							}

							add_element.attr = JSON.stringify( attr_obj );

							ins_obj.children.push( add_element );
						}
						
						return true;
					}
				}
				var r = bt_bb_insert_inside( obj.children[ i ], id, ins_obj );
				if ( r === true ) {
					return true;
				}
			}
		}
	}

	// ADD TO ROOT
	window.bt_bb_add_root = function( obj, base ) {
		var root_elements = [];
		if ( base !== undefined ) {
			root_elements.push( base );
		} else {
			$.each( window.bt_bb_map, function( index, value ) {
				if ( value.root == true ) {
					root_elements.push( value.base );
				}
			});
		}
		if ( root_elements.length == 1 ) {
			var root_element = {};
			root_element.title = root_elements[0];
			root_element.base = root_elements[0];
			root_element.key = bt_bb_get_key();
			root_element.children = [];

			var attr_obj = {};

			if ( window.bt_bb_map[ root_element.base ] !== undefined && window.bt_bb_map[ root_element.base ].params !== undefined ) {
				$.each( window.bt_bb_map[ root_element.base ].params, function( index, param ) {
					if ( param.hasOwnProperty( 'value' ) && typeof param.value == 'string' ) {
						attr_obj[ param.param_name ] = bt_bb_special_char_encode( param.value );
					} else if ( param.hasOwnProperty( 'value' ) && param.hasOwnProperty( 'default' ) ) {
						attr_obj[ param.param_name ] = param.default;	
					}
				});
			}

			root_element.attr = JSON.stringify( attr_obj );

			obj.children.push( root_element ); 
			return [ root_element.key, root_element.base ];
		} else if ( root_elements.length > 1 ) {
			//window.bt_bb_state = obj;
			window.bt_bb_dialog.show( 'add_root' );
		}
	}

	// ADD
	window.bt_bb_add = function( obj, base ) {
		var add_elements = [];
		if ( base !== undefined ) {
			add_elements.push( base );
		} else {
			$.each( window.bt_bb_map, function( index, value ) {
				var accept_element;
				if ( window.bt_bb_map[ window.bt_bb_base ].accept !== undefined ) {
					accept_element = window.bt_bb_map[ window.bt_bb_base ].accept[ value.base ];
				}			
				if (
					( accept_element === true || ( window.bt_bb_map[ window.bt_bb_base ].accept_all === true && accept_element !== false )
					|| ( window.bt_bb_map[ value.base ].as_child !== undefined && window.bt_bb_map[ value.base ].as_child['only'].indexOf( window.bt_bb_base ) != -1 ) )
					&& ( window.bt_bb_map[ value.base ].as_child === undefined || ( window.bt_bb_map[ value.base ].as_child !== undefined && window.bt_bb_map[ value.base ].as_child['only'].indexOf( window.bt_bb_base ) != -1 ) )
				) {
					add_elements.push( value.base );
				}
			});
			if ( window.bt_bb_map[ window.bt_bb_base ].accept !== undefined && window.bt_bb_map[ window.bt_bb_base ].accept[ '_content' ] === true ) {
				add_elements = [];
				add_elements.push( '_content' );
			}			
		}
		if ( add_elements.length == 1 ) {
			var add_element = {};
			add_element.title = add_elements[0];
			add_element.base = add_elements[0];
			if ( add_element.base == '_content' ) {
				add_element.content = '';
			}
			add_element.key = bt_bb_get_key();
			add_element.children = [];

			var attr_obj = {};
			if ( window.bt_bb_map[ add_element.base ] !== undefined && window.bt_bb_map[ add_element.base ].params !== undefined ) {
				$.each( window.bt_bb_map[ add_element.base ].params, function( index, param ) {
					if ( param.hasOwnProperty( 'value' ) && typeof param.value == 'string' ) {
						if ( param.type == 'textarea_object' ) {
							attr_obj[ param.param_name ] = param.value;
						} else {
							attr_obj[ param.param_name ] = bt_bb_special_char_encode( param.value );
						}
					} else if ( param.hasOwnProperty( 'value' ) && param.hasOwnProperty( 'default' ) ) {
						attr_obj[ param.param_name ] = param.default;	
					}
				});
			}

			add_element.attr = JSON.stringify( attr_obj );

			bt_bb_insert_inside( obj, window.bt_bb_from, add_element );
			return [ add_element.key, add_element.base ];
		} else if ( add_elements.length > 1 ) {
			//window.bt_bb_state = obj;
			window.bt_bb_dialog.show( 'add' );
		}
	}

	// EDIT
	window.bt_bb_edit = function( obj, id ) {
		for ( var i = 0; i < obj.children.length; i++ ) {
			if ( id.bt_ends_with( obj.children[ i ].key ) ) {
				if ( obj.children[ i ].title == '_content' ) {
					window.bt_bb_content = obj.children[ i ].content;
					window.bt_bb_dialog.show( 'edit_content' );
				} else {
					window.bt_bb_dialog.show( 'edit' );
				}
				break;
			}
			bt_bb_edit( obj.children[ i ], id );
		}
	}

	// CLONE
	window.bt_bb_clone = function( obj, id ) {
		$( '.bt_bb_toolbar_tools' ).css( 'transition', 'all 0s' );
		for ( var i = 0; i < obj.children.length; i++ ) {
			if ( id.bt_ends_with( obj.children[ i ].key ) ) {
				if ( obj.title == '_root' // parent is root
				|| window.bt_bb_map[ obj.base ] === undefined // sc not mapped
				|| window.bt_bb_map[ obj.base ].container != 'horizontal' 
				|| ( window.bt_bb_map[ obj.base ].container == 'horizontal' && obj.children.length < 12 ) ) {
					var ins_obj = bt_bb_get_obj_copy_by_id( obj, id );
					obj.children.splice( i + 1, 0, ins_obj );			
				}
				break;
			}
			bt_bb_clone( obj.children[ i ], id );
		}
	}
	
	//// CLIPBOARD
	
	// INIT CB ITEMS
	window.bt_bb_init_number_items = function() {
		window.bt_bb_cb_items = localStorage.getItem( 'bt_bb_cb_items' );
		if ( window.bt_bb_cb_items === null ) window.bt_bb_cb_items = 0;
		$( '.bt_bb_cb_items' ).html( window.bt_bb_cb_items );
	}
	
	// CB ITEMS
	window.bt_bb_set_number_items = function( n ) {
		localStorage.setItem( 'bt_bb_cb_items', n );
		$( '.bt_bb_cb_items' ).html( n );
		window.bt_bb_cb_items = n;
	}
	
	// ELEMENT ALLOWED
	window.bt_bb_allowed = function( base, p_base ) {
		if ( p_base === undefined ) return false; // non-root elements in root not allowed
		var p_map = window.bt_bb_map[ p_base ];
		var allowed = false;
		if ( ( p_map.accept !== undefined && p_map.accept[ base ] === true ) ||
			( p_map.accept !== undefined && p_map.accept[ base ] === undefined && p_map.accept_all === true ) ||
			( p_map.accept === undefined && p_map.accept_all === true ) ) {
			allowed = true;
		}
		return allowed;
	}
	
	// IMPORT
	window.bt_bb_cb_import = function( cb ) {
		var import_json = decodeURIComponent( window.bt_bb_b64DecodeUnicode( cb ) );
		var import_json_obj = JSON.parse( import_json );
		for ( var i = 1; i <= import_json_obj.length; i++ ) {
			localStorage.setItem( 'bt_bb_cb_' + i, decodeURIComponent( window.bt_bb_b64DecodeUnicode( import_json_obj[ i - 1 ].bt_bb_cb ) ) );
			bt_bb_set_number_items( import_json_obj.length );
		}
	}
	
	// COPY
	window.bt_bb_copy = function( obj, id ) {
		if ( window.bt_bb_cb_items > 1 ) {
			for ( var i = 2; i <= window.bt_bb_cb_items; i++ ) {
				localStorage.removeItem( 'bt_bb_cb_' + i );
			}
		}		
		var obj = bt_bb_get_obj_by_id( obj, id );
		localStorage.setItem( 'bt_bb_cb_1', JSON.stringify( obj ) );
		bt_bb_set_number_items( 1 );
	}
	
	// COPY PLUS
	window.bt_bb_copy_plus = function( obj, id ) {
		var copy_obj = bt_bb_get_obj_by_id( obj, id );
		if ( window.bt_bb_cb_items == 0 ) {
			localStorage.setItem( 'bt_bb_cb_1', JSON.stringify( copy_obj ) );
			bt_bb_set_number_items( 1 );
		} else {
			var cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_1' ) );
			var allowed = false;
			
			if ( copy_obj.p_base !== undefined ) {
				allowed = bt_bb_allowed( cb_item.base, copy_obj.p_base );
			} else if ( window.bt_bb_map[ copy_obj.base ].root !== undefined && window.bt_bb_map[ cb_item.base ].root !== undefined ) {
				allowed = true;
			}
			
			if ( allowed ) {
				window.bt_bb_cb_items++;
				localStorage.setItem( 'bt_bb_cb_' + window.bt_bb_cb_items, JSON.stringify( copy_obj ) );
				bt_bb_set_number_items( window.bt_bb_cb_items );
			} else {
				alert( window.bt_bb_text.not_allowed );
			}
		}
	}
	
	// PASTE
	window.bt_bb_paste = function( obj, id, before ) {
		if ( window.bt_bb_cb_items > 0 ) {
			var target_obj = bt_bb_get_obj_by_id( obj, id );
			var cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_1' ) );
			if ( window.bt_bb_map[ target_obj.base ].root !== undefined && window.bt_bb_map[ cb_item.base ].root !== undefined ) { // root
				for ( var i = window.bt_bb_cb_items; i >= 1; i-- ) {
					cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_' + i ) );
					cb_item = bt_bb_set_new_keys( cb_item );
					if ( before ) { // before
						bt_bb_insert_before( obj, id, cb_item );
					} else { // after
						bt_bb_insert_after( obj, id, cb_item );
					}
				}
			} else if ( bt_bb_allowed( cb_item.base, target_obj.p_base ) ) { // before, after
				if ( before ) { // before
					for ( var i = 1; i <= window.bt_bb_cb_items; i++ ) {
						cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_' + i ) );
						cb_item = bt_bb_set_new_keys( cb_item );
						bt_bb_insert_before( obj, id, cb_item );
					}
				} else { // after
					for ( var i = window.bt_bb_cb_items; i >= 1; i-- ) {
						cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_' + i ) );
						cb_item = bt_bb_set_new_keys( cb_item );
						bt_bb_insert_after( obj, id, cb_item );
					}
				}
			} else if ( bt_bb_allowed( cb_item.base, target_obj.base ) ) { // inside
				for ( var i = 1; i <= window.bt_bb_cb_items; i++ ) {
					cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_' + i ) );
					cb_item = bt_bb_set_new_keys( cb_item );
					bt_bb_insert_inside( obj, id, cb_item );
				}
			} else {
				alert( window.bt_bb_text.not_allowed );
			}
		}
	}
	
	// PASTE MAIN TOOLBAR
	window.bt_bb_paste_main_toolbar = function() {
		var cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_1' ) );
		if ( window.bt_bb_map[ cb_item.base ].root !== undefined ) { // root
			for ( var i = 1; i <= window.bt_bb_cb_items; i++ ) {
				cb_item = JSON.parse( localStorage.getItem( 'bt_bb_cb_' + i ) );
				cb_item = bt_bb_set_new_keys( cb_item );
				window.bt_bb_state_current.children.push( cb_item );
			}
			bt_bb_event( 'refresh' );
		} else {
			alert( window.bt_bb_text.not_allowed );
		}
	}
	
	// REFRESH CB ITEMS
	window.bt_bb_refresh_cb_items = function() {
		var items = localStorage.getItem( 'bt_bb_cb_items' );
		window.bt_bb_set_number_items( items === null ? 0 : items );
	}

	// DIALOG
	window.bt_bb_dialog = {};
	window.bt_bb_dialog.show = function( type ) {
		
		$( '#bt_bb_front_end_preview' ).hide();
		
		window.bt_bb_dialog.is_showing = true;
		
		var content = '';
		
		// add to root
		if ( type == 'add_root' ) {
			var title = window.bt_bb_text.add_element;
			var items = [];
			$.each( window.bt_bb_map, function( index, value ) {
				if ( value.root == true ) {
					items.push( { 'base': value.base, 'name': value.name, 'description': value.description, 'icon': value.icon } );
				}
			});
			items.sort(function( a, b ) {
				return a.name.toLowerCase().localeCompare( b.name.toLowerCase() ); 
			});
			$.each( items, function( index, value ) {
				content += '<div class="bt_bb_dialog_item bt_bb_dialog_add_element' + value.icon !== undefined ? ' ' + value.icon : '' + '" data-base="' + value.base + '"><b>' + value.name + '</b><i>' + value.description + '</i></div>';
			});
			$( '#bt_bb_dialog .bt_bb_dialog_content' ).html( content );
			$( '.bt_bb_dialog_add_element' ).click(function( e ) {
				window.bt_bb_base = $( this ).data( 'base' );
				window.bt_bb_dialog.hide();
				bt_bb_event( 'add_root_from_dialog' );
			});
			
		// add
		} else if ( type == 'add' ) {
			var title = window.bt_bb_text.add_element;
			var items = [];
			$.each( window.bt_bb_map, function( index, value ) {
				var accept_element;
				if ( window.bt_bb_map[ window.bt_bb_base ].accept !== undefined ) {
					accept_element = window.bt_bb_map[ window.bt_bb_base ].accept[ value.base ];
				}
				if ( 
					( accept_element === true || ( window.bt_bb_map[ window.bt_bb_base ].accept_all === true && accept_element !== false )
					|| ( window.bt_bb_map[ value.base ].as_child !== undefined && window.bt_bb_map[ value.base ].as_child['only'].indexOf( window.bt_bb_base ) != -1 ) )
					&& ( window.bt_bb_map[ value.base ].as_child === undefined || ( window.bt_bb_map[ value.base ].as_child !== undefined && window.bt_bb_map[ value.base ].as_child['only'].indexOf( window.bt_bb_base ) != -1 ) )
				) {
					if ( window.bt_bb_map[ value.base ].is_mapped !== false ) {
						items.push( { 'base': value.base, 'name': value.name, 'description': value.description, 'icon': value.icon } );
					}
				}
			});
			items.sort(function( a, b ) {
				return a.name.toLowerCase().localeCompare( b.name.toLowerCase() ); 
			});
			
			// filter
			var filter = '';
			filter += '<div class="bt_bb_dialog_item bt_bb_add_filter_container">';
			filter += '<input type="text" class="bt_bb_filter" placeholder="' + window.bt_bb_text.filter + '">';
			filter += '</div>';
			
			$( '#bt_bb_dialog .bt_bb_dialog_header_tools' ).append( filter );
			
			var fragment = document.createDocumentFragment();
			
			var div, b, i, txt_node;
			
			$.each( items, function( index, value ) {
				div = bt_bb_create_dom_element( 'div',
				[
					[ 'class', 'bt_bb_dialog_item bt_bb_dialog_add_element' + ( value.icon !== undefined ? ' bt_bb_icon ' + value.icon : '' ) ], 
					[ 'data-base', value.base ]
				] );
				
				b = bt_bb_create_dom_element( 'b', [] );
				txt_node = document.createTextNode( value.name );
				b.appendChild( txt_node );
				div.appendChild( b );
				
				i = bt_bb_create_dom_element( 'i', [] );
				txt_node = document.createTextNode( value.description );
				i.appendChild( txt_node );
				div.appendChild( i );
				
				fragment.appendChild( div );
			});
			
			$( '#bt_bb_dialog .bt_bb_dialog_content' )[0].appendChild( fragment );
			
			$( '.bt_bb_dialog_add_element' ).click(function( e ) {
				window.bt_bb_base = $( this ).data( 'base' );
				window.bt_bb_dialog.hide();
				bt_bb_event( 'add_from_dialog' );
			});
			
			$( '.bt_bb_filter' ).keyup(function( e ) {
				var val = $( this ).val();
				$( '.bt_bb_dialog_item' ).not( '.bt_bb_add_filter_container' ).each(function() {
					var html = $( this ).html().replace( /(<([^>]+)>)/ig, '' );
					var patt = new RegExp( val, 'i' );
					if ( ! patt.test( html ) ) {
						$( this ).hide();
					} else {
						$( this ).show();
					}
				});
			});
			
		// add horizontal
		} else if ( type == 'add_horizontal' ) {
			
			var title = window.bt_bb_text.edit_layout;

			if ( window.bt_bb_custom_elements || ! window.bt_bb_responsive_override_layout ) {
				window.bt_bb_edit_layout_classic();
			} else {
				window.bt_bb_edit_layout();
			}

		// edit content
		} else if ( type == 'edit_content' ) {
			
			$( document ).trigger( 'bt_bb_edit_content' );
			
			var title = window.bt_bb_text.edit_content;
			$( '#bt_bb_dialog' ).addClass( 'bt_bb_dialog_tinymce_container' );
			$( '.bt_bb_dialog_tinymce' ).show();
			
			var parent_id = $( '[data-reactid="' + window.bt_bb_from + '"]' ).closest( '.bt_bb_item' ).parent().data( 'reactid' );
			var parent_obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, parent_id );
			var parent_attr_obj = {};
			if ( parent_obj.attr !== undefined ) {
				parent_attr_obj = attr_to_obj( parent_obj.attr );
			}
			
			$( '.bt_bb_dialog_button' ).unbind( 'click' );
			
			$( '.bt_bb_dialog_button' ).click(function() { // submit _content
			
				window.switchEditors.go( 'bt_bb_tinymce', 'tmce' );
				var obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
				obj.content = tinyMCE.get( 'bt_bb_tinymce' ).getContent();
				if ( obj.content.startsWith( '<p>[' ) && obj.content.endsWith( ']</p>' ) ) {
					obj.content = obj.content.substring( 3 );
					obj.content = obj.content.substring( 0, obj.content.length - 4 );
				}
				
				var ai_obj = {};
				ai_obj.keywords = $( '.bt_bb_ai_keywords' ).val();
				ai_obj.tone = $( '.bt_bb_ai_tone' ).val();
				ai_obj.language = $( '.bt_bb_ai_language' ).val();
				ai_obj.length = $( '.bt_bb_ai_length_container input' ).val();
				parent_attr_obj[ 'ai_prompt_helper' ] = window.bt_bb_b64EncodeUnicode( JSON.stringify( ai_obj ) );
				parent_obj.attr = JSON.stringify( parent_attr_obj );
				
				window.bt_bb_action = 'refresh';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
				window.bt_bb_dialog.hide();
				
			});
			
			$( '#bt_bb_dialog' ).css( 'visibility', 'visible' );
			$( '#bt_bb_dialog .mce-i-resize' ).show();
			
			var ai_prompt;
			if ( typeof parent_attr_obj[ 'ai_prompt_helper' ] !== 'undefined' ) {
				ai_prompt = window.bt_bb_dialog_param.ai_prompt( { 'attr_value': parent_attr_obj[ 'ai_prompt_helper' ] } );
			} else {
				ai_prompt = window.bt_bb_dialog_param.ai_prompt( {} );
			}
			$( '.bt_bb_dialog_content' ).append( ai_prompt );
			
		// edit
		} else if ( type == 'edit' ) {
			
			$( document ).trigger( 'bt_bb_edit_element' );
			
			var title = window.bt_bb_text.edit;
			var obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, window.bt_bb_from );
			var attr_obj = {};
			if ( obj.attr !== undefined ) {
				attr_obj = attr_to_obj( obj.attr );
			}
			if ( window.bt_bb_map[ obj.base ] !== undefined ) {
			
				title = title + ' ' + window.bt_bb_map[ obj.base ].name;
				
				$( '#bt_bb_dialog' ).removeClass();
				$( '#bt_bb_dialog' ).addClass( 'bt_bb_dialog' + ' ' + obj.base );
			
				var params = window.bt_bb_map[ obj.base ].params;

				if ( params !== undefined ) {
				
					var fragment = document.createDocumentFragment();
					
					var hidden = new Array();
					
					var group = '';
					var group_class = '';
					
					window.bt_bb.param_groups = [];
					
					for ( var i = 0; i < params.length; i++ ) {
						
						group = '';
						content = '';
						
						// attr_value
						var attr_value = '';
						if ( attr_obj[ params[ i ].param_name ] !== undefined ) {
							attr_value = attr_obj[ params[ i ].param_name ];
						} else {
							attr_obj[ params[ i ].param_name ] = '';
						}
						
						// groups / tabs
						if ( params[ i ].group !== undefined ) {
							group = params[ i ].group;
						} else if ( params[ i ].type != 'hidden' ) {
							group = window.bt_bb_text.general;
						}
						
						if ( group != '' ) {
							//group_class = ' bt_bb_group_' + group.replace( ' ', '_' ).replace( /^[^a-z]+|[^\w:.-]+/gi, '' );
							group_class = ' bt_bb_group_' + window.bt_bb_b64EncodeUnicode( group ).replace( /[=+\/]/g, '' );
							if ( window.bt_bb.param_groups.indexOf( group ) == -1 ) {
								window.bt_bb.param_groups.push( group );
							}
						}

						// attach_images / attach_image
						if ( params[ i ].type == 'attach_images' || params[ i ].type == 'attach_image' || params[ i ].type == 'textfield' || params[ i ].type == 'datetime-local' || params[ i ].type == 'textarea' || params[ i ].type == 'textarea_object' || params[ i ].type == 'dropdown' || params[ i ].type == 'dropdown_color' || params[ i ].type == 'dropdown_color' || params[ i ].type == 'iconpicker' || params[ i ].type == 'colorpicker' || params[ i ].type == 'link' || params[ i ].type == 'checkbox' || params[ i ].type == 'checkbox_group' || params[ i ].type == 'radio' || params[ i ].type == 'ai_prompt' ) {
							
							var div = window.bt_bb_get_dialog_param( { 'param': params[ i ], 'attr_value': attr_value, 'group_class': group_class, 'base': obj.base } );
							
						// hidden
						} else if ( params[ i ].type == 'hidden' ) {
							var hidden_obj = new Object();
							hidden_obj.name = params[ i ].param_name;
							hidden_obj.value = params[ i ].value;
							hidden.push( hidden_obj );
							
						// custom
						} else {
							if ( window[ 'bt_bb_cf_' + params[ i ].type + '_content' ] !== undefined ) {
								
								var div = bt_bb_create_dom_element( 'div', 
								[
									[ 'class', 'bt_bb_dialog_item' + group_class ], 
									[ 'data-param_name', params[ i ].param_name ],
									[ 'data-type', params[ i ].type ]
								] );
								
								var arg = {};
								arg.param_heading = params[ i ].heading;
								arg.param_value = params[ i ].value;
								arg.param_name = params[ i ].param_name;
								arg.val = attr_value;
								arg.base = obj.base;
								
								div.innerHTML = window[ 'bt_bb_cf_' + params[ i ].type + '_content' ]( arg );
							}
						}
						
						if ( params[ i ].type != 'hidden' ) {
							fragment.appendChild( div );
						}
					}
					
					$( '#bt_bb_dialog' ).data( 'hidden', JSON.stringify( hidden ) );
					
					$( '#bt_bb_dialog .bt_bb_dialog_content' )[0].appendChild( fragment );
					
					// colorpicker
					$( '.bt_bb_color_picker' ).wpColorPicker();
					
					window.bt_bb_search_link_init();
					
					window.bt_bb_iconpicker_init();
					
					// image(s)
					
					window.bt_bb_image_sortable( $( '#bt_bb_dialog .bt_bb_dialog_item[data-type="attach_images"] .bt_bb_dialog_image_container' ), attr_obj );
					
					$( '#bt_bb_dialog .bt_bb_dialog_image_container' ).on( 'click', '.fa-times', function( e ) {
						window.bt_bb_delete_images( this, attr_obj );
					});

					//$( '#bt_bb_dialog .bt_bb_dialog_image_container' ).disableSelection(); // deprecated
					
					// select image(s)
					$( '.bt_bb_dialog_item' ).on( 'click', '.bt_bb_dialog_select_images_button', function( e ) {
						window.bt_bb_select_images( this, attr_obj );
					});
				}
			}
			
			// groups / tabs
			
			if ( window.bt_bb.param_groups.length > 0 ) {
				$( '.bt_bb_dialog_item' ).hide();
			}
			
			$.each( window.bt_bb.param_groups, function( index, val ) {
				var class_name = 'bt_bb_group_tab';
				if ( index == 0 ) {
					class_name = 'bt_bb_group_tab bt_bb_group_tab_active';
					$( '.bt_bb_group_' + window.bt_bb_b64EncodeUnicode( val ).replace( /[=+\/]/g, '' ) ).show();
				}
				$( '.bt_bb_dialog_header_tools' ).append( '<span class="' + class_name + '">' + val + '</span>' );
			});
			
			$( '#bt_bb_dialog .bt_bb_group_tab' ).click(function( e ) {
				var group = $( this ).html();
				$( '.bt_bb_dialog_item' ).hide();
				//$( '.bt_bb_group_' + group.replace( ' ', '_' ).replace( /^[^a-z]+|[^\w:.-]+/gi, '' ) ).show();
				$( '.bt_bb_group_' + window.bt_bb_b64EncodeUnicode( group ).replace( /[=+\/]/g, '' ) ).show();
				$( '.bt_bb_group_tab' ).removeClass( 'bt_bb_group_tab_active' );
				$( this ).addClass( 'bt_bb_group_tab_active' );
				window.bt_bb_resize_dialog();
			});
			
			// submit
			
			$( '#bt_bb_dialog' ).append( '<input type="button" class="bt_bb_dialog_button bt_bb_edit button button-small" value="' + window.bt_bb_text.submit + '">' );
			
			$( '#bt_bb_dialog .bt_bb_dialog_button' ).click(function( e ) {
				
				$( '#bt_bb_dialog .bt_bb_dialog_item' ).each(function() {
					
					var param_name = $( this ).data( 'param_name' );
					var type = $( this ).data( 'type' );
					
					var val = window.bt_bb_get_edit_item_value( param_name, type, $( this ) );
					
					if ( typeof val != 'undefined' ) { // attach_image already handles attr_obj
						attr_obj[ param_name ] = val;
					}
				
				});
				
				var hidden = JSON.parse( $( '#bt_bb_dialog' ).data( 'hidden' ) );
				
				for ( var i = 0; i < hidden.length; i++ ) {
					attr_obj[ '' + hidden[ i ].name ] = hidden[ i ].value;
				}
				
				obj.attr = JSON.stringify( attr_obj );
				window.bt_bb_dialog.hide();
				window.bt_bb_action = 'refresh';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );				
			});
			
		} else if ( type == 'manage_cb' ) {
			title = window.bt_bb_text.manage_cb;
			
			content += '<div class="bt_bb_dialog_item">';
			content += '<input type="text" class="bt_bb_impex_input">';
			content += '</div>';			
			
			$( '#bt_bb_dialog .bt_bb_dialog_content' ).html( content );
			
			$( '#bt_bb_dialog' ).append( '<div class="bt_bb_dialog_inline_buttons"><input type="button" class="bt_bb_dialog_button bt_bb_edit button button-small bt_bb_button_export" value="' + window.bt_bb_text.export + '"><input type="button" class="bt_bb_dialog_button bt_bb_edit button button-small bt_bb_button_import" value="' + window.bt_bb_text.import + '"></div>' );
			
			$( '#bt_bb_dialog .bt_bb_button_export' ).click(function( e ) {
				if ( window.bt_bb_cb_items > 0 ) {
					var export_json = '[';
					for ( var i = 1; i <= window.bt_bb_cb_items; i++ ) {
						export_json += '{"bt_bb_cb":"' + window.bt_bb_b64EncodeUnicode( encodeURIComponent( localStorage.getItem( 'bt_bb_cb_' + i ) ) ) + '"},';
					}
					export_json = export_json.substring( 0, export_json.length - 1 );
					export_json += ']';
					$( '.bt_bb_impex_input' ).val( window.bt_bb_b64EncodeUnicode( encodeURIComponent( export_json ) ) );
					$( '.bt_bb_impex_input' ).select();
				}
			});			
			
			$( '#bt_bb_dialog .bt_bb_button_import' ).click(function( e ) {
				if ( $( '.bt_bb_impex_input' ).val() ) {
					bt_bb_cb_import( $( '.bt_bb_impex_input' ).val() );
				}
			});
			
		} else if ( type == 'sc_mapper' ) {
			title = window.bt_bb_text.sc_mapper;
			$( '#bt_bb_dialog' ).addClass( 'bt_bb_dialog_sc_mapper_container' );
			
			// filter
			var filter = '';
			filter += '<div class="bt_bb_dialog_item bt_bb_sc_mapper_filter_container">';
			filter += '<input type="text" class="bt_bb_filter" placeholder="' + window.bt_bb_text.filter + '">';
			filter += '</div>';

			$( '#bt_bb_dialog .bt_bb_dialog_header_tools' ).append( filter );
			
			// sc map heading
			var get_sc_map_heading = function( base ) {
				var heading = base;
				if ( window.bt_bb_map_primary[ base ] !== undefined ) {
					heading += ' ' + '/' + ' ' + 'p';
				}
				if ( window.bt_bb_map_secondary[ base ] !== undefined ) {
					heading += ' ' + '/' + ' ' + 's';
				}
				return heading;
			}
			
			var fragment = document.createDocumentFragment();
			
			var div = bt_bb_create_dom_element( 'div', [ [ 'id', 'bt_bb_sc_mapper_accordion' ] ] );

			for ( var i = 0; i < window.bt_bb.all_sc.length; i++ ) {

				if ( window.bt_bb_map[ window.bt_bb.all_sc[ i ] ] !== undefined && window.bt_bb_map[ window.bt_bb.all_sc[ i ] ].is_mapped !== false ) { // mapped
					var h3 = bt_bb_create_dom_element( 'h3', [ [ 'class', 'bt_bb_sc_mapper_item' ] ] );
					h3.innerHTML = '<i class="fa fa-chevron-down"></i><span>' + get_sc_map_heading( window.bt_bb.all_sc[ i ] ) + '</span>';
					var div1 = bt_bb_create_dom_element( 'div', [ [ 'data-base', window.bt_bb.all_sc[ i ] ] ] );
				} else { // not mapped
					var h3 = bt_bb_create_dom_element( 'h3', [ [ 'class', 'bt_bb_sc_mapper_item bt_bb_sc_mapper_unmapped' ] ] );
					h3.innerHTML = '<i class="fa fa-chevron-down"></i><span>' + window.bt_bb.all_sc[ i ] + '</span>';
					var div1 = bt_bb_create_dom_element( 'div', [ [ 'data-base', window.bt_bb.all_sc[ i ] ] ] );
				}
				div.appendChild( h3 );
				div.appendChild( div1 );
			}
			
			fragment.appendChild( div );
			
			$( '#bt_bb_dialog .bt_bb_dialog_content' )[0].appendChild( fragment );
			
			// filter
			$( '.bt_bb_filter' ).keyup(function( e ) {
				var val = $( this ).val();
				$( '#bt_bb_sc_mapper_accordion > div' ).removeClass( 'bt_bb_map_item_active' );
				$( '#bt_bb_sc_mapper_accordion > h3' ).removeClass( 'bt_bb_map_header_active' );
				$( '#bt_bb_sc_mapper_accordion > h3 > i' ).removeClass( 'fa-chevron-up' ).addClass( 'fa-chevron-down' );
				$( '.bt_bb_sc_mapper_item' ).each(function() {
					var html = $( this ).html().replace( /(<([^>]+)>)/ig, '' );
					var patt = new RegExp( val, 'i' );
					if ( ! patt.test( html ) ) {
						$( this ).hide();
					} else {
						$( this ).show();
					}
				});
			});
			
			// tab
			$( '.bt_bb_sc_map' ).keydown(function( e ) {
				if ( e.keyCode === 9 ) {
					e.preventDefault();
					var start = this.selectionStart;
					var end = this.selectionEnd;
					var $this = $( this );
					$this.val( $this.val().substring( 0, start ) + '\t' + $this.val().substring( end ) );
					this.selectionStart = this.selectionEnd = start + 1;
					$( this ).parent().find( '.bt_bb_save_mapping_button' ).prop( 'disabled', false );
				}
			});
			
			// accordion
			$( '#bt_bb_sc_mapper_accordion h3' ).click(function( e ) {
				var n = $( this ).next();
				if ( n.hasClass( 'bt_bb_map_item_active' ) ) {
					n[0].innerHTML = '';
					n.removeClass( 'bt_bb_map_item_active' );
					$( this ).removeClass( 'bt_bb_map_header_active' );
					$( this ).find( 'i' ).removeClass( 'fa-chevron-up' ).addClass( 'fa-chevron-down' );
				} else {
					var content = '<input type="button" class="button button-small bt_bb_insert_mapping_template_button" value="' + window.bt_bb_text.insert_mapping + '"><input type="button" class="button button-small bt_bb_delete_mapping_button" disabled value="' + window.bt_bb_text.delete + '"><input type="button" class="button button-small bt_bb_save_mapping_button" disabled value="' + window.bt_bb_text.save + '"><span class="spinner" style="display: none;"></span><textarea class="bt_bb_sc_map" rows="10"></textarea>';
					n[0].innerHTML = content;

					// textarea autosize
					autosize( $( '.bt_bb_sc_map' ) );
					
					n.addClass( 'bt_bb_map_item_active' );
					$( this ).addClass( 'bt_bb_map_header_active' );
					$( this ).find( 'i' ).removeClass( 'fa-chevron-down' ).addClass( 'fa-chevron-up' );
					var base = n.data( 'base' );
					if ( window.bt_bb_map_secondary[ base ] !== undefined ) {
						n.find( '.bt_bb_delete_mapping_button' ).prop( 'disabled', false );
						n.find( '.bt_bb_insert_existing_mapping_button' ).click();
						n.find( '.bt_bb_save_mapping_button' ).prop( 'disabled', true );
					}
				}
			});
			
			// textarea change
			$( '#bt_bb_sc_mapper_accordion' ).on( 'keydown', '.bt_bb_sc_map', function() {
				$( this ).parent().find( '.bt_bb_save_mapping_button' ).prop( 'disabled', false );
			});
			
			// insert mapping template
			$( '#bt_bb_sc_mapper_accordion' ).on( 'click', '.bt_bb_insert_mapping_template_button', function( e ) {
				var ta = $( this ).parent().find( 'textarea' );
				var base = $( this ).parent().data( 'base' );
				
				if ( window.bt_bb_map[ base ] !== undefined && window.bt_bb_map[ base ].is_mapped !== false ) { // has mapping
					var map_json = JSON.stringify( window.bt_bb_map[ base ], null, '\t' );
				} else if ( window.vc_mapper !== undefined && window.vc_mapper[ base ] !== undefined ) { // has VC mapping
					var vc_map = window.vc_mapper[ base ];
					map_json = {}
					map_json.name = vc_map.name !== undefined ? vc_map.name : '';
					map_json.base = vc_map.base !== undefined ? vc_map.base : '';
					map_json.description = vc_map.description !== undefined ? vc_map.description : '';
					map_json.show_settings_on_create = vc_map.show_settings_on_create !== undefined ? vc_map.show_settings_on_create : true;
					if ( vc_map.is_container === true ) {
						if ( vc_map.base == 'vc_row' ) {
							map_json.root = true;
							map_json.container = 'horizontal';
							map_json.accept = { 'vc_column': true };
							map_json.toggle = true;
						} else if ( vc_map.base == 'vc_row_inner' ) {
							map_json.container = 'horizontal';
							map_json.accept = { 'vc_column_inner': true };
						} else if ( vc_map.base == 'vc_column' ) {
							map_json.container = 'vertical';
							map_json.width_param = 'width';
							map_json.accept_all = true;
							map_json.accept = { 'vc_row': false, 'vc_column': false, 'vc_column_inner': false };
						} else if ( vc_map.base == 'vc_column_inner' ) {
							map_json.container = 'vertical';
							map_json.width_param = 'width';
							map_json.accept_all = true;
							map_json.accept = { 'vc_row': false, 'vc_column': false, 'vc_row_inner': false, 'vc_column_inner': false };							
						} else {
							map_json.container = 'vertical';
						}
					}
					map_json.params = [];
					var vc_map_type = '';
					var k = 0;
					for ( var i = 0; i < vc_map.params.length; i++ ) {
						if ( vc_map.params[ i ].type != 'textarea_html' && vc_map.params[ i ].admin_label !== false ) {
							map_json.params[ k ] = {};
							map_json.params[ k ].type = 'textfield';
							vc_map_type = vc_map.params[ i ].type;
							if ( vc_map_type == 'textarea' || vc_map_type == 'dropdown' || vc_map_type == 'attach_image' || vc_map_type == 'attach_images' || vc_map_type == 'colorpicker' || vc_map_type == 'checkbox' || vc_map_type == 'checkbox_group' || vc_map_type == 'hidden' ) {
								map_json.params[ k ].type = vc_map_type;
							}
							map_json.params[ k ].heading = vc_map.params[ i ].heading !== undefined ? vc_map.params[ i ].heading : '';
							if ( vc_map.params[ i ].description !== undefined ) map_json.params[ k ].heading += ' ' + '(' + vc_map.params[ i ].description + ')';
							map_json.params[ k ].param_name = vc_map.params[ i ].param_name !== undefined ? vc_map.params[ i ].param_name : '';
							map_json.params[ k ].value = vc_map.params[ i ].value !== undefined ? vc_map.params[ i ].value : '';
							if ( vc_map.params[ i ].holder !== undefined ) map_json.params[ k ].preview = true;
							k++;
						} else if ( vc_map.params[ i ].type == 'textarea_html' ) {
							map_json.container = 'vertical';
							map_json.accept = { '_content': true };
						}
					}
					
					map_json = JSON.stringify( map_json, null, '\t' );
				} else { // no mapping
					var map_json = {};
					map_json.name = base;
					map_json.base = base;
					map_json.description = '';
					map_json.show_settings_on_create = true;
					map_json.params = [];
					map_json.params[0] = {};
					map_json.params[0].type = 'textfield';
					map_json.params[0].heading = 'Param 1';
					map_json.params[0].param_name = 'param_1';
					map_json.params[0].value = '';
					map_json.params[0].preview = true;
					map_json.params[1] = {};
					map_json.params[1].type = 'dropdown';
					map_json.params[1].heading = 'Param 2';
					map_json.params[1].param_name = 'param_2';
					map_json.params[1].value = {'Option 1':'value 1', 'Option 2':'value 2'};
					map_json.params[1].preview = true;					
					map_json = JSON.stringify( map_json, null, '\t' );
				}
				
				ta.val( map_json );
				var evt = document.createEvent( 'Event' );
				evt.initEvent( 'autosize:update', true, false );
				ta[0].dispatchEvent( evt );
				$( this ).parent().find( '.bt_bb_save_mapping_button' ).prop( 'disabled', false );
			});

			// save mapping
			$( '#bt_bb_sc_mapper_accordion' ).on( 'click', '.bt_bb_save_mapping_button', function( e ) {
				var base = $( this ).parent().data( 'base' );
				var this_button = $( this );
				
				try {
					var map_obj = JSON.parse( $( this ).parent().find( '.bt_bb_sc_map' ).val() );
				} catch( e ) {
					alert( e );
					return false;
				}

				var map = JSON.stringify( map_obj );

				this_button.siblings( '.spinner' ).show();
				this_button.siblings( '.spinner' ).css( 'visibility', 'visible' );
				var data = {
					'action': 'bt_bb_save_mapping',
					'base': base,
					'map': map
				};
				$.ajax({
					type: 'POST',
					url: window.bt_bb_ajax_url,
					data: data,
					async: true,
					success: function( response ) {
						if ( response == 'ok' ) {
							this_button.prop( 'disabled', true );
							this_button.siblings( '.spinner' ).hide();
							this_button.closest( 'div' ).prev( '.bt_bb_sc_mapper_item' ).removeClass( 'bt_bb_sc_mapper_unmapped' );
							window.bt_bb_map[ base ] = JSON.parse( map );
							if ( window.bt_bb_map_secondary[ base ] === undefined ) {
								window.bt_bb_map_secondary[ base ] = true;
							}
							this_button.closest( 'div' ).prev( '.bt_bb_sc_mapper_item' ).find( 'span' ).html( get_sc_map_heading( base ) );
							if ( window.bt_bb_map_secondary[ base ] !== undefined ) {
								this_button.parent( 'div' ).find( '.bt_bb_delete_mapping_button' ).prop( 'disabled', false );
							}
							window.bt_bb_action = 'refresh';
							bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
						}
					}
				});
			});

			// delete secondary mapping
			$( '#bt_bb_sc_mapper_accordion' ).on( 'click', '.bt_bb_delete_mapping_button', function( e ) {
				var base = $( this ).parent().data( 'base' );
				var this_button = $( this );
				this_button.siblings( '.spinner' ).show();
				this_button.siblings( '.spinner' ).css( 'visibility', 'visible' );
				var data = {
					'action': 'bt_bb_delete_mapping',
					'base': base
				};
				$.ajax({
					type: 'POST',
					url: window.bt_bb_ajax_url,
					data: data,
					async: true,
					success: function( response ) {
						if ( response == 'ok' ) {
							this_button.prop( 'disabled', true );
							this_button.siblings( '.spinner' ).hide();
							
							if ( window.bt_bb_map_secondary[ base ] !== undefined ) {
								delete window.bt_bb_map_secondary[ base ];
							}							
							this_button.parent().find( 'textarea' ).val( '' );
							
							if ( window.bt_bb_map_primary[ base ] === undefined ) {
								this_button.closest( 'div' ).prev( '.bt_bb_sc_mapper_item' ).addClass( 'bt_bb_sc_mapper_unmapped' );
								delete window.bt_bb_map[ base ];
								window.bt_bb_action = 'refresh';
								bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );								
							} else {
								window.bt_bb_map[ base ] = window.bt_bb_map_primary[ base ];
							}

							this_button.closest( 'div' ).prev( '.bt_bb_sc_mapper_item' ).find( 'span' ).html( get_sc_map_heading( base ) );

						}
					}
				});
			});

		} else if ( type == 'custom_css' ) {

			title = window.bt_bb_text.custom_css;

			content += '<div class="bt_bb_dialog_item">';
			content += '<textarea id="bt_bb_custom_css_content" class="bt_bb_custom_css_content" rows="10">' + window.bt_bb_b64DecodeUnicode( window.bt_bb_custom_css ) + '</textarea>';
			content += '</div>';

			$( '#bt_bb_dialog .bt_bb_dialog_content' ).html( content );

			$( '#bt_bb_dialog' ).append( '<div class="bt_bb_dialog_inline_buttons"><input type="button" class="bt_bb_dialog_button button button-small bt_bb_button_save_custom_css" value="' + window.bt_bb_text.save + '"></div>' );
			
			if ( wp.codeEditor !== undefined ) {
				window.bt_bb_ce = wp.codeEditor.initialize( 'bt_bb_custom_css_content' );
			} else {
				$( '#bt_bb_dialog' ).on( 'keydown', '.bt_bb_custom_css_content', function( e ) {
					if ( e.keyCode === 9 ) {
						e.preventDefault();
						var start = this.selectionStart;
						var end = this.selectionEnd;
						var $this = $( this );
						$this.val( $this.val().substring( 0, start ) + '\t' + $this.val().substring( end ) );
						this.selectionStart = this.selectionEnd = start + 1;
					}
				});
			}
			
		} else if ( type == 'custom' ) {
			title = window.bt_bb_custom_dialog.title;
		}
		
		$( '#bt_bb_dialog .bt_bb_dialog_header span' ).html( title );
		
		$( '.bt_bb_dialog_item input[type="text"]' ).keypress(function( e ) {
			if ( e.which == 13 ) {
				e.preventDefault();
			}
		});

		if ( type == 'edit_content' ) {
			$( '.bt_bb_dialog_tinymce' ).css( 'height', 'auto' );
			
			window.switchEditors.go( 'bt_bb_tinymce', 'tmce' );
			tinyMCE.get( 'bt_bb_tinymce' ).setContent( window.switchEditors.wpautop( window.bt_bb_content ) );
			//tinyMCE.get( 'bt_bb_tinymce' ).setContent( window.bt_bb_content.replace( /\n/ig, '<br>' ) );
			
			/*var mce_interval = function() {
				if ( tinyMCE.get( 'bt_bb_tinymce' ) != null ) {
					switchEditors.go( 'bt_bb_tinymce', 'tmce' );
					tinyMCE.get( 'bt_bb_tinymce' ).setContent( window.bt_bb_content );
					clearInterval( mce_interval_id );
				}
			}
			var mce_interval_id = setInterval( mce_interval, 50 );*/
		} else {
			$( '#bt_bb_dialog' ).css( 'visibility', 'visible' );
			$( '#bt_bb_dialog .mce-i-resize' ).show();
		}
		
		if ( type == 'add' || type == 'sc_mapper' ) {
			$( '.bt_bb_filter' ).focus();
		}
		
		window.bt_bb_resize_dialog();

	};

	window.bt_bb_dialog.hide = function( type ) {
		
		window.bt_bb_dialog.is_showing = false;
		window.bt_bb_dialog.is_mouseover = false;
		
		$( '.wp-picker-open' ).click();
		$( '.bt_bb_dialog_tinymce' ).hide();
		$( '#bt_bb_dialog' ).data( 'hidden', '' );
		$( '#bt_bb_dialog' ).removeClass( 'bt_bb_dialog_tinymce_container' );
		$( '#bt_bb_dialog' ).removeClass( 'bt_bb_dialog_sc_mapper_container' );
		$( '#bt_bb_dialog' ).removeClass( 'bt_bb_dialog_add_horizontal' );
		$( '#bt_bb_dialog' ).removeClass( 'bt_bb_dialog_custom_css' );
		var content_node = $( '#bt_bb_dialog .bt_bb_dialog_content' )[0];
		while ( content_node.firstChild ) {
			content_node.removeChild( content_node.firstChild );
		}
		$( '#bt_bb_dialog .bt_bb_dialog_header' )[0].innerHTML = '<div class="bt_bb_dialog_close"></div><span></span>';
		$( '#bt_bb_dialog .bt_bb_dialog_header_tools' )[0].innerHTML = '';
		$( '#bt_bb_dialog > input' ).remove();
		$( '#bt_bb_dialog > .bt_bb_dialog_inline_buttons' ).remove();
		$( '#bt_bb_dialog' ).css( 'visibility', 'hidden' );
	};

	$( document ).ready(function() {
		$( '#bt_bb_dialog' ).on( 'click', '.bt_bb_dialog_close', function( e ) {
			window.bt_bb_dialog.hide();
		});
	});

	// GET OBJECT BY ID
	window.bt_bb_get_obj_by_id = function( obj, id ) {
		var ret = null;
		for ( var i = 0; i < obj.children.length; i++ ) {
			if ( id.bt_ends_with( obj.children[ i ].key ) ) {
				ret = obj.children[ i ];
				break;
			}
			ret = bt_bb_get_obj_by_id( obj.children[ i ], id );
			if ( ret != null ) break;
		}
		return ret;
	}
	
	// GET PARAM
	window.bt_bb_get_param = function( base, param ) {
		if ( window.bt_bb_map[ base ] !== undefined ) {
			return window.bt_bb_map[ base ][ param ];
		}
		return undefined;
	}
	
	// STATE CB
	window.bt_bb_state_callback = function() {	
		bt_bb_horizontal_responsive();
		if ( window.bt_bb_callback_action !== null ) {
			bt_bb_event( window.bt_bb_callback_action );
		}
	}

	// HORIZONTAL RESPONSIVE
	window.bt_bb_horizontal_responsive = function() {
		$( '.bt_bb_horizontal' ).each(function() {
			var container_width = $( this ).width();
			var vertical = false;
			$( this ).find( '.bt_bb_is_width' ).each(function() {
				var obj = bt_bb_get_obj_by_id( window.bt_bb_state_current, $( this ).data( 'reactid' ) );
				var w_param = window.bt_bb_map[ obj.base ].width_param;
				var attr_obj = attr_to_obj( obj.attr );
				var w = attr_obj[ w_param ];
				w = w.split( '/' );
				w = 12 * w[0] / w[1];
				
				var this_min_width = container_width * w / 12;
				
				if ( this_min_width < window.bt_bb.min_width ) {
					vertical = true;
					return false;
				}
			});
			if ( vertical ) {
				$( this ).find( '.bt_bb_is_width' ).removeClass( 'bt_bb_width' );
				$( this ).css( 'display', 'block' );
			} else {
				$( this ).find( '.bt_bb_is_width' ).addClass( 'bt_bb_width' );
				$( this ).css( 'display', 'table' );
			}
		});
	}
	
	// RESIZE
	$( window ).resize(function() {
		bt_bb_horizontal_responsive();
	});
	
	// PUSH STATE
	window.bt_bb_push_state = function( state_data ) {
		window.bt_bb_state_current = state_data;
		window.bt_bb_state.splice( window.bt_bb_state_pointer + 1 );
		window.bt_bb_state.push( JSON.stringify( state_data ) );
		window.bt_bb_state_pointer = window.bt_bb_state.length - 1;
	}
	
	// UNDO
	window.bt_bb_undo = function() {
		window.bt_bb_dialog.hide();
		window.bt_bb_state_pointer--;
		if ( window.bt_bb_state_pointer > -1 ) {
			window.bt_bb_state_current = JSON.parse( window.bt_bb_state[ window.bt_bb_state_pointer ] );
			window.bt_bb_action = 'update_state';
			bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
		} else {
			window.bt_bb_state_pointer++;
		}
	}
	
	// REDO
	window.bt_bb_redo = function() {
		window.bt_bb_dialog.hide();
		window.bt_bb_state_pointer++;
		if ( window.bt_bb_state_pointer <= window.bt_bb_state.length - 1 ) {
			window.bt_bb_state_current = JSON.parse( window.bt_bb_state[ window.bt_bb_state_pointer ] );
			window.bt_bb_action = 'update_state';
			bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
		} else {
			window.bt_bb_state_pointer--;
		}
	}
	
	//

	String.prototype.bt_ends_with = function( suffix ) {
		return this.indexOf( suffix, this.length - suffix.length ) !== -1;
	};
	
	window.bt_bb_dispatch = function ( target_selector, ev_name ) {
		try {
			var ev = new Event( ev_name );
		} catch( e ) {
			var ev = document.createEvent( 'Event' );
			ev.initEvent( ev_name, false, false );
		}
		$( target_selector )[0].dispatchEvent( ev );
	}
	 
	$( document ).ready(function() {
		if ( $( '#bt_bb' ).length > 0 ) {
			window.bt_bb_element_list = BTReact.render(<BTBBElementList data={window.bt_bb_data} />, $( '#bt_bb' )[0], function(){ 
				bt_bb_horizontal_responsive();
				bt_bb_resize_h( window.bt_bb_data );
				window.bt_bb_action = 'refresh_on_ready';
				bt_bb_dispatch( '.bt_bb_item_list', 'bt_bb_event' );
			});
			/*if ( tinyMCE.editors.bt_bb_tinymce === undefined ) {
				tinyMCE.init( tinyMCEPreInit.mceInit.bt_bb_tinymce );
			}*/
		}
		
		// widgets & menus iconpicker
		if ( $( 'body' ).hasClass( 'widgets-php' ) || $( 'body' ).hasClass( 'wp-customizer' ) || $( 'body' ).hasClass( 'nav-menus-php' ) ) {
			
			// widgets (old widget editor)
			$( '.bt_bb_iconpicker_widget_placeholder' ).each(function() {
				$( this ).replaceWith( window.bt_bb_iconpicker( false, $( this ).data( 'icon' ) ) );
			});
			
			// menus - bt_menu_admin.php (shoperific plugin)
			if ( $( 'body' ).hasClass( 'nav-menus-php' ) ) {
				setInterval(function() {
					$( '#menu-to-edit .bt_bb_iconpicker_widget_placeholder' ).each(function() {
						$( this ).replaceWith( window.bt_bb_iconpicker( false, $( this ).data( 'icon' ) ) );
					});
				}, 100 );				
			}
			
			// customizer
			if ( $( 'body' ).hasClass( 'wp-customizer' ) ) {
				// widgets
				const targetNodes = document.getElementsByClassName( 'customize-control-widget_form' );
				const config = { attributes: true };
				// Callback function to execute when mutations are observed
				const callback = function( mutationsList, observer ) {
					// Use traditional 'for loops' for IE 11
					for ( const mutation of mutationsList ) {
						if ( mutation.type === 'attributes' && mutation.attributeName === 'class' ) {
							if ( mutation.target.className.includes( 'expanded' ) ) {
								$( '.bt_bb_iconpicker_widget_placeholder' ).each(function() {
									$( this ).replaceWith( window.bt_bb_iconpicker( false, $( this ).data( 'icon' ) ) );
								});
							}
						}
					}
				};
				const observer = [];
				for ( var i = 0; i < targetNodes.length; i++ ) {
					observer[ i ] = new MutationObserver( callback );
					observer[ i ].observe( targetNodes[ i ], config );
				}
				
				// widget block editor & iconpicker control
				setInterval(function() {
					$( '.customize-widgets__sidebar-section .bt_bb_iconpicker_widget_placeholder, .customize-control .bt_bb_iconpicker_widget_placeholder' ).each(function() {
						$( this ).replaceWith( window.bt_bb_iconpicker( false, $( this ).data( 'icon' ) ) );
					});
				}, 100 );
			}
			
			window.bt_bb_iconpicker_init( 'widgets' );
			
			// save (old widget editor)
			$( document ).ajaxSuccess(function( e, xhr, settings ) {
				if ( settings.data.includes( 'bt_bb_iconpicker' ) ) {
					$( '.bt_bb_iconpicker_widget_placeholder' ).each(function() {
						$( this ).replaceWith( window.bt_bb_iconpicker( false, $( this ).data( 'icon' ) ) );
					});
				}
			});
			
			// widget block editor
			const targetNode = document.getElementById( 'widgets-editor' );
			if ( targetNode ) {
				const config1 = { attributes: true, childList: true, subtree: true };
				// Callback function to execute when mutations are observed
				const callback1 = function( mutationsList, observer ) {
					// Use traditional 'for loops' for IE 11
					for ( const mutation of mutationsList ) {
						if ( mutation.type == 'childList' ) {
							$( '.bt_bb_iconpicker_widget_placeholder' ).each(function() {
								$( this ).replaceWith( window.bt_bb_iconpicker( false, $( this ).data( 'icon' ) ) );
							});
						}
					}
				};
				const observer1 = new MutationObserver( callback1 );
				observer1.observe( targetNode, config1 );
			}

		}

		// iconpicker widget toggle list
		/*$( 'body' ).on( 'click', '.bt_bb_iconpicker_widget_container .bt_bb_iconpicker_select', function( e ) {
			$( this ).next().toggle();
			$( this ).next().next().toggle();
		});

		// iconpicker widget select
		$( 'body' ).on( 'click', '.bt_bb_iconpicker_widget_container .bt_bb_icon_preview', function( e ) {
			var select_preview = $( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_select .bt_bb_icon_preview' );
			select_preview.attr( 'data-icon', $( this ).data( 'icon' ) );
			select_preview.attr( 'data-icon-code', $( this ).data( 'icon-code' ) );
			select_preview.removeClass();
			select_preview.addClass( $( this ).attr( 'class' ) );

			$( this ).closest( '.bt_bb_iconpicker' ).find( 'input' ).val( $( this ).data( 'icon' ) );
			$( this ).closest( '.bt_bb_iconpicker' ).find( 'input' ).trigger( 'change' ); // customize
			
			$( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_select .bt_bb_iconpicker_select_text' ).html( $( this ).attr( 'title' ) );
			
			$( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_clear' ).show();
			
			$( this ).parent().hide();
			$( this ).parent().prev().find( 'input' ).val( '' ).trigger( 'keyup' );
			$( this ).parent().prev().hide();
		});
		
		// iconpicker widget clear
		$( 'body' ).on( 'click', '.bt_bb_iconpicker_widget_container .bt_bb_iconpicker_clear', function( e ) {
			e.stopPropagation();
			var select_preview = $( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_select .bt_bb_icon_preview' );
			select_preview.attr( 'data-icon', '' );
			select_preview.attr( 'data-icon-code', '' );
			select_preview.parent().find( '.bt_bb_iconpicker_select_text' ).html( '' );
			$( this ).closest( '.bt_bb_iconpicker' ).find( 'input' ).val( '' ); // bt_menu_admin.php (shoperific plugin)
			$( this ).closest( '.bt_bb_iconpicker' ).find( 'input' ).trigger( 'change' );
			$( this ).parent().next().find( 'input' ).val( '' ).trigger( 'keyup' );
			$( this ).parent().next().hide();
			$( this ).parent().next().next().hide();
			
			$( this ).hide();
		});
		
		// iconpicker widget filter
		$( 'body' ).on( 'keyup', '.bt_bb_iconpicker_widget_container .bt_bb_filter', function( e ) {
			var val = $( this ).val();
			$( this ).closest( '.bt_bb_iconpicker' ).find( '.bt_bb_iconpicker_icons .bt_bb_icon_preview' ).each(function() {
				var title = $( this ).attr( 'title' );
				var patt = new RegExp( val, 'i' );
				if ( ! patt.test( title ) ) {
					$( this ).hide();
				} else {
					$( this ).show();
				}
			});
		});*/

	});
	
	$( document ).ready(function() {
		$( 'body' ).on( 'keyup', function( e ) {
			if ( e.key === 'Escape' ) {
				if ( $( e.target ).is(':focus') && $( e.target ).closest( '#bt_bb_dialog' ).length == 1 ) {
					$( e.target ).blur();
				} else {
					if ( e.target.tagName.toLowerCase() == 'body' ) {
						window.bt_bb_dialog.hide();
					}
				}
				
			}
		});
		$( window ).on( 'focus', function() {
			window.bt_bb_refresh_cb_items();
		});
	});

}( jQuery ));
