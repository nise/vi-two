/* 
* name: Vi2.Sharing
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - add sharing link for a popup
*	 - add sharing facilities for social media applications
*/


Vi2.Sharing = $.inherit(/** @lends Vi2.Sharing# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {String} options.selctor Selector to append the ahring button
		*		@param {boolean} options.shareLink 
		*		@param {boolean} options.shareEmbedLink 
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'sharing',
		type : 'player-plugin',
		options : {
			selector : '.control-bar',
			shareLink : true,
			shareEmbedLink: true,
			label: '</>'
		},
	
		/**
		* Creates an control element to allow users to share the video 
		*/
		init: function(){
			var _this = this;
			
			var url = window.location.href.slice(window.location.href.indexOf('#') + 1);
			
			// clear selector
			$( this.options.selector + '> .vi2-sharing-controls' ).remove();
		
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>').text( this.options.label )
				.addClass('sharing-label'))
				.addClass('vi2-sharing-controls')
				.bind('mouseenter', function(e){
					
				})/*
				.bind('mouseleave', function(e){
					$('.sharing-controls > .select-sharing').css('display','none');
				})*/
				.appendTo( this.options.selector );
			
			var options = $('<div></div>')
				.append( browserSharing )			
				.addClass('vi2-sharing-select')
				.appendTo( container );
			
			
			// share link
			if( _this.options.shareLink ){
				var input = $('<input type="text" />')
					.val( url )
					.attr('readonly',true)
					.attr('aria-describedby', 'URL to the current playback position of the video.')
					.focus(function() { 
						$(this).select(); 
					} )
					.appendTo( options );
			}
			
			// share embed link
			if( _this.options.shareEmbedLink ){
			}
			
			
			/*
			// create button		
			$('<a></a>')
				.addClass('vi2-video-sharing vi2-btn')
				.text('</>')
				.click(function(){ 
					$('.player-share')
						.appendTo('body')
						//.toggle()
						.css('top', '20px')
						.css('left', '250px');
						 
					var url = window.location.href.slice(window.location.href.indexOf('#') + 1);
					
						
					//$('.player-share-popup').val('<iframe src="http://www.iwrm-education.org/popup.html?id='+url+'" width="100" height="20"></iframe>') //also: title=bim&lecturer=sam
						//.bind("focus",function(e){ $(this).select(); })
						//.bind("mouseup",function(e){ return false; });	
					
					
					// share link
					if( _this.options.shareLink ){
						$('.player-share-link').val('http://www.iwrm-education.org/embed.html#'+url)
							.bind("focus",function(e){
									$(this).select();
							})
							.bind("mouseup",function(e){
									return false;
							});
					}
					
					// share embed link
					if( _this.options.shareEmbedLink ){
						$('.player-share-embed').val('<iframe src="http://www.iwrm-education.org/embed.html#'+url+'" width="935" height="610"></iframe>')
							.bind("focus",function(e){ 
								$(this).select(); 
							})
							.bind("mouseup",function(e){ 
								return false; 
							});
					}		
				})
				.appendTo( this.options.selector );
				//
				$('.player-share-close').button().click(function(){
					$('.player-share').hide();
				})
		*/
		},
		
		
		/**
		*/
		prepareEmbedMarkup : function(){
			var code = $();
			// add css
			var sc
			// add js
			var js = $('<script></script')
				.attr('type','text/javascript')
			// add html
			return code.html();
		}	
}); // end class
