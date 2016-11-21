/* 
*	name: Vi2.Comments
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- re-comments could be sorted desc by date. Solution needed
	- threaded comments
 	- highlight while playing
*/


Vi2.Comments = $.inherit( Vi2.Annotation, /** @lends Comments# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'comments',
		type : 'annotation',
		options : {
			hasTimelineMarker: true, 
			hasMenu : true,
			menuSelector: '#comments',
			allowEmoticons : true, 
			allowReplies : true,
			allowEditing : true,
			allowCreation : true, 
			timelineSelector : '.vi2-timeline-buttom',
			path:'/'
		},
		player : null,

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
						date: val.date, 
						author: val.author 
					}); 
				}
			});
			
			// show comments in a menu
			if( this.options.hasMenu ){
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'comments', events, this.options.timelineSelector );
			}				
		},	
		
		
		/*
		*
		**/
		createMenu : function(commentData){
			var _this = this;
			var tmp_t = -1;
			
			var comments = $('<ul></ul>')
				.addClass('comments-list');
			$( this.options.menuSelector ).html( comments );
			
			commentData = commentData.sort(function(a, b) {
  			return Number(a.time) > Number(b.time) ? 1 : -1;
			});
			moment.locale('de');
			$.each( commentData, function(i, val){   
			
				var a = $('<a></a>')
					.text(val.name)
					.addClass('id-'+ val.time+' comments-menu-question' )
					//.attr('href', '#'+vi2.options.id)
					.click(function(){  
						vi2.observer.log({ context:'comments',action:'menu-click',values: [val.name, val.author, val.time[0] ]} );
						_this.player.currentTime( val.time[0] );
					})
					;	
					
				if( _this.options.allowEmoticons ){
					a.emoticonize({ /* delay: 800, animate: false, exclude: 'pre, code, .no-emoticons' */ });
				}	
				
				
				var user = vi2.db.getUserById( val.author );	
				
				var header = $('<span></span>')
					.addClass('comments-header');
					
				$('<span></span>')
					//.text( user.firstname +' '+user.name )
					.text( user.username )
					.addClass('comments-user')
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
					.appendTo(comments)
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
						.attr('data-annotationtype', 'comments')
						.data('annotationdata', { 
							content: val.name, 
							time: val.time, 
							date: val.date,
							author: val.author 
						} )
						.appendTo( header )
						;
				}		
				// re-comments
				if( _this.options.allowReplies ){		
					var reply_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-arrow-right' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'comments')
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
			$(vi2.dom).find('[type="comments"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getCommentsById(id), function( i, val ){ 
				var comm = $('<div></div>')
					.attr('type',"comments")
					.attr('starttime', val.start)
					.attr('duration', 10)
					.attr('author', val.author)
					.attr('date', val.date)
					.text( decodeURIComponent(val.comment))
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

			// reset highlight
			$(this.options.menuSelector+' li').each(function(i, val){ 
				$(this).removeClass('vi2-highlight'); 
			});
			// highlight comment entry
			$(this.options.menuSelector+' li.t' + obj.displayPosition.t1 ).addClass('vi2-highlight');

		},
		
		/*
		 **/
		end:function(e, id){
			$(this.options.menuSelector+' li ').removeClass('vi2-highlight');
		},
			
			
		/*
		*
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
			<textarea name='comments-entry' data-datatype='string' placeholder='' aria-describedby='comments-form1'><%= content %></textarea>\
			<br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='comments-form1'>Zeitpunkt (s)</span>\
				<input type='text' class='form-control' value='<%= time %>' name='comments-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='comments-form1'>\
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
			obj.content = $( selector ).find('[name="comments-entry"]').val();
			obj.time = $( selector ).find('[name="comments-entry-time"]').attr('value');
			return obj;
		}
	
	
		
	}); // end class Comments
