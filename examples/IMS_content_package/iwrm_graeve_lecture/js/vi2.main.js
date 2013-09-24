/*****************************************/
	/* MAIN = controler = observer
	author: niels.seidel@nise81.com

	- clear overlay-container and other at updateVideo()
	- allow page back, offer bread crumb menu, ...
	- RSS: http://code.google.com/apis/youtube/2.0/reference.html

	code design
	- avoid usage of "main" to call function in here
	- use delegate(obj, func) instead of _this
	- Error handling: throw new Error('...');

	*/
	var Main = $.inherit(
	{
			/**/
  		__constructor : function(options) {
  			this.options = $.extend(this.options, options);
  			this.init();	
  			this.hooks['pause']=[]; 
  			this.hooks['play']=[]; 
  			this.hooks['ended']=[]; 

  			//this.testing();
  		},
  		
  		// defaults
  		options : {selector: '#screen', clockInterval: 500, videoSelector: '#video1', wrapControls:'#container', markupType: 'wiki', childtheme:''},
  		pieList : $('<ul></ul>').attr('class', 'pieContextMenu').attr('id', 'menu'),
  		player : null,
  		clock : null,
  		parseSelector : '',
  		widget : null,
  		widget_list : [],
  		hooks : [],
  		vid_arr : [],
			// very dirty hack!!
  		//the_tags : [],
	
  		/**/
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
  		},
  		
  		/**/
  		init : function(){
  			var _this = this;
  			$(this.options.selector)
  				.html($('<video controls></video>')
	  				.attr('id', this.options.videoSelector.replace(/\#|./,''))
  					.text('Your Browser does not support either this video format or videos at all')
  				).append($('<div></div>').attr('id', 'overlay'))
  				.addClass(this.options.childtheme);
  				
//  				alert($(this.options.selector).parent().html());
  				
				this.player = new Video({selector: this.options.videoSelector, wrapControls: this.options.wrapControls, childtheme:this.options.childtheme}, this);
				this.clock = new Clock(this.player, this.options.clockInterval);
		  	//
		  	$("div.dropdown").each(function(){ $(this).dropdown(); });		  		
		  	// some stuff
		  	$('body').append(this.pieList);
  			$("video").pieMenu("ul#menu");
		  	// init widgets
		  	//_this.initWidgets();
  		},
  		
  		/*
  		initWidgets : function(){
				var _this = this;
  			$.each(this.options.data, function(){
  				_this.addWidget(this);
  			});
  		},
  		*/
  		
  		/**/ // - kill switch()!
  		addWidget : function(obj){
  				var _this = this;   	
  				obj.player = this.player;
  				this.clock.addHook(obj.name, obj);		
  				
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
  					case 'seq' :
  						 $(_this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
  						 $(_this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
  						//_this.addPieItem('tag', 'img/ff.png', 'alert("addSignal");');
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
  				}	
  				this.widget_list[obj.name] = obj;

  		},
  			
  		/**/
  		removeWidget : function(widget_name){
  			// bugy?
  			this.widget_list[widget_name] = null;
  		},
  		
  		
  		/**/
  		isHook : function(type){
  			return this.hooks[type] != null;	
  		},
  		  		
  		/**/
			addHook : function(type, fn, cl){
				if(this.isHook(type)){
					this.hooks[type].push({cl:cl, fn:fn});
					return true;
				}else{
					return false;
				}
			},
			
			/**/
			ended : function(){ 
				var _this = this;
				//$.each(this.hooks['ended'], function(i, val){
					_this.clock.reset();
				//});
			},
			
			/**/
			pause : function(){ 
				//var h = function(){ window.eval("main.test();"); }
				//h();
				// eval("main.test()");
				var _this = this;
				//$.each(this.hooks['pause'], function(i, val){
					_this.clock.stopClock();
				//});
			},

			/**/
			play : function(){ 
				var _this = this;
				//$.each(this.hooks['play'], function(i, val){
					_this.clock.startClock();
				//});
			},
			  		
  		/**/
  		addPieItem : function(_name, _img, _callback){
  			var item = $('<li></li>')
  				.append($('<img / >')
  					.attr('src', _img)
  					.attr('alt','')
  					.attr('href','#')
//  					.bind('mouseup', {}, function(){ window.eval(_callback); })
  				);
  			this.pieList.append(item);
  		},  
  		
  		/**/
  		openScreen : function(){
  			this.player.pause();
  			var screen = $('<div></div>')
  				.addClass('screen')
  				.width($(this.options.videoSelector).width()-18)
  				.height($(this.options.videoSelector).height()-10)
  				.show();
  			$('.vi2-video-player').append(screen);
  			return screen;
  		},
  		
  		/**/
  		closeScreen : function(){
  			$('.screen').remove();
  			this.player.play();
  		},	
  		
  		/**/
  		updateVideo : function(id, i){
				var _this = this;
  			this.clock.annotations = [];				
  			$.each(this.vid_arr[i]['annotation'], function(i, val){
  				_this.clock.addAnnotation(val);
  			});

  			_this.widget_list['xlink'].clear();
  			_this.widget_list['xlink'].init(this.vid_arr[i]['annotation']);
  			_this.widget_list['toc'].init(this.vid_arr[i]['annotation']);
  		},
  		
  		
 			/**/
  		parse : function(selector, markupType){ 
  			this.parseSelector = selector;
  			var p = new Parser(selector, markupType == null ? this.markupType : markupType);
  			this.vid_arr = p.run();
  			this.player.loadSequence(this.vid_arr);  			
  		},

 
  });
	
	
	
	
	
		
	
	
