/* 
*	name: Vi2.UserTraces
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*/


	/* class Traces **/ 
	var Traces = $.inherit(/** @lends Traces# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
  			
		},
		
		name : 'traces',
		options : {selector: '#toc', vizOnTimeline: true},
		timelineSelector : 'vi2-video-seek',
	
		/* ... */
		init : function(){
			$(main.player).bind('log', function(){
				alert();
			});
					
		},		
		
		/* ... */
		showOnTimeline : function(e){
		
			
				var _this= this; 
				$(_this.timelineSelector+' .timetag').remove();
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name, start){
					var sp = $('<span></span>');					
					sp.addClass('timetag tlink').attr('style','left:'+_left+'px;')
						.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text(_name);} })
						.bind('click', function(event){
							_this.player.currentTime(start);
							main.log(_this.player.url+' timeline_link_seek: '+start);
						});
					return sp;
				};
				//				
				$.each(e.tags, function(){ 					
					var progress = this.occ[0] / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width()); 
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector+'link').append(f(progress, this.name, this.occ[0]));
 				});
		},
		
		fin : function(){}
				
	
		
	}); // end class Log
