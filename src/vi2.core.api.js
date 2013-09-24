/* class API
author: niels.seidel@nise81.com

Ziel könnte sein, mittels eines Learning Analytic-Frameworks die Annotationsdaten abzufragen, um sie in Echtezeit auswerten zu können.

Beipiel:
http://www.example.com/api.html?linksOfCategory=Tools&titleOf=video23

XML: http://stackoverflow.com/questions/5581592/render-xml-document-obtained-through-ajax-call-to-a-new-window

Planed extensions:
	*- inputAPI: Methode vi2.data("../data.json"), um die Metadaten der Videokollektion hinzufügen zu können. 
	*- output formats:
	*-- google sitemaps
	*-- linked data
	*-- RSS
	*-- IMS Content Package export ... generate imsmanifest.xml generieren und mit dateien zippen: http://stuk.github.io/jszip/
	*-- wiki markup
	*-- html markup / smil


*/ 
var Vi2_API = $.inherit(/** @lends API# */{
	/**
	* The Data API is implemented as an flexible interface between vi2.db.js and the address bar of the browser. More useful are api call via node.js. 
	* Combinations of functions can be requested, each with multiple parameter. The output is presented as is. No further calculations or joins of the data are not part of the API. Sofar it is an output API only. Input to the database can not be handled. The default output format is JSON. Other formats are still under construction. 	
	* 
	* 	@constructs 
	*/
  __constructor : function() { 
  	this.url = purl();
  },
  
  url : '',
  format : 'json',
  func_list : ['getStreamById', 'getCategoryTaxonomie'],
  
  /** ... */
  get : function(url){
	  var _this = this;
  	// determine output format
  	this.format = this.url.fparam('format') != '' ? this.url.fparam('format') : this.format;
  	//
  	this.funcs = this.getRequestedFunctions();
  	
  	// cycle through all requested functions and collect results
  	$.each(this.funcs, function(i, func){ 
 			// get parameter
  		this.params = _this.url.fparam(func.name).split(',');
  		if(this.params.length == 0){
  			func.results['void'] = vi2.db[func.name]();
			}else{
				// cycle through param
				$.each(this.params, function(j, param){ 
					// call function and store results
					func.results[param] = vi2.db[func.name](param); 
				});
  		}
  		
  	});  	
  	this.render(this.funcs);
  },
  
  /** ... */
  getRequestedFunctions : function(){
  	var _this = this;
  	var functions = new Object();
  	$.each(this.func_list, function(i, func){
  		if(_this.url.fparam(func)){
  			functions[func] = {name: func, params: '', results: {}}; 
  		}
  	});
  	return functions;
  },
  
  /** 
  * @description Passes data with data URI scheme
  * @parameter {json} data
   */
  render : function(data){
  	switch(this.format){
  		case 'xml':
  			
  			break;
  		default:	// json
  			//return data;
  				window.location.href = 'data:application/json;charset=utf-8,' + encodeURIComponent( JSON.stringify(data) );
  			//$('body').empty().text(JSON.stringify(data));
  	}
  	
  }
  
  	

	}); // end class API  	
