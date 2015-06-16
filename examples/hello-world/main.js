


/** class  **/ 
Vi2.Example = $.inherit({ 

  __constructor : function() { 
  	vi2 = this;
  	vi2.dom = "#vi2";
  	var files = [
  			{path: 'data.json', storage: 'json_data'}
  	];
		
		vi2.db = new DataBase({path: '/', files: files}, this, 'init');
  },
  
  viLog : '',
  
  /**
  
  */
  init : function(){
  
  
  	this.viLog = new Log({logger_path:this.server_url+'/log'}); 
  			
  	vi2.utils = new Vi2_Utils();
  	
  	vi2.observer = new Observer({selector:"#seq", videoWidth:"400px", videoHeight:"800px"}); 
		vi2.observer.init(0);
		vi2.observer.setCurrentStream('seidel1');
		vi2.observer.parse(vi2.dom, 'html');
		
		
		// At first we define some basic widgets
		var playbackSpeed = new Vi2.PlaybackSpeed();
		
		
		// now lets set up some annotation widgets.
	 	var toc = new Vi2.TableOfContents( { hasTimelineMarker: true, hasMenu: true, menuSelector:'.toc' } );
		
		
		// With these widgets we make use of the video database
		var related = new Vi2.RelatedVideos( { 
			resultSelector: '.related-videos', 
			modes:[{ mode: 'same-author', weight:0.8 }] 
		} );
		
		
		// add all the widgets
		vi2.observer.addWidget( toc );	
		vi2.observer.addWidget( playbackSpeed );  
  }
 
}); // class

