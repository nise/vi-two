/* UTILS 


json_validator: http://jsonformatter.curiousconcept.com/

**/ 
var Maintain = $.inherit(/** @lends Maintain# */{
		/* @constructs 
		*/
  __constructor : function() {
   // do nothing
	},

	//
	
	validateTags : function(){
		var tax = [];
		$.each(this.json_data._taxonomy, function(i, stream){
			$.each(stream.sub, function(i, val){
				tax.push(val);//{first_level: this.id, second_level: this.sub});	
			});
			//tax.push(stream.id);
		});
		var tags = [];
		$.each(this.json_data._stream, function(i, val){
			$.each(this.tags, function(i, tag){
				tags.push(tag.tagname)
			});
		});
		
		$.each(tax, function(i, val){
				if($.inArray(val, tags) == -1){
					$('#debug').append(val+', ');
				}
		});
		
	},


	//
	validateTags2 : function(){
	
		var tax = [];
		$.each(this.json_data._taxonomy, function(i, stream){
			$.each(stream.sub, function(i, val){
				tax.push(val);//{first_level: this.id, second_level: this.sub});	
			});
			tax.push(stream.id);
		});

		$.each(this.json_data._stream, function(i, val){
			$('#debug').append('Not found in '+val.id+': ');
			$.each(this.tags, function(i, tag){
				if($.inArray(tag.tagname, tax) == -1){
					$('#debug').append(tag.tagname+', ');
				}
			});
			$('#debug').append('<br/>');
		});

	},
	
	//
	validateLinks : function(){
		$.each(this.json_data._stream, function(i, val){
			$('#debug').append('['+val.id+'] '+val.metadata[0].title+' ('+val.metadata[0].author+'):<br/>');
			$.each(this.links, function(i, l){
					$('#debug').append('"'+l.id+'" @ '+l.start+' => '+l.text+'<br/>');
			});
			$('#debug').append('<br/>');
		});
	},
		
		
	/*

{"template":"basic","title":"New Project","guid":"E073E685-3ED6-4C5C-A210-A137894E4745","project":
{"targets":[{"id":8,"name":"Area1"},{"id":9,"name":"Area2"}],
"media":[{"id":"Media4","name":"Media41327357877524","url":"http://127.0.0.1/elearning/vi2/_attachments/videos/iwrm_cullmann.ogv","target":"main","
duration":178.378,"tracks":[

{"name":"Track1327357889581","id":"Track6","trackEvents":[

{"id":"TrackEvent128","type":"text","popcornOptions":{"start":3.5563294858342074,"end":12.915091290661069,"text":"hello","target":"Area2"},"track":"Track1327357889581","name":"Track1327357889591"}


]}]}]}}
	
	*/	
	generateButter : function(id){
		var _this = this;
		var butter = '{"template":"basic","title":"'+id+'","guid":"AA41AB3B-D145-477E-A264-3B42701F1E85", "project": {"targets":[{"id":0,"name":"Area1"},{"id":1,"name":"pop-container"}],"media":[ {"id":"Media0","name":"Media01327337635028","url":"http://127.0.0.1/elearning/vi2/_attachments/videos/iwrm_cullmann.ogv","target":"main","duration":4829.205,"tracks":[';
		var track0 = '',
		 		track1 = '',
		 		track2 = '',
		 		butter1 = '',
		 		butter2 = '', 
		 		butter3 = '';
		
		// fetch slides
		$.each(this.getStreamById(id, true).slides, function(i, val){
			//butter += '{"image":{"start": '+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1/elearning/vi2/_attachments/slides/'+id+'/'+this.img+'", "text":"", "target":"image-container", "link":{}, "id":"'+this.img.replace(/.jpg/, '')+'"}},'
			if(i % 2 == 0 ){
				butter1 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1/elearning/vi2/_attachments/slides/'+id+'/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639244","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
			}else{
				butter2 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1/elearning/vi2/_attachments/slides/'+id+'/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639255","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
			}
		}); 
		
		// fetch hyperlinks 
		$.each(this.getStreamById(id).links, function(i, val){
			butter3 += '{"id":"TrackEventA'+i+'","type":"pop","popcornOptions":{"start":'+Number(_this.deci2seconds(this.start))+',"end":'+(Number(_this.deci2seconds(this.start))+Number(this.duration))+',"exit":"2.5","text":"'+this.id+'", "link":"'+this.text+'","target":"pop-container", "left":"'+this.x+'%", "top":"'+this.y+'%"},"track":"Track1327357889566","name":"Track1327357889'+Math.ceil(Math.random()*1000)+'"},';		
		});
		track0 = '{"name":"Track1327337639244","id":"Track0", "trackEvents":['+butter1.substr(0, butter1.length -1)+']},';
		track1 = '{"name":"Track1327337639255","id":"Track1", "trackEvents":['+butter2.substr(0, butter2.length -1)+']},';
		track2 = '{"name":"Track1327357889566","id":"Track2", "trackEvents":['+butter3.substr(0, butter3.length -1)+']}';
		
		butter += track0 + track1 + track2 + ']}]}}';
		
		//$('#debug').html(butter);
		//this.json_import();
		//this.test();
	},	

	//
	/*
	Imports popcorn json into vi-two data/slides
	*/
	json_import : function(){ 
		var _this = this;
		var lectures = '';
		var images = ''; 
		$.ajax({
    	type: "POST",
    	dataType: "json",
    	url: './data_slide_update.json',
    	success: function(lec){   
    		
    		$.each(lec.data, function(i, val){
    			images = '';//val.title+"\n";	
    				 
    			$.each(val.project.media, function(ii, media){	
    				$.each(media.tracks, function(i, track){   
    					$.each(track.trackEvents, function(i, img){    
    						if(img.type === 'image'){
    							images += '{ "type":"seq", "starttime":'+img.popcornOptions.start+', "duration":'+(img.popcornOptions.end - img.popcornOptions.start)+', "id":"", "img":"'+String(img.popcornOptions.src).replace("http://elearning.ihi-zittau.de/beta/iwrm/slides/"+val.title+"/", "")+'" },';	
								}else if(img.type === 'pop'){
									images += '#x: '+img.popcornOptions.left+'  #y: '+img.popcornOptions.top+'  #start: '+_this.seconds2deci(img.popcornOptions.start)+'  #dur: '+(img.popcornOptions.end-img.popcornOptions.start)+'  #text: '+img.popcornOptions.text+'  #target: '+img.popcornOptions.link;
    							images += "\n";
    						}  				
    					});
    				});
    			});	
    			lectures += '\n { "id": "'+val.title+'", "slides":['+ images.substr(0, images.length - 1) +']},\n';			
    		});
    		
    		var jsoon = '';
				jsoon += '{ "_name": "vi2 slides", "_slides": [\n';
				jsoon += lectures.substr(0, lectures.length -1 );
				jsoon += '\n]}';
				
				$('#debug').html(jsoon);
    	},
			error: function(e, msg, x){ alert('error at json import '+msg); },
		});
	},
	
	//
	seconds2deci : function(s){
		var date = new Date(Math.ceil(s*1000));
		return (date.getHours()-1)+':'+date.getMinutes()+':'+date.getSeconds();
	},
	
	/*
	aim: search for broken images
	output: a string into debug textarea
	usage: copy the string into a bash script (e.g. script.sh) and run it inside the slides-folder: sh ./script.sh 
	*/
	validateImages : function(){
		var err = "#!/bin/bash \n";
		var img = new Image();
		
		$.each(this.json_slide_data._slides, function(i, lecture){
			var id = lecture.id;
			err += 'mkdir '+lecture.id;
			$.each(lecture.slides, function(j, img){
				err += 'cp ./'+id+'/'+img.img+' /'+lecture.id+' ;'
				//err += 'test -e ./'+id+'/'+img.img+' || echo "bad: '+img.img+'"; ';
			
			});
			
		});
		$('#debug').html(err);
	},
	
	test : function(){
	var dataString ='cullmann';
	if ( dataString ) { 
          		
          		var butter = '{"template":"basic","title":"'+dataString+'","guid":"AA41AB3B-D145-477E-A264-3B42701F1E85", "project": {"targets":[{"id":0,"name":"Area1"},{"id":1,"name":"pop-container"}],"media":[ {"id":"Media0","name":"Media01327337635028","url":"http://127.0.0.1/elearning/vi2/_attachments/videos/iwrm_'+dataString+'.ogv","target":"main","duration":4829.205,"tracks":[';
							var track0 = '',
		 					track1 = '',
		 					track2 = '',
		 					butter1 = '',
		 					butter2 = '', 
		 					//bam = '',
		 					butter3 = '';
							// 		
          		$.ajax({
    						type: "POST",
    						dataType: "json",
    						url: 'http://127.0.0.1/elearning/vi2/_attachments/data-slides.json',
    						success: function(data){  
    							$.each(data._slides, function(j, val){ 
    								//bam += '<option value="'+val.id+'">'+val.id+'</option>'
    								if(val.id == dataString){  
    									// fetch slides
											$.each(val.slides, function(i, val){ 
												if(i % 2 == 0 ){ 
													butter1 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1/elearning/vi2/_attachments/slides/'+dataString+'/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639244","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
												}else{
													butter2 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1/elearning/vi2/_attachments/slides/'+dataString+'/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639255","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
												}
											});
    								}
    							});	
    							//alert(bam);
									// fetch hyperlinks 
									/*$.each(this.getStreamById(id).links, function(i, val){
										butter3 += '{"id":"TrackEventA'+i+'","type":"pop","popcornOptions":{"start":'+Number(_this.deci2seconds(this.start))+',"end":'+(Number(_this.deci2seconds(this.start))+Number(this.duration))+',"exit":"2.5","text":"'+this.id+'", "link":"'+this.text+'","target":"pop-container", "left":"'+this.x+'%", "top":"'+this.y+'%"},"track":"Track1327357889566","name":"Track1327357889'+Math.ceil(Math.random()*1000)+'"},';		
									});*/
									track0 = '{"name":"Track1327337639244","id":"Track0", "trackEvents":['+butter1.substr(0, butter1.length -1)+']},';
									track1 = '{"name":"Track1327337639255","id":"Track1", "trackEvents":['+butter2.substr(0, butter2.length -1)+']}';
									//track2 = '{"name":"Track1327357889566","id":"Track2", "trackEvents":['+butter3.substr(0, butter3.length -1)+']}';
		
									butter += track0 + track1 + track2 + ']}]}}';
          		
          				$('#debug').html(butter);
  								//var data = JSON.parse( butter );
              		//popupManager.hidePopups();
              		//pm.importProject( data, document.getElementById( 'timeline-media-input-box' ).value );
    						},
								error: function(e){ alert('error at json import'); },
							});
          }
	
	}, 
	
	/* D3 Viz */
	chord : function(){
	var _this = this;
	var out = '';
	var links =''
	$.ajax({
    			type: "POST",
    			dataType: "json",
    			url: './data.json',
    			success: function(res){  
						$.each(res._stream, function(i, val){
							links = '';
							$.each(val.links, function(ii,vall){
								var cat = String(_this.getStreamById(val.id).metadata[0].category).replace(/\ /g, '').replace(/\_/g, '').replace(/\-/g, '').toLowerCase();
								links += '"flare.'+cat+'.'+vall.text+'.x",';
							}) 
							
							out += '{"name":"flare.'+String(this.metadata[0].category).replace(/\ /g, '').replace(/\_/g, '').replace(/\-/g, '').toLowerCase()+'.'+val.id+'.x","size":1699,"imports":['+links.slice(0,links.length-1)+']},'								
						})
					$('#debug').html(out.slice(0,out.length-1));
					}
	});





}

});
