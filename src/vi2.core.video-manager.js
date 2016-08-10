/* 
*	name: Vi2.VideoManager
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Implements a journaled naviagtion for browsing back and forth in a collection of videos.
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:

- kann templates laden und für seine kinder (e.g. related videos verarbeiten)


- listen to url changes and load videos and views
- list streams by category / tag / author / date / ...
- offers different rendering styles: 
Karussell, Liste, Card-Deck, Matrix, Stack, Video-Wall, Slide-Row, Slide-Matrix, ...
- sort order, change sort order .. sort by..

*/



Vi2.VideoManager = $.inherit(/** @lends Vi2.VideoManager# */{ // 

	/** 
	*		@constructs 
	*		@param {object} options An object containing the parameters
	*/
	__constructor : function(options) { 
		this.options = $.extend(this.options, options); 
	},
	
	name : 'video-manager',
	type : 'collection',
	content_selector : '#content',
	options : {
		selector : '#seq'
	},
	viewing_history : [],

	/**
	* Define paths that the video manager is listing to. 
	*/
	init : function(){  
		var _this = this; 
		
		// define default get routes
		Sammy(this.options.selector, function() { 
        
        this.get('#!/video/:stream/:time', function() {
        	_this.handleNewStream( this.params );
        });
     
        this.get('#!/video/:stream', function() {
        	_this.handleNewStream( this.params );
        });
        
        this.get('#!/videos/all', function() {
        	_this.handleAllStreams( );
        });
        
        this.get('#!/tags/:tag', function() {
        	_this.handleTags( this.params );
        });
        
        this.get('#!/category/:category', function() {
        	_this.handleCategory( this.params );
        });
        
      }).run();	
	},
	
	
	/*
	* Interface for other widgets to define routes that will be handled on their own
	* @params path {String} Path under which the the given callback function should called. For instance http://example.com/#<my-path>. The '#' is set by default and should therefore be excluded.
	* @params callback {Object}
	* @params fn {Object}
	**/
	addRoute : function(path, callback, fn){
		Sammy(this.options.selector, function() { 
		  this.get('#!'+path, function() {
		  	callback[fn]();
		  });
		}).run();
	},
	
	
	/*
	* Calls the given template from the defined template path in order to render the given data.
	**/
	render : function(template, data){ 
			return new EJS( { url: vi2.templatePath+''+template} ).render( data );
	},
	
	
	/**
	* This functions process a comma separated list of tags in order to identify the video streams that are related to these tags
	*/
	handleTags : function(params){ 
		var tags = params.tag.split(/,/); 
		var stream_names = '';
		var streams = [];
		var inverted = vi2.db.getInvertedTagIndex();
		
		for(var i = 0; i < tags.length; i++){
			if( inverted[tags[i]] !== undefined ){ 
				stream_names += inverted[tags[i]].toString() +',';
			}	
		}
		var t = []; t = removeDuplicates( stream_names.split(/,/) ); 
		for( var s = 0; s < t.length; s++){ 
			if( t[s]  !== ''){
				var str = vi2.db.getStreamById( t[s] );
				streams.push( str ); 
			}
		}
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Tags: ' + tags.toString(), items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* This functions process a single given category 
	*/
	handleCategory : function(params){ 
		var category = params.category; 
		var streams = vi2.db.getStreamsByCategory( category );
		
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* This functions processes all stream 
	*/
	handleAllStreams : function(params){ 
		var streams = vi2.db.getAllStreams();
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* Load a new video stream and naviagte to the give position in time.
	*/
	handleNewStream : function(params){ 
		var _this = this;
		var seek = params.time === undefined ? 0 : params.time.split(/:/)[1];
  	if( params.stream != vi2.observer.current_stream ){ 
    	$(vi2.dom).empty(); 
    	vi2.observer.setCurrentStream( params.stream, seek ); 
			vi2.observer.player.play(); 
			_this.loadWidgets();
		}else{
			vi2.observer.player.currentTime( seek );
		}	
	},
	
	
	
	/**
	*
	*/
	loadWidgets : function(){
	
		// Define some annotation widgets
	 	var toc = new Vi2.TableOfContents( { 
	 		hasTimelineMarker: true, 
	 		hasMenu: true, 
	 		menuSelector:'.toc' 
	 	} );
		
		// Synchronize some presentation slides as 
		var syncMedia = new Vi2.SyncronizeMedia( { 
			selector: '.syncMedia', 
			hasTimelineMarker: true, 
			hasMenu: true, 
			menuSelector:'.toc' 
		} );
		
		//var userNotes = new Vi2.UserNotes();
		
		// With these widgets we make use of the video database
		
		var relatedVideos = new Vi2.RelatedVideos( { 
			resultSelector: '.related-videos', 
			criteria:[
				{ criterion: 'random-destructor', weight:0.1 },
				{ criterion: 'same-author', weight:0.8 }, 
				{ criterion: 'same-tags', weight:0.6 },
				{ criterion: 'incomming-links', weight:0.5 },
				{ criterion: 'outgoing-links', weight:0.5 }
				] 
		} );
		//relatedVideos.init();
		
		var inVideoSearch = new Vi2.Search( {
			resultSelector: '.search-results', 
			limit: 25
		} );
		//inVideoSearch.find('water basin');
		
		
		// add all the widgets
		vi2.observer.addWidget( toc );
		vi2.observer.addWidget( syncMedia );
		
			
		vi2.observer.addWidget( relatedVideos );
		//vi2.observer.addWidget( userNotes );
		//vi2.observer.addWidget( inVideoSearch );
	
	
	},




	
	
	
	/* buggy ... */
	listAllItems : function(){
			var template = $("#item_template").val();
			
		// list items of all categories		
		$.each(this.getCategoryTaxonomie(), function(i, cat_name){
			// cat name
			$(_this.content_selector).append($("<h2></h2>").addClass('cat'+i).text(cat_name)).append('<br>');
			$.each(_this.json_data.stream, function(i, stream){
				if(stream.metadata[0].category == cat_name){
					var item =$('<div></div>')
						.setTemplate(template)
						.processTemplate(stream)
						.appendTo($(_this.content_selector));
						//$('div.hyphenate').hyphenate({remoteloading:true,});//.css('color','red');
						//$('.text').hidetext();						
				}
			});		
		});
	
	}
	
	
	
}); // end class VideoManager		
