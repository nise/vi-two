/* 
* name: Vi2.TemporalBookmarks
* author: niels.seidel@nise81.com
* license: BSD New
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
		* Initializes the bookmark of content and handles options
		*/
		init : function(){  
			// get the url
			var url = window.location.href.slice(window.location.href.indexOf('#') + 1) + '#!t=npt:'  ;
			
			// get the title of the video from database
			var title = vi2.db.getMetadataById( vi2.observer.current_stream ).title;
			
			// clear selector
			$( this.options.selector + '> .vi2-bookmark-controls' ).remove();
		
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>').text( this.options.label ).addClass('vi2-bookmark-label'))
				.addClass('vi2-bookmark-controls')
				.bind('mouseenter', function(e){
					$('.vi2-select-bookmark > input').val( url + vi2.observer.player.currentTime() ); 
				})/*
				.bind('mouseleave', function(e){
					$('.bookmark-controls > .select-bookmark').css('display','none');
				})*/
				.appendTo( this.options.selector );
			
			var options = $('<div></div>')
				.append( browserBookmark )			
				.addClass('vi2-select-bookmark')
				.appendTo( container );
			
			var input = $('<input type="text" />')
				.val( url )
				.attr('readonly',true)
				.attr('aria-describedby', 'URL to the current playback position of the video.')
				.focus(function() { 
					$(this).select(); 
				} )
				.appendTo( options );
							
			var browserBookmark = $('<a></a>')
				.text('bookmark')
				.addClass('vi2-btn')
				.attr('rel', 'sidebar')
				.attr('href','#')
				.attr('title', title)
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
	 			.appendTo( options );	
		}
}); // end class  
