/*

* json_validator: http://jsonformatter.curiousconcept.com
* toDo
- media fragment uri
- fin interne API zur Dokumentation
- CSS je Widget :: responsive Design  ... query-based CSS ..

- jquery tooltip, statt dem veralteten jquery.tooltip https://jqueryui.com/tooltip/#custom-style


- ketten von videos
- Widgets:
-- rating
-- comprehension / incomprehension
-- assessment ... translation, other types
-- comments ... check
-- traces (user traces)
-- pyramid
-- playlist at search result page
-- syncMedia add support for other file types

* nice to have:
- templates in eine datei auslagern
- Wizzard: 1) bestimme Videos, 2) wähler nutzergruppe, 3) wähle widgets/funktionen, 4) vorstrukturieren der Inhalte, 5) embed / publisch 
- correkt Error-Handling for firefox
- videoplayer: 463 Error ??
- audio only

* @author niels.seidel@nise81.com
* @version 1.4



*/



var VI2 = $.inherit(/** @lends VI-TWO# */
	{
	/**
	* A class for constructing a video-based learning environment.
	* @constructs
	*/
  __constructor : function(){ 
  	var _this = this;
  		
		observer = new Observer({
				//id:stream, 
				selector:'#screen', 
				clockInterval:500, 
				videoSelector:'#video1', 
				videoWidth: 280, 
				videoHeight:158, 
				markupType:'html', 
				videoControlsSelector: '.video-controls', 
				theme:'simpledark', 
				childtheme:'iwasbasicwhite'
		});
  	this.observer = observer;
  	
  	$(this.content_selector).bind('clear', function(){ 
  		if (_this.observer != undefined){
  			_this.observer.destroy();
  		}	
  	});
  	
  	// retrieve application data in a first call	
		db = new DataBase({}, this); 
		this.db = db;
  	
 
	},
	

	observer : undefined,
	name : 'vi2',
	db : undefined,
	dom : '#hydro1',
	content_selector : '#content',
	page_url : 'http://www.iwrm-education.de/',
	viLog : '',
	
	
	/* Shortcut function to trigger a log entry */
	log : function(msg){
	  $(this).trigger('log', [msg]);
  },
	
	/**
	* @description Some good starting point to manual anything
 	* @returns {Object}
 	*/
	startApp : function(){ 
		var _this = this;
			//
		if(window.location.href.indexOf('#') == -1){
			this.buildIntro();
		}
		if(window.location.href.slice(window.location.href.indexOf('#') + 1).substr(0,6) == '!start'){
			this.buildIntro();
		}	
		
		var location = window.location.href.slice(window.location.href.indexOf('#') + 1); //alert(location+'  = '+this.isStream(location));
		location = location.substr(1, location.length);
		
		
		/* some test and maintanace function calls */
		//this.validateLinks(); // validation
		//this.generateButter('cullmann');
		//var m = new Maintain();
		//m.json_import();
		//this.validateImages();
		//this.chord();
		
		

		
		// start other widgets
		this.viLog = new Log(); 
  	$(this).bind('log', function(e, msg){ _this.viLog.add(msg); }); 
		
		var viSearch = new Vi2_Search();
		var viPlaylist = new Vi_Playlist();
		var viRelatedVideos = new Vi2_RelatedVideos();
		var viVideoManager = new Vi2_VideoManager();
;
		var viAPI = new Vi2_API();
		this.observer.addWidget( viSearch );
		this.observer.addWidget( viPlaylist );
		this.observer.addWidget( viRelatedVideos );
		this.observer.addWidget( viVideoManager );
		
	
				
		
				// logging
		if(this.db.isStream(location)){
			this.log('lecture:'+location.split('#')[0]);
		}else{
			this.log(location.split('#')[0]);
		}
		// build navigation 
		this.buildNavigation();
		this.buildFooter();
		
		if(this.db.isStream(location) && location.substr(0,10) != 'userguide'){ 
			this.observer.current_stream = location;
			this.buildSingleVideo();
			return;
		}else if (location.substr(0,3) == 'api'){ 
			this.observer.current_stream = location.substr(0,3);
			viAPI.get(location);
			return; 
		}else if(location.substr(0,9) == 'category:'){
			this.observer.current_stream = location.substr(0,9);
			//this.db.getStreamsByCategory(decodeURI(location.substr(9,location.length)).replace(/\_/g, ' '));
			this.observer.widget_list['video-manager'].listByCategory(decodeURI(location.substr(9,location.length)).replace(/\_/g, ' '));
			
			return;
		}else if(location.substr(0,10) == 'userguide'){
			this.observer.current_stream = location.substr(0,10);
			this.buildSimpleVideo('userguide'); 
			return;
		/*}else if(location.substr(0,8) == 'lecture:'){ alert('bim') // not used anymore
			this.observer.current_stream = location.substr(0,8);
			this.db.getStreamsByTitle(decodeURI(location.substr(8,location.length)).replace(/\_/g, ' '));
			return;	*/	
		}else if(location.substr(0,4) == 'tag:'){ 
			this.observer.current_stream = location.substr(0,4);
			this.observer.widget_list['video-manager'].listByTag(decodeURI(location.substr(4,location.length)).replace(/\_/g, ' '));
			return;
		}else if(location.substr(0,7) == 'search:'){ 
			this.observer.current_stream = location.substr(0,7);
			this.observer.widget_list['search'].find(decodeURI(location.substr(7,location.length)).replace(/\_/g, ' '));
			return;
		}else if(location.substr(0,5) == 'about'){
			this.observer.current_stream = location.substr(0,5);
			this.getTemplatePage(location.substr(0,5)+'-template');
			return;	
		}else if(location.substr(0,10) == 'sitenotice'){
			this.observer.current_stream = location.substr(0,10);
			this.getTemplatePage(location.substr(0,10)+'-template');
			return;
		}else if(location.substr(0,4) == 'test'){
			//this.observer.current_stream = location.substr(0,4);
			this.getTestPage();
			return;					
		}else{
			this.log('404-error:'+location.split('#')[0]);		
			this.observer.current_stream = 'start';
			this.buildIntro();
			window.location.replace(window.location.href.split('#')[0] + '#!'+this.observer.current_stream);
			return;				
		}
	},
	

	
	/* Builds HTML footer */
	buildFooter : function(){
		var t = new Date(); lt = t.getTime() - t1;
		$('#footer').setTemplate($("#footer-template").val()).processTemplate({loadtime:lt});		
	},	
		
	/* ... */
	buildNavigation : function(){

		var nav = $('#navigation')
			.html('<a class="nav-s" href="#!start">HOME</a>')
			.append(this.buildDropDown(this.db.getCategoryTaxonomie(), 'Lecture categories', 'category', 'updateLocation'))
			.append(this.buildDropDown(this.db.getTagTaxonomie(), 'Keyword', 'tag' ,'updateLocation'))
			.append(this.buildPlaylist()) 
			.append(this.buildSearch())
			;
			//.append(this.buildDropDown(this.getTitles(), ':: lectures by title ::', 'category', 'updateLocation'));
//		$('body').prepend(this.buildDropDown(this.getAuthors(), 'choose lecturer', null));		

		$('.nav ul.nav-list-keyword li.nav-item').tsort('a');

		$('ul.category a:eq(0)').css({'background-image': 'url(img/cat_s0.png)'});
		$('ul.category a:eq(1)').css({'background-image': 'url(img/cat_s5.png)'});
		$('ul.category a:eq(2)').css({'background-image': 'url(img/cat_s1.png)'});
		$('ul.category a:eq(3)').css({'background-image': 'url(img/cat_s3.png)'});		
		$('ul.category a:eq(4)').css({'background-image': 'url(img/cat_s2.png)'});		
		$('ul.category a:eq(5)').css({'background-image': 'url(img/cat_s4.png)'});		
		$('ul.category a:eq(6)').css({'background-image': 'url(img/cat_s6.png)'});	
	},
	
	
	/* -- */
	buildIntro : function(){
		var _this = this;
		
		var introInfo = $('<div id="intro-info"></div>').hide();
		$(this.content_selector)
			.empty()
			.trigger('clear')
			.append(introInfo);

		var item =$('<div></div>')
			.addClass('content-intro')
			.setTemplate($("#intro_template2").val())
			.processTemplate({categories: this.db.getAllCategories()}) // this.getCategories()
			.appendTo($(_this.content_selector));
		
		$.fn.maphilight.defaults = {
			fill: true,
			fillColor: 'ffffff',
			fillOpacity: 0.5,
			stroke: false,
			strokeColor: '000000',
			strokeOpacity: 1,
			strokeWidth: 1,
			fade: true,
			alwaysOn: false,
			neverOn: false,
			groupBy: false,
			wrapClass: true,
			shadow: true,
			shadowX: 0,
			shadowY: 0,
			shadowRadius: 6,
			shadowColor: '000000',
			shadowOpacity: 0.8,
			shadowPosition: 'inside',
			shadowFrom: true
		}
		$('.imagemap').maphilight();
		
	},


	metadata : '',
	syncMedia :'',
	xlinkk:'',
	tocc:'',
	tagss:'',
	
	/* ... */
	buildSingleVideo : function(stream, selector, update){ 
		if(stream == null){
			stream = this.observer.current_stream;
		}
		if(selector == null){
			selector = '#content';
		}
		if(update == undefined){
			update = false;
		}			
		
		this.buildNavigation();
		
		var template = $("#content_template").val();
		$(selector).setTemplate(template).processTemplate({});
		// make a template out of it
		$("#accordion").accordion({autoHeight: false, collapsible: false, fillSpace: true });
		
		// initiate player
		if(!update){	
			this.observer = new Observer({
				id:stream, 
				selector:'#screen', 
				clockInterval:500, 
				videoSelector:'#video1', 
				videoWidth: 280, 
				videoHeight:158, 
				markupType:'html', 
				videoControlsSelector: '.video-controls', 
				theme:'simpledark', 
				childtheme:'iwasbasicwhite'
			});
		}
		
			// map json to DOM
		$(this.dom).empty();
		$(this.dom).append(this.db.getVideoById(stream));
		 
		this.observer.init();	

		metadataa = new Metadata(this.db.getMetadataById(stream));
		xlinkk = new XLink({target_selector:'#seq', vizOnTimeline: true, minDuration:'5'});
		tocc = new TOC({selector:'#toc', vizOnTimeline: true}); 
		tagss = new TemporalTagging({selector:'#tags', vizOnTimeline: false, max:20, sort:'freq'}, this.db.getTagsById(stream)); 
		syncMedia = new Vi2_SyncMedia({selector:'#syncMedia', vizOnTimeline: false, controls: false, path : 'slides/'});//, placeholder: 'slides/'+stream+'/'+stream+'_00001.jpg'}); 
		//new Seq({selector:'#seq', width:620, height:450, path:'videos/iwrm_'+stream+'_slides.ogv'}); 
		//	var seqv = new Seqv({selector:'#seq', width:620, height:450, path:'videos/iwrm_'+stream+'_slides.ogv'}); 
		//this.observer.addWidget(seqv);
	
		this.observer.addWidget(xlinkk);  
		this.observer.addWidget(syncMedia); 
		this.observer.addWidget(tocc); 
		this.observer.addWidget(tagss);
		this.observer.addWidget(this.viLog); 	
		this.observer.parse('#hydro1', 'html');  //		main.parse('#markup', 'wiki');
	},


	/* ... */
	buildSimpleVideo : function(stream, selector, update){
		if(stream == null){
			stream = this.observer.current_stream;
		}
		if(selector == null){
			selector = '#content';
		}
		if(update == undefined){
			update = false;
		}			
		
		this.buildNavigation();
		var template = $("#simplecontenttemplate").val();
		$(selector).setTemplate(template).processTemplate({});
		
		metadataa = new Metadata(this.db.getMetadataById(stream));
		// map json to DOM
		$(this.dom).empty();
		$(this.dom).append(this.db.getVideoById(stream));
		
		this.observer = new Observer({id:stream, selector:'#screen', clockInterval:500, videoSelector:'#video1', videoWidth: 780, videoHeight:400, markupType:'html', videoControlsSelector: '.video-controls', theme:'simpledark', childtheme:'iwasbasicwhite'});			
		this.observer.parse('#hydro1', 'html');  //		main.parse('#markup', 'wiki');
		
	},

	
	/* -- */
	buildSearch : function(){
		var _this = this;
		var dom = $('<form class="search-box"></form>');
		var input = $('<input type="text" id="search-text" value="Search" />')
			.click(function() {
    		if (this.value == this.defaultValue) {
    	 	 this.value = '';
    		}
  		})
  		.blur(function() {
    		if (this.value == '') {
    	 	 this.value = this.defaultValue;
    		}
  		})
  		.keyup(function(e){
					if (e.which == 13) { 
						_this.observer.updateLocation('search', $('#search-text').val());
					}
			});
		
		var submitt = $('<input type="submit" value="" />')
			.click(function(e){
					e.preventDefault();
					// call update function to replace address bar before searching
					_this.observer.updateLocation('search', $('#search-text').val());
			});  
		//
		dom
			.append(input)
			.append(submitt);

		return dom;
	},	
	
	
	/* -- */
	buildPlaylist : function(){ 
		var _this = this;
		var btn = $('<div></div>')
			.text('Playlist')
			.addClass('nav nav-playlist')
			.click(function(e){
				$(_this.content_selector)
				.empty()
				.trigger('clear')
				.setTemplate($("#cat_header").val())
				.processTemplate({title:'Playlist', desc: '', style: 'background: no-repeat url(img/cat_s'+'.png) white 0px 10px;'});
				// render data
				_this.observer.widget_list['playlist'].showPlaylist();
				//
				$('#content').find('.content-item').each(function(i, item){
						$(item).find('.addToPlaylist').text('-')
							.tooltip({delay: 0, showURL: true, bodyHandler: function() { 
									return $('<span></span>').text('Remove from playlist');
								} 
							}) 
							// remove items from playlist
							.bind('click', function(e){
								$(this).parent().remove();
								var id = $(this).attr('id').replace('playlist-', '');
								vi2.observer.widget_list['playlist'].remove(id);
					
								// reorganise items
								$(_this.content_selector+' > .content-item')
									.each(function(i, val){  
										if(i % 2 == 1){ 
											$(this).css('margin-right', '0');
										}	 
									});
							});					
					});
					// finish presentation in two column layout
					$(_this.content_selector+' > .content-item')
						.each(function(i, val){ 
							if(i % 2 == 1){ $(this).css('margin-right', '0');}	 
						});	
			});	
		return btn; 
	},
	
	/* -- */
	appendPlaylist : function(){
		var _this = this;
		// add button to apend item to the playlist
		$('.addToPlaylist')
			.tooltip({delay: 0, showURL: true, bodyHandler: function() { 
				return $('<span></span>').text('Add to playlist');
				} 
			})
			// add item to playlist
			.bind('click', function(e){ 
				vi2.observer.widget_list['playlist'].add(String($(this).attr('id')).replace('playlist-', ''));
			});
		
	},
	

	
	
	/* -- */
	getTemplatePage : function(template){
		$(this.content_selector)
			.trigger('clear')
			.html($("#"+template).val());
	},	

	






/* UI */
	/* ... */
	buildDropDown : function(options, label, type, func){ 
		var _this = this;
		var sel = $('<div></div>')
		.attr('class','nav')
		.text(label)
		.append($('<ul></ul>').addClass('nav-list').addClass(type).addClass('nav-list-'+label.toLowerCase()));
		
		$.each(options, function(i, val){
			var tugs = val.first_level; 
			$(val.second_level).each(function(i, val){ tugs = tugs+'+'+val;});	
			
			var item = $('<li></li>'); 
			$(sel).find('ul').append(item);
			item.addClass('nav-item')
				.html(
					$('<a></a>')
						.text(val.first_level)
						.click(function(){
							window.vi2.observer[func](type, tugs); 
					})
				);
						
			if(val.second_level == null){
				item.click(function(){ 
					window.vi2.observer[func](type, val.first_level); 				
				}); 
			}else{
				var nav = $('<div></div>').addClass('nav-list2').remove();
				$(val.second_level).each(function(i, value){ 
						var el = $('<a></a>')
							.addClass('nav-item2')
							.text(value)
							.click(function(){
								window.vi2.observer[func](type, value);
							});
						nav.append(el);
					});
				item.append(nav);
			}
		});		
		return sel;
	},
	
	
	
	
	
	////////////////////////////////////////////////////////////////////////////////////
	// UNUSED 
	
	// vi-memex prototype 
	getTestPage : function(){
		var _this = this;
		$(this.content_selector).empty();//trigger('clear');
		var page1 = $('<div></div>').attr('id','testpage1');
		var page2 = $('<div></div>').attr('id','testpage2'); 
		// build dropdowns	
		var opt = '';
		var sel1 = $('<select name="first" type="select"></select>');
		var sel2 = $('<select name="second" type="select"></select>');
		$.each(this.db.json_data.stream, function(val){
			$(sel1).append($('<option value="'+this.id+'">'+this.id+'</option>'));
			$(sel2).append($('<option value="'+this.id+'">'+this.id+'</option>'));
		});
		$(this.content_selector).append(sel1).append(sel2);
		$(this.content_selector).append('&bnsp; ').append($(' <a>interlink</a>').button()); 
		// load video
		var loadthevideo = function(stream, the_page, name){
			var template = $("#memex_template").val();
			$(the_page).empty().setTemplate(template).processTemplate({});
			$(_this.content_selector).append(the_page);
			
			metadataa = new Metadata(this.db.getMetadataById(stream));
			// map json to DOM
			$(_this.dom).empty();
			$(_this.dom).append(_this.db.getVideoById(stream));
		
			this.observer = new Observer({id:stream, videoWidth: 380, videoHeight:200, markupType:'html', theme:'simpledark', childtheme:'iwasbasicwhite'});	
			//main = _this.main;
			this.observer.parse('#hydro1', 'html'); 
			
		
		};
		$(sel1).bind('change', function(e){ 
			loadthevideo(this.value, page1);
		});
		$(sel2).bind('change', function(e){ 
			loadthevideo(this.value, page2);
		});
	}
	
	
	});// end VI2 class
	
