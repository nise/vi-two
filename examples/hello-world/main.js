


/** class  **/ 
var VI2Core = $.inherit({ 

  __constructor : function() { 
  	vi2 = this;
  	vi2.dom = "#vi2";
  	var files = [
  			{path: 'data.json', storage: 'json_data'}
  	];
		
		vi2.db = new DataBase({path: '/', files: files}, this, 'init');
  },
  
  viLog : '',
  observer:'',
  
  /**
  
  */
  init : function(){
  	this.viLog = new Log({logger_path:this.server_url+'/log'}); 
  			
  	vi2.utils = new Vi2_Utils();
  	
  	vi2.observer = new Observer({selector:"#seq", videoWidth:"400px", videoHeight:"800px"}); 
		vi2.observer.init(0);
		vi2.observer.setCurrentStream('seidel1');
		
		
		vi2.observer.parse(vi2.dom, 'html');
		
		var widget = new TOC({hasTimelineMarker: true, hasMenu: true}); 
		vi2.observer.addWidget(widget); 
  }
 
}); // class

