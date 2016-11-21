/* 
* name: Vi2.Zoom
* author: niels.seidel@nise81.com
* license: MIT License
* description: Allows to zoom the video in and out.
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	 - jquery.panzoom.js
* todo:
*  - needs event logging
*/


Vi2.Zoom = $.inherit(/** @lends Vi2.Zoom# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'zoom',
		type : 'player-widget',
		options : {
			videoSelector : '#video1',
			controlSelector : '.control-bar',
			hasControls : true,
			hasReset : true,
			haseSlider : true,
			min : 1,
			max : 4,
			steps : 0.25
		},

		/**
		* Initializes the control elements including the plugin panzoom
		*/
		init : function(){
		
			// clear selector
			$( this.options.controlSelector + '> .zoom-controls' ).remove();
		
			// add controls
			var container = $('<div></div>')
				.addClass('zoom-controls')
				.appendTo( this.options.controlSelector );
			
			if( this.options.hasSlider ){
				var range = $('<input></input>')
					.attr('type','range')
					.addClass('vi2-zoom-range')
					.appendTo( container )
				;
			}
			
			if( this.options.hasControls ){
				var btn_out = $('<button></button>')
					.text('-')
					.addClass('vi2-zoom-out')
					.prependTo( container )
				;
				var btn_in = $('<button></button>')
					.text('+')
					.addClass('vi2-zoom-in')
					.appendTo( container )
				;
			}
			
			if( this.options.hasReset ){
				var btn_reset = $('<button></button>')
					.text('reset')
					.addClass('vi2-zoom-reset')
					.appendTo( container )
				;
			}
		
		  // start panzoom with the given options
			var panzoom = $( this.options.videoSelector ).panzoom({
				cursor: "move",
				increment: this.options.steps,
				minScale: this.options.min,
				maxScale: this.options.max,
				rangeStep: this.options.steps,
				transition: true,
				duration: 200,
				easing: "ease-in-out",
				$zoomIn: $('.vi2-zoom-in'),
				$zoomOut: $('.vi2-zoom-out'),
				$zoomRange: $('.vi2-zoom-range'),
				$reset: $('.vi2-zoom-reset'),
				focal: {
				    clientX: 108,
				    clientY: 132
				}
			});
		}
}); // end class  
