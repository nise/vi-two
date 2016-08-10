/* 
* name: Vi2.TemporalBookmarks
* author: niels.seidel@nise81.com
* license: MIT License
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
		
		name : 'temporalBookmarks',
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
		
			var ico = $('<span></span>').addClass('glyphicon glyphicon-share')
			// add button to player control bar
			var container = $('<div></div>')
				.html( ico )
				//.append($('<div></div>').text( this.options.label ).addClass('vi2-bookmark-label'))
				.addClass('vi2-bookmark-controls')
				.bind('mouseenter', function(e){
					$('.vi2-select-bookmark > input').val( url + vi2.observer.player.currentTime() ); 
				})/*
				.bind('mouseleave', function(e){
					$('.bookmark-controls > .select-bookmark').css('display','none');
				})*/
				.appendTo( this.options.selector );
			
			var options = $('<span></span>')
				.append( browserBookmark )			
				.addClass('vi2-select-bookmark')
				.appendTo( container );
			
							
			var browserBookmark = $('<a></a>')
				.text('add to browser')
				.addClass('vi2-btn vi2-bookmarks-add-to-browser')
				.attr('rel', 'sidebar')
				.attr('href','#')
				.attr('title', title)
				.click(function() {
					vi2.observer.log({context:'temporalBookmarks', action:'save-browser-bookmark',values:[''+url+vi2.observer.player.currentTime()]});
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
	 			
	 		var input = $('<input type="text" />')
				.val( url )
				.attr('readonly',true)
				.attr('aria-describedby', 'URL to the current playback position of the video.')
				.click(function(){
					vi2.observer.log({context:'temporalBookmarks', action:'copy-bookmark-link',values:[ ''+url + vi2.observer.player.currentTime()]})
					$(this).focus();
				})
				.focus(function() { 
					$(this).select(); 
				} )
				.appendTo( options );
			
		}
}); // end class  
