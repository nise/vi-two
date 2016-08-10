/* DataBase
* author: niels.seidel@nise81.com
* license: MIT License

* todo:
- call_back als Event umsetzen
- filenames as parameter
- handle different data sets

*/


	/* class DataBase **/ 
	Vi2.DataBase = $.inherit(/** @lends DataBase# */{

		/** 
		*		@constructs
		*		@param {object} options An object containing the parameters
		*		@param {function} call_back Function that will be called after relevant data is available 
		*/
  	__constructor : function(options, call_back, fn, video_id) {  
  		this.call_back = call_back;
  		var _this = this;
  		this.options = $.extend(this.options, options); 
  		this._d = 0;  
  		$.each(this.options.jsonFiles, function(key, file) { 
        console.log("making requst for " + file.path);  
        _this.loadJSON(file.path, file.storage, fn);
       });
		},
				
		name : 'dataBase',
		options : {
			path :'',
			jsonFiles: [
  		//	{path: '/json/videos/', storage: 'json_data'}, 
  		//	{path: '/groups', storage: 'json_group_data'},
				// {path: this.options.path+'data-slides.json', storage: 'json_slide_data'},
  		//	{path: '/json/users', storage: 'json_user_data'}
  		]
		}, // ?
		call_back : {},
		_d : 0,
		json_data : {},
		json_slide_data : {},
		json_user_data : {},
		content_selector : '#content',
		dom : '#hydro1', // unused
		

	/**
	*	@param {Sring} URL of JSON file
	*	@param {Object} Internal Object where the fetched data will be stored for processing within the class 
	*/
	loadJSON : function(jsonURL, storage, fn){ 
		var _this = this;
    $.ajax({
        type: "get",
        beforeSend: function(xhr){
    				if (xhr.overrideMimeType){
				      xhr.overrideMimeType("application/json");
    				}
  			},
        url: _this.options.path + jsonURL,
        dataType: 'json',
        success: function(data){ 
            //alert("got " + jsonURL);
            _this[storage] = data;  
            
            //alert(JSON.stringify(_this.json_data))
            _this._d++; 
            if (_this._d === Object.size( _this.options.jsonFiles ) ){ 
            	console.log('done'); 
            	// call
            	_this.call_back[fn]();
            	
            }
        },
        error: function(e){
        	window.location = "/login"; 
					var err = new Error('Could not catch data');
				}
    });
	},


/* DB Calls */	
	
	/* returns true if stream of id exists */
	isStream : function(id){
		var t = false;
		$.each(this.json_data, function(val){
			if (this.id === id){
				t = true;
			}
		});
		return t;
	},
		
	//get stream by id
	getStreamById : function(id){  
		if(this.json_data === undefined){
			return {};
		}else{
			return this.json_data;
		}
		// old:
		/*
		var stream = {};  
		$.each(this.json_data, function(i, val){ 
			if (val._id === id){  
				stream = this; 
			}
		});
		
		return stream;
		*/
	},
			


	/* CATEGORIES*/

	/* returns data of all categories */
	getAllCategories : function(){ 
		return this.json_data.categories;
	},
	
	
	// returns ordered list of all categories
	getCategoryTaxonomie : function(){
		var cat = {};
		$.each(this.json_data.categories, function(i,val){ 
				cat[this.pos] = {first_level: this.title, desc: this.desc};
		}); 
		return cat;
	},
	
	
	/* returns data of the requested category */
	getCategory : function(cat_name){
		var data = {};
		$.each(this.json_data.categories, function(i,val){ 
			if(this.title === cat_name){
				data = {first_level: this.title, desc: this.desc, pos: this.pos, link: this.link, icon:this.icon};
			} 
		}); 
		return data;
	},
	

	/* META DATA */

	//
	getMetadataById : function(id){ 
		return this.getStreamById(id).metadata[0];
	},
		
	//get all titles
	getTitles : function(){
		var titles = [];
		$.each(this.json_data, function(val){
				titles.push({first_level: this.metadata[0].title});
		});
		return removeDuplicates(titles);
	},
	
	//get all authors
	getAuthors : function(){
		var authors = [];
		$.each(this.json_data, function(val){
				authors.push({first_level: this.metadata[0].author});
		});
		return removeDuplicates(authors);
	},
	
	/* - - */
	getStreamsOfSameAuthor : function(id){
		var author = this.getMetadataById(id).author; 
		var authors = [];
		$.each(this.json_data, function(i, stream){ 
				if(stream.metadata[0].author === author && stream.id != id){ 
					authors.push(stream.id); //$('#debug').val($('#debug').val() + stream.id);
				}
		});
		return authors;
	}, 
	
	

	/* TAGS */	

	/* returns all tags of a video/stream **/
	getTagsById : function(id){
		if(this.json_data.tags === undefined){
			return {};
		}else{
			return this.getStreamById(id).tags;
		}
	},
	
	/* returns all comments related to an video **/
	getCommentsById : function(id){
		if( this.getStreamById(id).comments === null ){
			return {}
		}else{
			return this.getStreamById(id).comments;
		}	
	},
		
	/* returns all tags related to the whole video collection **/
	getTagList : function(){
		var tags = [];
		$.each(this.json_data, function(val){
			$.each(this.tags, function(val){
				tags.push({first_level: this.tagname});
			});
		});
		return this.removeDuplicates(tags).sort();
	},
	
	/* returns ordered list of all tags */
	getTagTaxonomie : function(){ 
		var tax = [];
		$.each(this.json_data._taxonomy, function(i, stream){
			tax.push({first_level: this.id, second_level: this.sub});	
		});
		return tax;
	},
	
	/* -- */ 
	getStreamsWithSameTag : function(id){
		var _this = this;
		var streams = [];
		var tags = this.getStreamById(id).tags; 
		$.each(tags, function(i, the_tag_name){	
			$.each(_this.json_data, function(j, stream){  
				$.each(stream.tags, function(k, tag){ 
					if(this.tagname === the_tag_name.tagname){ 
					 streams.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
					}
				});
			});			
		});
		return streams;
	},
	
	
	/* -- */
	getRandomStreams : function( id ){
		var _this = this;
		var streams = [];
		$.each(_this.json_data, function(j, stream){ 
			streams.push(stream.id);
		});
		return streams; // xxx need to be sort random
	},
	
	

	/* LINKS */
	
		/* -- */
	getLinkTargetsById : function(id){
		var links = []; 
		$.each(	this.getStreamById(id).hyperlinks, function(val){ 
			links.push(this.target);  //$('#debug').val($('#debug').val() + this.target);
		});
		return	links;
	},
	
	/* -- */
	getLinkSourcesById : function(id){
		var links = [];	
		$.each(this.json_data, function(i, stream){
			$.each(stream.hyperlinks, function(i, link){
				if(this.target === id){
				 links.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
				}
			});
		});			
		return links;	
	},
	
	/* -- */ 	
	getLinksById : function(id){
		return this.getStreamById(id).hyperlinks; 
	},
	
	/* -- */ 	
	getAssessmentFillInById : function(id){
		return this.getStreamById(id).assessmentfillin; 
	},
	
	/* -- */ 	
	getAssessmentWritingById : function(id){
		return this.getStreamById(id).assessmentwriting; 
	},
	
	/* -- */ 	
	getAssessmentById : function(id){
		if(this.json_data.assessment === undefined){
			return {};
		}else{	
			return this.json_data.assessment; 
			//return this.getStreamById(id).assessment;
		}
	},
	
	
	/* returns table of content of the requested video */
	getTocById : function(id){
		if(this.json_data.toc === undefined){
			return {};
		}else{ 
			return this.getStreamById(id).toc;
		}
	},
	
		/* returns highlight of the requested video */
	getHighlightById : function(id){ 
		if( this.json_data.highlight === undefined ){
			return {};
		}else{ 
			return this.getStreamById(id).highlight;
		}
	},
	
	
	/** 
	*	@param {String} Video id
	*	@returns {Object} JSON object with temporal annotation of images/slides of video with the given id.
	*/ 	  
	getSlidesById : function(id){ 
		//alert(JSON.stringify( this.getStreamById(id)['slides'] ))
		return this.getStreamById(id).slides; 
		/*
		if(this.json_data.slides === undefined){
			return {};
		}else{
			return this.json_data.slides;
		}
		*/
		/*
		var slides = {}; 
		$.each(this.json_data, function(i, val){ 
			if (this._id === id){  
				slides = this.slides;
			}
		}); 
		return slides;
		*/
	}, 
	
	/*
	*
	**/
	hasSlides : function(id){
		if(this.getStreamById(id).slides !== undefined){
			if(this.getStreamById(id).slides.length > 0){
				return true;
			}
		}
		return false;
	},
	
	
	/**
	
	*/
	getUserById : function(id){  //alert(id); alert(this.json_user_data)
		var user = {}; 
		$.each(this.json_user_data, function(i, val){ 
			if( Number(val.id) === Number(id) ){  
				user = val;
			}
		}); 
		return user;
	}, 
		
		
	/**
	
	*/
	getGroupById : function(id){
		var group = {}; 
		$.each(this.json_group_data, function(i, val){ 
			if ( Number(val.id) === Number(id) ){  
				group = val;
			}
		}); 
		return group;
	},
	
	/* --- **/
	getUserByGroupId : function(group, pos){ //alert(group+'  '+pos)
		var u = [];
		$.each(this.json_user_data, function(i, val){ 
			if ( val.groups[pos] === group){  
				u.push( val );
			}
		});
		
		return u;
	}, 
				
	






	

	



	



	
	
	
	
	
	
	
	
	
/* TO CLEAN UP */	

	//
	getVideoById : function(id){ 
		var video = $('<div></div>')
			.attr('type',"video")
			.attr('starttime',0)
			.attr('duration',7)
			.attr('id', "myvideo")
			.text(this.getStreamById(id).video);  
		return video;
	}
	
	/* returns stream by its title  // xxx remove rendering code
	getStreamsByTitle : function(title_name){
		var _this = this;
		var template = $("#item_template").val();
		
		$(_this.content_selector)
			.empty()
			.trigger('clear');
			//.append($('<h2></h2>').text('Lectures in category: '+title_name));

		$.each(this.json_data.stream, function(i, stream){
				if(stream.metadata[0].title == title_name){
					var item =$('<div></div>')
						.addClass('content-item')
						.setTemplate(template)
						.processTemplate(stream)
						.appendTo($(_this.content_selector));
				}
		});
		//$('.text').hidetext();
		// reset drop downs
		$('.getStreamsByTag').val(-1);
		$('.getStreamsByCategory').val(-1);
	},
	*/
	
	
	
	}); // end class DataBase	
