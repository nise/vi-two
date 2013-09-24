/* Comments
	author: niels.seidel@nise81.com
	
	- highlight on skip
	- timeLineSelector
	- clip übergreifende sprünge
	 - nice defaults: var defaults = {animLen: 350}; options = $.extend(defaults, settings); 
	*/


	/* class Comments **/ 
	var Comments = $.inherit(/** @lends Comments# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options);
		},
		
		name : 'comments',
		options : {selector: '#comments', vizOnTimeline: true},
		player : null,
		timelineSelector : 'div.vi2-video-seek',

		/* ... */
		init : function(ann){ 
			var _this = this;
			var comments = $('<ul></ul>').addClass('commentslist'); 
			var li = function(author, title, target, time){
				var a = $('<a></a>')
					.text(author+': '+title)
					.attr('href', '#'+main.options.id)
					.click(function(){
						_this.player.currentTime(time);
					});				
				return $('<li></li>').attr('id', 't'+target).html(a);
			};
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){
				if(val.type == 'comment'){
					comments.append(li(val.author, val.title /* +' ('+_this.formatTime(val.t1).replace(/-/, ':')+')'*/, _this.formatTime(val.t1), val.t1));
					e.tags.push({name: val.title, occ:[val.t1]});
				}
			});

			this.showTimelineComments(e);
			// sort list entries by time and append them
			comments.find('li').tsort({attr:"id"}); 
			$(_this.options.selector).html(comments);		
						
		},							
				
		/* ... */
		begin : function(e, id, obj){ 

			if(this.currImgId == obj.content.target){
				return false;
			}else{
				// reset highlight
				$(this.options.selector+' li').each(function(i){ $(this).removeClass('highcomment');})
				// highlight comment entry
				$(this.options.selector+' li#t'+this.formatTime(obj.content.target)).addClass('highcomments');
			}
		},
	
		/* ... */
		end : function(e, id){ },
		
		/* ... */
		showTimelineComments : function(e){
			var _this= this; 
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name){
					var sp = $('<span></span>');					
					sp.addClass('timetag ttoc').attr('style','left:'+_left+'px;')
						//.bind('mouseover', function(e){
						.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text("hall");} });
						//});
					return sp;
				};
				//				
				$.each(e.tags, function(i, val){ 
					var progress = this.occ[0] / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width());
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector).append(f(progress, val.title));
 				});
		},
		
		
		/* ... */		
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "-" + seconds;
		}
		
	}); // end class Comments
