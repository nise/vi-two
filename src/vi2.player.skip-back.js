/* 
* name: Vi2.SkipBack
* author: niels.seidel@nise81.com
* license: BSD New
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
		
		name : 'temoral bookmarks',
		type : 'player-widget',
		options : {
			selector : '.control-bar',
			label : 'skip back',
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
					.addClass('vi2-skipback-label')
				)
				.addClass('vi2-skipback-controls vi2-btn')
				.bind('click', function(e){
					vi2.observer.player.currentTime( vi2.observer.player.currentTime() - _this.options.step ); 
				})
				.appendTo( this.options.selector );
		}
}); // end class  
