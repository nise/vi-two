/* 
* name: Vi2.TableOfContent
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - embedded java script
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - highlight on skip ... this.player.video.addEventListener('timeupdat
*  - realize a toc for concatinated video clips
*/


Vi2.TableOfContents = $.inherit( Vi2.Annotation, /** @lends Vi2.TableOfContents# */{ // 

		/** @constructs
		*		@extends Annotation
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		@param {boolean} options.hasMenu Wether the TOC should be listed in a menu or not.
		*		@param {string} options.menuSelector Class or id of the DOM element for the menu.
		*		@param {sring} options.timelineSelector Class or id of the DOM element for the annotated timeline.
		*		@param {string} options.path Path to folder where user icons are stored.
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'toc',
		type : 'annotation',
		options : {
			hasTimelineMarker: true, 
			hasMenu : true,
			menuSelector: '#toc', 
			timelineSelector : '.vi2-timeline-main',
			allowEditing : true,
			allowCreation : true,
			path:'/'
		},
		currentTocElement : 0,
		elements : [],

		/**
		Initializes the table of content and handles options
		*/
		init : function(annotations){
			var _this = this;
			// prepare toc data
			var events = [];
			$.each(annotations, function(i, val){
				if(val.type === _this.name ){
					if( val.note !== "missing"){ 
						_this.elements.push(val.t1);
					}	 
					events.push( { 
						name: val.title, 
						note:val.note, 
						occ:[val.t1], 
						time:[val.t1], 
						author: val.author, 
						date: val.date 
					});
				}
			});
			// 
			if( this.options.hasMenu ){
				this.createMenu( events );
			}	
			// 
			if( this.options.hasTimelineMarker ){
				vi2.observer.player.timeline.addTimelineMarkers( 'toc', events, this.options.timelineSelector );
			}
					
			// update toc highlight on time update
			vi2.observer.player.video.addEventListener('timeupdate', function(e) { 
				// reset highlight
				//		$(_this.options.menuSelector+' li').each(function(i, val){ $(this).removeClass('toc-hightlight');})
				// highlight toc entry
				//		$(_this.options.menuSelector+ ' li#t'+this.formatTime(obj.content.target)).addClass('toc-highlight');
			});
		},		
		
		
		/**
		* Loads toc data from database in order to generate corresponding DOM elements.
		* @ Resulting format of DOM element: <div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		*/
		appendToDOM : function(id){ 
			var frag = document.createDocumentFragment();
			$( vi2.dom ).find('[type="toc"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getTocById(id), function( i, val ){
				var toc = document.createElement( "div" );
				toc.setAttribute("type", "toc" );
				toc.setAttribute("note", val.note );
				toc.setAttribute("starttime", val.start );
				toc.setAttribute("duration", 10 );
				toc.setAttribute("author", val.author );
				toc.setAttribute("date", val.date );
				var itemText = document.createTextNode( decodeURIComponent(val.label) );
		 		toc.appendChild( itemText );
				frag.appendChild( toc );
			});
			$( vi2.dom ).append( frag );
		},
		
		/*
		**/
		updateDOMElement : function( obj ){ 
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]')
				.attr('author', vi2.wp_user )
				.attr('date', obj.date )  // its the creation date
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
				.attr('date', obj.date )
				.attr('starttime', obj.time )
				.text( obj.content ) 
				.appendTo( vi2.dom );
		},				
				
				
		/** 
		* During the playback corresponding toc entries will be highlighted.
		*/
		begin : function(e, id, obj){ 
				// reset highlight
				$(this.options.menuSelector+' li').each(function(i, val){ 
					$(this).removeClass('toc-highlight');
				});
				// highlight toc entry
				$('.toc-'+obj.displayPosition.t1).addClass('toc-highlight');
			
		},
	
	
		/** 
		* Terminates time-depended toc entries
		*/
		end : function(e, id, obj){ 
			//$('.toc-'+obj.displayPosition.t1).removeClass('toc-highlight');
		},
		
		
		/**
		* Builds a list menu of all entries of the table of content
		* todo: improve performance
		*/
		createMenu : function(tocData){
			var _this = this;
			var toc = $('<ul></ul>')
				.addClass('toc-list');
			$( this.options.menuSelector ).html( toc );	 
			
			$.each(tocData, function(i, val){ 
					var a = $('<a></a>')
					.text( val.name )
					.addClass('id-'+ val.occ[0]+' toc-menu-link')
					.attr('href', '#!/video/' + vi2.observer.current_stream + '/t=npt:' + val.occ[0] + '') // former: main.options.id
					;				
					
					var user = vi2.db.getUserById( val.author );	
					
					var li = $('<li></li>')
						.addClass('toc-'+val.occ[0])
						.attr('id', 'toc'+ val.occ[0])
						.attr('title', user.username+', ' + moment(Number(val.date), "x").fromNow())
						//.css('list-style-image',  "url('"+_this.options.path+"user-"+val.author+".png')")
						.html(a)
						.appendTo( toc )
						;
				
					// editing		
					if( _this.options.allowEditing ){		 
						var edit_btn = $('<a></a>')
							.addClass('tiny-edit-btn glyphicon glyphicon-pencil tiny-edit-btn-'+ _this.name)
							.attr('data-toggle', "modal")
							.attr('data-target', "#myModal")
							.attr('data-annotationtype', 'toc')
							.data('annotationdata', { 
								content: val.name, 
								time: val.occ[0], 
								date: val.date,
								author: val.author 
							} )
							.appendTo( li )
							;
					}
					// feature for (historic) movies where certain scenes are not available or lost	 
					if( val.note === "missing"){
						li.addClass('toc-disabled');
					}else{
						li.click(function(){
							vi2.observer.log({context:'toc',action:'menu-click',values: [val.name.replace(/,/g,'##'), val.author,  val.occ[0]] } ); 
							vi2.observer.player.currentTime( val.occ[0] );
							_this.currentTocElement = i;
						});	
					}	
			});// end each
		
			// sort list entries by time and append them
			//toc.find('li').tsort( { attr:"id" } );  // tsort is error prune under chromium
					
			
		},
		
		
		/*
		*
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
				<div class='input-group'>\
				<span class='input-group-addon' id='toc-form1'>Kapitelbezeichnung</span>\
				<input type='text' class='form-control' value='<%= content %>' name='toc-entry' data-datatype='string' placeholder='' aria-describedby='toc-form1'>\
				</div><br>\
				<div class='input-group'>\
				<span class='input-group-addon' id='toc-form1'>Wiedergabezeit</span>\
				<input type='text' class='form-control' value='<%= time %>' name='toc-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='toc-form1'>\
				</div>\
				"
				;
			if( data ){
				return ejs.render(str, data);
			}	else{
				return ejs.render(str, { 
					content:'', 
					time: vi2.observer.player.currentTime(),
					author: vi2.wp_user,
					date: (new Date().getTime())	 
				});	
			}	
		},
		
		
		/*
		*
		**/
		getAnnotationFormData : function( selector ){
			var obj = {};
			obj.content = $( selector ).find('[name="toc-entry"]').attr('value');
			obj.time = $( selector ).find('[name="toc-entry-time"]').attr('value');
			return obj;
		},
		
		
		/** 
		* Jumps to the next element of the table of content 
		*/
		nextElement : function(){
			//$('.toc-'+ (this.currentTocElement + 1) ).click();
			this.currentTocElement = this.currentTocElement < this.elements.length ? this.currentTocElement + 1 : this.currentTocElement;
			vi2.observer.player.currentTime( this.elements[ this.currentTocElement ] );
			vi2.observer.log({context:'toc',action:'jump-next',values:[this.currentTocElement]});
		},
		
		
		/** 
		* Jumps to the previous element of the table of content. 
		*/
		previousElement : function(){
			this.currentTocElement = this.currentTocElement === 0 ? this.currentTocElement : this.currentTocElement -1 ;
			vi2.observer.player.currentTime( this.elements[ this.currentTocElement ] );
			vi2.observer.log( {context:'toc',action:'jump-back',values: [this.currentTocElement ]} );
		}
		
	}); // end class
