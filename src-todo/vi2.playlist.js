/* 
*	name: Vi2.Playlist
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*/


var Vi2_Playlist = $.inherit(/** @lends Playlist# */{

	/** 
	*		@constructs 
	*		@param {object} options An object containing the parameters
	*/
	__constructor : function(options) {
		this.options = $.extend(this.options, options);	 
	},
	
	name : 'playlist',
	options : {selector: '#null'},
	content_selector : '#content',
	playlist : [],
	
	
	/* adds item to playlist */
	add : function(id){
		this.playlist.push(id);
	},
	
	
	/* removes item from playlist */
	remove : function(id){
		var _this = this;
		$(this.playlist).each(function(i, val){
			if(val == id){
				_this.playlist.splice(i, 1);		
			}
		});
	},
	
	
	/* Renders playlist items regarding presentation template */
	showPlaylist : function(){
		var _this = this;
		
		// handle empty playlist
		if(_this.playlist.length == 0){
				$(_this.content_selector).append('(Playlist is empty)')
		}
		// remove duplicates
		this.playlist = removeDuplicates(_this.playlist);
				
		$.each(this.playlist, function(i, list_item){ 
			var stream = vi2.db.getStreamById(list_item)
			var item =$('<div></div>')
				.addClass('content-item')
				.setTemplate($("#item_template").val())
				.processTemplate(stream);
			$(_this.content_selector).append(item);
		});				
	}
	
	
	
}); // end class	
