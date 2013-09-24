/* TEMPORAL TAGS
	author: niels.seidel@nise81.com
	inherits form Annotation
	
	
server side:
	- save entered tags and 
	- append tags to the cloud (update after entering)
	- idee: - semantische topic maps via db.pedia .. linked data browsing
	*/
	

	/* class TemporalTagging **/ 
	var TemporalTagging = $.inherit(Annotation, /** @lends TemporalTagging# */{
			
			/** @constructs
			*		@extends Annotation  
			*		@param {object} options An object containing the parameters
			*/
  		__constructor : function(options, tag_obj) {
  			this.options = $.extend(this.options, options); 
  			this.tag_obj = tag_obj;
  			
  			// display tags
  			this.displayTagcloud();
		},
		
		name : 'tags',
		type : 'annotation',
		options : {selector: '#tags', vizOnTimeline: true, max: 20, sort: 'alpha', order: 'asc'},
		player : null,
		tag_obj : {},
		tag_list : [],
		timelineSelector : 'div.vi2-video-seek',
		
		// dummy function for clock event bindings
		begin : function(e){},
		end : function(e){},
		
		/* ... */
		displayTagcloud : function(){
			var _this = this;
			// template for displaying tags
			var ln = function(_name, _freq, _tags){ 
				return $('<a></a>').attr('freq', _freq)
					//.append($('<span></span>')//
						.attr('href', '#!tag:'+_name.replace(' ', '_'))
						.text(_name+', ')//+'('+_freq+') ')
						.css("font-size", (_freq / 10 < 1) ? _freq / 10 + 1 + "em": (_freq / 10 > 2) ? "2em" : _freq / 10 + "em")
						//.bind('click', {tags:_tags}, function(e){ _this.showTimelineTag(e.data)})
					;
			};
			
			// prepare list and append existing tags
			var ul = $("<div></div>").attr("id", "tagList");   
			$.each(this.tag_obj, function(i, val){ 
				ul.append(ln(val.tagname, val.occ.length, val));
			});
			// sort by occurence or alphabeticly, sort order desc / asc
			var sortAttr = {};
			sortAttr.attr = this.options.sort == 'freq' ? 'freq' : '';
			sortAttr.order = this.options.order == 'desc' ? "desc" : "asc";
			ul.find('li').tsort(sortAttr);// 
			// cut off elements above max and render them
			$(ul).find('li:gt('+(this.options.max-1)+') > a').hide();
			$(this.options.selector).html(ul);
		},		
		
		/* ... */
		showTimelineTag : function(e){
			var _this= this;
			if(e.tags.occ.length === 1 && e.tags.occ[0] > 0){
				// jump to temporal position 
				this.player.currentTime(e.tags.occ[0]);
			}else{
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name, _time){
					return $('<span></span>')
						.addClass('timetag ttag')
						.attr('style','left:'+_left+'px;')
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

		
