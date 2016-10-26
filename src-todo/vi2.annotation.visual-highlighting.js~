/* 
*	name: Vi2.Highlighting
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
	- show element on menu click
	- enable object tracking
	- implement: showOnTimeline ... make it abstract in the parent class	

	*/
	
 
Vi2.VisualHighlighting = $.inherit( Vi2.Annotation, /** @lends TemporalTagging# */{
			
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
		
		name : 'highlight',
		type : 'annotation',
		options : {
			selector: '#highlight', 
			overlay_selector:'#overlay', 
			timeline_selector : '.vi2-video-seek',
			vizOnTimeline: true, 
			max: 20, 
			sort: 'alpha', 
			order: 'asc',
			showOnTimeline: false,
			sync: false
		},
		player : null,
		tag_obj : {},
		tag_list : [],
		popup: '',
		
		
		// dummy function for clock event bindings
		begin : function(e, id, obj){ 
				if( this.options.sync ){
					this.placeHighlight(e, id, obj);
				}			
	 	},
	 				
		end : function(e, id){ 	 
			//$(this.options.overlay_selector+' .overlay').hide(); // xxx bugy
		},
		
		/* Returns position of link anchores relativ to the dedicated representation area 
		* 		@param {Object} obj Contains an annotation object including its spatial elements.
		* 		@returns {Object} 
		**/
		relativePos : function(obj){ 
			//var pplayer = observer.widget_list['seq']; // IWRM only fix xxx // bugy
			//return {x: Math.floor((obj.x/100)*pplayer.width()), y: Math.floor((obj.y/100)*pplayer.height())};
			return {
				x: Math.floor((obj.x/100) * $('#video1').width() ), 
				y: Math.floor((obj.y/100) * $('#video1').height() ) 
			};
		},
		
		
		/*
		Expands overlay window
		**/
		showOverlay : function(item){ 
			var _this = this;
			this.popup = $('<div></div>').attr('id','persons-dialog').addClass('some-dialog');
			//$('#dialog3').html('');
			require(['text!../views/biography.ejs', 'ejs'], function(thetemplate) {    
				$.ajax({
			    type: "get",
			    beforeSend: function(xhr){
						if (xhr.overrideMimeType){ xhr.overrideMimeType("application/json"); }
					},
			    url: 'http://localhost:3000/json/persons/'+String(item).replace(/\ /,'_'),
			    dataType: 'json',
			    success: function(data){ 
			    	var tt = ejs.render(thetemplate, { items: data });
			    	_this.popup
							.html(tt)
							.appendTo('#dialog3')
							.dialog({
									//autoOpen: true,
									height: '400', 
									width: '600', 
									//modal:true, 
									draggable: false,
									open : function(){
										$(this).show();  
										vi2.observer.player.pause();
									},
									close : function(){
										vi2.observer.player.video.play();
										$('.highlight-element').hide();
										$(this).hide();
										$(this).destroy();
										$( this ).dialog( "close" );
										
									},
									closeOnEscape: true,
									resizable: false,
									//title: item,// + ' to ' + $(this).attr('title'),
									position:['100',0], 
									colseText:'x',
									zIndex:20000
							});
							
							$( _this.popup ).dialog( "open" );
					},
					error : function(e){ console.log('@'+this.name+': ERROR '+JSON.stringify(e)); }		  
				});
			});
		
		},
		
		/** -- */
		init : function(ann){ 
			var _this = this;
			_this.tag_obj = [];
			$.each(ann, function(i, val){  
				if(val.type == 'highlight'){ 
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
			
			$.each(	vi2.db.getHighlightById(id), function( i, val ){   
				$.each(val.occ, function(j, occurance){		
					var toc = $('<div></div>')
						.attr('type',"highlight")
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
			
			// prepare list and append existing tags
			var ul = $("<ul></ul>").addClass("highlight-list").appendTo(this.options.selector);   
			$.each(this.tag_obj, function(i, val){
				var li = $('<li></li>')
					.addClass('list-item')
					.attr('id', val.tagname.replace(' ', '--'))
					.append($('<a></a>')
					.attr('freq', val.occ.length )
					.addClass('id-'+val.tagname.replace(' ', '--'))
					.text(val.tagname+', ')//+'('+val.occ.length+') ')
					.css("font-size", (val.occ.length / 10 < 1) ? val.occ.length / 10 + 1 + "em": (val.occ.length / 10 > 2) ? "2em" : _freq / 10 + "em")
					.bind('click', {tags: val }, function(e){
						$('.highlight-element').remove(); 
						_this.showTimelineTag(e.data);
						vi2.observer.log('clicktagfromlist:'+ val.tagname); 
					})
				).appendTo( ul ); 
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
			var _this = this; 
			$(_this.options.timeline_selector+' .ttag').remove();
			if(e.tags.occ.length === 1 && e.tags.occ[0].start >= 0){ 
				// jump to temporal position 
				this.player.currentTime(e.tags.occ[0].start); 
				// highlight object inside the video 
				this.placeHighlight({}, 2,{ content: { title: e.tags.tagname}, displayPosition: {x: e.tags.occ[0].xpos, y: e.tags.occ[0].ypos, width: '100px', height:'100px'}});
			}else{ 
				// display tag occurence on timeline to motivate further selection
				$.each(e.tags.occ, function(){ 
					var progress = this.start / _this.player.duration();
					progress = ((progress) * $(_this.options.timeline_selector).width());
  	    	if (isNaN(progress)) { progress = 0; }
					var span = $('<span></span>')
						.addClass('highlight-timeline-entry')
						.attr('style','left:'+ progress +'px;')
						.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text(''+ e.tags.tagname);} })				
						.bind('click', function(){
							_this.player.currentTime( this.start );
							// highlight object inside the video
							
						})
						;
						/*.bind('mouseover', function(){
							...tooltip  e.tags.tagname
						});*/
	 				$(_this.options.timeline_selector).append( span );
 				});
			}
		},
		
		/* Places an image on top of teh video frame
			* 
			* 
			
		*/
		placeHighlight: function(e, id, obj){
			var _this = this; 
				var pos = this.relativePos(obj.displayPosition); 
				var o = $('<a></a>')
					//.text(''+obj.tagname )
					//.attr('href', obj.content.target)
					.attr('id', 'ov'+id)
					.addClass('overlay ov-'+id)
					.addClass('highlight-element')
	 				.bind('click', {}, function(data){
	 					_this.showOverlay( String(obj.content.title).replace(/\ /g, '_') );
					})
					.bind('mouseover', {}, function(e){
						$(this).text(obj.content.title);
					})
					.bind('mouseout', {}, function(e){
						$(this).text('');
					})
				// append and position object
				$(this.options.overlay_selector).append(o); 
				o.css({ 
					left: pos.x, 
					top: pos.y, 
					position:'absolute', 
					width: obj.displayPosition.width, 
					height: obj.displayPosition.height 
				})
				.show();
			
			// remove highlight layer when playback starts
			$( vi2.observer.player ).on('player.play', function(e){
				$('.highlight-element').remove();
				_this.popup.dialog( "close" );
			});		
		}
		
	}); // end class

		
