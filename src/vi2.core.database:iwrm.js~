	/* DataBase
	author: niels.seidel@nise81.com
	
	- call_back als Event umsetzen
	- filenames as parameter
	- handle different data sets
	
	*/


	/* class DataBase **/ 
	var DataBase = $.inherit(/** @lends DataBase# */{

		/** 
		*		@constructs
		*		@param {object} options An object containing the parameters
		*		@param {function} call_back Function that will be called after relevant data is available 
		*/
  	__constructor : function(options, call_back) {
  		this.call_back = call_back;
  		var _this = this;
  		this.options = $.extend(this.options, options);
  		
  		this._d = 0;
  		this.jsonFiles_arr = [
  			{path: this.options.path+'videos', storage: 'json_data'}, 
//  			{path: this.options.path+'data-slides.min.json', storage: 'json_slide_data'},
  			{path: this.options.path+'users', storage: 'json_user_data'}
  		]; 
  		$.each(this.jsonFiles_arr, function(key, file) { 
        console.log("making requst for " + file);  
        _this.loadJSON(file.path, file.storage);
       });
		},
				
		name : 'dataBase',
		options : {path:'./'}, // ?
		call_back : {},
		jsonFiles_arr : '',
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
	loadJSON : function(jsonURL, storage){ 
		var _this = this;
    $.ajax({
        type: "get",
        beforeSend: function(xhr){
    				if (xhr.overrideMimeType){
				      xhr.overrideMimeType("application/json");
    				}
  			},
        url: jsonURL,
        dataType: 'json',
        success: function(data){   
            console.log("got " + jsonURL);
            _this[storage] = data[0]; 
            _this._d++; 
            if (_this._d == Object.size(_this.jsonFiles_arr)){ 
            	console.log('done');  
            	// call
            	_this.call_back.startApp();
            	
            }
        },
        error: function(e){ alert(jsonURL+'___'+JSON.stringify(e));
					var err = new Error('Could not catch data');
				}
    });
	},


/* DB Calls */	
	
	/* returns true if stream of id exists */
	isStream : function(id){
		var t = false;
		$.each(this.json_data.stream, function(val){
			if (this.id == id){
				t = true;
			}
		});
		return t;
	},
		
	//get stream by id
	getStreamById : function(id){
		var stream = {}; 
		$.each(this.json_data.stream, function(i, val){ 
			if (val.id == id){  
				stream = val;
			}
		});
		return stream;
	},
			


	/* CATEGORIES*/

	/* returns data of all categories */
	getAllCategories : function(){ 
		return this.json_data.categories;
	},
	
	
	// returns ordered list of all categories
	getCategoryTaxonomie : function(){
		var cat = new Object();
		$.each(this.json_data.categories, function(i,val){ 
				cat[this.pos] = {first_level: this.title, desc: this.desc};
		}); 
		return cat;
	},
	
	
	/* returns data of the requested category */
	getCategory : function(cat_name){
		var data = {};
		$.each(this.json_data.categories, function(i,val){ 
			if(this.title == cat_name){
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
		$.each(this.json_data.stream, function(val){
				titles.push({first_level: this.metadata[0].title});
		});
		return removeDuplicates(titles);
	},
	
	//get all authors
	getAuthors : function(){
		var authors = [];
		$.each(this.json_data.stream, function(val){
				authors.push({first_level: this.metadata[0].author});
		});
		return removeDuplicates(authors);
	},
	
	/* - - */
	getStreamsOfSameAuthor : function(id){
		var author = this.getMetadataById(id).author; 
		var authors = [];
		$.each(this.json_data.stream, function(i, stream){ 
				if(stream.metadata[0].author == author && stream.id != id){ 
					authors.push(stream.id); //$('#debug').val($('#debug').val() + stream.id);
				}
		});
		return authors;
	}, 
	
	

	/* TAGS */	

	/* returns all tags of a video/stream */
	getTagsById : function(id){
		return this.getStreamById(id).tags;
	},
		
	/* returns all tags related to the whole video collection */
	getTagList : function(){
		var tags = [];
		$.each(this.json_data.stream, function(val){
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
			$.each(_this.json_data.stream, function(j, stream){  
				$.each(stream.tags, function(k, tag){ 
					if(this.tagname == the_tag_name.tagname){ 
					 streams.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
					}
				});
			});			
		});
		return streams;
	},
	
	

	/* LINKS */
	
		/* -- */
	getLinkTargetsById : function(id){
		var links = []; 
		$.each(	this.getStreamById(id).links, function(val){ 
			links.push(this.target);  //$('#debug').val($('#debug').val() + this.target);
		});
		return	links;
	},
	
	/* -- */
	getLinkSourcesById : function(id){
		var links = [];	
		$.each(this.json_data.stream, function(i, stream){
			$.each(stream.links, function(i, link){
				if(this.target == id){
				 links.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
				}
			});
		});			
		return links;	
	},
	
	/* -- */ 	
	getLinksById : function(id){
		return this.getStreamById(id).links; 
	},
	
	
	/* returns table of content of the requested video */
	getTocById : function(id){
		return this.getStreamById(id).toc
	},
	
	
	/** 
	*	@param {String} Video id
	*	@returns {Object} JSON object with temporal annotation of images/slides of video with the given id.
	*/ 	  
	getSlidesById : function(id){
		var slides = {}; 
		$.each(this.json_slide_data._slides, function(i, val){ 
			if (this.id == id){  
				slides = this.slides;
			}
		}); 
		return slides;
	}, 
	
	
	/**
	
	*/
	getUserById : function(id){
		var user = {}; 
		$.each(this.json_user_data.users, function(i, val){ 
			if (this.id == id){  
				user = this;
			}
		}); 
		return user;
	}, 
		
		
	/**
	
	*/
	getGroupById : function(id){
		var group = {}; 
		$.each(this.json_user_data.groups, function(i, val){ 
			if (this.id == id){  
				group = this;
			}
		}); 
		return group;
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
