/*

to do:
- vi-two core integrieren
- boostrap ... responsive design
- aktuelle jquery-version nutzen

NODE:
- script scheduler
- gzip compression
- VI-TWO Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten

---------------------------------------------
VI-TWO
- usability: feedback beim speichern!!!
- usability: delete realy?
- re-comment
- bearbeitungsstand anzeigen
-- anzahl items je toc/tags/comments/...
-- gesamtstand anhand von relativer metrik
- editieren der Zeit via 'edit'
- mehrsprachigkeit / spracheinheitlichkeit: l('')
- tag/toc input type=text statt textarea
- ass: Aufgabenstatistik 
- ass: semantische Nähe zw. Feedback und Aufgabe
- ass: Benachrichtigungen
- ass: scrollbares feld bei aufgabenbearbeitung
- ass: Benutzerbenachrichtigung
- tooltip für Funktionen
- bearbeitungsdatum im tooltip anzeigen, damit andere sich zeitnah anschließen können
- user online
- vereinheitlichung der widget in vi-two settings
- add Hyperlink
- convertierung von popcorn auf IWRM-ähnliche seite 
--- automatische Verlinkung via tags



NiceToHave

- popcorn plugin für assessment.
- screencast, tagesschau-beispiel...
- popcorn-plugin en-/disable via Widget Editor (??? Wie soll das gehen)
- add links > IWRM

-- placholder @ videoplayer in css einbinden


Admin:
- Metadaten in popcorn einpflegen >> IWRM
- define selector for flexible theme adoption
- video upload via firefogg? 

}else if(location.substr(0,6) == 't=npt:'){
	alert(location.substr(7,location.length));


*/

var $ = jQuery;


/** class Vi-Lab **/ 
var ViLab = $.inherit({ 

  __constructor : function(server_url, the_video_id) { 
  		var _this = this;
  		this.server_url = server_url;  
  
  		//
  		$.get('/json/user-data', function(data){  
  			$.get('/json/script', function(script) {   
  				_this.currentGroupVideoNum = script[0].phases[script[0]['current_phase']].groupindex;
  				_this.current_phase = script[0]['current_phase'];   
					_this.wp_user = data.id;
		 			_this.dom = _this.source_selector;
		 			_this.loadedWidgets = [];  
					_this.init('startApp', the_video_id);//data.videoid); 
					$('#inte').remove();
					//
					_this.socket = io('http://localhost:3000');  //   'http://176.10.37.68:3001'
						
					//io.set('transports', ['xhr-polling']);
					// refresh database if broadcast message comes i
					
					_this.socket.on('broadcast', function(io_data){  
						_this.init('updateApp', the_video_id);//data.videoid);
					});
				});	
  		});
  },
  
  
  json : '',
  current_phase : 0,
  viLog : '',
  socket : '',
  wp_user : '',
 	author : '...',
 	title : '...',
  source_selector : '#vi2',
  video_source : '',
  server_url : '',
  wp_user : '',
  plugin_dir : '',
	widgets: { 
		test: 'bam', 
		widgets: [
			{name:'tags'},
			{name:'highlight'}, 
			{name:'toc'},
			{name: 'xlink'},
			{name: 'comments'},
			{name: 'syncMedia'},
			{name: 'assessment'},
			{name: 'assessment-fill-in'},
			{name: 'assessment-writing'}
		]
	},
	ajaxurl : '',
	userData : {},
	observer : '',
	videoData : {},
	currentVideo : '',
	currentGroupVideoNum : 1,
	phase : {grouplevel:1},
	videoJSON : {},
	db: {},
	

  	/**
  	* Loads user-, group- and video metadata
  	*/
  	init : function(fn, video_id){
  		this.currentVideo = video_id; 
			this.db = new DataBase({path: this.server_url}, this, fn, video_id); //this.server_url+this.plugin_dir
  	},
  	
  	/* Shortcut function to trigger a log entry */
		log : function(msg){
			$(this).trigger('log', [msg]);
		},
  	viLog : {},
  	
  	
  	/**
  	*
  	*/
  	startApp : function(){ 
	  	var _this = this;
  		$(this.source_selector).empty(); 
  		$('#seq').empty();
			$('#screen').empty();
			$('.vi2-video-controls').empty();
			$('#accordion').empty(); 
		 	this.userData = this.db.getUserById( this.wp_user );
		 	  
		 	if(this.userData.trace == 1){
		 		$('input#tracing').attr('checked','checked');
		 	}else{
		 		$('#tracing').removeAttr('checked');
		 	}
		 	$('#tracing').click(function() {
				if ($(this).is(':checked')) { 
					_this.userData.trace=1;   
				} else {
					_this.userData.trace=0;
				}
				$.post('/update-users/'+_this.userData._id, {"data":_this.userData.trace}, function(res2){ 
       		//alert('Has been saved: '+ JSON.stringify(res2));
   		 	});
			});  
			
			
		 	this.currentGroup = this.userData.groups[this.currentGroupVideoNum];   
		 	this.groupData = this.db.getGroupById( this.currentGroup ); //alert('group:'+this.currentGroup)
		 	//this.currentVideo = this.groupData.videos[this.currentGroupVideoNum]; //alert('group-video-index::'+this.currentGroupVideoNum)
			//alert(this.currentVideo)
			this.videoData = this.db.getStreamById( this.currentVideo );
		 
		 	//this.socket.emit('registered user', { user_id: this.userData.id, group_id: this.currentGroup });
		 	
		 	//alert(JSON.stringify(this.groupData.videos[this.currentGroupVideoNum]))
		 	//alert(this.videoData.video)
		 	var video = $('<div></div>')
				.attr('type',"video")
				.attr('starttime',0)
				.attr('duration',7)
				.attr('id', "myvideo")
				.text(this.videoData.video)
				.appendTo(_this.source_selector); 

			/* define user area				
			var logout = $('<a></a>')
				.attr('href', '/user-logout')
				.text(' logout')
				;
			var the_user = $('<a></a>')
				.attr('href', '/user-data')
				.addClass('account-data-name')
				.css('background-image', "url('img/user-icons/user-"+this.userData.id+".png')")
				.text( this.userData.username);
			
			$('.account-data')
				.empty()
				.append(the_user)
				.append(' | ')
				.append(logout);
			*/
			// build video player	
			this.loadedWidgets = []; 
			//$("#accordion").accordion('destroy').empty();
			$("#overlay").empty();
			$('body').find('.ui-dialog').each(function(i,val){ $(this).remove(); });
			$('body').find('.some-dialog').each(function(i,val){ $(this).remove(); }); 
			this.viLog = new Log({logger_path:this.server_url+'/log'}); 
  		$(this).bind('log', function(e, msg){ _this.viLog.add(msg); }); 
  			
  		
  		vi2.utils = new Vi2_Utils();
			
			
			this.setupVideo( 1 );
			
   		//var t = $('#container').html();
   		//$('#container').parent().remove();
   		//$('.header').after(t);
  	},


  	/* **/
  	updateApp : function(){
			var _this = this; 
			$.each(this.loadedWidgets, function(i, val){ 
				_this.loadedWidgets[i]='';
				_this.enableWidget(val, {accordion: false});
			});
			this.observer.setAnnotations();
		},

  script : {},
  
  /* setup video*/ // todo: simplify!
  setupVideo : function(has_parallel_media){  
  	var _this = this; 
		// get scripts settings from backend
		$.get(this.server_url+'/json/script', function(res) {    
		  _this.script = res;
		  var phaseHasSlides = _this.db.hasSlides( _this.currentVideo );//res[0].phases[_this.current_phase].slides;  
			var options = {
				id : _this.currentVideo,
				embed:false,
				selector :   phaseHasSlides === 0  ? '#seq' : '#seq',
				videoWidth:  phaseHasSlides === 1  ? 28 : 900,  // video größe hängt nicht von den angeschalteten widgets, sondern von den anotierten ressourcen ab
				videoHeight: phaseHasSlides === 1  ? 15 : 450, 
				markupType:'html',  	
				theme:'simpledark', 
				childtheme:'iwasbasicwhite',
				thumbnail: _this.db.getMetadataById(_this.currentVideo).thumbnail
			};
			$('#overlay').css('width', options.videoWidth - 35);
		
			
			// extract media fragment window.location
			var seek = 0;
			var location = window.location.href.slice(window.location.href.indexOf('#!') + 1);
			location = location.substr(1, location.length);
			if(location.substr(0,6) == 't=npt:'){
				seek = location.split('t=npt:')[1].split(',')[0];	
			}
			
			_this.observer = new Observer(options); 
		 	_this.observer.init(seek);	 
			
  		//_this.viLog = new Log({path: _this.server_url+_this.plugin_dir+'/ip.php', prefix:'[wp_site:'+site_name+', wp_post:'+_this.post_id+', user:'+_this.wp_user+']'}); 
  		//$(_this).bind('log', function(e, msg){ _this.viLog.add(msg); });
			 
			metadataa = new Vi2_Metadata( { metatags: true, render: false } );  
			_this.addEdit_btn(); 
			_this.observer.addWidget(_this.viLog); 	 
			//$('#screen').empty();
			this.current_phase = _this.userData.experimental === "üüü" ? 4 : res[0]['current_phase'];
			

			$.each(res[0]['phases'][this.current_phase]['widgets'], function(i, widget){ 
					options = {};
					options.accordion = widget['accordion'];
					options.hasSlides = phaseHasSlides; 
					
					// prepare annotation dialogs	
					if(widget['annotate']){
						options.annotate = true;  
						switch(widget['name']){  
							// args: type, dialog label, short icon name
							case 'comments' : _this.prepareDialog('comments', 'Kommentar hinzufügen', '+ Kommentar');  break;
							case 'tags' :  _this.prepareDialog('tags', 'Schlüsselwort (tag) hinzufügen', '+ Tag'); break;
							case 'highlight' : _this.prepareDialog('highlight', 'Schlüsselwort (tag) hinzufügen', '+ Tag'); break;
							case 'toc' : _this.prepareDialog('toc', 'Kapitelmarke für das Inhaltsverzeichnis hinzufügen', '+ Kapitel'); break;
							case 'assessment' :  _this.prepareDialog('assessment', 'Frage hinzufügen', '+ Frage'); break;
							case 'assessment-fill-in' :  _this.prepareDialog('assessment-fill-in', 'Lücke hinzufügen', '+ Frage'); break;
							case 'assessment-writing' :  _this.prepareDialog('assessment-writing', 'Frage hinzufügen', '+ Frage'); break;
						}
					}else{
						options.annotate = false;
					} 
					_this.enableWidget(widget['name'], options); 
			}); 
			_this.observer.parse(_this.source_selector, 'html');
					
		
			// set instruction menu
			$('.instructions').empty();
			var tab = $('<ul></ul>');//
			var tab_content = $('<div></div>')
				.attr('id', 'instructions-tabs')
				.prependTo('.instructions')
				;
			tab_content
				.append($('<div></div>').addClass('ui-tabs-label').text('.'))
				.append(tab);
				
			var ii = 1;
			var current = -1; //alert('__'+JSON.stringify(res[0]['phases'][2]))
			$.each(res[0]['phases'], function(i, ins){
				if(i < 5){ // xxx bugy ... 
					tab.append('<li><a href="#instab'+ii+'">'+ii+'</a></li>');
					if(_this.userData.experimental === ""){  // kontrollgruppe
						tab_content.append($('<div></div>').attr('id', 'instab'+ii).html('<strong>'+ins.title_k+':</strong> '+ins.instruction)); // 
					}else{ // experimentalgruppe
						tab_content.append($('<div></div>').attr('id', 'instab'+ii).html('<strong>'+ins.title+':</strong> '+ins.instruction));
					}
					ii++;
				}	
			});		
			tab_content.tabs();
			tab_content.tabs('select', _this.userData.experimental === "" ? 0 : this.current_phase);
		
			
			
			// misc configurations	
  		$('#accordion').accordion({
  			collapsible: false,
  			heightStyle: "fill",
  			change: function( event, ui ) { 
  				_this.enableEditing($('#accordion').find('.ui-accordion-content-active').attr('id'));
  				//$.each(_this.loadedWidgets, function(i, val){ _this.enableEditing(val); });
  			} 
  		});
  		//$('#accordion').css('width', '-moz-calc(100vh -'+ $('#video1').css('width')+')');
  		
  		$( "#accordion-resizer" ).resizable({
      minHeight: 140,
      minWidth: 200,
      resize: function() {
        $( "#accordion" ).accordion( "refresh" );
      }
    });
  		
		});
		
		
		
		return;
		var m = $('.messages');//.empty();//.appendTo('ui-tabs-nav');.addClass('')
		var users_online = $('<span></span>')
				
				.addClass('users-online-nav')
				.prependTo('.account-data')
				;
		this.socket.on('broadcast-user-online', function(data){
			users_online.empty();
			$.each(_this.db.getUserByGroupId(data.group_id, _this.current_phase), function(i, val){
				if(val.id != _this.userData.id){
				var hs = val.hs == 'n' ? 'FH Nordhausen' : 'TUD / IHI Zittau';
				var ol = data.user_id == val.id ? 'on' : 'op';
				var the_user = $('<a></a>')
					.addClass('users-online '+ol)
					.css('background-image', "url('img/user-icons/user-"+this.id+".png')")
					.appendTo(users_online)
					.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text(val.firstname+' '+val.name+' ('+hs+')'); } })
					.text('');
				}
			});
			
		});
		
		//	
		var msg_button = $('<span></span>')
			.text('Messages')
			.addClass('ui-button message-nav')
			//.appendTo(m)
			.click(function() {
      	$( ".msg-container" ).empty().toggle( ); // 'blind', {}, 500 
      	$.get('/messages', function(data){
					$.each(data, function(i, msg){
						if(msg.type == 'test-result' && msg.content.videoid == _this.currentVideo){	
							var user = _this.db.getUserById(msg.from);
							var date = '';//new Date(msg.date*1000);
							//date = date.getDay()+'.'+date.getMonth()+'.'+date.getFullYear()+', '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
							var title = $('<div></div>')
								.addClass('msg-title ui-button '+msg.type)
								.css('background-image',  "url('img/user-icons/user-"+msg.from+".png')")
								.click(function(e){
									$(this).parent().find('.msg-content').toggle();
								})
								.append(user.firstname+' '+user.name)
								.append($('<span></span>').text(' '+date).addClass('msg-note'));
						
							var content = $('<div></div>')
								.addClass('msg-content')
								.hide()
								.append($('<div></div>').html('<b>Frage:</b> '+decodeURIComponent(msg.content.question)))
								.append($('<div></div>').html('<b>Antwort:</b> '+decodeURIComponent(msg.content.res)));	
							
							var feedback = $('<div></div>')
								.appendTo(content)
								.append('<b>Feedback:</b> ');
							$.get('/messages', function(data){
								$.each(data, function(i, fb){ 
									if(fb.type == 'feedback' && fb.replyto == msg._id){ 
										var user = _this.db.getUserById(fb.from);
										feedback.append($('<div></div>')
											.addClass('msg-feedback')
											.css('background-image',  "url('img/user-icons/user-"+fb.from+".png')")
											.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text('Feedback von '+user.firstname+' '+user.name);} })
											.append(decodeURIComponent(fb.content))
										);
									}
								});
							});
							
							var reply = $('<span></span>')
								.appendTo(content)
								.addClass('msg-feedback-reply')
								.append('<b>Feedback geben:</b> ')
								.append('<textarea></textarea>')
								.append($('<span></span>').text('send').addClass('msg-reply ui-button').click(function(){
										var the_feedback = {
											from : _this.wp_user, // the user that answered the question
											to : msg.from, // the author of the question
											date : new Date(),
											replyto: msg._id,
											type : 'feedback',
											read : false, 
											replied: false,
											title : 'Result: ',//+encodeURIComponent(obj.question),
											content : encodeURIComponent($(this).parent().find('textarea').val()) 
										};
										$.post('/messages', {"data":the_feedback}, function(res){ 
											//alert('Has been saved: '+ JSON.stringify(res));
											feedback.append($('<div></div>')
												.addClass('msg-feedback')
												.css('background-image',  "url('img/user-icons/user-"+the_feedback.from+".png')")
												.append(decodeURIComponent(the_feedback.content))); 
										});
									})// end click
								);
												
							var n = $('<div></div>')
								.addClass('msg-item')
								.append(title)
								.append(content)
								.appendTo('.msg-container');
						}
					});
				});
      	return false;
    	});
		var msg_container = $('<div></div>')
			.addClass('msg-container')
			.text('hello')
			.appendTo(m)
			.hide();
			
 
    // set effect from select menu value
    
		/*m.append('Messages').addClass('ui-button').click(function(){
			
		});*/
		
		// build menu with other accessible videos
		// needs to be implemented with the vi2-widget
		$('.sitepanel-right').html('<strong>Related Videos</strong>');
		var list = $('<div></div>')
				.addClass('ui-menu related-video-list')
				.appendTo('.sitepanel-right');
			
		$.get('/related-videos/'+_this.groupData.videos.join(","),function(data){ //alert(JSON.stringify(data)); 
			$.each(data, function(i, video){ 
				if(this.id != _this.currentVideo){	 
					//var video = _this.db.getStreamById(this);
					var el = $('<div></div>')
						.addClass('related-video')
						.css('background-image', "url("+video.thumbnail+")")	
						.appendTo(list);
					var link = $('<a></a>')
						.addClass('ui-button')
						.click(function(){ 
							//_this.currentGroupVideoNum = i;
							_this.init('startApp', video.id); //_this.parsePopcorn(video.popcorn)
						})
						.html(video.metadata[0].title+' ')
					//.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text('Bearbeitet durch: '+video.title);} });
						.appendTo(el);
					var info = $('<div></div>').addClass('related-video-info').text(video.metadata[0]["abstract"]+' ').appendTo(el)
				}
			});	
		});
		
		return;
		// editing progress
		var status = 0; 
		var length = this.videoData.metadata[0].length;
		status =+ (length * 3.5) / (this.videoData.toc.length * 10);
		status =+ (length * 3.5) / (this.videoData.tags.length * 10);
		status =+ (length * 3.5) / (this.videoData.assessment.length * 10);
//		status += (this.videoData.links.length / length ) * 0;
//		status += (this.videoData.comments.length / length ) * 0;
		//alert(status);
		
  },
  
 
  
  loadedWidgets : [],
  	
	/* build player dialog by widget definitions **/
	enableWidget : function(widget_name, options){  
		var widget = '';
		var title = widget_name; 
		if(this.loadedWidgets.indexOf(widget_name) != -1){ 
			return;
		}
		// invoke widgets
		switch(widget_name){
			case "syncMedia" : 
				//if(options.hasSlides){
					widget = new Vi2_SyncMedia({selector: '#syncMedia', vizOnTimeline: false, controls: false, path : '/vi-lab/slides/'});//, placeholder: 'slides/'+stream+'/'+stream+'_00001.jpg'}); 
					this.observer.addWidget(widget);
					title = 'Orte'; 
				//}
				break;
			case "tags" :
				widget = new TemporalTagging({vizOnTimeline: true, max:20}, {}); // sort:'freq'
				this.observer.addWidget(widget); 
				title = 'Schlüsselwörter (tags)';    
				break;
			case "highlight" : 
				widget =  new Vi2_Highlighting();
				this.observer.addWidget(widget); 
				title = 'Darsteller';    
				break;
			case "toc" : 
				widget = new TOC({vizOnTimeline: true, path: this.server_url+'/vi-lab/img/user-icons/'}); 
				this.observer.addWidget(widget); 
				//widget.init(this.observer.vid_arr[0]['annotation']);
				title = 'Szenen'; 
				break
			case "xlink" :		
				//widget = new XLink({target_selector:'#seq', vizOnTimeline: true, minDuration:'5'});
				//this.observer.addWidget(widget);
				break;	
			case "comments" : 
				widget = new Comments({path: this.server_url+'/vi-lab/img/user-icons/'});  
				this.observer.addWidget(widget); 
				title = 'Kommentare';
				break;
			case "assessment" : 
				widget = new Assessment({path: this.server_url+'/vi-lab/img/user-icons/'});
				this.observer.addWidget(widget);
				title = 'Testfragen';			
				break;
			case "assessment-fill-in" :		
				widget = new AssessmentFillIn({target_selector:'#seq', vizOnTimeline: true, minDuration:'5'});
				this.observer.addWidget(widget);
				title = 'Lückenskript';	
				break;
			case "assessment-writing" :		
				widget = new AssessmentWriting({target_selector:'#seq', vizOnTimeline: true, minDuration:'5'});
				this.observer.addWidget(widget);
				title = 'Aufgaben';	
				break;		
			default : return;			
		}
		this.loadedWidgets.push(widget_name);
		
		// add accordion elements
		if(options.accordion){ 
			var h3 = $('<h3 class="ui-accordion-header ui-corner-all"></h3>')
				.append('<a class="accordion-title" href="#">' + title + '</a>');
			if(options.annotate){
				h3.append('<a class="accordion-btn ui-state-default add-'+widget_name+'" style="padding-left:12px;">+</a>');
			}	
			// xxx bad hack instead of providing a timed feature like this
			if(widget_name == 'assessment-fill-in'){
				h3.append(
					$('<a></a>')
						.addClass('accordion-btn ui-state-default add-'+widget_name)
						.css('padding-left','12px')
						.text('-')
						.bind('mouseenter',function(){
							$('.assessment-fill-in').hide(430);
						})
						.bind('mouseleave',function(){
							$('.assessment-fill-in').show(240);
						})
						.tooltip({delay: 2, showURL: false, bodyHandler: function() { 
							return $('<span></span>').text('Lücken verbergen und Text vollständig anzeigen'); } 
						})
				);	
			}
			
			if( options.annotate || widget_name == 'toc' || widget_name == 'highlight' || widget_name == 'syncMedia' ){
				
				h3.appendTo('#accordion');
				$('<div></div>')
					.attr('id', widget_name)
					.css( "height", "" )
					//.attr('style',"height:400px;")
					.appendTo('#accordion');
				$('#toc').css( "height", "" );	
			}	
		}	 
	},
	
	
	

  
  /** 
  * Saves Popcorn data via PHP to MySQL database
  */
  savePopcorn : function(type){ return; alert(99)
  	var _this = this; 
  	// vi-two DOM to popcorn_json
  	var data = this.vitwo2json(this.source_selector, type); //alert(JSON.stringify(data));
 		vi2.observer.log('save:'+type +' '); //alert('/update-'+type+'/'+this.videoData._id)
 		//
 		$.post('/videos/annotate', {"data":data, annotationtype:type, videoid:_this.videoData._id}, function(res2){ 
 			_this.socket.emit('updated video', { videoid: _this.videoData._id });
 			_this.observer.setAnnotations();
      _this.enableEditing(type);
    });
 		return;
  },
  
  
  /* -- 
<div id="my video" type="video" starttime="0" duration="100">http://localhost/daily/wp-content/uploads/2012/11/Standard-Projekt.webm</div>
<div id="" type="xlink" starttime="0" duration="70.08888562434417" posx="50%" posy="50%"></div>
<div id="" type="seq" starttime="132.82974291710389" seek="0" duration="197.8315320041973">http://localhost/elearning/vi2/_attachments/slides/seidel1/iwrm_seidel1-3.jpg</div>
<div type="comment" author="nise" date="2013-01-03 12:46:03" starttime="15.32">hello world</div>
<div type="toc" author="nise" date="2013-01-03 13:01:46" starttime="16.88">tocc</div>
<div type="tags" author="nise" date="2013-01-03 20:43:26" starttime="0">kex</div>
  
  */
  vitwo2json : function(dom, type){
  	var r = []; 
  	switch(type){
  		case 'tags' : var tags = [];
				// fetch tags ... {"tagname":"El Nino","occ":[0]},
				$(dom).find("div[type='tags']").each(function(i, val){
					var flag = 0;
					$.each(tags, function(j,vall){
						if(this.tagname == encodeURIComponent($(val).text())){
							this.occ.push(Number($(val).attr('starttime')));
							flag=1;
						}
					}); 
					if(flag == 0){
						//tags.push( JSON.parse('{"tagname":"'+ encodeURIComponent($(val).text())+'", "occ":['+ Number($(val).attr("starttime"))+'] }'));
					}
					//track_tags_1 += '{"id":"TrackEvent'+i+'","type":"tag","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+',"tag":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_tags_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				}); 
				r = tags;
				break;
			case 'highlight' : var highlight = [];
				// fetch highlight ... {"tagname":"El Nino","occ":[0]},
				$(dom).find("div[type='highlight']").each(function(i, val){
					var flag = 0;
					$.each(highlight, function(j,vall){
						if(this.tagname == encodeURIComponent($(val).text())){
							this.occ.push(Number($(val).attr('starttime')));
							flag=1;
						}
					}); 
					if(flag == 0){
						highlight.push(JSON.parse('{"tagname":"'+ encodeURIComponent($(val).text())+'", "occ":['+ Number($(val).attr("starttime"))+'] }'));
					}
					//track_tags_1 += '{"id":"TrackEvent'+i+'","type":"tag","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+',"tag":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_tags_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				}); 
				r = highlight;
				break;
				
			case 'toc' : var toc = [];
				// fetch toc ... {"label":"2. Objectives","duration":1,"start":"195.960"},
				$(dom).find("div[type='toc']").each(function(i, val){
					toc.push(JSON.parse('{"label":"'+ encodeURIComponent($(this).text())+'", "start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'" }'));
					//track_toc_1 += '{"id":"TrackEvent'+i+'","type":"toc","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+',"toc":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_toc_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				});
				r = toc;
				break;
				
			case 'comments' : var comments = [];
				// fetch comments .. {"comment":"hallo welt", "start":"65","author":"thum.daniel", "date":"29.09.2013"}
				$(dom).find("div[type='comments']").each(function(i, val){
					comments.push(JSON.parse('{"comment":"'+ encodeURIComponent($(this).text()) +'", "start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'"}'));
					//track_comments_1 += '{"id":"TrackEvent'+i+'","type":"comment","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+', "comment":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_comments_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				});
				r = comments;
				break;
				
			case 'assessment' : var questions = [];
				// fetch question
				$(dom).find("div[type='assessment']").each(function(i, val){ 
					questions.push(JSON.parse('{"title":"'+encodeURIComponent($(this).text())+'","start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'"}'));
					//track_questions_1 += '{"id":"TrackEvent'+i+'","type":"question","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+', "question":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_comments_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';			
				});
				r = questions;
				break;
		}
		
		//json = JSON.parse(json);
		

		return r;
  },  	
	
	
	
	
	
	
	
	
	/** 
  * distinguish different input methods beside textarea :: tags, question/answers
  */
  prepareDialog : function(type, label, short_name){  
  	var _this = this;
  	var selector = $('<div></div>').attr('id','annotation-dialog-'+type).addClass('some-dialog');

		// add "+"-button to accordion panes 	
		$('.add-'+type).click( function(e) { 
			selector.dialog('open'); 
		});
		
		// Build form as simple textarea for anotation or as complex (MC-)question and answers form
  	var form = type != 'assessment' ? $('<textarea></textarea>').attr('id', 'annotionContent') : this.buildAssessmentForm(selector)
  	
  	// Build dialog window
  	selector
			.html(form)
			.appendTo('#screen')
			.dialog({
					autoOpen: false,
					height: '300', 
					width: '400', 
					modal:true, 
					draggable: false,
					open : function(){  
						_this.observer.player.pause();
					},
					buttons : {
						"save" : function(){ 
							/*if(_this.saveDialog(type, vi2.observer.player.currentTime(), form, undefined, this)){	// dialog, type, time, form		
								$(this).dialog("close");			
							}*/
						}
					},
					closeOnEscape: true,
					resizable: false,
					title: label,// + ' to ' + $(this).attr('title'),
					//position:['100',0], 
					colseText:'x',
					zIndex:200000						
			}); 
  },
  
  
  /**
  *
  */
  buildAssessmentForm : function(selector){ 
  		var question = $('<textarea></textarea>').attr('id', 'annotionQuestion');
  		var answer_box = $('<div></div>');
  		
  		// Multiple Choice / Singele Choice
  		var assessment_types = ['radio','checkbox','fill-in'];
  		var type = assessment_types[1];
  		var ii = 0;
  		var add = $('<div></div>').addClass('add-question mc-question').button().text('Multiple-Choice-Antwort')
  			.click(function(){
  				var rm = $('<span></span>').button().text('x')
						.click(function(){ 
							$(this).parent().remove(); 
							if($('.answer').length == 0){
								$('.fi-question').show();
							}	
						});
					$('.fi-question').hide();
					var answ = $('<div></div>')
						.attr('id', 'answ'+Math.ceil(Math.random()*100))
						.addClass('answer')
						.append('<input type="'+ type +'" name="quest" value'+ (type == "=radio" ? 1 : "") +' />')
						.append('<input type="text" value=""/>')
						.append(rm)
						.append('<br/>');
					var height = Number(selector.dialog( "option", "height")); 
					selector.dialog( "option", "height", (height+25));
					ii++;
					answer_box.append(answ);
			});
  		 
  		// fill-in text
  		var add2 = $('<div></div>').addClass('add-question fi-question').button().text('Freitext-Antwort')
  			.click(function(){
					var rm = $('<span></span>').button().text('x').click(function(){ 
						$(this).parent().remove();
						$('.add-question').show();
				});
  			$('.add-question').hide();
  			var answ = $('<div></div>')
  				.attr('id', 'answ'+Math.ceil(Math.random()*100))
  				.addClass('answer')
  				.append('<textarea></textarea>')
  				.append(rm)
  				.append('<br/>');
  			var height = Number(selector.dialog( "option", "height")); 
  			selector.dialog( "option", "height", (height+25));
  			ii++;
  			answer_box.append(answ);
  		});
  		 
  		//
  		return $('<div></div>')
  			.addClass('questionanswers')
  			.append(question)
  			.append(answer_box)
  			.append(add)
  			.append(add2);
  	},
  
  
  /* Assessment Edit Form **/
  assessmentEditForm : function(json, selector){ 
		//add question
		var question = $('<textarea></textarea>').attr('id', 'annotionQuestion').val(json.question);
		var answer_box = $('<div></div>');
		
			var ii = 0;
			var add = $('<div></div>').button().text('add answer').click(function(){
				var rm = $('<span></span>').button().text('x').click(function(){ 
					$(this).parent().remove();
					if($('.answer').length == 0){
						$('.fi-question').show();
					}	
				});
				var answ = $('<div></div>')
					.attr('id', 'answ'+Math.ceil(Math.random()*100))
					.addClass('answer')
					.append('<input type="checkbox" name="quest" value="1" />')
					.append('<input type="text" value=""/>')
					.append(rm)
					.append('<br/>');
				var height = Number(selector.dialog( "option", "height")); 
				selector.dialog( "option", "height", (height+25));
				ii++;
				answer_box.append(answ);
			});
			
			// fill in questions
			var add2 = $('<div></div>').addClass('add-question fi-question').button().text('Freitext-Antwort')
  			.click(function(){
					var rm = $('<span></span>').button().text('x').click(function(){ 
						$(this).parent().remove();
						$('.add-question').show();
					});
  			$('.add-question').hide();
  			var answ = $('<div></div>')
  				.attr('id', 'answ'+Math.ceil(Math.random()*100))
  				.addClass('answer fi-answer')
  				.append('<textarea></textarea>')
  				.append(rm)
  				.append('<br/>');
  			var height = Number(selector.dialog( "option", "height")); 
  			selector.dialog( "option", "height", (height+25));
  			ii++;
  			answer_box.append(answ);
  		});	
		
		// handle answers
		if(json.answ[0] != undefined){
		if(json.answ[0].questiontype == 'mc'){
			// add existing answers
			$.each(json.answ, function(i, val){ 
				var rm = $('<span></span>').button().text('x')
					.click(function(){ 
						$(this).parent().remove(); 
						if($('.answer').length == 0){
							$('.fi-question').show();
						}
					});
				var checkbox = $('<input type="checkbox" name="quest" value="1" />');
				$.each(json.correct, function(j, el){
					if(el == val.id){ 
						checkbox.attr('checked', true);
					}
				});
				var answ = $('<div></div>')
					.attr('id', val.id)
					.addClass('answer')
					.append(checkbox)
					.append($('<input type="text" />').val(val.answ))
					.append(rm)
					.append('<br/>')
					.appendTo(answer_box);
				var height = Number(selector.dialog( "option", "height")); 
				selector.dialog( "option", "height", (height+25));
			
			}); 
		}else if(json.answ[0].questiontype == 'fill-in'){ 
			var rm = $('<span></span>').button().text('x').click(function(){ 
					$(this).parent().remove();
					if($('.answer').length == 0){
						$('.fi-question').show();
					}	
				});
			var answ = $('<div></div>')
  				.attr('id', 'answ'+Math.ceil(Math.random()*100))
  				.addClass('answer fi-answer')
  				.append($('<textarea></textarea>').val(json.answ[0].answ))
  				.append(rm)
  				.append('<br/>')
  				.appendTo(answer_box);
  			var height = Number(selector.dialog( "option", "height")); 
		}
		}
		
		return $('<div></div>')
		.addClass('questionanswers')
		.append(question)
		.append(answer_box)
		.append(add)
		.append(add2);
	},
  
  
  /** -- */
  saveDialog: function(type, time, form, replaceAnnotation, selector){ 
  	var _this = this;
  	if( ! _this.validateForm(selector)){
  		return false;
  	}
  	var data = {};
		data.time = time;  
		//				
		if(type == 'assessment'){  	 
			var o = {};
			o.question = $(selector).find('#annotionQuestion').val(); 
			o.answ = [];
			o.correct = []; 
			var qtype = 'mc';
			$(selector).find('.questionanswers div.answer').each(function(i, val){
				if($(this).find("input[name='quest']:checked").val() == 1){ 
					o.correct.push($(this).attr('id'));
				}
				var the_answer = $(this).find("input[type='text']").val();
				if(the_answer == undefined){ 
					the_answer = $(this).find('textarea').val(); 
					qtype = 'fill-in';
				}
				o.answ.push({id: $(this).attr('id'), answ: the_answer, questiontype: qtype });
			});
			data.content = o; //JSON.stringify(o); //alertencodeURIComponent(data.content));
		}else{
			data.content = form.val();
		}
		// validation					
		if (data.content != {}){   
			// update DOM
			var element = ''; 
			if(replaceAnnotation != undefined){ //alert('update DOM-'+type+'___'+JSON.stringify(data.content.question)); 
				if(type == 'tags' || type == 'highlight'){ //alert(replaceAnnotation+'   '+data.content)
					$(_this.source_selector).find(':contains("'+replaceAnnotation.replace('--',' ')+'")').each(function(i,val){
						$(this).text(data.content);
					});
				}else{ 
					$(_this.source_selector).find('[starttime="'+replaceAnnotation+'"]')
						.attr('author', vi2.wp_user)
						.attr('date', new Date().getTime())
						.text(type=='assessment' ? JSON.stringify(data.content) : data.content);
				}	
			// add DOM		
			}else{ //alert('add DOM')//alert(JSON.stringify(data.content)); alert(data.type)
				element = $('<div></div>')
    		//.attr('id', el.popcornOptions.text)
    		.attr('type', type)
    		.attr('starttime', data.time)
    		//.attr('duration', 10)
    		.attr('author', vi2.wp_user)
    		.attr('date', new Date().getTime()) // time in ms
    		.html(type=='assessment' ? JSON.stringify(data.content) : data.content )
    		.appendTo(_this.source_selector);
    	}	
			// save to popcorn / WP
			vi2.observer.log('saveannotation:'+type +' '+data.time);
			
			_this.savePopcorn(type);	
			// update player
  		
			//_this.observer.log('[call:add_annotation, content:'+data.content+', time:'+data.time+']');
			_this.observer.player.play(); // restart playback
		
		}else{
			//_this.player.play();									
		}		
		return true;
  },
  
  /**
  */
  validateForm : function(selector){
  	var textarea_flag = 0, textinput_flag = 0, msg = '', sum_checked = 0, sum_checkbox = 0;
  	$(selector).find('input[type=text]').each(function(i,val){
  		if($(val).val() == ''){
  			$(val).css('border','solid 1px red');
  			textinput_flag = true;
  		}else{
  			$(val).css('border','solid 1px black');
  		}
  	});
  	if(textinput_flag){
  		msg += "\n Versehen Sie bitte jede Antwortoption mit einem Text.";
  	}
  	
  	$(selector).find('textarea').each(function(i,val){
  		if(String($(val).val()).length < 2){
  			$(val).css('border','solid 1px red');
  			textarea_flag = true;
  		}else{
  			$(val).css('border','solid 1px black');
  		}
  	});
  	if(textarea_flag){
  		msg += "\n Definieren Sie bitte einen Text für diese Frage bzw. Antwort.";
  	}
  	
  	if($(selector).find('input[type=checkbox]').length > 0 && $(selector).find('input:checked').length == 0){ 
  		msg =+ "\n Mindestens eine Antwortoption sollte als richtig markiert werden.";
  	}
  	
  	if(String(msg).length === 0){ return true; }else{ alert('Validation Error:'+msg); return false;}
  },
  
  current_phase : 0,
	
	/* -- **/
	enableEditing : function(ttype){  
		var annotate = false;
		this.current_phase = this.userData.experimental === "" ? 4 : this.script[0]['current_phase'];
		
		$.each(this.script[0]['phases'][this.current_phase]['widgets'], function(i, widget){ 
			if(this.name == ttype){ 
				annotate = widget.annotate;
			}
		});
		if(! annotate){
			return;
		}
		  
		var _this = this;
		// 
		$('.'+ttype+'list').find('a.accordion-annotation-edit').each(function(i,val){ $(this).remove(); });
		
		$('.'+ttype+'list').find('li').each(function(i, val){  
			if(ttype =='toc' || ttype =='tags' || ttype == 'highlight' || $(val).attr('author') == _this.wp_user){ 
				var selector = $('<div></div)').attr('id','annotation-dialog-'+ttype+'-'+i).addClass('some-dialog');
				var id = $(val).find('a').attr('class').replace('id-', '');
				var edit_btn = $('<a></a>')
					.addClass('accordion-annotation-edit tiny-edit-btn ui-button tiny-edit-btn-'+ttype)
					.click(function(e){ 
						selector.dialog('open'); // {"question":"bim","answ":[{"id":"answ0","answ":"he"},{"id":"answ1","answ":"ho"}],"correct":"answ0"}
					});
				var delete_btn = $('<a></a>')
					.addClass('accordion-annotation-edit tiny-delete-btn ui-button tiny-delete-btn-'+ttype)
					.click(function(e){ 
						//$(this).text('realy?').click(function(){ 
							//$(this).parent().parent().remove();
							//vi2.observer.log('deleteannotation:'+ttype+' '+id);
							if(ttype == 'tags' || ttype == 'highlight'){ 
								$(_this.source_selector).find(':contains("'+id+'")').each(function(i,val){
									$(this).remove();
								});
							}else{
								$(_this.source_selector).find('[starttime="'+id+'"]').remove();
							}	
							_this.savePopcorn(ttype);
						//});
					}); 
				var palette = $('<span></span>').addClass('icon-bar').append(edit_btn).append(delete_btn)	
				$(val).find('.icon-bar').each(function(i,val){ $(this).remove(); });
				$(val).append(palette);
			
				var form = '';
				switch(ttype){
					case 'assessment':
						form = _this.assessmentEditForm(JSON.parse(String($('#vi2').find('[starttime="'+id+'"]').text())), selector);
						break;
					case 'tags':
						form = $('<textarea></textarea>').attr('id', 'annotionContent').val(id.replace('--', ' '));
						break;
					case 'hightlight':
						form = $('<textarea></textarea>').attr('id', 'annotionContent').val(id.replace('--', ' '));
						break;		
					default:
						form = $('<textarea></textarea>').attr('id', 'annotionContent').val($('#vi2').find('[starttime="'+id+'"]').text());
				} 
					 	
				//				
				selector
					.html(form)
					.dialog({
						autoOpen: false,
						height: '200', 
						width: '300', 
						modal:true, 
						draggable: false,
						open : function(){ 
							//vi2.observer.player.pause();
						},
						buttons : {
							"save" : function(){  
								if(_this.saveDialog(ttype, id, form, id, this)){	// dialog, type, time, form, replace		
									$(this).dialog("close");	
								}
							},
							"delete" : function(){
								$('#vi2').find('[starttime="'+id+'"]').remove();
								//vi2.observer.log('deleteannotation:'+ttype +' '+id);
								
								_this.savePopcorn(ttype);					
								$(this).dialog("close");
							}
					},
					closeOnEscape: true,
					resizable: false,
					title: 'Define a Question',// + ' to ' + $(this).attr('title'),
					//position:['100',0], 
					colseText:'x',
					zIndex:200000						
				}); // end selector	
			}// end if		
		}); // end each
	},
	
	
		
 
  /** 
  * Call popcorn-maker by pressing an edit button 
  */
  addEdit_btn : function(){
  	var _this = this;
    var popcorn_url = this.server_url +'/vi-lab/js/popcorn-maker/index.html';
		var title = $('.entry-title').text();
		var dialog = $("#dialog");
		
    // call popcorn
    $('<a></a>')
			.text('edit')
			.addClass('edit-videolab')
			.button()
			.click(function(e){ 
				vi2.observer.log('[call:open_popcorn]');
				$("#dialog").empty();
				var frame = $('<iframe></iframe>')	
					.attr('src', popcorn_url)// + '?post_id=' + _this.post_id + '&title=' + title)
					.attr('height', '100%')
					.attr('width', '100%'); 
				dialog.append(frame).dialog({height: '650', width: '1000', modal:true, position:['100','40'], zIndex:200000 ,title: title});	
			})
		//.appendTo('.meta-desc');
	},
	
	
	/* ... */
	getWidgets : function(){
		
		return true;
	}
	

});// end class VideoLab









