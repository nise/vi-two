	/* RelatedVideos
	author: niels.seidel@nise81.com
	
	to-do
	- destructor: man möchte ja nicht nur im eigenen Saft schwimmen (filter bubble), sondern auch auf andere Themen stoßen ... statt optimal match
	- (server side) 	- users that have seen this video also took a look at ...

	*/


	 
Vi2.RelatedVideos = $.inherit(/** @lends RelatedVideos# */{

		/** 
		*		@constructs 
		*		@param {object} options 
		*		@param {object} options.modes Object...
		*/
  	__constructor : function(options) { 
  		this.options = $.extend(this.options, options); 
  		this.determineModes( vi2.observer.current_stream );
		},
				
		name : 'related-videos',
		options : {
			resultSelector:'.related-videos', 
			modes: [ 
				{ mode: 'incomming-links', weight:0.4 },
				{ mode: 'outgoing-links', weight:0.8 },
				{ mode: 'same-author', weight:0.8 }
				]
			},
		results : {},		
		player : null,
		
		/* ... */
		init : function(ann){
			var _this = this;
			this.link_list = this.buildLinkList(ann);	
		},
		
		
		/* -- */
		determineModes : function(id){
			var _this = this;
			var streams = []; //alert(this.options.modes.split("+")[0])
			$.each( this.options.modes, function(i, mode){ 
				switch(mode.mode){
					case "incomming-links" :
						streams.push(_this.getRelativesByIncommingLinks(id));
						break;
					case "outgoing-links" :
						streams.push(_this.getRelativesByOutgoingLinks(id));
						break;
					case "same-author"	:
						_this.weightResults( _this.getRelativesOfSameAuthor(id), mode.weight )	
						break;
					case "same-tags"	:
						_this.weightResults( _this.getRelativesByTagRelation(id), mode.weight)	
						break;
					default :
						// do nothing			
				}
			}); 
			return;
			return streams;
			// sort by occurance
			for(var i = 0; i < streams.length; i++){
				s[streams[i]]++;
  		}	
  		s.sort(); 
  		return s;
		},
		
		/***/
		weightResults : function(res, weight){ 
			var _this = this;
			$.each(res, function(i, val){
				if( val in _this.results == false ){  
					_this.results[ val ] = 0;
				}
				_this.results[ val ] += weight;
			});
			alert(JSON.stringify(_this.results))
		},
		
		
		/** 
		
		*/
		showRelatedVideos : function(id){
			var _this = this;
			$.each(this.determineRelatedLinks(id), function(i,val){
				$(_this.options.resultSelector).append(val)
				//$('#debug').val($('#debug').val() +' '+ i +'('+val+')');
			});
		},	
		
		
		/* -- */
		getRelativesByOutgoingLinks : function(id){
			return vi2.db.getLinkTargetsById(id);	
		},
		
		
		/* -- */
		getRelativesByIncommingLinks : function(id){
			return vi2.db.getLinkSourcesById(id);	
		},
		
		
		/* -- */		
		getRelativesByTagRelation : function(id, number){
			return vi2.db.getStreamsWithSameTag(id);
		},
		
		
		/* -- */		
		getRelativesOfSameAuthor : function(id){ 
			return vi2.db.getStreamsOfSameAuthor(id);
		},

		
		

		
		


		/** */
		showLinkSummary : function(e){ return;
		 var _this = this;
			var screen = observer.openScreen(this.options.resultSelector);
			// prepare link list (remove doubles)
			var ex = [];
			$.each(_this.link_list.tags, function(i, val){
				if(ex.indexOf(val.target) == -1){
					val.name = vi2.db.getMetadataById(val.target.replace(/\#!/, '')).title; 
					ex.push(val.target);
				}else{ 
					val.name = 0; val.target = '';
				}
				
			});
			// use template
			screen.setTemplate('<div><h3>Related Lectures:</h3><ul>{#foreach $T.tags as link}{#if $T.link.name == 0}{#else}<li><a href="{$T.link.target}">{$T.link.name}</a></li>{#/if}{#/foreach}</ul></div>');
			screen.processTemplate(_this.link_list);
			
		}
		
		
	}); // end class RelatedVideos		
