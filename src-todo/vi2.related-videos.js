/* 
* name: Vi2.RelatedVideos
* author: niels.seidel@nise81.com
* license: MIT License
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* to-do:
*  - implement random-destructor => @db random array sort missing
*  - exclude videos that have been watched already => make dependency to ViewingHistory 
*  - add categorie as possible criterion
*  - add updated_at / created_at as a criterion
*  - (server side) 	- users that have seen this video also whatched this
*  - check literature about other algorithms for recommender systems
*/


Vi2.RelatedVideos = $.inherit(/** @lends Vi2.RelatedVideos# */{

		/** 
		*		@constructs 
		*		@param {object} options 
		*		@param {object} options.criteria Object...
		*		@param {Number} options.criteria.weight Weight of the given criteria
		*		@param {Number} options.limit Number of requestested related videos
		*/
  	__constructor : function(options) { 
  		this.options = $.extend(this.options, options); 
		},
				
		name : 'related-videos',
		options : {
			resultSelector:'.related-videos', 
			limit : 10, 
			criteria: [ 
				{ criterion: 'random-destructor', weight:0.2 },
				{ criterion: 'outgoing-links', weight:0.4 },
				{ criterion: 'incomming-links', weight:0.4 },
				{ criterion: 'outgoing-links', weight:0.8 },
				{ criterion: 'same-author', weight:0.8 }
				]
			},
		results : {},		
		player : null,
		
		/* ... */
		init : function(ann){
			//var _this = this;
			//this.link_list = this.buildLinkList(ann);	
			this.determineCriteria( vi2.observer.current_stream );
		},
		
		
		/* -- */
		determineCriteria : function(id){
			var _this = this;
			this.results = {};
			$.each( this.options.criteria, function(i, criterion){ 
				switch(criterion.criterion){
					case "random-destructor" :
						_this.weightResults( vi2.db.getRandomStreams(id), criterion.weight );	
						break;
					case "incomming-links" :
						_this.weightResults( vi2.db.getLinkSourcesById(id), criterion.weight );	
						break;
					case "outgoing-links" :
						_this.weightResults( vi2.db.getLinkTargetsById(id), criterion.weight );	
						break;
					case "same-author"	:
						_this.weightResults( vi2.db.getStreamsOfSameAuthor(id), criterion.weight );	
						break;
					case "same-tags"	: 
						_this.weightResults( vi2.db.getStreamsWithSameTag(id), criterion.weight );	
						break;
					default :
						// do nothing			
				}
			}); 
			// render results
			this.showRelatedVideos();
		},
		
		
		/*
		* @res {object} {<stream-id>: <number of occurances>}
		**/
		weightResults : function(res, weight){  
			var _this = this;
			$.each(res, function(i, val){ 
				if( i in _this.results === false ){  
					_this.results[ i ] = 0;
				} 
				_this.results[ i ] += Math.floor( val * weight * 10) / 10; // bug: strange floating number as result
			});
			
		},
		
		/**
		
		*/
		sortByRelevance : function(arr){
			var sortable = [];
			for (var el in arr){
						sortable.push([el, arr[el]]);
			}			
			return sortable.sort(function(a, b) { 
				return  b[1] - a[1]; 
			});
		},
		
		
		/** 
		Renders results
		*/
		showRelatedVideos : function(id){
			var _this = this;
			// sort by relevance 
			this.results = this.sortByRelevance( this.results );
			var ul = $('<ul></ul>');
			
			var j = 0;	
			$.each(this.results, function(i,val){
				if( j < _this.options.limit ){ 
					var t = val.toString().split(','); 
					var li = $('<li></li>').appendTo(ul);
					var a = $('<a></a>').attr('href','#!/video/' + t[0] + '').text( t[0] + ' (' + t[1] + ')').appendTo(li);
					;	
				}
				j++;
			});
			$( this.options.resultSelector ).html( ul );
		}	
		
		


		/** deprecated ... 
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
		 */
		
		
	}); // end class RelatedVideos		
