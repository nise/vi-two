/* 
* name: Vi2.AnnotatedTimline
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* related code:		
	- timeline preview: https://github.com/brightcove/videojs-thumbnails/blob/master/videojs.thumbnails.js

* todo:
*   - cluster / zoom : - Vergleiche Darstellung von sehr vielen Markern bei Google Maps ...
		- diagramm (?)
		- filter
		- multi tracks
		- add slide preview
		- bug: previw is not exact and is loading very slow

*/


Vi2.AnnotatedTimeline = $.inherit(/** @lends Vi2.TableOfContents# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(video, options, seek) { 
  			this.video = video;
  			this.options = $.extend(this.options, options);  
  			this.seek = seek === undefined ? 0 : seek;
  			this.init();
		},
		
		name : 'annotated timeline',
		type : 'core',
		options : {
			timelineSelector : '.vi2-timeline-main',
			hasPreview : false,
			hasSlidePreview: false,
			previewPath : '/static/img/video-stills/theresienstadt/still-image-',
			hasMarker : true,
			path:'/'
		},
		video : null,
		seek : 0,
		seeksliding: false,
		video_seek: null,  
		
		video_loading_progress: null,
		video_timer: null,
		interval: 0,
		percentLoaded:0,
		video_container: null,
		cursorX : 0,

		/**
		Initializes the table of content and handles options
		*/
		init : function(annotations){
			var _this = this;
			// init
			this.video_seek = $( this.options.timelineSelector );
			this.video_loading_progress = $('.vi2-timeline-progress');
			this.video_timer = $('.vi2-video-timer'); // could become an option
		
			if( this.options.hasPreview ){
				this.createTimelineVideoPreview();
			}
			
			if( this.options.hasSlidePreview ){
				this.createTimelineSlidePreview();
			}		
		
			// initiate event listeners, vi2.observer.log('loadingtime--video:'+url);
			var 
				t0 = 0, 
				t1 = 0
				;
			this.video.onloadstart = function(e){
				// 1. event called 
				t0 = Date.now();
			};
			this.video.ondurationchange = function(){ 
				// 2. event called
				t1 = ( Date.now() - t0 );
				//console.log('duration '+ ( Date.now() - t0 ) );
				_this.handleDurationChange();  
			}; 
			this.video.onloadedmetadata = function(e){ 
				// 3. event called
				//console.log('load meta '+ ( Date.now() - t0 ) );  
			};
			this.video.onloadeddata = function(e){ 
				// 4. event called
				vi2.observer.log({context:'player', action:'video-loading-time', values:[t1, ( Date.now() - t0 )]});
				//console.log('load data '+ ( Date.now() - t0 ) ); 
			};
			this.video.onprogress = function(e){ 
				// 5. event called  
			};
			this.video.oncanplay = function(e){ 
				// 6. event called
				//console.log('can play '+ ( Date.now() - t0 ) );  
			};
			this.video.oncanplaythrough = function(e){ 
				// 7. event called
				//console.log('can play through '+ ( Date.now() - t0 ) ); 
			};
			
			
			this.video.addEventListener('timeupdate', function(e){ 
				_this.handleTimeupdate(e); 
			});
			
		},		
		
		/** 
		* Creates a timeline slider to seek within the playback time 
		*/
		createTimelineControl : function() { 
			var _this = this;
			//
			/*if (this.video.readyState) {  
				clearInterval(this.interval);
				clearInterval(this.interval);*/
				//var video_duration = _this.video.duration; //$(this.options.selector).attr('duration');
				this.video_seek.slider({
					value: 0,
					step: 0.01,
					orientation: 'horizontal',
					range: 'min',
					max: vi2.observer.player.duration(),
					animate: false,
				  slide: function(event, ui) { 
							_this.seeksliding = true;
					},
					start: function(event, ui) { 
						vi2.observer.log({context:'player',action:'seek-start',values: [ui.value]} );
						_this.buffclick++;
						_this.seeksliding = true;
					},
					stop: function(event, ui) { 
						vi2.observer.log({context:'player',action:'seek-stop',values:[ui.value]}	);
						_this.seeksliding = false;
						//if(_this.percentLoaded > (ui.value / _this.duration())){
						vi2.observer.player.currentTime( parseFloat(Math.ceil(ui.value)) ); // XXX bugy / webkit fix
					}
					
				});
				
			/*} else {
				// try reinitiate the slider as long the ...? 
				this.interval = setInterval(function() { _this.createTimelineControl(); }, 150);
			}*/
		
		},
		
		
		/*
		* Add Video preview on timeline
		* todo: event could be logged
		**/
		createTimelineVideoPreview : function(){ 
			var 
					_this = this,
					width = $( this.options.timelineSelector ).width(),
					left = ($( this.options.timelineSelector )).offset().left,
					t = 1,
					o = null
					;
			
			var img = new Image();
			img.id = 'videopreview';//);//.attr('src', _this.options.previewPath + "001.jpg");
			var timeline_preview = $('<div></div>')
				.addClass('vi2-timeline-preview')
				.html( img )
				.appendTo( _this.options.timelineSelector );
			
			// event
			var handleTimelineMoves = function(event){ 
					$( timeline_preview ).css({ left: (event.pageX - 100) });
					t = (Math.round( ( event.pageX / width ) * vi2.observer.player.duration() ) - 20); // correction value is unclear
					o = new Image();
					img_selector = document.getElementById("videopreview");
					listener = function(event2){
						img_selector.src = o.src; 
					};
					o.removeEventListener('load', listener, false);
					o.addEventListener('load', listener, false); 
					o.src = _this.options.previewPath + "" + t + ".jpg";//  + "?_=" + (+new Date());
					o.onerror = function () { this.style.display = "none"; };
			};			
			var el = document.getElementsByClassName( 'vi2-timeline-main' );
			el[0].removeEventListener('mousemove', handleTimelineMoves );
			el[0].addEventListener('mousemove', handleTimelineMoves );
		},
		

		/*
		* Add Video preview on timeline
		* todo: event could be logged
		**/
		createTimelineSlidePreview : function(){ 
			var 
					_this = this,
					width = $( this.options.timelineSelector ).width(),
					left = $( this.options.timelineSelector ).offset().left,
					t = 1,
					o = null
					;
			var timeline_preview = $('<div></div>')
				.addClass('vi2-timeline-preview')
				.appendTo( this.options.timelineSelector );
			
			// event			
			var el = document.getElementsByClassName( 'vi2-timeline-main' );
			el[0].addEventListener('mousemove', function(event){ 
					$( timeline_preview ).css({ left: (event.pageX - 100) });
					t = (Math.floor( ( vi2.observer.player.duration() / width ) * Math.floor(event.pageX) )).toString();
					
					o = new Image();
					o.src = _this.options.previewPath + "" + t + ".png";
					listener = function(event2){
						$( timeline_preview )
							//.css({ left: (event.pageX - 100) })
							.html(o);
					};
					o.removeEventListener('load', listener, true);
					o.addEventListener('load', listener, true); 
			}, false);
		},
	
		
		/** 
		* Displays markers on the timeline
		* options: hasTooltip, clickable, type, 
		*/
		addTimelineMarkers : function(type, data, timelineSelector){   
			var _this= this; 
			if( timelineSelector === undefined ){
				timelineSelector = this.options.timelineSelector;
			}
			this.options[ type ] = { markerHasTooltip: true, markerIsClickable:true };
			var timeline = $( timelineSelector );
			
			// remove existing markes of the same type before rewriting them
			$('.'+type + '-timeline-marker').each(function(i, val){ $(val).remove(); });
			
			$.each( data, function(i, val){ 
				var progress = val.occ[0] / vi2.observer.player.duration();
				progress = ((progress) * $( timelineSelector ).width());
	    	if (isNaN(progress) || progress > $( timelineSelector ).width()) { return;}
	    	
	    	var sp = $('<a></a>')			// $('<span></span>');		
					.addClass( type + '-timeline-marker ttoc')
					.attr('style','left:'+ progress +'px;')
					;
				if( _this.options[ type ].markerHasTooltip){
					sp
						.attr('title', val.name)
						.attr('data-toggle', 'tooltip');
				}	
				if( _this.options[ type ].markerIsClickable ){	
					sp.bind('click', function(event){ 
							vi2.observer.player.currentTime( val.occ[0] );
							// xxx bug for type === assessment !!! todo
							vi2.observer.log( {context:type, action:'timeline-link-click',values:[val.name,val.author,val.occ[0]]});
					});
				}
 				timeline.append(sp); // val.title
			});
		},
		
				
		/*
		* Event is called when the total playback time has been determined
		**/
		handleDurationChange : function(e) { 
			this.createTimelineControl(); 
			//if( $(_this.options.selector).attr('duration') != undefined )  
			 
			 	vi2.observer.player.currentTime( this.seek );
				$(vi2.observer).trigger('player.ready', [vi2.observer.player.seqList[vi2.observer.player.seqNum].id, vi2.observer.player.seqNum]);
				
			
			/*if (Number(this.seek) > 0) { 
				if(this.percentLoaded > (this.seek / this.duration())){
					//this.currentTime(seek); // bugy in production use or on remote sites
					vi2.observer.player.currentTime( this.seek );
					$(vi2.observer).trigger('player.ready', [vi2.observer.player.seqList[vi2.observer.player.seqNum]['id'], vi2.observer.player.seqNum]);
				}
			}*/
			 	
		},
		
		
		/*
		* Event is called during the videos is buffering
		**/
		handleProgress : function (e) {
			//_this.setProgressRail(e);
			var
				target = this.video;//(e != undefined) ? e.target : this.video,
				percent = null;			

			if (target && target.buffered && target.buffered.length > 0 && target.buffered.end && target.duration) {
				percent = target.buffered.end(0) / target.duration;
			} else if (target && target.bytesTotal !== undefined && target.bytesTotal > 0 && target.bufferedBytes !== undefined) {
				percent = target.bufferedBytes / target.bytesTotal; 
			} else if (e && e.lengthComputable && e.total !== 0) {
				percent = e.loaded/e.total;
			}

			if (percent !== null) {
				this.percentLoaded = percent;
				percent = Math.min(1, Math.max(0, percent));
				
				if (this.video_loading_progress && this.video_seek) {
					this.video_loading_progress.width(this.video_seek.width() * percent);
				}
			}
			
		},


		/*
		* Event is called every time when the playback time changes
		**/
		handleTimeupdate : function(e) { 
			if (!this.seeksliding) {
				this.video_seek.slider('value', vi2.observer.player.currentTime() ); // / vi2.observer.player.duration()
			}
			//this.video_timer.text( vi2.utils.seconds2decimal( vi2.observer.player.currentTime() ) + ' / ' + vi2.utils.seconds2decimal( vi2.observer.player.duration() ));
		},
		
		
		/**/
		pixelInTime : function(){}
		
		
	
		
	/* -- 
		setCurrentRail: function(e) {

			var t = this;
		
			if (t.media.currentTime != undefined && t.media.duration) {

				// update bar and handle
				if (t.total && t.handle) {
					var 
						newWidth = t.total.width() * t.media.currentTime / t.media.duration,
						handlePos = newWidth - (t.handle.outerWidth(true) / 2);

					t.current.width(newWidth);
					t.handle.css('left', handlePos);
				}
			}

		}	*/
		
	}); // end class
