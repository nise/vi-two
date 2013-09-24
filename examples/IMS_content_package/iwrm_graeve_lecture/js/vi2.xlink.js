	/*****************************************/
	/* XLink
	author: niels.seidel@nise81.com
		
	- remove dirty hacks xxx
	- link-types: cycle, xlink
	- timeLineSelector
	- nice defaults: var defaults = {animLen: 350}; options = $.extend(defaults, settings); 
	
	nth
	- viz on timeline
	- apply minimum link duration
	- delay removeOverlay on mouseover/shift-press etc.
	
	*/


	/** class XLink **/ 
	var XLink = $.inherit({

		/**/
  	__constructor : function(options) {
  		this.options = $.extend(this.options, options)
		},
				
		name : 'xlink',
		options : {selector: '#overlay', vizOnTimeline: true, minDuration: 1},
		player : null,
		timelineSelector : 'div.vi2-video-seek',

		/**/
		init : function(ann){
			var _this = this;
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){
				if(val.linktype == 'cycle' || val.linktype == 'standard'){
					e.tags.push({name: val.title, occ:[val.t1]});
				}
			});
			this.showTimelineTOC(e);
		},						

		/**/
		begin : function(e, id, obj){ 
			var _this = this;
			var pos = this.relativePos(obj.displayPosition); //alert(($(this.options.selector).offset()).top - pos.x + 'sss');
			var o = $('<span></span>')
								.text(obj.content.title)
								.attr('id', 'ov'+id)
								.addClass('overlay ov-'+id)
								.addClass(obj.linktype == 'external' ? 'hyperlink-external' : '')
								.addClass(obj.linktype == 'cycle' ? 'hyperlink-cycle' : '')
								.addClass(obj.linktype == 'standard' ? 'hyperlink-standard' : '')
				 				.bind('click', {}, function(data){
				 					// distinguish link types
				 					switch(obj.linktype){
				 						case 'standard' :
				 							main.parse('#'+obj.content.target, 'html');
				 							
				 							//// dirty hacks xxx 
				 							// update tags
				 							main.widget_list['tags'].tag_obj = $('body').data().tags[obj.content.target];
				 							main.widget_list['tags'].displayTagcloud();
				 							// update metadata
				 							metadataa = new Metadata($('body').data().metadata[obj.content.target]);

											// change video without updating related content (seq, metadata, toc...)
											///_this.loadVideo(obj.content.target, 10);
											break;
										case 'external' :
											return true;
										case 'cycle' : 
											_this.loadCycleVideo(obj.content.target, 10, 15, obj.displayPosition.t1); // url, seek time, duration, return_seek
											break;
										case 'x':
											break;	
									} 
									$(this).remove();
								});
			 if(obj.linktype == 'external'){
			 		o.html($('<a></a>')
			 			.attr('target', 'new')
			 			.attr('href', obj.content.target)
			 			.attr('class', 'external-link')
			 			.text(obj.content.title+'')
			 		);
			 }
			$(this.options.selector).append(o);
			// positioning object AFTER appending it to its parent // buggy
			o.css({left: +($(this.options.selector).offset()).left+pos.x, top: pos.y, position:'absolute'})			
		},
	
		/**/
		end : function(e, id){ 	 //alert('end link')
			$(this.options.selector+' .ov-'+id).hide();
		},
		
		/**/
		showTimelineTOC : function(e){
			var _this= this; 
				$(_this.timelineSelector+' .timetag').remove();
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name){
					var sp = $('<span></span>');					
					sp.addClass('timetag tlink').attr('style','left:'+_left+'px;')
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
		clear : function(){
			$(this.options.selector).html('');
		},
		
		/**/
		vizOnTimeline : function(){},
		
		/**/
		relativePos : function(obj){
			return {x: Math.floor((obj.x/100)*this.player.width()), y: Math.floor((obj.y/100)*this.player.height())};
		},
		
		/**/
  	loadVideo : function(url, seek){
	  	this.player.loadVideo(url, seek);  			
  	},
  	
  	/**/
  	loadCycleVideo : function(url, seek, duration, return_seek){
	  	this.player.loadCycleVideo(url, seek, duration, return_seek);  			
  	},
  	
	}); // end class XLink


