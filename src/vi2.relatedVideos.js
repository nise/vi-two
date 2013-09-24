	/* RelatedVideos
	author: niels.seidel@nise81.com
	
	to-do
	- destructor: man möchte ja nicht nur im eigenen Saft schwimmen (filter bubble), sondern auch auf andere Themen stoßen ... statt optimal match
	- (server side) 	- users that have seen this video also took a look at ...

	*/


	 
	var Vi2_RelatedVideos = $.inherit(/** @lends RelatedVideos# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) { 
  		this.options = $.extend(this.options, options); 
  		this.showRelatedVideos('huppert1');
		},
				
		name : 'related-videos',
		options : {target_selector:'#seq', modes:'incomming-links+outgoing-links'},
		player : null,
		
		/* ... */
		init : function(ann){
			var _this = this;
			this.link_list = this.buildLinkList(ann);	
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

		
		/* -- */
		determineRelatedLinks : function(id){
			var _this = this;
			var streams = []; //alert(this.options.modes.split("+")[0])
			$.each(this.options.modes.split("+"), function(i, mode){ 
				switch(mode){
					case "incomming-links" :
						streams.push(_this.getRelativesByIncommingLinks(id));
						break;
					case "outgoing-links" :
						streams.push(_this.getRelativesByOutgoingLinks(id));
						break;
				}
			}); 
			return streams;
			// sort by occurance
			for(var i = 0; i < streams.length; i++){
				s[streams[i]]++;
  		}	
  		s.sort(); 
  		return s;
		},

		
		/* -- */
		showRelatedVideos : function(id){
			$.each(this.determineRelatedLinks(id), function(i,val){
				//$('#debug').val($('#debug').val() +' '+ i +'('+val+')');
			});
		},


		/* unused !!! */
		showLinkSummary : function(e){ return;
		 var _this = this;
			var screen = observer.openScreen(this.options.target_selector);
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
