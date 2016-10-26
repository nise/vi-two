/* 
*	name: Vi2.Hyperlinks
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*  - ejs.js
*	todo:
	- include editor from vi-wiki 
	- nice defaults: var defaults = {animLen: 350}; 
	- apply minimum link duration
	- delay removeOverlay on mouseover/shift-press etc.
	
*/

/* 
 * class Hyperlinks 
 **/ 
Vi2.Hyperlinks = $.inherit( Vi2.Annotation,/** @lends Hyperlinks# */{

		/* @constructs
		 *		@extends Annotation
		 *		@param {object} options An object containing the parameters
     *		
     *		@param {string} options.displaySelector An optional setting.
		 **/
  	__constructor : function(options) { 	
  		this.options = $.extend(this.options, options); 
		},
				
		name : 'hyperlinks',
		type : 'annotation',
		
		options : {
			displaySelector: '#seq',
 			hasTimelineMarker: true,
 			timelineSelector : '.vi2-timeline-top', 
			hasMenu : true,
			menuSelector: '#hyperlinks',
			minDuration: 5, // seconds
			allowEditing : true,
			allowCreation : true, 
			path: '/static/img/user-icons/'
		},
		player : null,
		link_list : {},
		currLinkId :-1,

		/* 
		 *
		 **/
		init : function(ann){
			this.clear(); 
			var events = [];
			$.each(ann, function(i, val){ 
				if( val.linktype === 'cycle' || val.linktype === 'standard' || val.linktype === 'external'){ // former also  val.linktype == 'standard' ||
				events.push({ 
						name: val.title, 
						occ:[val.t1], 
						target: val.target,
						description: ( val.description ), 
						time :[val.t1],
						duration: val.t2, 
						x:val.x,
						y:val.y,
						date: val.date, 
						author: val.author 
				});
				}
			}); //{"occ":["1690"],"target":"#!moss","time":["1690"],"date":"1416312331209","author":"admin"}
			
			// show comments in a menu
			if( this.options.hasMenu ){ 
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'hyperlinks', events, this.options.timelineSelector );
			}		
		},		
		
		
		/* 
			* Translated database entry of link into a dom element that the parser will read later on 
			**/
		appendToDOM : function(id){
			var _this = this;
			$(vi2.dom).find('[type="hyperlinks"]').each(function(i,val){ $(this).remove(); });
			$(vi2.dom).find('[type="cycle"]').each(function(i,val){ $(this).remove(); });
			 
			$.each(	vi2.db.getLinksById(id), function(i, val){  
				var links = $('<div></div>')
				.attr('type', val.type) // former default: "xlink"
				.attr('starttime', val.starttime)//vi2.utils.deci2seconds(this.start))
				.attr('duration', val.duration)
				.attr('posx', val.x)
				.attr('posy', val.y)
				.attr('seek', vi2.utils.deci2seconds(this.seek))
				.attr('duration2', vi2.utils.deci2seconds(this.duration2))
				.attr('target', val.target)
				.attr('description', decodeURIComponent( val.description) )
				.attr('author', val.author)
				.attr('date', val.date)
				.text( decodeURIComponent(val.title) )
				.appendTo( vi2.dom )
				;
			});
			
		},	
		
		
		/**
			*
			*/
		updateDOMElement : function( obj ){  
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]')
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.attr('description', decodeURIComponent( obj.content.description ) )
				.attr('duration', obj.content.duration === undefined ? '10' : obj.content.duration )
				.attr('posx', obj.content.x === undefined ? '20' : obj.content.x  )
				.attr('posy', obj.content.y === undefined ? '80' : obj.content.y  )
				.attr('seek', 0 )// obj.conetnt.seek
				.attr('duration2', 0 )//obj.content.duration2
				.attr('target', obj.content.target)
				.text( decodeURIComponent(obj.content.label) ); 
		},
		
		
		/**
			* @todo { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
			*/
		addDOMElement : function( obj ){ 
			$('<div></div>')
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.attr('duration', obj.content.duration === undefined ? '10' : obj.content.duration )
				.attr('posx', obj.content.x === undefined ? '20' : obj.content.x  )
				.attr('posy', obj.content.y === undefined ? '80' : obj.content.y  )
				.attr('seek', 0 )// obj.conetnt.seek
				.attr('duration2', 0 )//obj.content.duration2
				.attr('target', obj.content.target)
				.attr('description', decodeURIComponent( obj.content.description ))
				.text( decodeURIComponent(obj.content.label) )
				.appendTo( vi2.dom ); 
		},
		
		
		/**
		* Builds a list menu of all entries of the table of content
		*/
		createMenu : function(hyperlinksData){  
			var _this = this;
			var hyperlinks = $('<ul></ul>')
				.addClass('hyperlinks-list');
			$( this.options.menuSelector ).html( hyperlinks );	 
			
			$.each(hyperlinksData, function(i, val){  
					var a = $('<a></a>')
					.text( decodeURIComponent( val.name ) )
					.addClass('id-'+ val.occ[0])
					.attr('href', '#!/video/' + vi2.observer.current_stream + '/t=npt:' + val.occ[0] + '') // former: main.options.id
					;				
					var user = vi2.db.getUserById( val.author );	
			
					var li = $('<li></li>')
						.addClass('hyperlinks-'+val.occ[0])
						.attr('id', ''+ val.occ[0])
						.attr('title', user.username+', ' + moment(Number(val.date), "x").fromNow())
						//.css('list-style-image',  "url('"+_this.options.path+"user-"+val.author+".png')")
						.html(a)
						.appendTo( hyperlinks )
						; 
					var data = {
								time: val.occ[0],
								date: val.date,
								author: val.author,
								content : {
									label: val.name, 
									date: val.date,
									duration: val.duration, 
									description: val.description,
									target: val.target,
									x: val.x,
									y: val.y,
									seek: 0,//val.seek,
									duration2: 0//val.duration2 
								}
							};
							
					// editing		
					if( _this.options.allowEditing ){		 // evtl. && Number(val.author) === Number(vi2.wp_user) 
						var edit_btn = $('<a></a>')
							.addClass('tiny-edit-btn glyphicon glyphicon-pencil tiny-edit-btn-'+ _this.name)
							.attr('data-toggle', "modal")
							.attr('data-target', "#myModal")
							.attr('data-annotationtype', 'hyperlinks')
							.data('annotationdata', data )
							.appendTo( li )
							;
					}
					
					li.click(function(){
						vi2.observer.log({context:'hyperlinks',action:'menu-click',values:[val.name,val.author,val.occ[0]]} ); 
						vi2.observer.player.currentTime( val.occ[0] );
						_this.currentTocElement = i;
					});	
				
			});// end each
		
			// sort list entries by time and append them
			hyperlinks
				.find('li').tsort( { attr:"id" } );  // tsort is error prune under chromium
					
			
		},			
		
		
		/** 
			* Begin of XLink annotation. Typically the link anchor will apeare on screen. There are three different link types: standard (target within video collection), external (target elsewhere in the WWW) and cycle (like standard link but with the option to return to the link source).
			* @param {Object} e
			* @param {String} id
			* @param {Object} obj		
		*/
		begin : function(e, id, obj){  
				this.currLinkId = id;
				var _this = this;
				
				// distinguish link types as icons
				var ltype = $('<span></span>');
				var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
				var regex = new RegExp(expression);
				if (obj.content.target.match(regex) ){
					obj.linktype = 'external';
					ltype.addClass('glyphicon glyphicon-share-alt');
				} else {
					obj.linktype = 'standard';
					ltype.addClass('glyphicon glyphicon-link');
				}
				
				var o = $('<a></a>')
					.text(' ' +( decodeURIComponent( obj.content.title ) ) )
					.attr('id', 'ov'+id)
					.attr('href', obj.content.target )
					.attr('title', ( obj.content.description ) )
					.addClass('overlay ov-'+id+' hyperlink-'+obj.linktype)
					.bind('click', function(data){ 
						// log click
						vi2.observer.log({context:'hyperlinks',action:'link-'+obj.linktype+'-click',values:[obj.content.target, obj.author, obj.displayPosition.t1]} );
	 					// distinguish link types
	 					switch(obj.linktype){
	 						case 'standard' : 	// called xlink
	 							return true;
	 							//var new_stream = obj.content.target.replace(/\#!/,'');
								//vi2.observer.setCurrentStream(new_stream);
								
							case 'external' :
								return true;
							case 'cycle' : 
								var new_stream = obj.content.target.replace(/\#!/,'');
								vi2.observer.setCurrentStream(new_stream);
								// make new object for return link
								var return_obj = {
									title : 'return to: '+obj.content.title,
									target : String(_this.player.url).replace(/.webm/,'').replace(/videos\/iwrm\_/,''), // dirty IWAS hack
									linktype : 'standard',
									type : 'xlink',
									x : 2, //obj.displayPosition.x,
									y : 93, // obj.displayPosition.y,
									t1 : obj.seek,
									t2 : obj.duration,
									seek : obj.displayPosition.t1,
									duration : 0
								};	
								// append that object
								vi2.observer.vid_arr[0].annotation.push(return_obj); 
								//	_this.loadCycleVideo(obj.content.target, 10, 15, obj.displayPosition.t1); // url, seek time, duration, return_seek
								break;
							case 'x':
								break;	
						}
						// load Video
						_this.loadVideo(vi2.observer.vid_arr[0].url , obj.seek);
						
						// remove link ancshor after click 
						$(this).remove();
					})
					.prepend( ltype )
					.appendTo( this.options.displaySelector )
					.css({left: obj.displayPosition.x+'%', top: obj.displayPosition.y+'%', position:'absolute'})
					.effect( "highlight", 2000 ) // could be improved
					; 
		},
	
	
		/** 
				*
				* End of annotion time. The link anchor will disapear from screen. 
				*/
		end : function(e, id){ 	 
			$( this.options.displaySelector + ' .ov-'+id ).hide();
		},
		
		
		/** 
				*
				*/
		clear : function(){ 
			$( this.options.displaySelector ).html('');
			// xxx static, stands in relative with template of videoplayer
			$('.vi2-video-seeklink').html('');
			
		},
		
		
		/*
		* 
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form1'>ULR</span>\
				<input type='text' class='form-control' value='<%= content.target %>' name='hyperlinks-entry-url' data-datatype='string' placeholder='' aria-describedby='hyperlinks-form1'>\
			</div><br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form1'>Bezeichner</span>\
				<input type='text' class='form-control' value='<%= content.label %>' name='hyperlinks-entry-label' data-datatype='string' placeholder='' aria-describedby='hyperlinks-form12'>\
			</div><br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form2'>Beschreibung</span>\
				<textarea name='hyperlinks-entry-desc' data-datatype='string' placeholder='' aria-describedby='hyperlinks-form2'><%= content.description %></textarea>\
			</div><br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form3'>Zeitpunkt (s)</span>\
				<input type='text' class='form-control' value='<%= time %>' name='hyperlinks-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form66'>Anzeigedauer (s)</span>\
				<input type='text' class='form-control' value='<%= content.duration %>' name='hyperlinks-entry-duration' data-datatype='decimal-time' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form66'>Position x (%)</span>\
				<input type='text' class='form-control' value='<%= content.x %>' name='hyperlinks-entry-x' data-datatype='number' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form66'>Position y (%)</span>\
				<input type='text' class='form-control' value='<%= content.y %>' name='hyperlinks-entry-y' data-datatype='number' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			"; 
			if( data.content !== '' ){
				data.content.description = decodeURIComponent( data.content.description );
				data.content.label = decodeURIComponent( data.content.label );
				return ejs.render(str, data);
			}	else{
				return ejs.render(str, { 
					content: { 
						description:'', 
						target:'', 
						label:'',
						duration:10,
						x: 50,
						y: 50
					}, 
					time: vi2.observer.player.currentTime(), 
					date: (new Date().getTime()),
					author: vi2.wp_user 
				});	
			}	
		},
		
		
		/*
		*
		**/
		getAnnotationFormData : function( selector ){ //encodeURIComponent
			return {
				time: $( selector ).find('[name="hyperlinks-entry-time"]').attr('value'),
				content: {
					label: ($( selector ).find('[name="hyperlinks-entry-label"]').val() ), 					
					target: $( selector ).find('[name="hyperlinks-entry-url"]').val(),
					description: ( $( selector ).find('[name="hyperlinks-entry-desc"]').val() ),// opt	
					duration:  $( selector ).find('[name="hyperlinks-entry-duration"]').val(),
					x:  $( selector ).find('[name="hyperlinks-entry-x"]').val(),
					y:  $( selector ).find('[name="hyperlinks-entry-y"]').val(),
					seek:  0,//$( selector ).find('[name="hyperlinks-entry-seek"]').val(),// opt
					duration2:  0 //$( selector ).find('[name="hyperlinks-entry-duration2"]').val()// opt						
				}	
			};
		},
		
		
		/** Loads video from url and seeks to a dedicated position in time. 
		*		@param {String} url 
		* 	@param {Number} seek 
		*/
  	loadVideo : function(url, seek){
	  	this.player.loadVideo(url, seek);  			
  	},
  	
  	
  	/** 
				*
				*/
  	loadCycleVideo : function(url, seek, duration, return_seek){
	  	this.player.loadCycleVideo(url, seek, duration, return_seek);  			
  	}
  	
	}); // end class XLink


