/* Comments
	author: niels.seidel@nise81.com
	
	- highlight on skip
	- timeLineSelector
	- clip übergreifende sprünge
	 - nice defaults: var defaults = {animLen: 350}; options = $.extend(defaults, settings); 
	*/


	/* class Comments **/ 
	var Comments = $.inherit(Annotation, /** @lends Comments# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'comments',
		type : 'annotation',
		options : {selector: '#comments', vizOnTimeline: true, path: '/'},
		player : null,
		timelineSelector : 'div.vi2-video-seek',

		/* ... */
		init : function(ann){ 
			var _this = this;
			var comments = $('<ul></ul>').addClass('commentslist');
			$(this.options.selector).html(comments); 
			var li = function(author, title, target, time){
				var a = $('<a></a>')
					.text(title)
					.addClass('id-'+time)
					//.attr('href', '#'+vi2.options.id)
					.click(function(){
						vi2.observer.log('clickcommentfromlist:'+title +' '+author+' '+time);
						_this.player.currentTime(time);
					});	
				var user = vi2.db.getUserById(author);				
				return $('<li></li>')
					.addClass('list-item')
					.attr('author', author)
					.attr('id', 't'+target)
					.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text('Kommentar von '+user.firstname+' '+user.name);} })
					.css('list-style-image',  "url('"+_this.options.path+"user-"+author+".png')")
					.html(a);
			}; 
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){
				if(val.type == 'comment'){  
					comments.append(li(val.author, val.title, _this.formatTime(val.t1), val.t1));
					e.tags.push({name: val.title, occ:[val.t1]}); 
				}
			});

			this.showCommentsOnTimeline(e);
			// sort list entries by time and append them
			comments.find('li').tsort({attr:"id"}); 			
		},	
		
					/* -- */
		//<div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		//
		appendToDOM : function(id){ 
			var _this = this;
			$(vi2.dom).find('[type="comments"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getCommentsById(id), function( i, val ){ 
				var comm = $('<div></div>')
					.attr('type',"comments")
					.attr('starttime', val.start)
					.attr('duration', 10)
					.attr('author', val.author)
					.attr('date', val.date)
					.attr('id', "")
					.text(decodeURIComponent(val.comment))
					.appendTo( vi2.dom )
					;  
			});
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
		showCommentsOnTimeline : function(e){
			if(! this.options.vizOnTimeline ){ return; }
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
