/* 
*	name: Vi2.TemporalTags
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- how to update multiple tags @ updateDOMElement
	- semantische topic maps via db.pedia .. linked data browsing
*/
	

	/* class TemporalTagging */ 
	Vi2.TemporalTags = $.inherit( Vi2.Annotation, /** @lends TemporalTagging# */{
			
		/** @constructs
		*		@extends Annotation  
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options, tag_obj) {
			this.options = $.extend(this.options, options); 
			this.tag_obj = tag_obj;
			
			// display tags
			//this.displayTagcloud();
		},
		
		name : 'tags',
		type : 'annotation',
		options : { 
			selector: '#tags', 
			hasTimelineMarker: true, 
			max: 20, 
			sort: 'alpha', 
			order: 'asc'
		},
		player : null,
		tag_obj : {},
		tag_list : [],
		timelineSelector : 'div.vi2-video-seek',
		
		// dummy function for clock event bindings
		begin : function(e){},
		end : function(e){},
		
		/**  */
		init : function(ann){ 
			var _this = this;
			_this.tag_obj = [];
			$.each(ann, function(i, val){ 
				if(val.type == 'tags'){ 
					var ii = _this.get_tag_by_name(val.title);
					if( ii == -1){
						_this.tag_obj.push({tagname: val.title, occ: [val.t1]});
					}	else {
					_this.tag_obj[ii].occ.push(val.t1);
					}
				}
 			}); 
			this.displayTagcloud(); 
		},
		
		/* -- **/
		//<div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		//{"tagname":"La Nina","occ":[0]},
		appendToDOM : function(id){
			var _this = this;
			$(vi2.dom).find('[type="tags"]').each(function(i,val){ $(this).remove(); }); 
			
			$.each(	vi2.db.getTagsById(id), function( i, val ){   //alert(val.starttime)
				$.each(val.occ, function(j, time){		
					var toc = $('<div></div>')
						.attr('type',"tags")
						.attr('starttime', time)
						.attr('duration', 10)
						.attr('id', "tag-"+j)
						.text(decodeURIComponent(val.tagname))
						.appendTo( vi2.dom )
						;
				});			
			});
		},
		
		/*
		**/
		updateDOMElement : function( obj ){
				//.attr('starttime', obj.time )
				//.text( obj.content );	
			$(vi2.dom)
				.find(':contains("'+ obj.time +'")')
				.each(function(i,val){
					$(val)
						.text( obj.content)
						.attr('author', vi2.wp_user )
						.attr('date', new Date().getTime())
				}); 
		},	
		
		
		/** -- */
		get_tag_by_name : function(name){
			var out = -1;
			$.each(this.tag_obj, function(i, val){
				if(val.tagname == name){
					out = i;
				} 
			});
			return out;
		},
		
		/** 
		 */
		displayTagcloud : function(){  
			$(this.options.selector).empty();
			var _this = this;
			// template for displaying tags
			var ln = function(_name, _freq, _tags){ 
				return $('<li></li>').addClass('list-item').attr('id', _name.replace(' ', '--')).append($('<a></a>').attr('freq', _freq).addClass('id-'+_name.replace(' ', '--'))
					//.append($('<span></span>')//
					//.attr('href', '#!tag:'+_name.replace(' ', '_')) // IWRM
					.text(_name+', ')//+'('+_freq+') ')
					.css("font-size", (_freq / 10 < 1) ? _freq / 10 + 1 + "em": (_freq / 10 > 2) ? "2em" : _freq / 10 + "em")
					.bind('click', {tags:_tags}, function(e){ 
						vi2.observer.log('clicktagfromlist:'+_name);
						_this.showTimelineTag(e.data);
					})
					);	
			};
			
			// prepare list and append existing tags
			var ul = $("<ul></ul>").addClass("tagslist").appendTo(this.options.selector);   
			$.each(this.tag_obj, function(i, val){
				ul.append(ln(val.tagname, val.occ.length, val));
			});
			// sort by occurence or alphabeticly, sort order desc / asc
			var sortAttr = {};
			sortAttr.attr = this.options.sort == 'freq' ? 'freq' : '';
			sortAttr.order = this.options.order == 'desc' ? "desc" : "asc";
			ul.find('a').tsort(sortAttr); 
			// cut off elements above max and render them
			$(ul).find('li:gt('+(this.options.max-1)+') > a').hide();
			
		},		
		
		/* ... */
		showTimelineTag : function(e){ 
			var _this= this;
			if(e.tags.occ.length === 1 && e.tags.occ[0] >= 0){
				// jump to temporal position 
				this.player.currentTime(e.tags.occ[0]);
			}else{
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name, _time){
					return $('<span></span>')
						.addClass('timetag ttag')
						.attr('style','left:'+_left+'px;')
						.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text(''+_name);} })				
						.bind('click', function(){
							_this.player.currentTime(_time);
						})
						;
						/*.bind('mouseover', function(){
							...tooltip  _name
						});*/
				};
				//				
				$(_this.timelineSelector+' .ttag').remove();
				$.each(e.tags.occ, function(){
					var progress = this / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width());
  	    	if (isNaN(progress)) { progress = 0; }
	 				$(_this.timelineSelector).append(f(progress, e.tags.tagname, this));
 				});
			}
		},
		
		/* ... */
		addTags : function(){
			var _this = this;
			var sc = vi2.observer.openScreen();
			sc.html('<h4>Add tags @ '+this.player.currentTime().toString().substr(0,4)+'s</h4>').append($('<form class="myform"></form>').keyup(function(e) { if (e.which == 27) { _this.saveTags(); } }).append('<ul id="mytags"></ul>'));
			$('#mytags').show();
			var close = $('<h3>x</h3>')
				.addClass('close-btn')
				//.button()
				.width(20)
				.bind('click', function(){ _this.saveTags(); })
				;
			sc.append(close);
			// bug ..its not called twice
			$("#mytags").tagit({
				availableTags: ["c++", "java", "php", "coldfusion", "javascript", "asp", "ruby", "python", "c", "scala", "groovy", "haskell", "perl"]
			});
		},
		
		/* ... */
		saveTags : function(){
			var _this = this;
			var arr = [];
			$.each($('ul#mytags > li'), function(i, val){
				if($(val).find('input[type=hidden]').val() != undefined)
					$('#debug').append("Tag: "+$(val).find('input[type=hidden]').val()+" @ "+_this.player.currentTime()+"s");
				//$('#debug').append("{tagname:'"+$(val).find('input[type=hidden]').val()+"', occ:["+_this.player.currentTime()+"]}");
				//arr.push($(val).find('input[type=hidden]').val()); 
				//alert($(val).find('input[type=hidden]').val());
			});
			vi2.observer.closeScreen();
			// save to couchdb
			// display updated tag-list by dbload or appendance
			
		},
	
		get_tags_by_name : function(){}
		
	}); // end class

		
