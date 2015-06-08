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
		options : {selector: '#toc', vizOnTimeline: true, path:'/'},
		player : null,
		timelineSelector : 'div.vi2-video-seek',
		currentTocElement : 0,
		elements : [],

		/* ... */
		init : function(ann){ 
			var _this = this;
			var toc = $('<ul></ul>').addClass('toclist'); 
			
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){
				if(val.type == 'toc'){ 
					var a = $('<a></a>')
					.text( val.title )
					.addClass('id-'+ val.t1)
					.attr('href', '#!t=npt:' + val.t1 + '') // former: main.options.id
					;				
					var li = $('<li></li>')
						.addClass('toc-'+val.t1)
						.attr('id', ''+ i)
						//.css('list-style-image',  "url('"+_this.options.path+"user-"+val.author+".png')")
						.html(a)
						.appendTo( toc ); 
					if( val.note === "missing"){
						li.addClass('toc-disabled');
					}else{
						_this.elements.push(val.t1);
						li
							.click(function(){
								vi2.observer.log('clicktocfromlist:'+val.title.replace(/,/g,'##') +' '+val.author+' '+ val.t1); 
								_this.player.currentTime( val.t1 );
								_this.currentTocElement = i;
							});	
					}	
					
					e.tags.push({name: val.title, occ:[val.t1]});
				}
			});

			this.showTimelineTOC(e);
			// sort list entries by time and append them
			toc.find('li').tsort({attr:"id"});  // tsort is error prune under chromium
			$(_this.options.selector).html(toc);		
					
			// update toc highlight on time update
			this.player.video.addEventListener('timeupdate', function(e) { 
				// reset highlight
		//		$(_this.options.selector+' li').each(function(i, val){ $(this).removeClass('hightoc');})
				// highlight toc entry
		//		$(_this.options.selector+ ' li#t'+this.formatTime(obj.content.target)).addClass('hightoc');
			});
			
		},		
		
		
		/* -- **/
		//<div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		appendToDOM : function(id){ 
			var _this = this;
			$(vi2.dom).find('[type="toc"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getTocById(id), function( i, val ){   
				var toc = $('<div></div>')
					.attr('type',"toc")
					.attr('note', val.note )
					.attr('starttime', val.start)
					.attr('duration', 10)
					.attr('author', 'none')
					.attr('id', "")
					.text( decodeURIComponent(val.label) )
					.appendTo( vi2.dom )
					;
			});
		},					
				
		/* ... */
		begin : function(e, id, obj){ 
				// reset highlight
				$(this.options.selector+' li').each(function(i, val){ $(this).removeClass('hightoc') ;})
				// highlight toc entry
				$('.toc-'+obj.displayPosition.t1).addClass('hightoc');
			
		},
	
		/* ... */
		end : function(e, id, obj){ 
			//$('.toc-'+obj.displayPosition.t1).removeClass('hightoc');
		},
		
		/* ... */
		showTimelineTOC : function(e){ 
			var _this= this; 
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name){
					return sp = $('<span></span>')					
						.addClass('toc-timetag ttoc').attr('style','left:'+_left+'px;')
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
		},
		
		/****INTERFACES*****/
		
		/* -- */
		nextElement : function(){
			//$('.toc-'+ (this.currentTocElement + 1) ).click();
			this.currentTocElement = this.currentTocElement < this.elements.length ? this.currentTocElement + 1 : this.currentTocElement;
			this.player.currentTime( this.elements[ this.currentTocElement ] );
			//
		},
		
		/* -- */
		previousElement : function(){
			this.currentTocElement = this.currentTocElement == 0 ? this.currentTocElement : this.currentTocElement -1 ;
			this.player.currentTime( this.elements[ this.currentTocElement ] );
		}
		
	}); // end class TOC
