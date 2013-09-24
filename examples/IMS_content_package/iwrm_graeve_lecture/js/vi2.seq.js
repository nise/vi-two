/*****************************************/
/* SEQ  pdf3JPG:$ convert -resize 800 -quality 93 xxx.pdf slide.jpg
	author: niels.seidel@nise81.com

	- enable other media types then .png
	
	nth:
	- viz on timeline by showing current slide
	- on/off controls .. sync, skip/browse slides

	*/


	/** class Seq **/ 
	var Seq = $.inherit({

		/**/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
  		$(this.options.selector).html(new Image());
  		var e = {}; e.tags = {}; e.tags.occ = [];
//  		this.showTimelineSeq(e);	
	
		},
		
		name : 'seq',
		// defaults
		options : {selector: '#screen', vizOnTimeline: true, controls: true, path: ''},
		player : null,
		currImgId : -1,
		timelineSelector : 'div.vi2-video-seek',
						
		/**/
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
	
		/**/
		end : function(e, id){
//			$(this.options.selector+' .ov-'+id).remove();
		},
		
		/**/
		showTimelineSeq : function(e){
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
        tickSize = sliderWidth / main.player.duration();
        
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
		
		/**/
		relativePos : function(obj){
			return {x: Math.floor((obj.x/100)*this.player.width()), y: Math.floor((obj.y/100)*this.player.height())};
		},
		
		/**/
  	loadVideo : function(url, seek){
	  	this.player.loadVideo(url, seek);  			
  	},
  	
  	
	}); // end class Seq


