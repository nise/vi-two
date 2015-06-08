/* Assessment
	author: niels.seidel@nise81.com
		
	- timeLineSelector
	- nice defaults: var defaults = {animLen: 350}; 
	- bug: offset @ o.css({left: pos.x   ... nicht im MediaWiki, aber in den showcases
	
	nth
	- apply minimum link duration
	- delay removeOverlay on mouseover/shift-press etc.
	
	*/


	/* class Assessment **/ 
	var AssessmentFillIn = $.inherit(/** @lends Assessment-fill-in# */{

		/** @constructs
		*		@extends Annotation
		*		@param {object} options An object containing the parameters
    *		@param {string} options.target_selector A required setting.
    *		@param {string} options.selector An optional setting.
		*/
  	__constructor : function(options) {
  		this.options = $.extend(this.options, options); 
		},
				
		name : 'assessment-fill-in',
		type : 'annotation',
		
		options : {target_selector:'#seq' ,selector: '#overlay', selector2:'#assessment-fill-in', vizOnTimeline: true, minDuration: 5},
		player : null,
		timelineSelector : 'div.vi2-video-seek', 
		link_list : {},
		currLinkId :-1,

		/* ... */
		init : function(ann){
			var _this = this;
			this.clear();
			this.link_list = this.buildLinkList(ann);	
			
			var _this = this;
			var comments = $('<ul></ul>').addClass('assessment-fi-list');
			$(this.options.selector2).html(comments);  
			var li = function(author, title, target, time, i){  
				var a = $('<a></a>')
					.text('Lücke '+i)
					.addClass('id-'+time)
					//.attr('href', '#'+vi2.options.id)
					;
				var user = vi2.db.getUserById(author);				
				return $('<li></li>')
					.addClass('list-item')
					.attr('author', author)
					.attr('id', 't'+target)
					//.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text('Kommentar von '+user.firstname+' '+user.name);} })
					.css('list-style-image',  "url('"+_this.options.path+"user-"+author+".png')")
					.html(a)
					.click(function(e){ 
						vi2.observer.log('clickfillinfromlist: Luecke'+i +' '+' '+time);
						_this.player.currentTime(time);
					});	;
			}; 
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){ //alert(val.type)
				if(val.type == 'assessment-fill-in'){  
					comments.append(li('', '', _this.formatTime(val.t1), val.t1, i)); 
					e.tags.push({name: val.title, occ:[val.t1]}); 
				}
			});
			
			
			this.vizOnTimeline(this.link_list);
		},		
		
		/* Translated database entry of link into a dom element that the parser will read later on */
		// // <div type="xlink" starttime=297 duration=14 posx=32 posy=90 id="Using existing Videos" >bonk1</div>
		appendToDOM : function(id){
			var _this = this;
			$(vi2.dom).find('[type="assessment-fill-in"]').each(function(i,val){ $(this).remove(); });
			//$(vi2.dom).find('[type="cycle"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getAssessmentFillInById(id), function(val){ 
				var links = $('<div></div>')
				.attr('type', this.type) // former default: "xlink"
				.attr('starttime', this.start)//deci2seconds(this.start))
				.attr('duration', this.duration)
				.attr('width', this.width == undefined ? 100 : this.width)
				.attr('posx', this.x)
				.attr('posy', this.y)
				//.attr('seek', deci2seconds(this.seek))
				//.attr('duration2', deci2seconds(this.duration2))
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
				
				$.get('/assessment/fill-in/'+vi2.currentVideo+'-'+obj.content.title, function(data){
					if(! data.empty){
						data[0].contents.sort(function(m1, m2) { return moment(m2.updated_at) - moment(m1.updated_at); }); 
					}
					if(data.empty == true){}	
					var newInput = document.createElement("input"); 	
					$(newInput)
						.attr('type', 'text')
						.attr('name', 'field-'+obj.content.title)
						.attr('id', obj.content.title)
						.css('width', obj.width)
						.val(data.empty ? '' : data[0].contents[0].text)
						.focus(function(e){ 
							_this.player.pause();
						});
				
					var btn = $('<div></div>')
						.text('speichern')
						.css('border-left','solid 1px #003366')
						//.button()
						.addClass('submit-fill-in')
						.click(function(e){
							vi2.observer.log(_this.player.url+' save-fill-in: '+obj.content.title); 
							$.post('/assessment/fill-in/'+vi2.currentVideo+'-'+obj.content.title, {"text": $(newInput).val() }, function(dat){
								//alert('saved'); // ot working xxx
								_this.player.play();
								$(btn).tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text('Eingabe gespeichert');} })
							});
						});
						$(btn).css('display','none');
						
					var rev = $('<div id="thediv"></div>')
						.text('historie')
						.css('display','inline')
						//.button()
						.addClass('submit-fill-in')
						.bind('mouseenter',function(e){
							_this.showRevisions(data, this);
						})
						.bind('mouseleave',function(e){
							$('.revisions').remove();
						})
						;
						$(rev).css('display','none');
						
						
							 
					var o = $('<span></span>')
						.append(newInput)
						.append(btn)
						.append(rev)
						.attr('id', 'ov'+id)
						.addClass('overlay ov-'+id)
						.addClass('assessment-fill-in')
		 				.bind('mouseenter', function(dataa){
		 					_this.player.pause();
		 					$(btn).css('display','inline');
							$(rev).css('display','inline');
		 					//$.get('/assessment/fill-in/'+id, function(data){ _this.showRevisions(data, o); });
						})
						.bind('mouseleave', function(data){ 
							//_this.player.play();
							$(btn).css('display','none');
							$(rev).css('display','none');
							$('.revisions').remove(); 
						})
						.appendTo(_this.options.selector);
					
					// positioning object AFTER appending it to its parent // buggy
					// ($(this.options.selector).offset()).left+
					//alert($(this.options.selector).offset().left+'  '+pos.x);
					o.css({left: pos.x+280, top: pos.y, position:'absolute'});		
					
					//$(btn).css('display','inline');
					//$(rev).css('display','inline');
					//document.getElementById('thediv').style['display'] = "inline";	
			
			});
		},
	
		/* End of annotion time. The link anchor will disapear from screen. */
		end : function(e, id){ 	 //alert('end link')
			$(this.options.selector+' .ov-'+id).hide();
		},
		
		
		/*
		**/
		showRevisions : function(data, selector){
			var _this = this;
				$('.revisions').remove();
				var revisions = $('<div></div>')
					.addClass('revisions')
					.appendTo(selector);
				$.each(data[0].contents, function(i, val){
					if(val.user_id){
						var e = $('<span></span>')
							.addClass('revisions-entry')
							.attr('id', 'tt'+moment(new Date()).diff(val.updated_at, 'seconds'))
							.append(
								$('<img />')
									.attr('src','/vi-lab/img/user-icons/user-'+val.user_id+'.png')
									.addClass('user-icon')
							)
							.append(
								$('<span></span>')
									.text(val.text)
									.addClass('text')
							)		
							.append(
								$('<span></span>')
									.text(_this.timeDifference(val.updated_at))
									.addClass('date')
							)	
							.append('<br>').appendTo(revisions);
					}	
				});
				
				$('.revisions').find('.revisions-entry').tsort({attr:'id'},{order:'desc'});		
		},
		
		timeDifference : function(s){
			var b = moment(s);
			var a = moment(new Date());
			
			
			var diff = a.diff(b, 'seconds'); 
			if(diff <= 60 ){
				return 'vor ' + diff.toFixed(1) + 's'; 
			}
			
			diff = a.diff(b, 'minutes'); 
			if(diff <= 60){
				return 'vor ' + diff.toFixed(1) + 'min';
			}
			
			diff = a.diff(b, 'hours', true); 
			if(diff <= 24){
				return 'vor ' + diff.toFixed(1) + 'h'; 
			}
			
			diff = a.diff(b, 'days', true); 
			if(diff < 30){
				return 'vor ' + diff.toFixed(1) + 'd'; 
			}
			
			diff = a.diff(b, 'months', true);
			if(diff < 12){
				return 'vor ' + diff.toFixed(1) + 'm'; 
			}
			
			var diff = a.diff(b, 'years', true);
			return 'vor ' + diff.toFixed(1) + 'y'; 
			
		},
		
		
		/* Visualizes link representations on the timeline **/
		vizOnTimeline : function(e){
				var _this= this; 
				$(_this.timelineSelector+' .timetag').remove();
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name, start){
					var sp = $('<span></span>');					
					sp.addClass('tassessment-fi timetag').attr('style','left:'+_left+'px;')
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
		
	
		
		/** Returns position of link anchores relativ to the dedicated representation area 
		* 		@param {Object} obj Contains an annotation object including its spatial elements.
		* 		@returns {Object} 
		*/
		relativePos : function(obj){ 
			//var pplayer = observer.widget_list['seq']; // IWRM only fix xxx // bugy
			//return {x: Math.floor((obj.x/100)*pplayer.width()), y: Math.floor((obj.y/100)*pplayer.height())};
			return {x: Math.floor((obj.x/100)*615), y: Math.floor((obj.y/100)*450)};
		},
		
	
  	
  	/* ... */		
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "-" + seconds;
		}
  	
	}); // end class XLink


