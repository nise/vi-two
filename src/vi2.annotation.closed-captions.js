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
		name : 'closedCaptions',
		type : 'annotation',
		// defaults
		options : {    //hasTimelineMarker: true, hasMenu: true, menuSelector:'.toc'
			selector: '.closedCaption', 
			hasTimelineMarker: true, 
			controls: true, 
			hasTimelineMarker: true,
			timelineSelector : 'div.vi2-video-seek',
			hasMenu: true,
			menuSelector:'.transcript'
		},
		tag_obj : [],
		
		width : 0, // not needed
		height : 0, 
		
		
		/* Initialize */
		init : function(ann){  	
  		//**** write the code to add the track element to the video
		},
		
		
		/* 
		 * Converts subtitle formats like SubRip, W3C WEBVVT, W3C TTML into the internal representation
		 * todo: optain data form subtitle files & convert to the following format:
		 * output: <div type="closedCaptions" starttime=1344 duration="165"></div>
		 **/
		appendToDOM : function(id){ 
			//**** usually any annotations need to be converted into the internal represetation of code. Therefore, it is necessary to append these contents to the dom structure first. The parser of the core components then will take care of everthing
			$(vi2.dom).find('[type="closedCaptions"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getSlidesById(id), function(i, val){  //alert(JSON.stringify(val))
				var slides = $('<div></div>')
				.attr('type',"closedCaptions")
				.attr('starttime', val.starttime )
				.attr('duration', val.duration ) //**** you need to calculate the duration
				.attr('id', val.id)
				.text(this.tagname ) //**** dedicated for the content of the caption
				//**** feel free to add other necessary elements
				.appendTo( vi2.dom );
			}); 
			
		},

		/* Append caption content to _this.options.selector
		 **/
		begin : function(e, id, obj){ 
			//**** event handler for displaying a caption or highlighting a cue inside the transcript text
		},


		/*
		 * Remove caption content from _this.options.selector
		 **/
		end : function(e, id){
			//**** event handler to hide a caption or disable highlighting
		},
  	
	}); // end class 


