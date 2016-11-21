/* 
* name: Vi2.ClosedCaptions 
*	author: niels.seidel@nise81.com
* license: BSD New
* description: 
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
		
		
		/* -- */
		// <div type="syncMedia" starttime=1344 duration=165 id=hello>hydro_graefe-11.jpg</div>
		appendToDOM : function(id){ 
			$(vi2.dom).find('[type="closedCaptions"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getSlidesById(id), function(i, val){  //alert(JSON.stringify(val))
				var slides = $('<div></div>')
				.attr('type',"syncMedia")
				.attr('starttime', val.starttime )//this.occ[0].start )
				.attr('duration', val.duration )//this.occ[0].duration)
				//.attr('seek', this.seek != null ? deci2seconds(this.seek) : 0)
				//.attr('duration2', this.duration2 != null ? this.duration2 : 0)
				.attr('id', val.id)
				.attr('path', val.img ) // val.path
				.text(this.tagname )
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
					.attr('src', this.options.prefix_path+vi2.observer.current_stream+'/'+obj.content.target)
					.addClass('slide ov-'+id)
					.unbind('load')
					.bind('load', function(e){ //alert(JSON.stringify(t))
							$(_this.options.selector).html(o);
					});
			}
		},


		/* ... */
		end : function(e, id){  //alert(id)
			$(this.options.selector+' .ov-'+id).remove();
		},
  	
	}); // end class 


