var 
					_this = this,
					wraper = $('<span></span>'),
					marker = $('<span></span>'),
					input_fields = $('<span></span>')
					;
				$( wraper )
					.addClass('analysis-marker-wraper marker-id-' + id )
					.html( marker )
					.append( input_fields )
					.appendTo( this.options.displaySelector )
					.css({left: obj.displayPosition.x+'%', top: obj.displayPosition.y+'%', position:'absolute'})
					;	
				$( input_fields )
					.addClass('analysis-input-fields analysis-marker-wraper')
					.addClass( obj.displayPosition.x > 50 ? ' left':' right' )
					.addClass( obj.displayPosition.y > 50 ? ' bottom':' top' )
					;
					
				$( this.options.displaySelector ).find( 'analysis-marker-wraper' ).each(function(i, val){ $(val).remove(); });
				var open = false;
				
				$( marker )
					//.text(' ' +( decodeURIComponent( obj.content.title ) ) )
					.attr('id', 'ov'+id)
					.attr('title', ( obj.data.markerlabel ) )
					.addClass('ov-'+id+' analysis-marker')
					.bind('click', function(data){
						if(open){
							open = false;
							$('.marker-element').hide();
							$('.analysis-input-fields').empty();
							vi2.observer.player.play();
						}else{
							open = true; 
							// pause the video
							vi2.observer.player.pause();

							// reset elements
							$('.marker-element').remove();
											
							// marker + option select
							if( _this.options.hasMarkerSelect && ( obj.data.markertype === 'marker-select' || obj.data.markertype === 'marker-select-desc') ){ 
								/*var btn =$('<button></button>').html('Action <span class="caret"></span>')
									.attr('type',"button")
									.data('toggle',"dropdown") 
									.attr('aria-haspopup',"true")
									.attr('aria-expanded',"false")
									.addClass('btn btn-default dropdown-toggle')
									;
		    				var ul = $('<ul></ul>').addClass('dropdown-menu');
		      			for( var i=0; i < _this.options.selectData.length; i++){
									var opt = $('<li></li>')
										.html( _this.options.selectData[i] )
										//.attr('value', _this.options.selectData[i].toLowerCase() )
										;
									ul.append( opt );
								}
								$(this).parent().append( btn ).append( ul );
								*/
								var select = $('<select></select>')
									.addClass('marker-element')
									.attr('title','Select a category')
									;
								for( var i=0; i < _this.options.selectData.length; i++){
									var opt = $('<option></option>')
										.html( _this.options.selectData[i] )
										.attr('value', _this.options.selectData[i].toLowerCase() )
										;
									select.append( opt );
								}
								$( input_fields ).append( select );
						
						
							}	
				
							// marker + label
							if( _this.options.hasMarkerLabel && ( obj.data.markertype === 'marker-label' || obj.data.markertype === 'marker-label-desc') ){ 
								var input = $('<input />')
									.attr('type','text')
									.attr('title','Label the marker')
									.val( obj.data.markerlabel )
									.addClass('marker-text-label marker-element');
								$( input_fields ).append( input );
							}
						// marker + text
							if( _this.options.hasMarkerDescription && ( obj.data.markertype === 'marker-desc' || obj.data.markertype === 'marker-label-desc' || obj.data.markertype === 'marker-select-desc') ){ 
								var text = $('<textarea placeholder="Beschreibung"></textarea>')
									.attr('title','Beschreiben Sie was und warum Sie etwas im Video markiert haben')
									.val( obj.data.markerdescription )
									.addClass('marker-element');//.attr('type','text');
								$( input_fields ).append( text );
			
								var text2 = $('<textarea placeholder="Beurteilung"></textarea>')
									.attr('title','Beurteilen Sie den Konflikt')
									.val( obj.data.markerdescription2 )
									.addClass('marker-element');//.attr('type','text');
								$( input_fields ).append( text2 );
							}
						}						
						
						// save btn
						var save = $('<a></a>')
							.text('speichern')
							.addClass('save-btn vi2-analysis-btn')
							.appendTo( input_fields ) 
							.bind('click', {}, function(ee){ 
								var xx = ( $(this).parent().offset().left - $('video').offset().left ) / $('video').height() * 100;
								var yy = ( $(this).parent().offset().top - $('video').offset().top ) / $('video').width() * 100;
						
								var label = $(this).parent().find('.marker-text-label').val();
								_this.annotation_flag = false; 
								// add new annotation to the DOM
						
								_this.addDOMElement( {
									"type": _this.name,
									"id": Math.ceil( Math.random() * 1000 ),
									"date": (new Date().getTime()),
									"author": vi2.wp_user,
									"y": yy,
									"x": xx,
									"starttime":  vi2.observer.player.currentTime(),
									"duration":"10",
									"markertype":"marker-label-desc",
									"markerlabel": label === undefined ? '?' : label,
									"markerselectoption":"cat a",
									"markerdescription": $(this).parent().find('.marker-description').val(),
									"markerdescription2": $(this).parent().find('.marker-description2').val(),
									//"analysis": $(this).parent().find('.marker-analysis').val()
								});

								// save DOM to DB		
								_this.saveDOM();
								$( marker ).hide();
							});
					});
