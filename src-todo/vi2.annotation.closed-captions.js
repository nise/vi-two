/* 
* name: Vi2.ClosedCaptions 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: displays captions in a layer on top of the video
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	- srt files, font size, multi language, colored text, bg-contrast
*/


Vi2.ClosedCaptions = $.inherit(Annotation, /** @lends Vi2.SyncMedia# */{

		/** @constructs 
		*		@extends Annotation 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);	
  	},
  	
  	/* class variables */
		name : 'syncMedia',
		type : 'annotation',
		// defaults
		options : {    //hasTimelineMarker: true, hasMenu: true, menuSelector:'.toc'
			selector: '.syncMedia', 
			hasTimelineMarker: true, 
			controls: true, 
			hasTimelineMarker: true,
			timelineSelector : 'div.vi2-video-seek',
			hasMenu: true,
			menuSelector:'.synMediaMenu',
			prefix_path: 'slides/', 
			sync: true, 
			placeholder:'img/placeholder.jpg'
		},
		tag_obj : [],
		currImgId : -1,
		
		width : 0, // not needed
		height : 0, 
		
		
		/* Initialize */
		init : function(ann){  	
  		var _this = this; 
			this.tag_obj = [];
			$.each(ann, function(i, val){  
				if(val.type == 'syncMedia'){ 
					var ii = _this.get_tag_by_name(val.title);
					if( ii == -1){ 
						_this.tag_obj.push({
							tagname: val.title, 
							path: val.target,
							occ: [{start: val.t1, duration: val.t2, xpos:val.x, ypos:val.y}]});
					}	else {
					_this.tag_obj[ii].occ.push({start: val.t1, duration: val.t2, x:val.x, y:val.y});
					}
				}
 			});
  	
		},
		
		
		/* 
		 * Converts subtitle formats like SubRip, W3C WEBVVT, W3C TTML into the internal representation
		 * todo: optain data form subtitle files & convert to the following format:
		 * output: <div type="closedCaptions" starttime=1344 duration="165"></div>
		 **/
		appendToDOM : function(id){ 
			$(vi2.dom).find('[type="closedCaptions"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getSlidesById(id), function(i, val){  //alert(JSON.stringify(val))
				var slides = $('<div></div>')
				.attr('type',"closedCaptions")
				.attr('starttime', val.starttime )
				.attr('duration', val.duration )
				.attr('id', val.id)
				.text(this.tagname )
				.appendTo( vi2.dom );
			}); 
			
		},

		/* Append caption content to _this.options.selector
		 **/
		begin : function(e, id, obj){ 
			if(this.currImgId == obj.content.target){
				return false;
			}else{  
				var _this = this;
				this.currImgId = obj.content.target; 
				var o = new Image(); 
				// animate transition	if image is loaded				
				$(o)
					.attr('src', this.options.prefix_path+vi2.observer.current_stream+'/'+obj.content.target)
					.addClass('slide ov-'+id)
					.unbind('load')
					.bind('load', function(e){ //alert(JSON.stringify(t))
							$(_this.options.selector).html(o);
					});
			}
		},


		/*
		 * Remove caption content from _this.options.selector
		 **/
		end : function(e, id){
			$(this.options.selector+' .ov-'+id).remove();
		},
  	
	}); // end class 


