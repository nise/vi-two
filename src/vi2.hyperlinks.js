/* 
*	name: Vi2.Hyperlinks
*	author: niels.seidel@nise81.com
* license: BSD New
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- timeLineSelector
	- nice defaults: var defaults = {animLen: 350}; 
	- bug: offset @ o.css({left: pos.x   ... nicht im MediaWiki, aber in den showcases
	
	nth
	- viz on timeline
	- apply minimum link duration
	- delay removeOverlay on mouseover/shift-press etc.
	
	*/


	/* class XLink **/ 
	var XLink = $.inherit(/** @lends XLink# */{

		/** @constructs
		*		@extends Annotation
		*		@param {object} options An object containing the parameters
    *		@param {string} options.target_selector A required setting.
    *		@param {string} options.selector An optional setting.
		*/
  	__constructor : function(options) {
  		this.options = $.extend(this.options, options); 
		},
				
		name : 'xlink',
		type : 'annotation',
		
		options : {target_selector:'#seq' ,selector: '#overlay', vizOnTimeline: true, minDuration: 5},
		player : null,
		timelineSelector : 'div.vi2-video-seek', 
		link_list : {},
		currLinkId :-1,

		/* ... */
		init : function(ann){
			var _this = this;
			this.clear();
			this.link_list = this.buildLinkList(ann);	
			this.showTimelineXlink(this.link_list);
		},		
		
		/* Translated database entry of link into a dom element that the parser will read later on */
		// // <div type="xlink" starttime=297 duration=14 posx=32 posy=90 id="Using existing Videos" >bonk1</div>
		appendToDOM : function(id){
			var _this = this;
			$(vi2.dom).find('[type="xlink"]').each(function(i,val){ $(this).remove(); });
			$(vi2.dom).find('[type="cycle"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getLinksById(id), function(val){ 
				var links = $('<div></div>')
				.attr('type', this.type) // former default: "xlink"
				.attr('starttime', deci2seconds(this.start))
				.attr('duration', this.duration)
				.attr('posx', this.x)
				.attr('posy', this.y)
				.attr('seek', deci2seconds(this.seek))
				.attr('duration2', deci2seconds(this.duration2))
				.attr('id', this.id)
				.text('#!'+this.target)
				.appendTo( vi2.dom )
				;
			});
		},				
		
		
		/* ... */
		buildLinkList : function(ann){
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){
				if(val.linktype == 'cycle' || val.linktype == 'standard' || val.linktype == 'xlink'){ 
					e.tags.push({name: val.title, occ:[val.t1], target:val.target});
				}
			});
			return e;
		},

		
		/** Begin of XLink annotation. Typically the link anchor will apeare on screen. There are three different link types: standard (target within video collection), external (target elsewhere in the WWW) and cycle (like standard link but with the option to return to the link source).
				@param {Object} e
				@param {String} id
				@param {Object} obj		
		*/
		begin : function(e, id, obj){ 
				this.currLinkId = id;
				var _this = this;
				var pos = this.relativePos(obj.displayPosition); 
				var o = $('<a></a>')
					.text(obj.content.title)
					//.attr('href', obj.content.target)
					.attr('id', 'ov'+id)
					.addClass('overlay ov-'+id)
					.addClass('hyperlink-'+obj.linktype)
	 				.bind('click', {}, function(data){
	 					// distinguish link types
	 					switch(obj.linktype){
	 						case 'standard' : 	// called xlink
	 							var new_stream = obj.content.target.replace(/\#!/,'');
								vi2.observer.setCurrentStream(new_stream);
								break;
							case 'external' :
								return true;
							case 'cycle' : 
								var new_stream = obj.content.target.replace(/\#!/,'');
								vi2.observer.setCurrentStream(new_stream);
								// make new object for return link
								var return_obj = {
									title : 'return to: '+obj.content.title,
									target : String(_this.player.url).replace(/.webm/,'').replace(/videos\/iwrm\_/,''), // dirty IWAS hack
									linktype : 'standard',
									type : 'xlink',
									x : 2, //obj.displayPosition.x,
									y : 93, // obj.displayPosition.y,
									t1 : obj.seek,
									t2 : obj.duration,
									seek : obj.displayPosition.t1,
									duration : 0
								};	
								// append that object
								vi2.observer.vid_arr[0]['annotation'].push(return_obj); 
								//	_this.loadCycleVideo(obj.content.target, 10, 15, obj.displayPosition.t1); // url, seek time, duration, return_seek
								break;
							case 'x':
								break;	
						}
						// load Video
						_this.loadVideo(vi2.observer.vid_arr[0]['url'], obj.seek);
						// log something
						vi2.observer.log(_this.player.url+' link_click: '+obj.content.target+', seek_to: '+obj.displayPosition.t1);
						// remove link ancshor after click 
						$(this).remove();
					});
				$(this.options.selector).append(o);
				// positioning object AFTER appending it to its parent // buggy
				// ($(this.options.selector).offset()).left+
				//alert($(this.options.selector).offset().left+'  '+pos.x);
				o.css({left: pos.x, top: pos.y, position:'absolute'});		
		//	}	
		},
	
		/* End of annotion time. The link anchor will disapear from screen. */
		end : function(e, id){ 	 //alert('end link')
			$(this.options.selector+' .ov-'+id).hide();
		},
		
		/* Visualizes link representations on the timeline */
		showTimelineXlink : function(e){
				var _this= this; 
				$(_this.timelineSelector+' .timetag').remove();
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name, start){
					var sp = $('<span></span>');					
					sp.addClass('timetag tlink').attr('style','left:'+_left+'px;')
						.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text('Link to: '+_name);} })
						.bind('click', function(event){
							_this.player.currentTime(start);
							vi2.observer.log(_this.player.url+' timeline_link_seek: '+start);
						});
					return sp;
				};
				//				
				$.each(e.tags, function(){ 					
					var progress = this.occ[0] / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width()); 
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector+'link').append(f(progress, this.name, this.occ[0]));
 				});
		},
		

		
		// ?
		clear : function(){
			$(this.options.selector).html('');
			// xxx static, stands in relative with template of videoplayer
			$('.vi2-video-seeklink').html('');
			
		},
		
		// ?
		vizOnTimeline : function(){},
		
		
		/** Returns position of link anchores relativ to the dedicated representation area 
		* 		@param {Object} obj Contains an annotation object including its spatial elements.
		* 		@returns {Object} 
		*/
		relativePos : function(obj){ 
			//var pplayer = observer.widget_list['seq']; // IWRM only fix xxx // bugy
			//return {x: Math.floor((obj.x/100)*pplayer.width()), y: Math.floor((obj.y/100)*pplayer.height())};
			return {x: Math.floor((obj.x/100)*615), y: Math.floor((obj.y/100)*450)};
		},
		
		/** Loads video from url and seeks to a dedicated position in time. 
		*		@param {String} url 
		* 	@param {Number} seek 
		*/
  	loadVideo : function(url, seek){
	  	this.player.loadVideo(url, seek);  			
  	},
  	
  	/** ... */
  	loadCycleVideo : function(url, seek, duration, return_seek){
	  	this.player.loadCycleVideo(url, seek, duration, return_seek);  			
  	}
  	
	}); // end class XLink


