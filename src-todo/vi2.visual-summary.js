/* 
* name: Vi2.VisualSummary
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - finish: http://stackoverflow.com/questions/10136232/using-javascript-jquery-to-access-picture-content-for-a-frame-in-a-video
*	 - 
*/


Vi2.VisualSummary = $.inherit(/** @lends Vi2.VisualSummary# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {String} ...
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'visual summary',
		type : 'misc',
		options : {
			selector : '.control-bar',
			shareLink : true,
			shareEmbedLink: true,
			label: '</>'
		},
	
		/**
		* Creates an control element to allow users to share the video 
		*/
		init: function(){
			var _this = this;
			
			var url = window.location.href.slice(window.location.href.indexOf('#') + 1);
			
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>').text( this.options.label ).addClass('sharing-label'))
				.addClass('vi2-sharing-controls')
				.bind('mouseenter', function(e){
					
				})/*
				.bind('mouseleave', function(e){
					$('.sharing-controls > .select-sharing').css('display','none');
				})*/
				.appendTo( this.options.selector );
			
			
		}	
}); // end class
