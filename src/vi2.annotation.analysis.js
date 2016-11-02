/* 
*	name: Vi2.Analysis
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:

*/


Vi2.Analysis = $.inherit( Vi2.Annotation, /** @lends Analysis# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'analysis',
		type : 'annotation',
		options : {
			selector : '.control-bar',
			hasTimelineMarker: true, 
			hasMenu : true,
			menuSelector: '.analysis',
			displaySelector : '#seq',
			hasMarker: true,
			hasMarkerSelect:true,
			selectData:['Cat A', 'Cat B', 'Cat C'],
			hasMarkerLabel:true,
			hasMarkerComment:true,
			hasMarkerText:true,
			allowEmoticons : true, 
			allowReplies : true,
			allowEditing : true,
			allowCreation : true, 
			timelineSelector : '.vi2-timeline-bottom',
			path:'/'
		},
		player : null,
		currentMarker : -1,

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
						marker_type: val.marker_type,
						marker_label: val.marker_label,
						marker_select_option: val.marker_select_option, 
						marker_description: val.marker_description,
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
			
			if( this.options.allowCreation ){
				this.addMarker();
			}				
		},
		
		
		/*
		 **/
		addMarker : function(){
			$( this.options.selector + '> .vi2-analysis-controls' ).remove();
		
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>')
					.text( 'A' )
					.addClass('vi2-analysis-label ')//glyphicon glyphicon-step-backward
				)
				.addClass('vi2-analysis-controls vi2-btn')
				.attr('title', 'add marker')
				.bind('click', function(e){
					vi2.observer.pause();
					var newMarker = $('<a></a>')
						.addClass('analysis-marker')
						.draggable({ containment: "parent" })
						.appendTo( _this.options.displaySelector )
						.css({left: '50%', top: '50px', position:'absolute'})
						.bind('click', function(){
							
						})
						;
				})
				.prependTo( this.options.selector );	
		}, 	
		
		
		/*
		*
		**/
		createMenu : function(analysisData){
			var _this = this;
			var tmp_t = -1;
			
			var analysis = $('<ul></ul>')
				.addClass('analysis-list');
			$( this.options.menuSelector ).html( analysis );
			
			analysisData = analysisData.sort(function(a, b) {
  			return Number(a.time) > Number(b.time) ? 1 : -1;
			});
			moment.locale('de');
			$.each( analysisData, function(i, val){   
			
				var a = $('<a></a>')
					.text(val.name)
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
					
				$('<span></span>')
					//.text( user.firstname +' '+user.name )
					.text( user.username )
					.addClass('analysis-user')
					.appendTo( header )
					; 
				header.append(' ' + moment(Number(val.date), "x").fromNow() );	
				
				var li = $('<li></li>')
					.addClass('list-item')
					.addClass('t'+val.time)
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

				// edit
				if( _this.options.allowEditing && Number(val.author) === Number(vi2.wp_user) ){	 
					var edit_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-pencil' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'analysis')
						.data('annotationdata', { 
							content: val.name, 
							time: val.time, 
							date: val.date,
							author: val.author 
						} )
						.appendTo( header )
						;
				}		
				// re-analysis
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
					
				tmp_t = val.time;		
			}); // end each
		},
		
		/* -- */
		//<div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		//
		appendToDOM : function(id){ 
			var _this = this;
			$(vi2.dom).find('[type="analysis"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getAnalysisById(id), function( i, val ){ 
				var comm = $('<div></div>')
					.attr('type',"analysis")
					.attr('starttime', val.start)
					.attr('duration', 10)
					.attr('author', val.author)
					.attr('x', val.x)
					.attr('y', val.y)
					.attr('date', val.date)
					.attr('marker_type', val.marker_type)
					.attr('marker_label', val.marker_label)
					.attr('marker_select_option', val.marker_select_option) 
					.attr('marker_description', val.marker_description)
					.attr('id', val.id)
					.text( decodeURIComponent(val.analysis))
					.appendTo( vi2.dom )
					
					;  
			});
		},		
		
		
		/*
		**/
		updateDOMElement : function( obj ){
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]')
				.attr('author', vi2.wp_user )
				.attr('date', obj.date)  // its the creation date
				.attr('starttime', obj.time )
				.text( obj.content ); 
		},	
		
		/*
		* { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
		**/
		addDOMElement : function( obj ){
			$('<div></div>')
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.text( obj.content )
				.appendTo( vi2.dom );
		},			
	
				
		/*
		 *
		 **/
		begin : function(e, id, obj){ 
			if( this.currentMarker !== obj.id ){
				this.currentMarker = obj.id;
				var _this = this;
				var ltype = $('<span></span>')
					.addClass('analysis-marker-wraper marker-id-'+obj.content.target);

				$( this.options.displaySelector ).find( 'analysis-marker-wraper' ).each(function(i, val){ $(val).remove(); });
			
				var o = $('<span></span>')
						//.text(' ' +( decodeURIComponent( obj.content.title ) ) )
						.attr('id', 'ov'+id)
						//.attr('href', '#' )
						.attr('title', ( obj.content.description ) )
						.addClass('ov-'+id+' analysis-marker')
						.bind('click', function(data){ alert(obj.marker_type)
							// pause the video
							vi2.observer.player.pause();
						
							// marker + option select
							if( _this.options.hasMarkerSelect && obj.marker_type === ( 'marker-select' || 'marker-select-desc') ){ 
								var select = $('<select></select>');
								for( var i=0; i < _this.options.selectData.length; i++){
									var opt = $('<option></option>')
										.html( _this.options.selectData[i] )
										.attr('value', _this.options.selectData[i].toLowerCase() )
										;
									select.append( opt );
								}
								$(this).parent().append( select );
							}	
						
							// marker + label
							if( _this.options.hasMarkerLabel && obj.marker_type === ( 'marker-label' || 'marker-label-desc') ){ 
								var input = $('<input />').attr('type','text');
								$(this).parent().append( input );
							}
						
							// marker + text
							if( _this.options.hasMarkerText && obj.marker_type === ( 'marker-desc' || 'marker-label-desc' || 'marker-select-desc') ){ 
								var text = $('<textarea></textarea>');//.attr('type','text');
								$(this).parent().append( text );
							}
						
							// remove link ancshor after click 
							//$(this).remove();
						});
					
					
						$(ltype)
							.html(o)
							.appendTo( this.options.displaySelector )
							.css({left: obj.displayPosition.x+'%', top: obj.displayPosition.y+'%', position:'absolute'})
							.effect( "highlight", 500 ) // could be improved
							; 
				 
				// xxx does it work?
				// reset highlight
				$(this.options.menuSelector+' li').each(function(i, val){ 
					$(this).removeClass('vi2-highlight'); 
				});
				// highlight analysis entry
				$(this.options.menuSelector+' li.t' + obj.displayPosition.t1 ).addClass('vi2-highlight');
			}
		},
		
		/*
		 **/
		end:function(e, id){
			// xxx does it work?
			$(this.options.menuSelector+' li ').removeClass('vi2-highlight');
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
			var obj = {};
			obj.content = $( selector ).find('[name="analysis-entry"]').val();
			obj.time = $( selector ).find('[name="analysis-entry-time"]').attr('value');
			return obj;
		}
	
	
		
	}); // end class Analysis
