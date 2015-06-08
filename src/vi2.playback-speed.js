/* Adjust Playback Speed
author: niels.seidel@nise81.com

todo:
- show speed changes on video frame

*/


var Vi2_PlaybackSpeed = $.inherit(/** @lends PlaybackSpeed# */{

	/** 
	*		@constructs 
	*		
	*/
	__constructor : function(options, observer) { 
			this.options = $.extend(this.options, options);
			this.observer = observer;
			this.player = this.observer.player;
			this.video = document.getElementById( this.options.video_selector ); 
			this.init();
	},
	
	name : 'playbackSpeed',
	options : {
		video_selector : 'video1',
		selector: '.control-bar',
		speed_steps: [0.3,0.5,0.8,1.0,1.5,2.0,3.0,4.0]	
	},
	speed : 1,
	observer : '',
	player : '',
	video : '',	
	speedIndex : 3,
	

	/* Initializes the playback speed controls */
	init : function(selector){ 
		var _this = this;
		var container = $('<div></div>')
			.append($('<div></div>').text('1.0x').addClass('speed-label'))
			.addClass('speed-controls')
			.bind('mouseenter', function(e){
				$('.speed-controls > ul').css('display','block');
			})
			.bind('mouseleave', function(e){
				$('.speed-controls > ul').css('display','none');
			})
			.tooltip({
				delay: 0, 
				showURL: false, 
				bodyHandler: function() { 
					return $('<span></span>')
						.text('Wiedergabegeschwindigkeit');
				} 
			})
			.appendTo( this.options.selector );
			
		var options = $('<ul></ul>')
			.addClass('select-speed')
			.appendTo(container);
		
		$.each( this.options.speed_steps, function(i, val){ 
			var sel = $('<li></li>')
				.attr('speed', val)
				.text(val+'x')
				.click(function(e){
					_this.setCurrentSpeed( $(this).attr('speed') );
				})
				.appendTo(options);
				
		})
	},
	
	/* */
	displaySpeed : function(){
		// need to be implemented
	},
	
	
	
	/**** INTERFACES **********/
	
	/* Returns the current playback speed*/
	getCurrentSpeed : function(){
		return this.speed;
	},
	
	/* Sets the playback speed */ 
	setCurrentSpeed : function(speed){ 
		if( this.options.speed_steps.indexOf( parseFloat(speed) ) != -1){
			// set speed
			this.video.defaultPlaybackRate = 1.0; 
			this.video.playbackRate = speed; 
			this.speed = speed;
			this.speedIndex = this.options.speed_steps.indexOf( parseFloat(speed) );
			// set label
			$('.speed-label').text( speed + 'x');
			// close select menu
			$('.speed-controls > ul').css('display','none');
			// log it
			vi2.observer.log( this.url + ' change_speed: ' + this.player.currentTime() + ' speed: ' + speed);
		}	
	},
	
	/* Increases the playback speed by one step in the index of the given values */
	increaseSpeed : function(){ 
		if( this.speedIndex < this.options.speed_steps.length ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex + 1 ] );
		}	
	},
	
	/* Decreases the playback speed by one step in the index of the given values */
	decreaseSpeed : function(){ 
		if( this.speedIndex > 1 ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex -1 ] );
		}	
	}
	
	
}); // end class
	
