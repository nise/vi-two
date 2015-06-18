/* 
* name: Vi2.TableOfContent
* author: niels.seidel@nise81.com
* license:
* description:
* depends on:
*  - embedded java script
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - highlight on skip ... this.player.video.addEventListener('timeupdat
*  - realize a toc for concatinated video clips
*/


Vi2.TableOfContents = $.inherit(Annotation, /** @lends Vi2.TableOfContents# */{ // 

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
			timelineSelector : '.vi2-video-seek',
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
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(annotations, function(i, val){
				if(val.type == 'toc'){ 
					if( val.note !== "missing"){
						_this.elements.push(val.t1);
					}	
					e.tags.push({name: val.title, occ:[val.t1]});
				}
			});
			// 
			if( this.options.hasMenu ){
				this.buildMenu(e.tags)
			}	
			// 
			if( this.options.hasTimelineMarker ){
				this.buildTimelineMarkers(e);
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
		Loads toc data from database in order to generate corresponding DOM elements.
		@ Resulting format of DOM element: <div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		*/
		appendToDOM : function(id){ 
			var _this = this; 
			$(vi2.dom).find('[type="toc"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getTocById(id), function( i, val ){  
				var toc = $('<div></div>')
					.attr('type',"toc")
					.attr('note', val.note )
					.attr('starttime', val.start)
					.attr('duration', 10)
					.attr('author', 'none')
					.attr('id', "")
					.text( decodeURIComponent(val.label) )
					.appendTo( vi2.dom )
					;
			});
		},					
				
		/** 
		During the playback corresponding toc entries will be highlighted.
		*/
		begin : function(e, id, obj){ 
				// reset highlight
				$(this.options.menuSelector+' li').each(function(i, val){ $(this).removeClass('toc-highlight') ;})
				// highlight toc entry
				$('.toc-'+obj.displayPosition.t1).addClass('toc-highlight');
			
		},
	
		/** 
		Terminates time-depended toc entries
		*/
		end : function(e, id, obj){ 
			//$('.toc-'+obj.displayPosition.t1).removeClass('toc-highlight');
		},
		
		
		/**
		Builds a list menu of all entries of the table of content
		*/
		buildMenu : function(tocData){
			var _this = this;
			var toc = $('<ul></ul>').addClass('toc-list'); 
			
			$.each(tocData, function(i, val){
					var a = $('<a></a>')
					.text( val.name )
					.addClass('id-'+ val.occ[0])
					.attr('href', '#!t=npt:' + val.occ[0] + '') // former: main.options.id
					;				
					var li = $('<li></li>')
						.addClass('toc-'+val.occ[0])
						.attr('id', ''+ i)
						//.css('list-style-image',  "url('"+_this.options.path+"user-"+val.author+".png')")
						.html(a)
						.appendTo( toc )
						; 
					if( val.note === "missing"){
						li.addClass('toc-disabled');
					}else{
						li.click(function(){
							vi2.observer.log('clicktocfromlist:'+val.name.replace(/,/g,'##') +' '+val.author+' '+ val.occ[0]); 
							vi2.observer.player.currentTime( val.occ[0] );
							_this.currentTocElement = i;
						});	
					}	
			});
			
			
			// sort list entries by time and append them
			toc
				.find('li').tsort( { attr:"id" } )  // tsort is error prune under chromium
				.appendTo( this.options.menuSelector )		
			
		},
		
		
		/** 
		Displays a table of content as markers on the timeline
		@todo this function could to be moved to the player or separated into a timeline class
		*/
		buildTimelineMarkers : function(tocData){  
			var _this= this; 
				// display toc occurence on timeline to motivate further selection
				var f = function(_left, _name){ 
					return sp = $('<span></span>')					
						.addClass('toc-timeline-marker ttoc')
						.attr('style','left:'+_left+'px;')
						.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text(_name);} });
				};
								
				$.each(tocData, function(i, val){ 
					var progress = this.occ[0] / vi2.observer.player.duration();
					progress = ((progress) * $(_this.options.timelineSelector).width());
  	    	if (isNaN(progress) || progress > $(_this.options.timelineSelector).width()) { return;}
	 				$(_this.options.timelineSelector).append(f(progress, val.name));
 				});
		},
		
		
		/** 
		Jumps to the next element of the table of content 
		*/
		nextElement : function(){
			//$('.toc-'+ (this.currentTocElement + 1) ).click();
			this.currentTocElement = this.currentTocElement < this.elements.length ? this.currentTocElement + 1 : this.currentTocElement;
			vi2.observer.player.currentTime( this.elements[ this.currentTocElement ] );
			//
		},
		
		
		/** 
		Jumps to the previous element of the table of content. 
		*/
		previousElement : function(){
			this.currentTocElement = this.currentTocElement == 0 ? this.currentTocElement : this.currentTocElement -1 ;
			vi2.observer.player.currentTime( this.elements[ this.currentTocElement ] );
		}
		
	}); // end class
