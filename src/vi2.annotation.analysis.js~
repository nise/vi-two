/* 
*	name: Vi2.Analysis
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 - minor bug: an open input filed doesn't get updated if a peer client changes data
 - refactor menu
 - use data-attribute for storing 
 - drop-down for different types / option for enabled types
 - re-comment binding
*/


Vi2.Analysis = $.inherit( Vi2.Annotation, /** @lends Analysis# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'assessmentanalysis',
		type : 'annotation',
		options : {
			selector : '.control-bar',
			hasTimelineMarker: true, 
			hasMenu : true,
			menuSelector: '#assessmentanalysis',
			displaySelector : '#overlay',
			hasMarker: true,
			hasMarkerSelect:true,
			selectData:['Cat A', 'Cat B', 'Cat C'],
			hasMarkerLabel:true,
			hasMarkerComment:true,
			hasMarkerDescription:true,
			hasMarkerDescription2:true,
			allowEmoticons : true, 
			allowReplies : false,
			allowEditing : false,
			allowCreation : true, 
			timelineSelector : '.vi2-timeline-top',
			path:'/'
		},
		player : null,
		currentMarker : -1,
		annotation_flag : false,
		marker_template : [	
					'<div class="analysis-marker-annotate">',
						'<span class="analysis-marker-annotate-fill"></span>',
						'<span class="input-wraper right top">',
							 '<input id="marker-text-label" type="text" placeholder="Label" class="marker-element" title="Label" />',
							 '<textarea id="marker-description" class="marker-element" placeholder="Beschreibung" title="Beschreibung der Markierung"></textarea>',
							 '<textarea id="marker-description2" class="marker-element" placeholder="Beurteilung" title="Beurteilung"></textarea>',
							 '<a class="save-btn vi2-analysis-btn">speichern</a>',
							 '<a class="remove-btn vi2-analysis-btn glyphicon glyphicon-remove"></a>',				
						'</span>',
					'</div>'
				].join(''),


		/* ... */
		init : function(ann){  
			if( ann === null ){
				ann = {};
			} 
			var _this = this;
			var events = [];
			$.each(ann, function(i, val){  
				if( val.type === _this.name ){  
					events.push({
						name: val.title, 
						occ:[val.t1], 
						time :[val.t1], 
						x:val.x,
						y:val.y,
						date: val.date, 
						author: val.author,
						markertype: val.markertype,
						markerlabel: val.markerlabel,
						markerselectoption: val.markerselectoption, 
						markerdescription: val.markerdescription,
						markerdescription2: val.markerdescription2,
						id: val.id
					}); 
				}
			});
			
			// show analysis in a menu
			if( this.options.hasMenu ){
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'analysis', events, this.options.timelineSelector );
			}
			
			// add annotation button to the video control bar
			if( this.options.allowCreation ){
				$( this.options.selector + '> .vi2-analysis-controls' ).remove();
				// add button to player control bar
				var container = $('<div></div>')
					.append($('<div></div>')
										.addClass('vi2-analysis-label glyphicon glyphicon-plus')//glyphicon glyphicon-step-backward
					)
					.addClass('vi2-analysis-controls vi2-btn')
					.attr('title', 'Markierung hinzufügen')
					.bind('click', {}, function(e){		
						_this.addMarker();
					})
					.appendTo( this.options.selector );			
			}	
		},
		
		
		/*
		 * Add a new marker to the video
		 **/
		addMarker : function(){ 
			var 
				_this = this,
				time = vi2.observer.player.currentTime(),
				id = 'markerid'+Math.ceil( Math.random() * 1000 )
				;
			if( ! _this.annotation_flag ){
				//$('.analysis-marker-annotate').remove();	
				_this.annotation_flag = true;
				vi2.observer.player.pause();
				
				// append the marker template
				//$( _this.options.displaySelector ).append( _this.marker_template );
				var tt = $('<div></div>').append( _this.marker_template );
				tt.find('.analysis-marker-annotate')
					.addClass( id );
				$( _this.options.displaySelector ).append( tt.find('.analysis-marker-annotate') );
				
				// define events for the control and input element that belong to the marker template
				var remove = $('.'+id+' .remove-btn')
					.click(function(e){
						_this.annotation_flag = false;
						$(newMarker).hide();
						vi2.observer.player.play();
					});
					
				var save = $('.'+id+' .save-btn')
					.bind('click', {}, function(ee){ 
						_this.annotation_flag = false; 
						// add new annotation to the DOM
						_this.addDOMElement({
							"type": _this.name,
							"id": id,
							"date": (new Date().getTime()),
							"author": vi2.wp_user,
							"y": ( ( $(this).parent().parent().offset().top - $('video').offset().top ) / $('video').height() * 100 ).toFixed(0),
							"x": ( ( $(this).parent().parent().offset().left - $('video').offset().left ) / $('video').width() * 100 ).toFixed(0),
							"starttime":  time,
							"duration":"10",
							"markertype":"marker-label-desc",
							"markerlabel": $(this).parent().find('#marker-text-label').val(),
							"markerselectoption":"cat a",
							"markerdescription": $(this).parent().find('#marker-description').val(),
							"markerdescription2": $(this).parent().find('#marker-description2').val()
							//"analysis": $(this).parent().find('.marker-analysis').val()
						});
						// save DOM to DB		
						_this.saveDOM();
						$('.'+id ).hide();
						vi2.observer.player.play();
					});// end save
					
				var newMarker = $('.'+id ) //.analysis-marker-annotate
					.css({left: '49%', top: '20%', position:'absolute'})
					.show()
					.draggable({ 
						containment: "parent",
						drag: function(e){
							var x = ( $(this).offset().left - $('video').offset().left ) / $('video').width() * 100;
							var y = ( $(this).offset().top - $('video').offset().top ) / $('video').height() * 100;
							//$('.analysis-marker-annotate-fill').text(x.toFixed(1)+'__'+y.toFixed(1));
							if( x > 50 ){ $('.input-wraper').addClass('left').removeClass('right'); }else{ $('.input-wraper').addClass('right').removeClass('left'); }
							if( y > 50 ){ $('.input-wraper').addClass('bottom').removeClass('top'); }else{ $('.input-wraper').addClass('top').removeClass('bottom'); }
						} 
					})
					/*.resizable({ // needs to be considered to find the right position for the input wraper
						containment: "parent",
						maxHeight: 800,
						maxWidth: 800,
						minHeight: 50,
						minWidth: 50
					})*/
					;			
				}// end if annotation_flag
		}, 	
		
		
		/*
		* xxx: needs to be replaced by a template
		**/
		createMenu : function(analysisData){ 
			var _this = this;
			var tmp_t = -1;

			var analysis = $('<ul></ul>').addClass('analysis-list');
			$( '#assessmentanalysis' ).html( analysis );
			
			analysisData = analysisData.sort(function(a, b) {
  			return Number(a.time) > Number(b.time) ? 1 : -1;
			});
			moment.locale('de');
			$.each( analysisData, function(i, val){  
				var a = $('<a></a>')
					.text(val.markerlabel+'') 
					.addClass('id-'+ val.time+' analysis-menu-question' )
					//.attr('href', '#'+vi2.options.id)
					.click(function(){  
						vi2.observer.log({ context:'analysis',action:'menu-click',values: [val.name, val.author, val.time[0] ]} );
						_this.player.currentTime( val.time[0] );
					})
					;	
					
				if( _this.options.allowEmoticons ){
					//a.emoticonize({ /* delay: 800, animate: false, exclude: 'pre, code, .no-emoticons' */ });
				}	
				
				
				var user = vi2.db.getUserById( val.author );	
				
				var header = $('<span></span>')
					.addClass('analysis-header');
				
				user.firstname = user.firstname !== undefined ? user.firstname : 'user ';	
				user.name = user.name !== undefined ? user.name : '';
				$('<span></span>')
					.text( user.firstname +' '+ user.name +' ' )
					.text( user.username )
					.addClass('analysis-user')
					.appendTo( header )
					; 
				header.append('  _' + moment(Number(val.date), "x").fromNow() );	

				var li = $('<li></li>')
					.addClass('list-item')
					.addClass('t'+ Number(val.time[0].replace('.','')))
					.attr('author', val.author)
					.attr('date', 'd'+val.date)
					.attr('id', 't'+_this.formatTime(val.time, '-'))
					.html( header )
					.append(a)
					.appendTo(analysis)
					;

				if( Number(val.time) === Number(tmp_t) ){ 
					li.css({ 'margin-left':'15px' }); 
					// re-comments could be sorted desc by date. Solution needed
					//comments.find('.t'+val.time).tsort({ attr:"date", order:'asc'}); 
				}	

				// remove marker
				//if( _this.options.allowEditing && Number(val.author) === Number(vi2.wp_user) ){	 
					var remove_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-remove' )
						.bind('click', function(){  
							// remove them from the video screen as well
							$( '.'+val.id ).remove();
							_this.removeDOMElement( val.id ); 
						})
						.appendTo( header )
						;
				//}		
				/*// re-analysis
				if( _this.options.allowReplies ){		
					var reply_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-arrow-right' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'analysis')
						.data('annotationdata', { content: '', time: val.time, date: (new Date().getTime()) } )
						.appendTo( header )
						;		
					}	
				*/	
				tmp_t = val.time;		
			}); // end each
		},
		
		
		/*
		 * Saves DOM representation to the database
		 **/
		saveDOM : function(){ 
			var _this = this;
			// fetch all data from DOM
			var data = [];
			
			$(vi2.dom).find("div[type='"+ _this.name +"']").each(function(i, val){
				var obj = {};
				//obj.title = $(val).text();
				obj.target = $(val).attr('starttime') === undefined ? 0 : $(val).attr('starttime');
				obj.linktype = '';
				obj.x = $(val).attr('x');
				obj.y = $(val).attr('y');
				obj.t1 = $(val).attr('starttime') === undefined ? 0 : $(val).attr('starttime');
				obj.t2 = $(val).attr('duration') === undefined ? 1 : $(val).attr('duration');
				obj.marker = $(val).data('marker');
				obj.markertype = $(val).attr('markertype');
				obj.markerlabel = $(val).attr('markerlabel');
				obj.markerdescription = $(val).attr('markerdescription');
				obj.markerdescription2 = $(val).attr('markerdescription2');
				obj.markerselectoption = $(val).attr('markerselectoption');
				obj.id = $(val).attr('id');
				data.push( obj );
			});
		
			// store DOM data at the server / db 
	 		$.post('/videos/annotate', {"data":data, annotationtype: _this.name, videoid: vi2.videoData._id}, function( res ){ 
	 			// tell the other clients that some annotations habe been changed
	 			socket.emit('video.updated', { videoid: vi2.currentVideo }); // xxx bug
	 			// refresh annotations
	 			vi2.observer.setAnnotations();
	 			
			});
		},	
		
			
		/*
		 * appends all annotations to the DOM model, e.g.
		 * <div id="1" type="analysis" starttime="235.09" duration="10" author="8" x="50" y="20" date="1445946251191" markertype="marker-label" markerlabel="This is a label." markerselectoption="" markerdescription="">some text</div>
		 **/
		appendToDOM : function(id){ 
			var _this = this; 
			$(vi2.dom).find('[type="'+ _this.name +'"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getAnalysisById(id), function( i, val ){ 
				var comm = $('<div></div>')
					.attr('type', _this.name)
					.attr('author', val.author)
					.attr('date', val.date)
					.attr('starttime', val.t1)
					.attr('duration', 10)
					.attr('x', val.x)
					.attr('y', val.y)
					.attr('markertype', val.markertype)
					.attr('markerlabel', val.markerlabel)
					.attr('markerselectoption', val.markerselectoption) 
					.attr('markerdescription', val.markerdescription)
					.attr('markerdescription2', val.markerdescription2)
					.attr('id', val.id)
					.text( decodeURIComponent(val.analysis))
					.appendTo( vi2.dom )
					
					;  
			});
		},		
		
		
		/*
		 * Updates a single DOM element
		 **/
		updateDOMElement : function( val ){   
			$(vi2.dom).find("div[id='"+ val.id +"']").each(function(i, val){ 
				$(this).remove();
			});	
			
			$('<div></div>')	
				.attr('type', val.type)	
				.attr('author', vi2.wp_user )
				.attr('date', val.date)  // its the creation date
				.attr('starttime', val.starttime )
				.attr('duration', val.duration )
				.attr('x', val.x)
				.attr('y', val.y)
				.attr('markertype', val.markertype)
				.attr('markerlabel', val.markerlabel)
				.attr('markerselectoption', val.markerselectoption) 
				.attr('markerdescription', val.markerdescription)
				.attr('markerdescription2', val.markerdescription2)
				.attr('id', val.id)
				.text( val.markerlabel )
				.appendTo(vi2.dom)
				;
		
			this.saveDOM();	
		},	
		
		
		/*
		 * Adds a new DOM elemnt
		 **/
		addDOMElement : function( obj ){  
			$('<div></div>')
				.attr('id', obj.id)
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', obj.date)
				.attr('x', obj.x)
				.attr('y', obj.y)
				.attr('starttime', obj.starttime)
				.attr('duration', obj.duration)
				.attr('markertype', obj.markertype)
				.attr('markerlabel', obj.markerlabel)
				.attr('markerselect_option', obj.markerselectoption)
				.attr('markerdescription', obj.markerdescription)
				.attr('markerdescription2', obj.markerdescription2)
				.data('marker', obj)
				.text( obj.markerlabel )
				.appendTo( vi2.dom );
		},		
		
		
		/*
		 * Removes a DOM element
		 **/	
		removeDOMElement : function( id ){ // xxx time is not a good selector
			$(vi2.dom).find("div[id='"+ id +"']").each(function(i, val){ 
				$(this).remove();
			});	
			this.saveDOM();
		},
			
				
		/*
		 * Function that will be called by the core.clock in order to handle time-depending annotations
		 * @params e (object) Event
		 * @params id (number) Id of the annotation
		 * @prams obj (object) All data that has been stored with a single annotations that is going to be handled by this function.
		 **/ 
		begin : function(e, id, obj){	  
			var _this = this; 
			if( this.currentMarker !== obj.data.id ){ 
				this.currentMarker = obj.data.id;
				$('.'+obj.data.id).remove();	
				vi2.observer.player.pause();

				// set data and append the marker template
				var tt = $('<div></div>').append( _this.marker_template );
				tt.find('.analysis-marker-annotate')
					.attr('title', obj.data.markerlabel )
					.addClass( obj.data.id )
					.css({left: obj.displayPosition.x+'%', top: obj.displayPosition.y+'%', position:'absolute'});
					
				$( _this.options.displaySelector ).append( tt.find('.analysis-marker-annotate') );	
				$('.'+obj.data.id + ' #marker-text-label').val( obj.data.markerlabel );
				$('.'+obj.data.id + ' #marker-description').val( obj.data.markerdescription );
				$('.'+obj.data.id + ' #marker-description2').val( obj.data.markerdescription2 );

				// set position of input elements
				var x = ( $('.'+obj.data.id ).offset().left - $('video').offset().left ) / $('video').width() * 100;
				var y = ( $('.'+obj.data.id ).offset().top - $('video').offset().top ) / $('video').height() * 100;
				//$('.analysis-marker-annotate-fill').text(x.toFixed(1)+'__'+y.toFixed(1));
				if( x > 50 ){ $('.'+obj.data.id +' .input-wraper').addClass('left').removeClass('right'); }else{ $('.'+obj.data.id +' .input-wraper').addClass('right').removeClass('left'); }
				if( y > 50 ){ $('.'+obj.data.id +' .input-wraper').addClass('bottom').removeClass('top'); }else{ $('.'+obj.data.id +' .input-wraper').addClass('top').removeClass('bottom'); }				
				
				// define events for the control and input element that belong to the marker template
				var remove = $('.'+obj.data.id + ' .remove-btn').hide()
					.click(function(e){
						$('.'+obj.data.id + ' .input-wraper').hide();
						vi2.observer.player.play();
					});
					
				var save = $('.'+obj.data.id + ' .save-btn')
					.bind('click', {}, function(ee){  
						// add new annotation to the DOM
						var data = {
							"type": _this.name,
							"id": obj.data.id,
							"date": obj.data.date,
							"author": vi2.wp_user,
							"y": obj.data.y,//( $(this).parent().parent().offset().top - $('video').offset().top ) / $('video').height() * 100,
							"x": obj.data.x,//( $(this).parent().parent().offset().left - $('video').offset().left ) / $('video').width() * 100,
							"starttime":  obj.displayPosition.t1,
							"duration":"10",
							"markertype":"marker-label-desc",
							"markerlabel": $(this).parent().find('#marker-text-label').val(),
							"markerselectoption":"cat a",
							"markerdescription": $(this).parent().find('#marker-description').val(),
							"markerdescription2": $(this).parent().find('#marker-description2').val()
							//"analysis": $(this).parent().find('.marker-analysis').val()
						}
						//
						_this.updateDOMElement( data );
						
						//$('.input-wraper').hide();
						vi2.observer.player.play();
					});// end save

				var newMarker = $('.'+obj.data.id ) 
					//.css({left: obj.displayPosition.x+'%', top: obj.displayPosition.y+'%', position:'absolute'})
					.show()
					/*.draggable({ 
						containment: "parent",
						drag: function(e){
							var x = ( $(this).offset().left - $('video').offset().left ) / $('video').width() * 100;
							var y = ( $(this).offset().top - $('video').offset().top ) / $('video').height() * 100;
							//$('.analysis-marker-annotate-fill').text(x.toFixed(1)+'__'+y.toFixed(1));
							if( x > 50 ){ $('.input-wraper').addClass('left').removeClass('right'); }else{ $('.input-wraper').addClass('right').removeClass('left'); }
							if( y > 50 ){ $('.input-wraper').addClass('bottom').removeClass('top'); }else{ $('.input-wraper').addClass('top').removeClass('bottom'); }
						} 
					})
					.resizable({ // needs to be considered to find the right position for the input wraper
						containment: "parent",
						maxHeight: 800,
						maxWidth: 800,
						minHeight: 50,
						minWidth: 50
					})*/
					;		
				
				// reset highlight
				$(_this.options.menuSelector+' li').each(function(i, val){ 
					$(this).removeClass('vi2-highlight'); 
				}); 
				// highlight analysis entry
				$('.t' + Number(obj.displayPosition.t1.replace('.','')) ).addClass('vi2-highlight');
			}
			
		},
		
		
		/*
		 * 
		 **/
		end:function(e, id, obj){ 
			// hide the annotation
			$('.'+obj.data.id).hide();
			// reset the current marker
			this.currentMarker = -1;
			// make the menu item look normal and remove the highlighting class
			//$('.t' + Number(obj.displayPosition.t1.replace('.','')) ).removeClass('vi2-highlight');
		},
			
			
		/*
		*
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
			<textarea name='analysis-entry' data-datatype='string' placeholder='' aria-describedby='analysis-form1'><%= content %></textarea>\
			<br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='analysis-form1'>Zeitpunkt (s)</span>\
				<input type='text' class='form-control' value='<%= time %>' name='analysis-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='analysis-form1'>\
			</div>\
			";
			if( data ){
				return ejs.render(str, data);
			}	else{
				return ejs.render(str, { 
					content:'', 
					time: vi2.observer.player.currentTime() , 
					date: (new Date().getTime()), 
					author: vi2.wp_user
					});	
			}	
		},
		
		
		/*
		 *
		 **/
		getAnnotationFormData : function( selector ){
			return { 
				content : $( selector ).find('[name="analysis-entry"]').val(),
				time : $( selector ).find('[name="analysis-entry-time"]').attr('value')
			};  
		}
	
	}); // end class Analysis
