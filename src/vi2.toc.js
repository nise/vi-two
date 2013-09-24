	/* TOC
	author: niels.seidel@nise81.com
	
	- highlight on skip ... this.player.video.addEventListener('timeupdat
	- timeLineSelector
	- clip übergreifende sprünge
	*/


	/* class TOC **/ 
	var TOC = $.inherit(Annotation, /** @lends TableOfContents# */{ // 

		/** @constructs
		*		@extends Annotation
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'toc',
		type : 'annotation',
		options : {selector: '#toc', vizOnTimeline: true},
		player : null,
		timelineSelector : 'div.vi2-video-seek',

		/* ... */
		init : function(ann){ 
			var _this = this;
			var toc = $('<ul></ul>').addClass('toclist'); 
			var li = function(title, target, time){ 
				var a = $('<a></a>')
					.text(title)
					.attr('href', '#!' + vi2.current_stream) // former: main.options.id
					.click(function(){ 
						_this.player.currentTime(time);
					});				
				return $('<li></li>').attr('id', 't'+target).html(a);
			};
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){
				if(val.type == 'toc'){
					toc.append(li(val.title /* +' ('+_this.formatTime(val.t1).replace(/-/, ':')+')'*/, val.t1, val.t1));
					e.tags.push({name: val.title, occ:[val.t1]});
				}
			});

			this.showTimelineTOC(e);
			// sort list entries by time and append them
			//toc.find('li').tsort({attr:"id"});  // tsort is error prune under chromium
			$(_this.options.selector).html(toc);		
					
			// update toc highlight on time update
			this.player.video.addEventListener('timeupdate', function(e) { 
				// reset highlight
		//		$(_this.options.selector+' li').each(function(i, val){ $(this).removeClass('hightoc');})
				// highlight toc entry
		//		$(_this.options.selector+ ' li#t'+this.formatTime(obj.content.target)).addClass('hightoc');
			});
			
		},		
		
		
		/* -- */
		//<div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		appendToDOM : function(id){ 
			var _this = this;
			var tocs = [];
			$.each(	vi2.db.getTocById(id), function( i, val ){
				var toc = $('<div></div>')
					.attr('type',"toc")
					.attr('starttime', val.start)
					.attr('duration', 10)
					.attr('id', "")
					.text(val.label)
					.appendTo( vi2.dom )
					;
			});
		},					
				
		/* ... */
		begin : function(e, id, obj){ 

				// reset highlight
				$(this.options.selector+' li').each(function(i, val){ $(this).removeClass('hightoc');})
				// highlight toc entry
				$(this.options.selector+ ' li#t'+this.formatTime(obj.content.target)).addClass('hightoc');
			
		},
	
		/* ... */
		end : function(e, id){ },
		
		/* ... */
		showTimelineTOC : function(e){
			var _this= this; 
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name){
					return sp = $('<span></span>')					
						.addClass('timetag ttoc').attr('style','left:'+_left+'px;')
						.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text(_name);} });
				};
								
				$.each(e.tags, function(){ 
					var progress = this.occ[0] / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width());
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector).append(f(progress, this.name));
 				});
		},
		
		
		/* ... */		
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "" + seconds;
		}
		
	}); // end class TOC
