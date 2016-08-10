/* 
* name: Vi2.Playbackspeed
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
* - show speed changes on video frame when they get changed with keyboard commands
*/


Vi2.PlaybackSpeed = $.inherit(/** @lends Vi2.PlaybackSpeed# */{

	/** 
	*	@constructs 
	*	@param options {object}
	* @param options.selector {String} 
	* @param options.videoSelector {String} 	
	* @param options.speed_steps {Array} Float array with the available steps to increase or decrease the playback speed 
	*/
	__constructor : function(options) { 
			this.options = $.extend(this.options, options);
			this.video = document.getElementById( this.options.videoSelector );
	},
	
	name : 'playbackSpeed',
	type : 'player-widget',
	options : {
		selector: '.control-bar',
		videoSelector : 'video1',
		speed_steps: [0.3,0.5,0.7,1.0,1.5,1.7,2.0]//[0.3,0.5,0.8,1.0,1.5,2.0,3.0,4.0]	
	},
	speed : 1, // default speed
	video : '',	
	speedIndex : 3,
	

	/** 
	*	Initializes the playback speed controls 
	*/
	init : function(selector){  
		var _this = this;
		// clear selector
		$( this.options.selector + '> .vi2-speed-controls' ).remove();
		
		var container = $('<div></div>')
			.append($('<div></div>').text('1.0x').addClass('speed-label'))
			.addClass('vi2-speed-controls')
			.bind('mouseenter', function(e){
				$('.vi2-speed-controls > ul').css('display','block');
			})
			.bind('mouseleave', function(e){
				$('.vi2-speed-controls > ul').css('display','none');
			})
			/*.tooltip({
				delay: 0, 
				showURL: false, 
				bodyHandler: function() { 
					return $('<span></span>')
						.text('Wiedergabegeschwindigkeit');
				} 
			})*/
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
				
		});
	},
	
	
	/** 
	* Shows the currently changed speed option inside the video frame. This indicator disappears after a few seconds
	*/
	displaySpeed : function(){
		// need to be implemented
	},
	
	
	/** 
	* Interface that returns the current playback speed
	*/
	getCurrentSpeed : function(){
		return this.speed;
	},
	
	
	/** 
	* Interface to sets the playback speed
	*	@param speed {Number} 	 
	*/ 
	setCurrentSpeed : function(speed){ 
		if( this.options.speed_steps.indexOf( parseFloat(speed) ) !== -1){
			// log event
			vi2.observer.log({context:'playbackSpeed', action:'change-speed', values:[this.speed, speed]});
			// set speed
			this.video.defaultPlaybackRate = 1.0; 
			this.video.playbackRate = speed; 
			this.speed = speed;
			this.speedIndex = this.options.speed_steps.indexOf( parseFloat(speed) );
			// set label
			$('.speed-label').text( speed + 'x');
			// close select menu
			$('.vi2-speed-controls > ul').css('display','none');
		}	
	},
	
	
	/**
	* Interface to increases the playback speed by one step in the index of the given values 
	*/
	increaseSpeed : function(){ 
		if( this.speedIndex < this.options.speed_steps.length ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex + 1 ] );
		}	
	},
	
	
	/** 
	* Interface to decreases the playback speed by one step in the index of the given values 
	*/
	decreaseSpeed : function(){ 
		if( this.speedIndex > 1 ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex -1 ] );
		}	
	}
	
	
}); // end class
	
