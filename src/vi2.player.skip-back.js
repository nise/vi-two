/* 
* name: Vi2.SkipBack
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - 
*/


Vi2.SkipBack = $.inherit(/** @lends Vi2.SkipBack# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'skipBack',
		type : 'player-widget',
		options : {
			selector : '.control-bar',
			label : '',
			step : 5 // in seconds
		},

		/**
		* Initializes the skip back button of content and handles options
		*/
		init : function(){  
			// clear selector
			$( this.options.selector + '> .vi2-skipback-controls' ).remove();
		
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>')
					.text( this.options.label )
					.addClass('vi2-skipback-label glyphicon glyphicon-step-backward')
				)
				.addClass('vi2-skipback-controls vi2-btn')
				.attr('title', this.options.step+'s zurückspringen')
				.bind('click', function(e){ 
					var current = vi2.observer.player.currentTime();
					var next = Number(Number(current) - Number(_this.options.step));
					
					vi2.observer.log({context:'skipBack',action:'skip-back',values: [current, String(next) ]});
					vi2.observer.player.currentTime( next ); 
				})
				.prependTo( this.options.selector );
		}
}); // end class  
