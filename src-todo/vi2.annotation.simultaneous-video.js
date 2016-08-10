/* 
*	name: Vi2.SyncVideo
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*/

	/* class SimultaneousVideo **/ 
	var Seqv = $.inherit(/* @lends SimultaneousVideo# */{

		/* @constructs */
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
  		
  		// init widget if main player is ready
  		$(main).bind('player.ready', function(e, id, i){ main.widget_list['seqv'].init(); });
 // 		$(main).bind('player.update', function(e, id){ main.widget_list['seqv'].updateTime(); });
		},
		
		name : 'seqv',
		// defaults
		options : {selector: '#screen', controls: true, path: '', width:400, height:300},
		player : null,
		timelineSelector : 'div.vi2-video-seek',
		video : '',

		/* ... */
		init : function(){ 
			this.loadVideo(this.options.path, 0); 
		},
		
		/* ... */
		loadVideo : function(url, seek) { 
			var _this = this; 
			this.video = $.extend(document.createElement('video'), {
				loop: false,
	  		preload: true,
	  		autoplay: false, 
	  		controls: false,  
	  		poster: "img/placeholder_slides.jpg",
	  		width: this.options.width,
	  		height: this.options.height,
	  		onerror: function(e){ _this.errorHandling(e); },
				oncanplay: function(e) {  
					

				},
				readyState: function(){
				}
			}); 
			
	  	$(this.video).html(this.createSource(url, 'video/ogg; codecs="theora, vorbis"')); 
			$(this.options.selector).html(this.video).append($('<div></div>').attr('id', 'overlay').css({position:'relative'}));
			//this.video.load();
			
			// control hook event bindings
			$(main.player).bind('player.play', function(e){ _this.video.play();  });
			$(main.player).bind('player.pause', function(e){ _this.video.pause(); });
			$(main.player).bind('player.slowupdate', function(e, main_player_current_time){ 
				//$(_this.video).attr('currentTime', main_player_current_time); 
				_this.video.currentTime = main_player_current_time; // buggy
			});
		},
		
		/* ... */
		createSource : function(src, type) {
  		var source = document.createElement('source');
  		source.src = src;
  		source.type = type;
  		return source;
		},
		
		/* ... */
		updateTime : function(e, t){
			this.video.currentTime = 1000;
//			$('#debug').append(t+'  ,');
		},
								
		/* ... */
		begin : function(e, id, obj){ 
			//
		},
	
		/* ... */
		end : function(e, id){
//			$(this.options.selector+' .ov-'+id).remove();
		},
		
	/* ... */
	width : function(x){
		if(x == null){ 
			return this.video.width;
		}else{
			this.video.width = x;
		}
	},
	
	/* ... */
	height : function(x){
		if(x == null){ 
			return this.video.height;
		}else{
			this.video.height = x;
		}
	},
		
		/* ... */
		relativePos : function(obj){
			return {x: Math.floor((obj.x/100)*this.player.width()), y: Math.floor((obj.y/100)*this.player.height())};
		},
		
		/* ... */
  	xxxloadVideo : function(url, seek){
	  	this.player.loadVideo(url, seek);  			
  	}
  	
  	
	}); // end class Seq


