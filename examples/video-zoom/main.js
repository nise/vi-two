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
  	alert(  $('vi2-video-r').data('src') );
  
  	vi2.viLog = new Log(); 
  	vi2.utils = new Vi2_Utils();
  	
  	vi2.observer = new Vi2.Observer({selector:"#seq", videoWidth:"400px", videoHeight:"800px"}); 
		vi2.observer.init(0);  
		
		var videoManager = new Vi2.VideoManager(); 
		vi2.observer.addWidget( videoManager ); 
		videoManager.init();
		vi2.videoManager = videoManager;
		
		// At first we define some basic player widgets
		var playbackSpeed = new Vi2.PlaybackSpeed();
		var temporalBookmarks = new Vi2.TemporalBookmarks();
		var zoom = new Vi2.Zoom();
		var skipBack = new Vi2.SkipBack();
		
		// Now add these widgets to the player
		vi2.observer.addWidget( zoom );	
		vi2.observer.addWidget( playbackSpeed );  
		vi2.observer.addWidget( temporalBookmarks );
		vi2.observer.addWidget( skipBack ); 
		
  }
}); // class

