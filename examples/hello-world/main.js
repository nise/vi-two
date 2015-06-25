/* 
* name: Vi2.Example / Vi2.Main
*	author: niels.seidel@nise81.com
* license: BSD New
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo: 	
*/


Vi2.Example = $.inherit({ 

  __constructor : function() { 
  	vi2 = this;
  	vi2.dom = "#vi2";
  	vi2.templatePath = "views/";
  	var files = [
  			{path: 'data.json', storage: 'json_data'},
  			{path: 'data-slides.min.json', storage: 'json_slide_data'}
  	];
		
		vi2.db = new Vi2.DataBase( {path: '/', files: files }, this, 'init');
  },
  
  viLog : '',
  
  /**
  
  */
  init : function(){
  
  
  	this.viLog = new Log({logger_path:this.server_url+'/log'}); 
  			
  	vi2.utils = new Vi2_Utils();
  	
  	vi2.observer = new Vi2.Observer({selector:"#seq", videoWidth:"400px", videoHeight:"800px"}); 
		vi2.observer.init(0);  
		vi2.observer.setCurrentStream('seidel1'); 
		vi2.observer.parse(vi2.dom, 'html');
		
		//this.loadConfig();
		
		
		// At first we define some basic player widgets
		var playbackSpeed = new Vi2.PlaybackSpeed();
		var temporalBookmarks = new Vi2.TemporalBookmarks();
		var zoom = new Vi2.Zoom();
		var sharing = new Vi2.Sharing();
		//var skipBack = new Vi2.SkipBack();
				
		// Add an table of content
	 	var toc = new Vi2.TableOfContents( { 
	 		hasTimelineMarker: true, 
	 		hasMenu: true, 
	 		menuSelector:'.toc' 
	 	} );
		
		// Synchronize some presentation slides
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
		//vi2.observer.addWidget( userNotes );
		vi2.observer.addWidget( relatedVideos );
		//vi2.observer.addWidget( inVideoSearch );	
		vi2.observer.addWidget( playbackSpeed );  
		vi2.observer.addWidget( temporalBookmarks );
		vi2.observer.addWidget( zoom ); 
		vi2.observer.addWidget( sharing ); // http://localhost/elearning/vi2/vi-two/examples/iwrm/videos/iwrm_seidel1.webm
  }
  
  
  /**
  {
  widgets : [
  	{name: 'related-videos', command: 'Vi2.RelatedVideos', options: { resultSelector: '.related-videos' } }.
  	{}
  ]
  
  }
  
  loadConfig : function(){
  	$.get( this.options.config, function(data){
  		for(var w in data){
  			if(data.hasOwnProperty(w)){
  				//window[data[w].command]()		
  			}
  		}
  	} );
  }
 */
}); // class

