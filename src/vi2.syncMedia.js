/* SyncMedia  pdf3JPG:$ convert -resize 800 -quality 93 xxx.pdf slide.jpg
	author: niels.seidel@nise81.com
	
	nth:
	- viz on timeline by showing current slide
	- on/off controls .. sync, skip/browse slides
	- differ media types

	*/


	/* class SyncMedia **/ 
	var Vi2_SyncMedia = $.inherit(Annotation, /** @lends SyncMedia# */{

		/** @constructs 
		*		@extends Annotation 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options);
  			
  	},
  	
  	init : function(){		 
  		$(this.options.selector).html(new Image()).addClass(this.options.childtheme);;
  		this.currImgId = -1;
  		var e = {}; e.tags = {}; e.tags.occ = [];
				//  		this.showTimelineSeq(e);	

				// place holder
				var o = new Image(); 
				$(o)
					.attr('src', this.options.placeholder)
					.addClass('slide')
					.unbind('click')
					.appendTo(this.options.selector);
		},
		
		name : 'syncMedia',
		type : 'annotation',
		// defaults
		options : {selector: '#seq', vizOnTimeline: true, controls: true, path: '', childTheme:'', placeholder:'img/placeholder_slides.jpg'},
		player : null,
		currImgId : -1,
		timelineSelector : 'div.vi2-video-seek',
		width : 0,
		height : 0, 
		o : null,				
		
		/* -- */
		// <div type="syncMedia" starttime=1344 duration=165 id=hello>hydro_graefe-11.jpg</div>
		appendToDOM : function(id){
			$.each(	vi2.db.getSlidesById(id), function(val){
				var slides = $('<div></div>')
				.attr('type',"syncMedia")
				.attr('starttime', this.starttime)
				.attr('duration', this.duration)
				.attr('seek', this.seek != null ? deci2seconds(this.seek) : 0)
				.attr('duration2', this.duration2 != null ? this.duration2 : 0)
				.attr('id', this.id)
				.text(id+'/'+this.img)
				.appendTo( vi2.dom );
			});
		},

		/* -- */
		begin : function(e, id, obj){ 
			if(this.currImgId == obj.content.target){
				return false;
			}else{  
				var _this = this;
				this.currImgId = obj.content.target; 
				var o = new Image(); 
				
				// animate transition	if image is loaded				
				$(o)
					.attr('src', this.options.path+''+obj.content.target)
					.addClass('slide')// ov-'+id);
					.unbind('load')
					.bind('load', function(){ 
							$(_this.options.selector).html(o);
					});
					//$('#debug').html(obj.content.target +'  ');				
			}
		},

	
		/*
		begin : function(e, id, obj){ 
			if(this.currImgId == obj.content.target){
				return false;
			}else{
				this.currImgId = obj.content.target;
				var _this = this; 
				var o = new Image();
				o.src = this.options.path+''+obj.content.target; 
				$(o).addClass('slide');// ov-'+id);
							
  	  	$(this.options.selector+' img').fadeOut(20, function(){ 
  	  	  $(_this.options.selector).html(o);
  	  		$(o).fadeIn(500);
  	  	});
			}
		},
		*/
		
		
		/* ... */
		end : function(e, id){
			$(this.options.selector+' .ov-'+id).remove();
		},
		
		/* ... */
		showTimelineSeq : function(e){ return;
			var _this= this; 
			if(e.tags.occ.length === 1){
				// jump to temporal position 
				this.player.currentTime(e.tags[0].start);
			}else{
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name){
					return $('<span></span>')
						.addClass('timetag ttoc')
						.attr('style','left:'+_left+'px;');
						/*.bind('mouseover', function(){
							...tooltip  _name
						});*/
				};
				/*
				var position = $(_this.timelineSelector).position(); 
        var sliderWidth = $(_this.timelineSelector).width();
        var minX = position.left;
        var maxX = minX + sliderWidth;
        tickSize = sliderWidth / observer.player.duration();
        
				$(_this.timelineSelector).bind('mousemove', function(e){ 
					if (e.pageX >= minX && e.pageX <= maxX) {
        	  var val = (e.pageX - minX) / tickSize;
//            alert(tickSize);

        	}

				});
				*/
				//				
				$.each(e.tags.occ, function(){ 
					var progress = this / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width());
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector).append(f(progress, e.tags.name));
 				});
			}
		},
		
		/* ... */
		relativePos : function(obj){
			return {x: Math.floor((obj.x/100)*this.player.width()), y: Math.floor((obj.y/100)*this.player.height())};
		},
		
		/* ... */
  loadVideo : function(url, seek){
	  	this.player.loadVideo(url, seek);  			
  },
  
  width : function(){ return this.width; },
  height : function(){ return this.height; }
  	
  	
	}); // end class SyncMedia


