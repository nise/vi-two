/*	VideoPlayer
 		author: niels.seidel@nise81.com

 - remove flash vars / falback code
 - simultanous playback of two clips
 - cache mangement for videos: http://www.misfitgeek.com/2012/10/html5-off-line-storing-and-retrieving-videos-with-indexeddb/
 - refine cycle including event bindings
 - change all 'bind's inside loadUI into extra functions
 - visualize loaded bytes
 - audio only?
 - manage to play parts of a video: http://www.xiph.org/oggz/doc/group__seek__api.html
- options: supported codecs / mime types
 - ui control for playbackrate
 - further: API calls: http://code.google.com/apis/youtube/js_api_reference.html
 - good fullscreen example: http://demo.paranoidr.de/jVideo/
 - loading video 2 times seems strange, look at main :: 
 - media fragment URI ..parser ..:: http://tomayac.com/mediafragments/mediafragments.html
 \begin{lstlisting}

\\ normal playback time
Schema: t=npt:<start-in-seconds>,<end-in-seconds>
Beispiel: t=npt:10,20 
.
t=120s,121.5s
Shema: t=npt:<m>,<s>.<ms>:<h>:<m>.<ms>
Beispiel: t=npt:120,0:02:01.5

// SMPTE timecode standard ... wie bei DVDs
Schema: t=smpte-<frame-rate>:<h>:<m>:<s>,<h>:<m>:<s>.<ms>
t=smpte-30:0:02:00,0:02:01:15
t=smpte-25:0:02:00:00,0:02:01:12.1


t=npt:10,20 			# => results in the time interval [10,20[
t=,20 						# => results in the time interval [0,20[
t=smpte:0:02:00, 	# => results in the time interval [120,end[


// Räumliche Dimension
Schema: #xywh=<einheit>:<x>:<y>:<width>:<height>
Beispiel: #xywh=pixel:10,10,30,30


track=1&track=2 track=video
track=Kids%20Video
# => results in only extracting track ’1’ and ’2’
# => results in only extracting track ’video’
# => results in only extracting track

xywh=160,120,320,240
# => results in a 320x240 box at x=160 and y=120
xywh=pixel:160,120,320,240 # => results in a 320x240 box at x=160 and y=120
xywh=percent:25,25,50,50 # => results in a 50%x50% box at x=25% and y=25%

// Named dimension
id=1 # => results in only extracting the section called ’1’
id=chapter-1 # => results in only extracting the section called ’chapter-1’
id=My%20Kids # => results in only extracting the section called ’My Kids’

\end{lstlisting}

Alternative Zeitleiste: http://propublica.github.com/timeline-setter/doc/twitter-demo.html

 */


var Video = $.inherit(/** @lends VideoPlayer# */
{
	/** 
	* 	@constructs 
	*		@param {object} options An object containing the parameters
	*		@param {Observer} observer Observer of VI-TWO
	*/
  __constructor: function(options, observer) { 
		this.options = $.extend(this.options, options);
		this.observer = observer;
		this.spinner = new Spinner(this.spinner_options);
  	this.loadVideo('./', 0); // load nil video to build player interface
  	this.loadUI();
  	
  },

	name: 'video player',
	// defaults
	options: {observer: null, selector: '#video1', width: 500, height: 375, wrapControls: '', childtheme: '', thumbnail:'img/placeholder.jpg', embed:true},
	video: null,
	observer: null,
	url: '',
	video_controls: null,
	video_volume: 0.5,
  video_container: null,
	video_wrap: null,
	play_btn: $(''),
	add_btn: $(''),
	video_seek: null,
	video_progress: null,
	video_timer: null,
	volume: null,
	muted: false,
	volume_btn: null,
	seeksliding: null,
	interval: 0,
	isSequence: false,
	seqList: [],
	seqNum: null,
	seqLoop: false,
	percentLoaded:0,
	spinner : false,
	spinner_options : {
  	lines: 6, // The number of lines to draw
  	length: 0, // The length of each line
  	width: 20, // The line thickness
  	radius: 20, // The radius of the inner circle
  	color: '#003366', // #rgb or #rrggbb
  	speed: 1, // Rounds per second
  	trail: 89, // Afterglow percentage
  	shadow: false, // Whether to render a shadow
  	hwaccel: false, // Whether to use hardware acceleration
  	className: 'spinner', // The CSS class to assign to the spinner
  	zIndex: 2e9, // The z-index (defaults to 2000000000)
  	top: 'auto', // Top position relative to parent in px
  	left: 'auto' // Left position relative to parent in px
	},
	buffclick: 0,

	/* load video */
	// param: url= url of video; seek = time seek within video in seconds
	loadVideo: function(url, seek) { 
		this.startSpinning();
		if (seek == undefined){ this.seek = 0;} else{ this.seek = seek;}
		var supportedCodec = this.detectVideoSupport();
		
		/*
		if (supportedCodec == '') {	
  		var flashvars = {};
			flashvars.mediaURL = "videos/iwrm_cullmann.mp4";
			flashvars.teaserURL = "media/nice-flowers.jpg";
			flashvars.allowSmoothing = "true";
			flashvars.autoPlay = "false";
			flashvars.buffer = "6";
			flashvars.showTimecode = "true";
			flashvars.loop = "false";
			flashvars.controlColor = "0x3fd2a3";
			flashvars.controlBackColor = "0x000000";
			flashvars.scaleIfFullScreen = "true";
			flashvars.showScalingButton = "true";
			flashvars.defaultVolume = "100";
			flashvars.crop = "false";
			//flashvars.onClick = "toggleFullScreen";
		
			var params = {};
			params.menu = "false";
			params.allowFullScreen = "true";
			params.allowScriptAccess = "always"
		
			var attributes = {};
			attributes.id = "nonverblaster";
			attributes.bgcolor = "#000000"
		
			swfobject.embedSWF("NonverBlaster.swf", this.options.selector, "300", "288", "9", "js/expressinstall.swf", flashvars, params, attributes);
		}
		*/
		
		var _this = this;
		this.url = url;
	  this.video = document.getElementsByTagName('video')[0];
	  this.video.pause();
		this.video = $.extend(this.video, {
			loop: false,
	  	preload: 'metadata', // 'metadata' | true ??
	  	autoplay: true,
	  	controls: false,
	  	poster: 'img/placeholder.jpg',
	  	width: this.options.width,
	  	height: this.options.height,
	  	onerror: function(e) { _this.errorHandling(e); }
		});

		// event binding: on can play
		this.video.addEventListener('readystate', function(e) { _this.readyStateHandler(e); });

		// event binding: on can play
		this.video.addEventListener('loadedmetadata', function(e) {});

		// event binding: on can play
		this.video.addEventListener('canplay', function(e) { _this.canPlayHandler(e); });

		// event binding: on duration change; trigger when duration is known
		this.video.addEventListener('durationchange', function(e) {  _this.currentTime(_this.seek); _this.durationChangeHandler(e, _this.seek); });

		// event binding: on time update
		this.video.addEventListener('timeupdate', function(e) { 
			_this.timeUpdateHandler(e); 
			_this.setProgressRail(e);
			//_this.setCurrentRail(e);
		});
		
		
		// loading
		this.video.addEventListener('progress', function (e) {
			//_this.setProgressRail(e);
			
			var
				target = _this.video;//(e != undefined) ? e.target : _this.video,
				percent = null;			

			if (target && target.buffered && target.buffered.length > 0 && target.buffered.end && target.duration) {
				percent = target.buffered.end(0) / target.duration;
			} else if (target && target.bytesTotal != undefined && target.bytesTotal > 0 && target.bufferedBytes != undefined) {
				percent = target.bufferedBytes / target.bytesTotal; 
			} else if (e && e.lengthComputable && e.total != 0) {
				percent = e.loaded/e.total;
			}

			if (percent !== null) {
				_this.percentLoaded = percent;
				percent = Math.min(1, Math.max(0, percent));
				
				if (_this.video_progress && _this.video_seek) {
					_this.video_progress.width(_this.video_seek.width() * percent);
				}
			}
			
		}, false);

			

		// event binding: on ended
		$(this.video).bind('ended', function(e) { _this.endedHandler(e); }, false);

		/*
		if(Number(seek) > 0){
			this.video.addEventListener("timeupdate", function() { //alert(_this.video.seekable.end(_this.buffclick));
		}, false);
		*/

	 	// get sources and load video
		$(this.video).html(this.createSource(url, supportedCodec), this.video.firstChild);
		this.video.load(); // not needed ?!
		
		//this.buildSEO();
	},


	/* HTML5 playback detection */
	// 		returns: mime type of supported video or empty string if there is no support
	//		called-by: loadVideo()
	// 		toDo: check support for video element
	detectVideoSupport: function() {
		var canPlay = '';
		var dummy_video = document.createElement('video');

		// prefer webm even if ogv or mp4 is available
		if (dummy_video.canPlayType('video/webm; codecs="vp8, vorbis"') != '') {
			canPlay = 'video/webm'; 
		}else	 if (dummy_video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') != '') {
			canPlay = 'video/mp4'; 		
		}/*else if(dummy_video.canPlayType('video/ogg; codecs="theora, vorbis"') != ''){
			canPlay = 'video/ogv';
		}*/
		
		//
		if (canPlay == '') {
			$('#content').html('<h3>We appologize that IWRM-education is currently not supported by your browser.</h3>The provided video material can be played on Mozilla Firefox, Google Chrome and Opera. If you prefer Internet Explorer 9 you need to install a <a href="https://tools.google.com/dlpage/webmmf">webm video extension</a> provided by Google. In the near future we are going to server further video formats which will be supported by all major browsers.<br /><br /> Thank you for your understanding.');
		}

		return canPlay;
	},

	/* load sequence */
	loadSequence: function(sources, num) { 
		this.seqList = sources;
		this.isSequence = true;
		if (num == null) {
			this.seqNum = 0;
		}else {
			this.seqNum = num % this.seqList.length;
		}
		this.loadVideo(this.seqList[this.seqNum]['url'], 0);

	},

	/* build video source element
			param: src = video url; mime_type = mime_type of video
			returns: video source element including src and type attribute
	*/
	createSource: function(src, mime_type) {
  	var source = document.createElement('source'); 
  	// extract file type out of mime type
  	source.src = src.replace('.webm', '') + '.' + mime_type.replace('video/', '');
  	//"php/download.php?video="+src.replace('videos/', '').replace('.webm', '.' + mime_type.replace('video/', ''))+'&mime='+mime_type;
  	// set mime type
  	source.type = mime_type;
  	return source;
	},

/* SEO ********************/
	buildSEO : function(){ alert(1); return;  //alert(vi2.name)
		var meta = vi2.db.getMetadataById(vi2.observer.current_stream);
		$('head meta').each(function(i,val){ this.remove()});
		
		$('head')
			.prepend('<meta itemprop="duration" content="'+meta.length+'" />')
			.prepend('<meta itemprop="height" content="158" />')
			.prepend('<meta itemprop="width" content="280" />')
			.prepend('<meta itemprop="uploadDate" content="'+meta.date+'" />')
			.prepend('<meta itemprop="thumbnailUrl" content="'+vi2.page_url+'img/thumbnails/iwrm_'+vi2.observer.current_stream+'.jpg" />')
			.prepend('<meta itemprop="contentURL" content="'+vi2.page_url+'videos/iwrm_'+vi2.observer.current_stream+'.mp4" />')
			.prepend('<meta itemprop="embedURL" content="'+vi2.page_url+'#!'+vi2.observer.current_stream+'" />')
		; 
	},


/* UI ******************************************/


	/* load UI */
	loadUI: function() { 
		var _this = this;
		var options = {theme: this.options.theme, childtheme: this.options.childtheme};
		var video_wrap = $('<div></div>').addClass('vi2-video-player').addClass(options.theme).addClass(options.childtheme);
		this.video_controls = $('<div class="vi2-video-controls"><a class="vi2-video-play" title="Play/Pause"></a><div class="timelines"><div class="vi2-video-seeklink"></div><div class="vi2-video-seek"></div><div class="vi2-video-progress"></div></div><div class="vi2-video-timer"></div><div class="vi2-btn-box"></div><div class="vi2-volume-box"><div class="vi2-volume-slider"></div><a class="vi2-volume-button" title="Mute/Unmute"></a></div></div>');

		$(this.options.wrapControls)
			.wrap(video_wrap)
			.after(this.video_controls);
		this.video_container = $(this.options.wrapControls).parent('.vi2-video-player');

		this.play_btn = $('.vi2-video-play', this.video_container);
		this.video_seek = $('.vi2-video-seek', this.video_container);
		this.video_progress = $('.vi2-video-progress', this.video_container);
		this.video_timer = $('.vi2-video-timer', this.video_container);
		this.volume = $('.vi2-volume-slider', this.video_container);
		this.volume_btn = $('.vi2-volume-button', this.video_container);
		this.add_btn = $('.vi2-btn-box', this.video_container);


		// keep the native HTML5 controls hidden
		$(this.video).removeAttr('controls');

		//
		$(this.volume).slider({
			value: _this.video_volume,
			orientation: 'vertical',
			range: 'min',
			max: 1,
			step: 0.05,
			animate: true,
			slide: function(e,ui) {
				_this.muted = false;
				$('video').attr('volume', ui.value);
				_this.video_volume = ui.value;
			}
		});

		// event bindings
//		$(this.video).parent().bind('mouseover', function(e) { _this.video_controls.show();	});
//		$(this.video).parent().bind('mouseout', function(e) { _this.video_controls.hide();	});


		this.play_btn.bind('click', function() {
			_this.play();
		});

		$(this.video).bind('play', function(e) {
			_this.play_btn.addClass('vi2-paused-button');
			vi2.observer.play();
			$('.screen').remove();
		});

		$(this.video).bind('pause', function(e) {
			_this.play_btn.removeClass('vi2-paused-button');
			vi2.observer.pause();
		});


		// keyboard / space bar for play/pause
		$('body').unbind('keydown').bind('keydown', function(e) {
			if (e.which == 32) {
				_this.play();
			}
		});


		this.volume_btn.bind('click', function(e) {
			_this.muteVolume();
		});

		//this.add_btn.text('add tag').click(function(e){  _this.observer.widget_list['tags'].addTags(); });
		// hide moving picture in order limit visual cognition channel to one
		// xxx: #screen should be replaced by an option
		var o = new Image(); 
		$(o).attr('src', this.options.thumbnail).addClass('toggle-pair').prependTo('#screen').hide();//.attr('src', 'img/thumbnails/iwrm_'++'.jpg')
		$(this.video).addClass('toggle-pair');
		var hidden = true;
		var btn = $('<span></span>')
			.addClass('toggle-moving-picture')
			.text('hide video')
			.prependTo('#screen')
			.click(function(){
				$(this).text(hidden ? 'show video' : 'hide video');
				hidden = ! hidden; 
				$('#screen').find('.toggle-pair').toggle();
			});
			
			
		//	
		if(this.options.embed){
			$('<a></a>')
				.addClass('player-share-btn')
				.text('</>')
				.click(function(){
					$('.player-share')
						.appendTo('body')
						.toggle()
						.css('top', $('.player-share-btn').offset().top + 20)
						.css('left', $('.player-share-btn').offset().left - 250);
						 
					var url = window.location.href.slice(window.location.href.indexOf('#') + 1);
					$('.player-share-embed').val('<iframe src="http://www.iwrm-education.org/embed.html#'+url+'" width="935" height="610"></iframe>')
						.bind("focus",function(e){ $(this).select(); })
						.bind("mouseup",function(e){ return false; });
					
					$('.player-share-popup').val('<iframe src="http://www.iwrm-education.org/popup.html?id='+url+'" width="100" height="20"></iframe>') //also: title=bim&lecturer=sam
						.bind("focus",function(e){ $(this).select(); })
						.bind("mouseup",function(e){ return false; });	

					$('.player-share-link').val('http://www.iwrm-education.org/embed.html#'+url)
						.bind("focus",function(e){
								$(this).select();
						})
						.bind("mouseup",function(e){
								return false;
						});
				})
				.appendTo('.vi2-btn-box');
				//
				$('.player-share-close').button().click(function(){
					$('.player-share').hide();
				})
		}	

	},



	/* create seek slider */
	createSeek: function() {
		var _this = this;
		if (this.video.readyState) {
			clearInterval(this.interval);
			clearInterval(this.interval);

			var video_duration = $(this.options.selector).attr('duration');

			this.video_seek.slider({
				value: 0,
				step: 0.01,
				orientation: 'horizontal',
				range: 'min',
				max: video_duration,
				animate: false,
				slide: function(event, ui) {
						_this.seeksliding = true;
				},
				start: function(event, ui) {
					vi2.observer.log(_this.url+' seek_start: '+_this.currentTime()+'   '+ui.value);
					_this.buffclick++;
					_this.seeksliding = true;
				},
				stop: function(e,ui) {
					vi2.observer.log(_this.url+' seek_end: '+ui.value);
					_this.seeksliding = false;
					$(_this.video).trigger('play');
					//if(_this.percentLoaded > (ui.value / _this.duration())){
						$(_this.options.selector).attr('currentTime', Math.ceil(ui.value)); // XXX bugy / webkit fix
					//}else{
					 //alert(33); // bugy xxx
					//}	
				}
			});
			this.video_controls.show();
		} else {
			// try reinitiate the slider as long the
			this.interval = setInterval(function() { _this.createSeek(); }, 150);
		}
	},





/* EVENT HANDLER *************************/

		
		/* -- */
		setProgressRail: function(e) {

		},
		
		/* -- 
		setCurrentRail: function() {

			var t = this;
		
			if (t.media.currentTime != undefined && t.media.duration) {

				// update bar and handle
				if (t.total && t.handle) {
					var 
						newWidth = t.total.width() * t.media.currentTime / t.media.duration,
						handlePos = newWidth - (t.handle.outerWidth(true) / 2);

					t.current.width(newWidth);
					t.handle.css('left', handlePos);
				}
			}

		}	*/





	/* updates after seeking */
	seekUpdate: function() {
		var currenttime = $(this.options.selector).attr('currentTime');
		//$('#debug').append(currenttime+'\n');
		if (!this.seeksliding) {
			this.video_seek.slider('value', currenttime);
		}
		this.timeUpdate();
		
	},

	/* time update */
	timeUpdate: function() {
		this.video_timer.text(this.timeFormat($(this.options.selector).attr('currentTime')) + ' / ' + this.timeFormat($(this.options.selector).attr('duration')));
	},

	/* mute volume */
	muteVolume: function() {
		if (this.muted) {
			this.volume.slider('value', this.video_volume);
			this.volume_btn.removeClass('vi2-volume-mute');
		} else {
			this.volume.slider('value', 0);
			this.volume_btn.addClass('vi2-volume-mute');
		}
		$('video').attr('volume', this.video_volume);
		this.muted = ! this.muted;
	},


	// event handler: on can play
	readyStateHandler: function(e) {
		// notify observer about new video
		vi2.observer.updateVideo(this.seqList[this.seqNum]['id'], this.seqNum);
	},


	// event handler: on can play
	canPlayHandler: function(e) {
		// play_btn playpause.disabled = false;
		//	vi2.observer.updateVideo(_this.seqList[_this.seqNum]['id'], _this.seqNum);
	},


	// event handler: on duration change; trigger when duration is known
	durationChangeHandler: function(e, seek) { //alert('should seek '+e.data.seek)
		this.createSeek();
		//$('#debug').append('seek  '+this.timeFormat(this.video.seekable.start(0))+' - '+this.timeFormat(this.video.seekable.end(0))+'\n');
		if (Number(seek) > 0) { 
			if(this.percentLoaded > (seek / this.duration())){
				this.currentTime(seek); // bugy in production use or on remote sites
			}
		}
		$(vi2.observer).trigger('player.ready', [this.seqList[this.seqNum]['id'], this.seqNum]);
	},


	// event handler: on time update
	timeUpdateHandler: function(e) {
		this.seekUpdate();
			
		//var lastBuffered = this.video.buffered.end(this.video.buffered.length-1);
		if (this.video.readyState == 2) {
			// load spinner
			this.startSpinning();
			//$('#debug').html('loading');
		}else if (this.video.readyState == 4) {
			this.stopSpinning();
			//$('#debug').html('');
		}
/*
		return;
				$('#debug').html(this.video.readyState+' seekabel '+this.video.seekable.end(0)+'    -  start:'+this.video.buffered.start(this.buffclick)+' end: '+this.video.buffered.end(this.buffclick)+'\n');
				if (seek < this.video.seekable.end(this.buffclick) && seek > 0 ) {
						this.currentTime(seek);
				}
				*/
	},


	// event handler: on ended
	endedHandler: function(e) { 
		vi2.observer.ended();
		this.video.removeEventListener('ended', arguments.callee, false);
		this.play_btn.removeClass('vi2-paused-button');
		// load next video clip if its a sequence
		if (this.isSequence && ((this.seqNum + 1) < this.seqList.length || this.seqLoop)) {
			this.seqNum = (this.seqNum + 1) % this.seqList.length;
			this.loadVideo(this.seqList[this.seqNum]['url']);
		}else { 
			$(vi2.observer.player).trigger('video.end', null);
		}
	},






/* UTILS *************************/

	/* formate second to decimal view*/
	timeFormat: function(seconds) {
		d = Number(seconds);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "00:") + (s < 10 ? "0" : "") + s); 
	},
	
	// starts spinner, called if video data is loading
	startSpinning : function(){
		this.spinner.spin(document.getElementById('overlay'));
	},
	
	// stops spinne
	stopSpinning : function(){
		this.spinner.stop();
	},

	/* prints errors */
	errorHandling: function(e) {
	  $('#debug').append('Error - Media Source not supported: ' + this.video.error.code == this.video.error.MEDIA_ERR_SRC_NOT_SUPPORTED); // true
	 	$('#debug').append('Error - Network No Source: ' + this.video.networkState == this.video.NETWORK_NO_SOURCE); // true
	},






	/* INTERFACES *************************/

	/* just play */
	play: function() {
		if ($(this.options.selector).attr('paused') == false) {
			this.video.pause();
			$(this.observer.player).trigger('player.pause');
		} else {
			this.video.play();
			$(this.observer.player).trigger('player.play');
		}
	},

	/* just pause */
	pause: function() {
		this.video.pause();
		$(this.observer.player).bind('player.pause');
	},

	/* returns duration of video */
	duration: function() {
		return $(this.options.selector).attr('duration');
	},

	/* return current playback time or set the time */
	currentTime: function(x) {
		if (x == undefined) {
			return $(this.options.selector).attr('currentTime');
		}else {
			$(this.video).trigger('play');
			//if(this.percentLoaded > ($(this.options.selector).attr('currentTime') / this.duration())){  // xxx bugy
				$(this.options.selector).attr('currentTime', x);
			//}	
		}
	},

	/* sets or returns video width */
	width: function(x) {
		if (x == null) {
			return this.video.width;
		}else {
			this.video.width = x;
		}
	},

	/* sets or return video width */
	height: function(x) {
		if (x == null) {
			return this.video.height;
		}else {
			this.video.height = x;
		}
	},

	/* sets or returns playback rate */
	playbackRate: function(x) {
		if (x == null) {
			return this.video.playbackRate;
		}else {
			this.video.playbackRate = x;
		}
	}

}); // end video class















/*
	playorpause : function() {
		if(this.video.ended || this.video.paused) {
			this.video.play();
		} else {
			this.video.pause();
		}
	},
*/





// Fallback & Media format detection


/*
https://developer.mozilla.org/en/Configuring_servers_for_Ogg_media
#1 determine duration
$ oggz-info /g/media/bruce_vs_ironman.ogv

#2 hard code duration for apache2 in the .htaccess-file of the media folder
<Files "elephant.ogv">
Header set X-Content-Duration "653.791"
</Files>


http://dev.opera.com/articles/view/everything-you-need-to-know-about-html5-video-and-audio/
*/




	/*
	- dirty hack without considering custom events
	- without seeking yet
	- !! such a automatisation is only need if you want to force the user to return to the source video

	loadCycleVideo : function(url, seek, duration, return_seek){

		stop/freez orig. video
		load new video in window/frame
		attach annotation to terminate after time is over
		reload orig. video
		seek to previouse temporal position
		play

		var _this = this;
		this.cycledata = {url: this.main.parseSelector, return_seek: return_seek};

		this.main.vid_arr = []; 		this.main.vid_arr[0] = []; this.main.vid_arr[0]['annotations'] = [];
		this.main.vid_arr[0]['annotations'].push({title:'', target:this.url, linktype:'cycle', type:'xlink', x:0, y:0, t1:seek, t2:duration});
		 $(this).bind('annotation.begin.cycle', function(e, a, b){ _this.begin(e, a, b);});
		 $(this).bind('annotation.end.cycle', function(e, a, b){ _this.end(e, a);});

		//this.main.updateVideo(0,0);

		this.loadVideo(url, seek);
		setTimeout(function(){ $(_this).trigger('annotation.end.cycle'); return '';}, 1000);

	},

		cycledata : {},
	begin : function(e, a, b){},
	end : function(e, a){ this.main.parse(this.cycledata.url, 'html');//loadVideo(this.cycledata.url, this.cycledata.return_seek);
	},


	terminateCycleVideo : function(){
		$(this.options.selector).parent().find('#subvideo').remove();
	},


	*/




















