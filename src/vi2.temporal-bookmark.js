/* 
* name: Vi2.TemporalBookmarks
* author: niels.seidel@nise81.com
* license:
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - add support for bookmarking services e.g. delicious, twitter, fb, ...
*/


Vi2.TemporalBookmarks = $.inherit(/** @lends Vi2.TemporalBookmarks# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'temoral bookmarks',
		type : 'player-widget',
		options : {
			selector : '.control-bar',
			label : 'bookmark'
		},

		/**
		Initializes the table of content and handles options
		*/
		init : function(annotations){  
		
			var url = window.location.href;
			
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>').text( this.options.label ).addClass('bookmark-label'))
				.addClass('bookmark-controls')
				/*.bind('mouseenter', function(e){
					$('.bookmark-controls > .select-bookmark').css('display','block');
				})
				.bind('mouseleave', function(e){
					$('.bookmark-controls > .select-bookmark').css('display','none');
				})*/
				.appendTo( this.options.selector);
			//
			var input = $('<input type="text" readonly aria-describedby="URL to the current playback position of the video." />')
				.val( url )
				.focus(function() { 
					$(this).select(); 
				} );
			var options = $('<div></div>')
				.append( input )
				.append( browserBookmark )			
				.addClass('select-bookmark')
				.appendTo(container);
			
			var browserBookmark = $('<span></span>')
				.text('bookmark')
				.addClass('vi2-btn')
				.click(function() {
				  if (window.sidebar) { // Mozilla Firefox Bookmark
				    window.sidebar.addPanel(location.href,document.title,"");
				  }else if(window.external) { // IE Favorite
				    window.external.AddFavorite(location.href,document.title); 
				  }else if(window.opera && window.print) { // Opera Hotlist
				    this.title=document.title;
				    return true;
		 		 	}
		 		 	return true;
	 			})
	 			.appendTo(options);	
		}


 
    
  

}); // end class  
