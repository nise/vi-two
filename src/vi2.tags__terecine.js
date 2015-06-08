/* TEMPORAL TAGS
	author: niels.seidel@nise81.com
	inherits form Annotation
	
	
server side:
	- save entered tags and 
	- append tags to the cloud (update after entering)
	- idee: - semantische topic maps via db.pedia .. linked data browsing
	*/
	

	/* class TemporalTagging */ 
	var TemporalTagging = $.inherit(Annotation, /** @lends TemporalTagging# */{
			
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
		options : {selector: '#tags', overlay_selector:'#overlay', vizOnTimeline: true, max: 20, sort: 'alpha', order: 'asc'},
		player : null,
		tag_obj : {},
		tag_list : [],
		timelineSelector : 'div.vi2-video-seek',
		
		// dummy function for clock event bindings
		begin : function(e, id, obj){ 
				this.currLinkId = id;
				var _this = this; 
				var pos = this.relativePos(obj.displayPosition); 
				var o = $('<a></a>')
					//.text('xxx')
					//.attr('href', obj.content.target)
					.attr('id', 'ov'+id)
					.addClass('overlay ov-'+id)
					.addClass('hyperlink-highlight')
	 				.bind('click', {}, function(data){
	 					
	 					_this.showOverlay(String(obj.content.title).replace(/\ /g, '_'));
					})
					.bind('mouseover', {}, function(e){
						$(this).text(obj.content.title);
					})
					.bind('mouseout', {}, function(e){
						$(this).text('');
					})
					
					// css_scale img height:auto; width:auto; max-width:300px; max-height:300px;
				$(this.options.overlay_selector).append(o); 
				//alert($(this.options.overlay_selector).offset().left+'  '+pos.x);
				o.css({left: pos.x, top: pos.y, position:'absolute', width: '100px', height: '100px'})
					.show();			
	 	},
	 				
		end : function(e, id){ 	 //alert('end link')
			$(this.options.overlay_selector+' .ov-'+id).hide();
		},
		
		/* Returns position of link anchores relativ to the dedicated representation area 
		* 		@param {Object} obj Contains an annotation object including its spatial elements.
		* 		@returns {Object} 
		**/
		relativePos : function(obj){ 
			//var pplayer = observer.widget_list['seq']; // IWRM only fix xxx // bugy
			//return {x: Math.floor((obj.x/100)*pplayer.width()), y: Math.floor((obj.y/100)*pplayer.height())};
			return {x: Math.floor((obj.x/100)*615), y: Math.floor((obj.y/100)*450)};
		},
		
		
		/*
		Expands overlay window
		**/
		showOverlay : function(item){ 
			var selector = $('<div></div>').attr('id','persons-dialog').addClass('some-dialog');
			//$('#dialog3').html('');
			require(['text!../views/biography.ejs', 'ejs'], function(thetemplate) {    
				$.ajax({
			    type: "get",
			    beforeSend: function(xhr){
						//	if (xhr.overrideMimeType){ xhr.overrideMimeType("application/json"); }
					},
			    url: 'http://127.0.0.1:3000/json/persons/'+String(item).replace(/\ /,'_'),
			    dataType: 'json',
			    success: function(data){ 
			    	var tt = ejs.render(thetemplate, { items: data });
			    	
			    	selector
							.html(tt)
						//	.appendTo('#dialog3')
							.dialog({
									//autoOpen: true,
									height: '400', 
									width: '600', 
									//modal:true, 
									draggable: false,
									open : function(){
										//$(this).show();  
										
										vi2.observer.player.pause();
									},
									close : function(){
										//$(this).hide();
										//$(this).destroy();
										//$( this ).dialog( "close" );
										vi2.observer.player.play();
									},
									closeOnEscape: true,
									resizable: false,
									//title: item,// + ' to ' + $(this).attr('title'),
									//position:['100',0], 
									colseText:'x',
									zIndex:20000
							});
							$(selector).dialog( "open" );
					},
					error : function(e){ alert('ERRO '+JSON.stringify(e)); }		  
				});
			});
		
		},
		
		/** -- */
		init : function(ann){ 
			var _this = this;
			_this.tag_obj = [];
			$.each(ann, function(i, val){ 
				if(val.type == 'tags'){ 
					var ii = _this.get_tag_by_name(val.title);
					if( ii == -1){ 
						_this.tag_obj.push({tagname: val.title, occ: [{start: val.t1, duration: val.t2, xpos:val.x, ypos:val.y}]});
					}	else {
					_this.tag_obj[ii].occ.push({start: val.t1, duration: val.t2, x:val.x, y:val.y});
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
			//$(vi2.dom).find('[type="tags"]').each(function(i,val){ $(this).remove(); }); 
			
			$.each(	vi2.db.getTagsById(id), function( i, val ){   //alert(val.starttime)
				$.each(val.occ, function(j, occurance){		
					var toc = $('<div></div>')
						.attr('type',"tags")
						.attr('starttime', occurance.start)
						.attr('id', "tag-"+j)	
						.attr('posx', occurance.x)
						.attr('posy', occurance.y)
						.attr('duration', occurance.duration)
						.text(decodeURIComponent(val.tagname))
						.appendTo( vi2.dom )
						;
				});			
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
		
		/** ... */
		displayTagcloud : function(){  
			$(this.options.selector).empty();
			var _this = this;
			// template for displaying tags
			var ln = function(_name, _freq, _tags){ 
				return $('<li></li>')
					.addClass('list-item')
					.attr('id', _name.replace(' ', '--'))
					.append($('<a></a>')
					.attr('freq', _freq)
					.addClass('id-'+_name.replace(' ', '--'))
					//.append($('<span></span>')//
					//.attr('href', '#!tag:'+_name.replace(' ', '_')) // IWRM
					.text(_name+', ')//+'('+_freq+') ')
					.css("font-size", (_freq / 10 < 1) ? _freq / 10 + 1 + "em": (_freq / 10 > 2) ? "2em" : _freq / 10 + "em")
					.bind('click', {tags:_tags}, function(e){ 
						_this.showTimelineTag(e.data);
						vi2.observer.log('clicktagfromlist:'+_name); 
						
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
			if(e.tags.occ.length === 1 && e.tags.occ[0].start >= 0){ 
				// jump to temporal position 
				this.player.currentTime(e.tags.occ[0].start);
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
					var progress = this.start / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width());
  	    	if (isNaN(progress)) { progress = 0; }
	 				$(_this.timelineSelector).append(f(progress, e.tags.tagname, this.start));
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

		
