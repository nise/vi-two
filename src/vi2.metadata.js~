/* 
* name: Vi2.Metadata
* author: niels.seidel@nse81.com
* license: 
* description:
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
  		options : { metatags: false, render:false },
  		labels : {author: 'Author:', title: 'Title:', category: 'Category:', date: 'Date:', rating: 'Rating:'},
  		
  		/* */
  		update: function(){
  			this.render(); 
  			this.buildMetaTags();
  		},
  		
  		/* ... */
  		render : function(){
  			if(this.options.render){
					var _this = this;
					var data = $('<div></div>')
					$.each(this.labels, function(i, val){
						data.append('<strong>'+val+'</strong> '+_this.metadata[i]+'</br>');
					});	
					$('.meta-title').html(this.metadata.title);
					$('.meta-desc').html(this.metadata.author+' ('+this.metadata.institution+')');

					
					//$(this.options.selector).html(data);
					//$(this.options.selector).append(this.options.author);
				}	
  		},
  		
  		/* SEO ********************/
			buildMetaTags : function(){
				if( this.options.metatags ){ 
				
					$('head meta').each(function(i,val){ this.remove()});
		
					$('head')
						.prepend('<meta itemprop="duration" content="'+this.metadata.length+'" />')
						.prepend('<meta itemprop="height" content="'+ vi2.observer.player.height() +'" />')
						.prepend('<meta itemprop="width" content="'+ vi2.observer.player.width() +'" />')
						.prepend('<meta itemprop="uploadDate" content="'+this.metadata.date+'" />')
						//.prepend('<meta itemprop="thumbnailUrl" content="'+vi2.page_url+'img/thumbnails/iwrm_'+vi2.observer.current_stream+'.jpg" />')
						.prepend('<meta itemprop="contentURL" content="' + vi2.db.getStreamById( vi2.observer.current_stream ).video + '" />')
						//.prepend('<meta itemprop="embedURL" content="'+vi2.page_url+'#!'+vi2.observer.current_stream+'" />')
					; 
				}	
			}

});

