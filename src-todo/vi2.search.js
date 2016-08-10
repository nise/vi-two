/* 
* name: Vi2.Search 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: Search within annotated video contents
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*  - parametrisierung, insb. gewichtung der ergebnisse, sortierung, suchparameter
*  - pagination
*/


Vi2.Search = $.inherit(/** @lends Vi2.Search# */{

	/** 
	*		@constructs 
	*		
	*/
	__constructor : function( options ) { 
			this.options = $.extend(this.options, options);   
	},
	
	name : 'search',
	options : {
		resultSelector: '.search-results', 
		limit: 25
	},
	total : 0,


	/* handle search */
	find : function(string){
		
		if(ocr == undefined){ //alert(22);
			window.setTimeout("vi2.observer.widget_list['search'].find('"+string+"')", 1000); // bug!!
			return;
		}else{
			var t1 = 0, t2 = 0;
			var t = new Date(); t1 = t.getTime();
			var _this = this;
			var result = [];
			var maxResult = 1;
		
	/*		var t1 = 0; var t2 = 0;
			$.ajax({type: "POST", dataType: "json", url: './ocr.json', 
				beforeSend : function(){ 
					var t = new Date(); t1 = t.getTime(); 
				},
				success: function(res){  
					var t = new Date(); t2 = t.getTime();
					_this.ocr = res;
		*/			
				// split search string into words by using an regex
				$.each(string.split(/[^\s"]+|"([^"]*)"/gi), function(i, str){ 
						var expp = new RegExp(str, "gi");
						// parse json completly 
						$.each(vi2.db.json_data.stream, function(i, stream){ 
								// add stream as potential result
								stream.id = String(stream.id);
								if(result[i] == null){ 
									result[i] = {}; 
								} 
								result[i].id = stream.id;
								result[i].title = stream.metadata[0].title;
								result[i].author = stream.metadata[0].author;
								if(result[i]['abstract'] == undefined){ result[i]['abstract'] = 0; }
								if(result[i].tags == undefined){ result[i].tags = 0; }
								if(result[i].auth == undefined){ result[i].auth = 0; }
								if(result[i].fulltext == undefined){ result[i].fulltext = 0; }
							
								// increment title-count in case it matches
								if(stream.metadata[0].title.search(expp) != -1 ){
									result[i].ti = 1;
								}else{
									result[i].ti = 0;
								}
										
								// increment author-count in case it matches
								if(stream.metadata[0].author.search(expp) != -1 ){
									result[i].auth = 1;
								}else{
									result[i].auth = 0;
								}		
								
								// increment abstract-count in case it matches
								if(stream.metadata[0]['abstract'].search(expp) != -1 ){
									result[i]['abstract'] += stream.metadata[0]['abstract'].match(expp).length;
								}
								
								// increment tag-count in case one or more are matching
								var t = '';

								$.each(stream.tags, function(i,val){ 
									t += this.tagname+' '; 
								});	
					
								if(t.search(expp) != -1 ){
									result[i].tags += t.match(expp).length;
									//alert(stream.id+' '+ result[stream.id].tags);
								}
							
								// full text search inside slides 
								//var slides = '';
								$.each(ocr, function(index, val){ 
									if(val.id == stream.id){ 
										$.each(val.slides, function(index2, vall){ 
											if((vall.text).search(expp) != -1){ 
												result[i].fulltext++;
												//slides = slides + ',' + vall.source;
											}
										});
									}	
								});
							
								// weight results 
								result[i]['total'] = result[i].ti * 12 + result[i].auth * 10 + result[i]['abstract'] * 2 + result[i].tags * 10 + result[i].fulltext * 2;
				
								if (result[i].total > maxResult) { 
									maxResult = result[i].total; 
								}
						});
					});
					// normalize result
					$.each(result, function(i, val){ if(this.total > 0) this.total = Math.ceil((100*this.total) / maxResult);});
					var t = new Date(); t2 = t.getTime(); 
					// render results, header and template
					$(_this.resultSelector).trigger('clear').empty().append($('<h2></h2>').text('Search results for "'+string+'"')).append('<span class="des">(search time: '+(t2-t1)+' ms)</span>');
						var item =$('<div></div>')
							.setTemplate($("#search-template").val())
							.processTemplate({results:result}) // vi2.db.json_data.stream.stream
							.appendTo($(_this.resultSelector));

					// sort results
					$('div.search-results > div').tsort('.res', {order:"desc"});

		}
		
	}
	
}); // end class
	
