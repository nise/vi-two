/* 
* name: Vi2.Metadata
* author: niels.seidel@nse81.com
* license: MIT License
* description:
* depends on:
*  - lib: embedded java script
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:	
	- integrate it on server side
	- do we really need a rendering funtion?
	- complete metadata
	- think about sitemap.xml and dbpedia
	- bug: metadata width and height is Null since the video has not been loaded yet.
*/


Vi2.Metadata = $.inherit(/** @lends Vi2.Metadata# */
	{
			/** 
			*		@constructs 
			*		@param {object} options An object containing the parameters
			*/
  		__constructor : function( options ) { 
  			this.metadata = vi2.db.getMetadataById( vi2.observer.current_stream );
  			this.options = $.extend(this.options, options);
  			this.update();
  		},
  		
  		// defaults
  		options : { 
  			selector: '.metadata',
  			requiresMetatags: true, 
  			requiresDisplay: true
  		},
  		
  		
  		/** 
  		* Updates all metadata
  		*/
  		update: function(){
  			if( this.options.requiresDisplay ){
  				this.displayMetadata();
  			}
  			if( this.options.requiresMetatags){	 
  				this.buildMetaTags();
  			}	
  		},
  		
  	
  		/** 
  		* Displays metadata to the given selector
  		*/
  		displayMetadata : function(){
  			//var html = new EJS({url: vi2.templatePath+'vi2.metadata.ejs'}).render( this.metadata );
				//$( this.options.selector ).html( html );
  		},
  		
  		
  		/** 
  		* Append html meta tags to the DOM header in favour of SEO 
  		*/
			buildMetaTags : function(){ 
				$('head meta').each( function(i,val){ $(val).remove(); });
				$('head')
					.prepend('<meta content="text/html;charset=utf-8" http-equiv="Content-Type">')
					.prepend('<meta content="utf-8" http-equiv="encoding">')
					.prepend('<meta http-equiv="X-UA-Compatible" content="IE=Edge"/>')
					.prepend('<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />')
					.prepend('<meta itemprop="duration" content="'+this.metadata.length+'" />')
					.prepend('<meta itemprop="height" content="'+ vi2.observer.player.height() +'" />')
					.prepend('<meta itemprop="width" content="'+ vi2.observer.player.width() +'" />')
					.prepend('<meta itemprop="uploadDate" content="'+this.metadata.date+'" />')
					//.prepend('<meta itemprop="thumbnailUrl" content="'+vi2.page_url+'img/thumbnails/iwrm_'+vi2.observer.current_stream+'.jpg" />')
					.prepend('<meta itemprop="contentURL" content="' + vi2.db.getStreamById( vi2.observer.current_stream ).video + '" />')
					//.prepend('<meta itemprop="embedURL" content="'+vi2.page_url+'#!'+vi2.observer.current_stream+'" />')
				;	
			}
}); // end class

