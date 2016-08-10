/* 
*	name: Vi2.Map
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*/

var Map = $.inherit(/** @lends Map# */{

		/** constructs */
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
  		$(this.options.selector).html(new Image());
  		var e = {}; e.tags = {}; e.tags.occ = [];
		},
		
		name : 'map',
		// defaults
		options : {selector: '#screen', vizOnTimeline: true, controls: true, path: ''},
		player : null,
		currImgId : -1,
		timelineSelector : 'div.vi2-video-seek',
						
		/* ... */
		begin : function(e, id, obj){ 
			if(this.currImgId == obj.content.target){
				return false;
			}else{
				this.currImgId = obj.content.target;
				var _this = this; 
				var o =$('<div></div>').addClass('slide ov-'+id).text('test');
				//Initialise with KML/GeoRSS URL
  			var geoxml = new CM.GeoXml(this.options.path+''+obj.content.target);

  //			CM.Event.addListener(geoxml, 'load', function() {

    			var map = new CM.Map(o, new CM.Tiles.CloudMade.Web({key: 'ed24c9065bb55c1090d3d76e7ab8577e'}));
    			map.zoomToBounds(geoxml.getDefaultBounds());
    			map.addOverlay(geoxml);
    			alert(o.html());
//  			});
  			$(this.options.selector).append(o);
			}
		},
	
		/* ... */
		end : function(e, id){
			$(this.options.selector+' .ov-'+id).remove();
		}
	  	
  	
	}); // end class Map


