/* class Observer 
	author: niels.seidel@nise81.com

	- clear overlay-container and other at updateVideo()
	- allow page back, offer bread crumb menu, ...
	- RSS: http://code.google.com/apis/youtube/2.0/reference.html

	code design
	- use delegate(obj, func) instead of _this
	- Error handling: throw new Error('...');

	*/
	var Observer = $.inherit(/** @lends Observer# */{
	
	/** 
	*		@constructs
	*		@params {object} options  
	*/
	__constructor : function(options) {
		this.options = $.extend(this.options, options);
		this.widget_list = new Object(); // Assoc Array is an Object // Object.size(this.widget_list)
		this.clock = new Clock({}, this.options.clockInterval);
		//this.init();	

		//this.testing();
	},
	
	// defaults
	name : 'observer',
	options : {id: 'start', selector: '#screen', clockInterval: 500, videoSelector: '#video1', videoWidth:500, videoHeight:375, wrapControls:'#container', markupType: 'wiki', childtheme:''},
	pieList : $('<ul></ul>').attr('class', 'pieContextMenu').attr('id', 'menu'),
	player : undefined,
	clock : undefined,
	parseSelector : '',
	widget : undefined,
	widget_list : [],
	hooks : [],
	vid_arr : [],
	current_stream : 'start',
	
	/* .. */
	setCurrentStream : function(stream){ 
		this.current_stream = stream;
		$(vi2.dom)
			.empty()
			.append(vi2.db.getVideoById(stream)); 
		this.annotationsToDOM();
		this.clock.stopClock();
		this.clock.reset();
		var metadataa = new Metadata(vi2.db.getMetadataById(stream));
		var p = new Parser(vi2.dom, 'html'); // parse the DOM
		this.vid_arr = p.run(); 
	},

	/* -- */
	parse : function(selector, markupType){ 
		this.parseSelector = selector;
		var p = new Parser(selector, markupType == null ? this.markupType : markupType);
		this.vid_arr = [];
		this.vid_arr = p.run();
		this.clock.stopClock();
		this.clock.reset(); 
		this.player.loadSequence(this.vid_arr);  
					
	},

	/* -- */
	init : function(){
		var _this = this;
		//this.checkVideo();
		//var videoo = undefined;
		//if(!!document.createElement('video').canPlayType){
		var videoo = $('<video controls autobuffer></video>')
				.attr('id', this.options.videoSelector.replace(/\#|./,''))
				.text('Your Browser does not support either this video format or videos at all');
		//}else{
			
		//}
		$(this.options.selector).html(videoo);
				
		this.player = new Video({selector: this.options.videoSelector, width:this.options.videoWidth, height:this.options.videoHeight, wrapControls: this.options.wrapControls, theme:this.options.theme, childtheme:this.options.childtheme}, this);
		
		this.clock.player = this.player;// = new Clock(this.player, this.options.clockInterval);
  	//
  	$("div.dropdown").each(function(){ $(this).dropdown(); });		  		
  	// some stuff
  	$('body').append(this.pieList);
		//$("video").pieMenu("ul#menu");
		
		
		 // some event bindings hooks
		 $(this).bind('player.ready', function(e, id, i){ 
					_this.clock.annotations = [];
//  				alert('pl readee:  '+_this.vid_arr[i]['annotation'].length);				
					$.each(_this.vid_arr[i]['annotation'], function(i, val){
					_this.clock.addAnnotation(val);
				});
			// xxx Abfrage, ob Widget geladen wurde	
			_this.widget_list['xlink'].clear();
			_this.widget_list['xlink'].init(_this.vid_arr[i]['annotation']);
			_this.widget_list['toc'].init(_this.vid_arr[i]['annotation']);
			_this.widget_list['syncMedia'].init();
		});
		
		/* // doppelt
		$(this).bind('player.ready', function(e, id, i){ _this.widget_list['xlink'].clear(); });
		$(this).bind('player.ready', function(e, id, i){ _this.widget_list['xlink'].init(_this.vid_arr[i]['annotation']); });
		$(this).bind('player.ready', function(e, id, i){ _this.widget_list['toc'].init(_this.vid_arr[i]['annotation']); });
		*/
	},
  		
	/* -- */
	checkVideo : function(){
	
		if(!!document.createElement('video').canPlayType){
			var vidTest = document.createElement("video");
			oggTest = vidTest.canPlayType('video/ogg; codecs="theora, vorbis"');
			if (!oggTest){
				h264Test = vidTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
				if (!h264Test){
					alert("Sorry. No video support.");
				}else{
					if (h264Test == "probably"){
						//document.getElementById("checkVideoResult").innerHTML="Yeah! Full support!";
					}else{
						//document.getElementById("checkVideoResult").innerHTML="Meh. Some support.";
					}
				}
			}else{
				if (oggTest == "probably"){
					//document.getElementById("checkVideoResult").innerHTML="Yeah! Full support!";
				}else{
					//document.getElementById("checkVideoResult").innerHTML="Meh. Some support.";
				}
			}
		}else{
			alert("Sorry. No video support. xx");
		}
	}, 
			
			
	/* -- */
	updateLocation : function(identifier, value){ 
		// Exeption for IWRM Education
		if(value == 'Introduction'){
			window.location.replace(window.location.href.split('#')[0]+'#!borchardt2');
			return;
		}
		window.location.replace(window.location.href.split('#')[0] + '#!'+identifier+':'+value.replace(/\ /g, '_'));
	},
  		  		
  		  		
/* WIDGETS *********/

  		/* -- */
  		isWidget : function(widget){
  			return this.widget_list[widget] != null;	
  		},


  		/* -- */ // - kill switch()!
  		addWidget : function(obj){ 
   				if(this.widget_list[obj.name] != null){ 
   					return false;
   				}
  				
  				var _this = this;   	
  				obj.player = this.player; 
  				this.clock.addHook(obj.name, obj);	
  				
  				if(obj.type == 'annotation'){ 
  					obj.appendToDOM(this.options.id);
  				}	

  				switch(obj.name){
  					case 'tags' : // bugy
							// no event bindings	
  						//_this.addPieItem('tag', 'img/addTag.png', 'main.widget.addTags();');
  						break;
  					case 'xlink' : 
  						 $(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
  						 $(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
  						//	_this.addPieItem('tag', 'img/ff.png', 'alert("addLink");'); // authoring mode
  					  break;
  					case 'relatedVideos' :
  						$(this.player).bind('video.end', function(e, a){ obj.showLinkSummary(); });
  						break;  
  					case 'search' : 
  						// ...
  						break;	
  					case 'syncMedia' : 
  						 $(_this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
  						 $(_this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
  						//_this.addPieItem('tag', 'img/ff.png', 'alert("addSignal");');
  					  break;	
  				case 'seqv' :
  						// bind to sync both videos
  						break;
  						case 'map' :
  						 $(_this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
  						 $(_this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
  				  break;	
  					case 'toc' :
  					//obj.clock = this.clock; 
  						$(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
  						$(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
  						//_this.addPieItem('tag', 'img/ff.png', 'alert("addSignal");');
  					  break;
  					case 'log' :
  						$(this.player).bind('log', function(e, msg){ obj.add(msg); });
  						break;
  					case 'trace' :
  						//..
  						break;	
  				 
  				}
  			
  				// register widget	
  				this.widget_list[obj.name] = obj; 
  				return true; 
  		},
  			
  		/* -- */
  		removeWidget : function(widget_name){
  			// bugy?
  			this.widget_list[widget_name] = 0;
  		},
  		
  		/* -- */
  		isWidget : function(name){
  			if(this.widget_list.indexOf("118") != -1){
  				return true;
  			}
  			return false;
  		},
  		
  		/* append annotation data of widgets to DOM */
  		annotationsToDOM : function(){ 
  			var _this = this;
  			$.each(this.widget_list, function(i, widget){ 
  				if(widget.type == 'annotation'){ 
  					widget.appendToDOM(_this.current_stream);
  				}
  			});
  		},
  		  		
  		
  		
  		
/* HOOKS *********/
// could all be done with event binding and trigger, like: $(_this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ alert('a');});
  		
  		/* -- */
  		isHook : function(widget, hook_name){
  			return this.hooks[widget+'_'+hook_name] != null;	
  		},

  		
  		/* -- */
  		registerHook : function(widget, hook_name){
  			return this.hooks[widget+'_'+hook_name] = [];	
  		},
  		  		
  		/* not used anymore */
			setHook : function(widget, hook_name, func){ 
				if(this.isWidget(widget)){
					if (this.isHook(widget, hook_name)){
						// set hook 
						//this.hooks[widget+'_'+hook_name].push({hook_name: hook_name, func: func});
						$(this).bind(hook_name, func); // function(e, a, b){ alert('a');}
						return true;
					}else{ 
						throw new Error('Vi2 Error: The hook '+hook_name+' you are trying set is not registered at widget '+widget+'.');
					}
				}
				throw new Error('Vi2 Error: Widget '+widget+' does not exist.');
			},
			
			/* -- */
			callHook : function(widget, hook_name, param){ 
				var _this = this;
				if (this.isHook(widget, hook_name)){
//					$.each(this.hooks[widget+'_'+hook_name], function(i, val){
						$(_this).trigger(hook_name, param);
//					});
				} else {
					throw new Error('Vi2 Error: Called undefined Hook: '+widget+'_'+hook_name+'.');
				}
			},
			
			test : function(e){
				alert('test called '+e);
			},
			
			test2 : function(e){
				alert('test 2 called '+e);
			},
						
			/* -- */
  		updateVideo : function(id, i){ 
		  	
				var _this = this;   		
  			
  			
/*

  			// hook testings
  			this.hooks = [];
  			this.registerHook('xlink', 'maintest'); // 
		  	this.setHook('xlink', 'maintest', function(e, a) {main.test(a);});
		  	this.setHook('xlink', 'maintest', function(e, a) {main.test2(a);});
		 		this.callHook('xlink', 'maintest', ['hello world']); 


				this.clock.annotations = [];				
  			$.each(this.vid_arr[i]['annotation'], function(i, val){
  				_this.clock.addAnnotation(val);
  			});
  			
				if(_this.widget_list['xlink'] != null){
	  			_this.widget_list['xlink'].clear();
  				_this.widget_list['xlink'].init(_this.vid_arr[i]['annotation']);
  			}
  			if(_this.widget_list['toc'] != null){ 	  				
	  			_this.widget_list['toc'].init(_this.vid_arr[i]['annotation']);						
	  		}
	  		// if there is a sequential video, play it
	  		if(_this.widget_list['seqv'] != null){ 	  				
	  			_this.widget_list['seqv'].init();//_this.vid_arr[i]['annotation']);						
	  		}
*/
  		},
			
			/* -- */
			ended : function(){ 
				var _this = this;
				// _this.clock.reset(); // if enabled slide sync does not work after vides has ended.
			},
			
			/* -- */
			pause : function(){ 
				var _this = this;
				_this.clock.stopClock();
			},

			/* -- */
			play : function(){ 
				var _this = this;
				_this.clock.startClock();
			},
			
			/* -- */
			log : function(msg){
				$(this.player).trigger('log', [msg]);
			},
			
			/* -- */
			destroy : function(){
				$('video').stop();
				this.clock.reset();
				$('#hydro1').empty();
			},
			  		
			
			
			  		
			  		
/* AUTHORING *********/			  		
  		
  		/* -- */
  		addPieItem : function(_name, _img, _callback){
  			var item = $('<li></li>')
  				.append($('<img / >')
  					.attr('src', _img)
  					.attr('alt','')
  					.attr('href','#')
//  					.bind('mouseup', {}, function(){ window.[_callback]; })
  				);
  			this.pieList.append(item);
  		},  
  		
  		/* -- */
  		openScreen : function(selector){ 
  			if(selector == undefined){
  				selector = '.vi2-video-player'; 
  			}
  			//this.player.pause();
  			if($('.screen').length == 0){
				var screen = $('<div></div>')
					.addClass('screen');
					//.width($(selector).width()-18)
					//.height($(selector).height()-10)
				}
				$('.screen').show()
					.appendTo(selector);
			
  			return screen;
  		},
  		
  		/* -- */
  		closeScreen : function(){
  			$('.screen').remove();
  			this.player.play();
  		},	
 
  
  
  
  
  
  
	/* -- */
  		testing : function(){
  			// sequential videos
  			var arr = [];
				arr[0] = [];	arr[1] = []; arr[2] = [];
				arr[2]['url'] = 'http://127.0.0.1/elearning/videos/Compi.ogg';
				arr[1]['url'] = 'http://127.0.0.1/elearning/videos/bunny.ogg';
				arr[0]['url'] = 'http://127.0.0.1/elearning/videos/type.ogv';
				//this.player.loadSequence(arr);
				
				this.clock.annotations.push({content: {title: 'hallo', target:'1.JPG'}, linktype:'', type: 'seq', displayPosition: {x: 0, y: 0, t1: 0, t2: 5}});
				this.clock.annotations.push({content: {title: 'hallo', target:'4.JPG'}, linktype:'', type: 'seq', displayPosition: {x: 0, y: 0, t1: 5, t2: 10}});
				this.clock.annotations.push({content: {title: 'hallo', target:'3.JPG'}, linktype:'', type: 'seq', displayPosition: {x: 0, y: 0, t1: 10, t2: 15}});
				//
  		}
  		
  });
	
	
	
	
	
		
	
	
