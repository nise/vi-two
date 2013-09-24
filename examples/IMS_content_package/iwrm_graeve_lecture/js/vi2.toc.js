/*****************************************/
	/* TOC
	author: niels.seidel@nise81.com
	
	- highlight on skip
	- timeLineSelector
	- clip übergreifende sprünge
	 - nice defaults: var defaults = {animLen: 350}; options = $.extend(defaults, settings); 
	*/


	/** class TOC **/ 
	var TOC = $.inherit({

		/**/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'toc',
		options : {selector: '#toc', vizOnTimeline: true},
		player : null,
		timelineSelector : 'div.vi2-video-seek',

		/**/
		init : function(ann){
			var _this = this;
			var toc = $('<ul></ul>').addClass('toclist');
			var li = function(title, target, time){
				var a = $('<a></a>')
					.text(title)
					.attr('href', '#')
					.click(function(){
						_this.player.currentTime(time);
					});				
				return $('<li></li>').attr('id', 't'+target).html(a);
			};
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){
				if(val.type == 'toc'){
					toc.append(li(val.title+' ('+_this.formatTime(val.t1).replace(/-/, ':')+')', _this.formatTime(val.t1), val.t1));
					e.tags.push({name: val.title, occ:[val.t1]});
				}
			});
			this.showTimelineTOC(e);
			// sort list entries by time and append them
			toc.find('li').tsort({attr:"id"});
			$(_this.options.selector).html(toc);		
						
		},							
				
		/**/
		begin : function(e, id, obj){ 

			if(this.currImgId == obj.content.target){
				return false;
			}else{
				// reset highlight
				$(this.options.selector+' li').each(function(i){ $(this).removeClass('hightoc');})
				// highlight toc entry
				$(this.options.selector+' li#t'+this.formatTime(obj.content.target)).addClass('hightoc');
			}
		},
	
		/**/
		end : function(e, id){ },
		
		/**/
		showTimelineTOC : function(e){
			var _this= this; 
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name){
					var sp = $('<span></span>');					
					sp.addClass('timetag ttoc').attr('style','left:'+_left+'px;')
						.bind('mouseover', function(e){
							$(this).tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text(_name);} });
						});
					return sp;
				};
				//				
				$.each(e.tags, function(){ 
					var progress = this.occ[0] / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width());
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector).append(f(progress, this.name));
 				});
		},
		
		
		/**/		
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "-" + seconds;
		},
		
	}); // end class TOC
