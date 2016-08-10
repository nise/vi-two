/* 
* name: Vi2.VideoPlayer 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 - variablen aufräumen
 - bug: keydown binding vary in different browsers
 -- onliest fix: https://github.com/google/closure-library/blob/master/closure/goog/events/keyhandler.js
 
 - add getter and setter for quality, playback status, video information, next, previous, playback rate

 - @createVideoHiding: build function to turn of the video screen in order to listen to the audio only.
	- YOuTube http://coding-everyday.blogspot.de/2013/03/how-to-grab-youtube-playback-video-files.html
 - visualize loaded bytes
  - simultanous playback of two clips
 - cache mangement for videos: http://www.misfitgeek.com/2012/10/html5-off-line-storing-and-retrieving-videos-with-indexeddb/
 - refine cycle including event bindings


 - manage to play parts of a video: http://www.xiph.org/oggz/doc/group__seek__api.html
- options: supported codecs / mime types
 - further: API calls: http://code.google.com/apis/youtube/js_api_reference.html
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


https://developer.mozilla.org/en/Configuring_servers_for_Ogg_media
#1 determine duration
$ oggz-info /g/media/bruce_vs_ironman.ogv

#2 hard code duration for apache2 in the .htaccess-file of the media folder
<Files "elephant.ogv">
Header set X-Content-Duration "653.791"
</Files>


http://dev.opera.com/articles/view/everything-you-need-to-know-about-html5-video-and-audio/
*/



var Video = $.inherit(/** @lends VideoPlayer# */
{
	/** 
	* 	@constructs 
	*		@param {object} options An object containing the parameters
	*		@param {Observer} observer Observer of VI-TWO
	*/
  __constructor: function(options) { 
		this.options = $.extend(this.options, options); 
		// init spinner
		this.spinner = new Spinner(this.spinner_options); //this.stopSpinning();
		this.video = document.getElementById( (this.options.selector).replace(/\#/,'') );  
  	this.loadUI();
  },

	name: 'video player',
	// defaults
	options: {
		observer: null, 
		selector: '#video1', 
		width: 500, 
		height: 375, 
		seek:0, 
		videoControlsSelector: '.video-controls', 
		thumbnail:'/static/img/placeholder.jpg', 
		defaultVolume : 1 // 0..1
	},
	video: null,
	timeline : null,
	observer: null,
	url: '',

	/* selectors */
  video_container: null,
	video_wrap: null,
	play_btn: null,
	volume_btn: null,
	
	/* flags */
	volume: null,
	isMuted: false,
	isSequence: false,
	seqList: [],
	seqNum: null,
	seqLoop: false,
	videoIsPlaying: true,
	percentLoaded: 0,
	buffclick: 0,
	
	/* spinner options */
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
  	zIndex: 29, // The z-index (defaults to 2000000000)
  	top: 'auto', // Top position relative to parent in px
  	left: 'auto' // Left position relative to parent in px
	},
	

	/* load video */
	// param: url= url of video; seek = time seek within video in seconds
	loadVideo: function(url, seek) {   
		var _this = this;
		this.url = url;
	  this.seek = seek === undefined ? 0 : seek;
	  
	  var videoo = $('<video></video>')
				.attr('controls', false)
				.attr('autobuffer', true)
				.attr('preload', "metadata")
				.attr('id', 'video1')
				.addClass('embed-responsive-item col-md-12')
				.text('Your Browser does not support either this video format or videos at all');
		$('#seq')
			.addClass('embed-responsive embed-responsive-16by9')
			.html(videoo); 
	  this.video = document.getElementById( ( this.options.selector ).replace(/\#/,'') );
	 
	  if(this.videoIsPlaying){
	  		$(vi2.observer.player).trigger('player.play', []);
	  }
	  this.video.pause();
		this.startSpinning(); 
		
		var supportedCodec = this.detectVideoSupport();
		this.video = $.extend( this.video, {
			loop: false,
	  	preload: 'metadata', // 'metadata' | true ??
	  	autoplay: this.videoIsPlaying,
	  	controls: false,
	  	poster: '/static/img/stills/'+this.options.thumbnail,
	 		 //	width: this.options.width,
	  	//	height: this.options.height,
	  	onerror: function(e) { _this.errorHandling(e); }
		});
		
		// add timeline
		this.timeline = new Vi2.AnnotatedTimeline( this.video, {}, this.seek );
		
		// add playback logger
		this.logger();
		
		var playbackSpeed = new Vi2.PlaybackSpeed();
		vi2.observer.addWidget( playbackSpeed );  
		
		//var temporalBookmarks = new Vi2.TemporalBookmarks();
		//vi2.observer.addWidget( temporalBookmarks );
		
		//var zoom = new Vi2.Zoom();
		//vi2.observer.addWidget( zoom );	
		
		var skipBack = new Vi2.SkipBack();
		vi2.observer.addWidget( skipBack );
		
		//var sharing = new Vi2.Sharing();
		//vi2.observer.addWidget( sharing ); // http://localhost/elearning/vi2/vi-two/examples/iwrm/videos/iwrm_seidel1.webm
		
		this.play_btn = $('.vi2-video-play-pause');
		
		this.video.addEventListener('play', function(e){ 
			vi2.observer.clock.startClock();
			//$('header').hide();
			_this.play_btn.find('.glyphicon-pause').show();
			_this.play_btn.find('.glyphicon-play').hide();
		});
		
		this.video.addEventListener('pause', function(e){ 
			vi2.observer.clock.stopClock();
			$('header').show();
			_this.play_btn.find('.glyphicon-pause').hide();
			_this.play_btn.find('.glyphicon-play').show();
		});
		
		this.video.addEventListener('abort', function(e){  
			vi2.observer.clock.stopClock();
			$('header').show();
			_this.play_btn.find('.glyphicon-pause').hide();
			_this.play_btn.find('.glyphicon-play').show();
		});

		// event binding: on can play
		this.video.addEventListener('readystate', function(e) { 
			_this.readyStateHandler(e); 
		});

		// event binding: on time update
		this.video.addEventListener('timeupdate', function(e) { 
			_this.timeUpdateHandler(e); 
		});
		
		// event binding: on ended
		this.video.addEventListener('ended', function(e) { 
			_this.endedHandler(e); 
		}, false);

		
	// trigger event that a new video stream has been loaded
			var t = new Date();
			$(vi2.observer).trigger('stream.loaded', { 
				stream: vi2.observer.current_stream,//params['stream'], 
				playback_time: seek,//params['time'], 
				time: t.getTime()
			} );	

 	// get sources and load video
	 	if( url !== undefined){
			$( this.video ).html( this.createSource(url, supportedCodec ), this.video.firstChild);	 
		}
	 
	},


	/* HTML5 playback detection 
	* 	returns: mime type of supported video or empty string if there is no support
	*		called-by: loadVideo()
	* 	toDo: check support for video element
	**/
	detectVideoSupport: function() {
		var dummy_video = document.createElement('video');

		// prefer mp4 over webm over ogv 
		if (dummy_video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== '') {
			vi2.observer.log({context:'player',action:'video-support-mp4', values:['1'] });
			return 'video/mp4'; 		
		}else if (dummy_video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '') {
			vi2.observer.log({context:'player',action:'video-support-webm', values:['1'] });
			return 'video/webm'; 
		}else	 if(dummy_video.canPlayType('video/ogg; codecs="theora, vorbis"') !== ''){
			vi2.observer.log({context:'player',action:'video-support-ogv', values:['1'] });
			return 'video/ogv';
		}else{
			// no suitable video format is avalable
			vi2.observer.log({context:'player',action:'video-support-none', values:['1'] }); 
			$('#page').html('<h3>We appologize that video application is currently not supported by your browser.</h3>The provided video material can be played on Mozilla Firefox, Google Chrome and Opera. If you prefer Internet Explorer 9 you need to install a <a href="https://tools.google.com/dlpage/webmmf">webm video extension</a> provided by Google. In the near future we are going to server further video formats which will be supported by all major browsers.<br /><br /> Thank you for your understanding.');
		}
		return '';
	},
	
	
	detectBrowser : function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M[0];//.join(' ');
	},

	/* load sequence */
	loadSequence: function(sources, num, seek) {  
		this.seqList = sources;
		this.seek = seek;
		this.isSequence = true;
		if (num === undefined) {
			this.seqNum = 0;
		}else {
			this.seqNum = num;// % this.seqList.length;
		} 
		this.loadVideo(this.seqList[this.seqNum].url, this.seek);
	},


	/** 
	* build video source element
	* @param src = video url; mime_type = mime_type of video
	*	@returns: video source element including src and type attribute
	*/
	createSource: function(src, mime_type) { 
  	var
  		ext, 
  		source = document.createElement('source'); 
  	if( this.detectBrowser() === 'Firefox'){
  		ext = '.mp4';
  		mime_type = "video/mp4";
  	}else if( this.detectBrowser() === 'Chrome'){
  		ext = '.webm';
  		mime_type = "video/webm";
  	}
  	
  	// extract file type out of mime type
  	source.src = src.replace('.mp4', ext)+"?foo="+(new Date().getTime());//
  	// set mime type
  	source.type = mime_type;
  	return source;
	},



	/** 
	* load UI 
	**/
	loadUI: function() { 
		var _this = this;
		// load other ui elements
		this.createPlaybackControl();
		this.createVolumeControl();
		this.createVideoHiding();
		
		// show/hide video controls
		$(_this.options.videoControlsSelector).addClass("open-controls");
		/*$("#overlay, #seq, #video1 #video-controls #accordion-resizer").hover(
			function() {  
		  	$(_this.options.videoControlsSelector).addClass("open-controls");
			}, 
			function() { 
		  	$(_this.options.videoControlsSelector).removeClass("open-controls");
			}
		);*/
		// ??
		//$('#overlay').css('height', $('video').height() );
		//$('#overlay').css('width', $('#video1').width() );
		
	
		// hide cursor and controls if inactive
		var mouseTimer = null, cursorVisible = true;

		function disappearCursor() {
		    mouseTimer = null; 
		    document.body.style.cursor = "none";
		    cursorVisible = false;
		    $(_this.options.videoControlsSelector).removeClass("open-controls");
		}
		var el = document.getElementById('video1');
		document.onmousemove = function() {
		    if (mouseTimer) {
		        window.clearTimeout(mouseTimer);
		    }
		    if (!cursorVisible) {
		        document.body.style.cursor = "default";
		        cursorVisible = true;
		        $(_this.options.videoControlsSelector).addClass("open-controls");
		    }
		    mouseTimer = window.setTimeout(disappearCursor, 1000);
		};
		
		$('body').unbind('keydown').bind('keydown', function(e) { 
			//_this.keyboardCommandHandler(e); 
		});
		
	},
	
	/**
	* Creates video playback control
	*/
	createPlaybackControl : function(){
		var _this = this;
		
		this.play_btn = $('.vi2-video-play-pause');
		
		
		this.play_btn.bind('click', function() {
			_this.play(); 
		});

		$(this.play_btn).bind('play', function(e) {  
			vi2.observer.play();
			$('.screen').remove();
		});

		$(this.play_btn).bind('pause', function(e) { 
			vi2.observer.pause();
		});
		
		$(vi2.observer.player).bind('player.play', function(e, a, b) { 
  			//$('.navbar').hide();
  	});
  	
  	$(vi2.observer.player).bind('player.pause', function(e, a, b) { 
  			//$('.navbar').show();	
  	});
  	
	},


	/** 
	* Creates a volume control element 
	*/
	createVolumeControl : function(){ 
		var _this = this;
		// intit controls
		this.volume = $('.vi2-volume-slider', this.video_container);
		this.volume_btn = $('.vi2-volume-button', this.video_container);
		// init slider
		$(this.volume).slider({
				orientation: 'horizontal',
				range: 'min',
				max: 1,
				step: 0.05,
				animate: false,
				value : _this.options.defaultVolume,
				slide: function(e,ui) { 
					if(ui.value > 0 && ui.value < 0.5 ){ 
						_this.isMuted = false;
						_this.volume_btn.addClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
					}else if( ui.value >= 0.5 ){
						_this.isMuted = false;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.addClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
						
					}else{
						_this.isMuted = true;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.addClass('glyphicon-volume-off');
					}
					//_this.video_volume = parseFloat(ui.value);
				},
				change : function(e,ui){
					// set video volume
					_this.video.volume = ui.value;
					// button states
					if(ui.value > 0 && ui.value < 0.5 ){ 
						_this.isMuted = false;
						_this.volume_btn.addClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
					}else if( ui.value >= 0.5 ){
						_this.isMuted = false;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.addClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
						
					}else{
						_this.isMuted = true;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.addClass('glyphicon-volume-off');
					}
					//_this.video_volume = parseFloat(ui.value);
				}	
		});
		
		this.volume_btn
			.bind('click', function(e) { 
				_this.muteVolume();
			})
			;
			
		if( this.volume.slider('value') === 0 ){
			this.isMuted = true;
			this.volume_btn.addClass('glyphicon glyphicon-volume-off');
		}else{
			this.volume_btn.addClass('glyphicon glyphicon-volume-up');
		}
		
		// set initial volume
		// xxx does not work
			
	},
	
	/**
	* Get volume
	*/
	getVolume : function(){
		return this.volume.slider('value');//this.video_volume;
	},
	
	
	/**
	* Set volume
	* @param volume {Number} Number in the range of 0 and 1. Every value outside that rang will be changed to the boundaries. 
	*/
	setVolume : function(volume){
		vi2.observer.log({context:'player',action:'set-volume', values:[volume] }); 
		this.volume.slider('value', volume);
	},
	
	
	/** 
	* Increases audio volume by 5 percent 
	*/
	increaseVolume : function(){ 
		$(this.volume).slider('value', $(this.volume).slider('value') + 0.05 );
	},
	
	
	/** 
	* Decreases audio volume by 5 percent 
	*/
	decreaseVolume : function(){
		$(this.volume).slider('value', $(this.volume).slider('value') - 0.05 );
	},


	tmp_volume : 0,
	/** 
	* Toggles the button to mute/unmute the volume. If volume get unmuted the volume will be reset to the value it had befor muting.
	*/
	muteVolume: function() { 
		if( ! this.isMuted) {
			tmp_volume = this.volume.slider('value');
			this.setVolume(0);
			this.isMuted = true;
		}else {
			this.setVolume( tmp_volume );
			this.isMuted = false;
		}
	},



	
	
	
	
	/* Creates controle element to hide/show the video frame 
	*	xxx todo: this should be accomplished with a audio description and other accessibility assistance
	*/
	createVideoHiding: function(){		return;
		
		// hide moving picture in order limit visual cognition channel to one
		// xxx: #screen should be replaced by an option
		var o = new Image(); 
		$(o).attr('src', '/static/img/stills/'+this.options.thumbnail).addClass('toggle-pair').prependTo('#screen').hide();
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
			$('#screen').find('.toggle-pair').toggle().hide();
			$('.toggle-moving-picture').hide();
		
	},
	

/********* LOADING Indicator *********************************/

	/* 
	* Starts the loading indicator in terms of a spinner. Function is called if video data is loading 
	**/
	startSpinning : function(){
		this.spinner.spin(document.getElementById('overlay'));
		$('.spinner').css('top','200px'); // xxx hardcoded repositioning of spinner element
	},

	/* 
	* Stops the loading indicator 
	**/
	stopSpinning : function(){
		this.spinner.stop(); 
	},



/* EVENT HANDLER *************************/


	

	/** 
	* event handler: on can play. Notifies the observer about a new video.
	*/
	readyStateHandler: function(e) {
		vi2.observer.updateVideo(this.seqList[this.seqNum].id, this.seqNum);
	},


	/* 
	* event handler: on time update
	**/
	timeUpdateHandler: function(e) {
		if ( this.video.readyState === 2 ) {
			this.startSpinning(); 
		}else if ( this.video.readyState === 4 ) {
			this.stopSpinning();
		}
	},


	/*
	* event handler: on ended
	**/
	endedHandler: function(e) { 
		vi2.observer.log({context:'player',action:'video-ended', values:[ this.url ]});
		vi2.observer.ended();
		this.video.removeEventListener('ended', arguments.callee, false);
		//this.play_btn.removeClass('vi2-video-pause');
		//this.play_btn.addClass('vi2-video-play');
		// load next video clip if its a sequence
		if (this.isSequence && ((this.seqNum + 1) < this.seqList.length || this.seqLoop)) {
			this.seqNum = (this.seqNum + 1) % this.seqList.length;
			this.loadVideo(this.seqList[this.seqNum].url);
		}else { 
			$(vi2.observer.player).trigger('video.end', null);
		}
	},
	
	
	/* 
	* Handles certain keyboad commends 
	**/
	keyboardCommandHandler : function(e){	
		
		e.preventDefault();
		this.video.focus();
		switch (e.which) {
			case 32: // space 
				this.play(); //
				break;
			case 189: // minus 173  oder 189
				vi2.observer.getWidget('playbackSpeed').decreaseSpeed();
				break;
			case 187: // plus 171 oder 187
				vi2.observer.getWidget('playbackSpeed').increaseSpeed();
				break;
			case 	38: // arrow up
				this.increaseVolume(); // volume control
				break;
			case 40: // arrow down
				this.decreaseVolume(); // volume control
				break;
			case 77: // m 
				this.muteVolume();// volume mute	
				break;
			case 39: // 39: right 
				vi2.observer.widget_list.toc.nextElement();
				break;
			case 37: // 37:left		
				vi2.observer.widget_list.toc.previousElement();
				break;
			case 34: // 39: right  presenter
				vi2.observer.player.play();
				//vi2.observer.widget_list.toc.nextElement();
				break;
			case 33: // 37:left		presenter
				vi2.observer.widget_list.toc.previousElement();
				break;	
		}
		this.video.focus(); 
	},



	/* INTERFACES *************************/

	/* just play */
	play: function() {   
		if ( this.video.paused === false) { 
			this.video.pause(); 
			this.isPlaying(false);
			$(vi2.observer.player).trigger('player.pause', []);
			vi2.observer.clock.stopClock();
			vi2.observer.log({context:'player',action:'pause-click', values:['1'] }); 
		} else {  
			this.video.play(); 
			this.isPlaying(true);
			$(vi2.observer.player).trigger('player.play', []);
			vi2.observer.clock.startClock();
			vi2.observer.log({context:'player',action:'play-click', values:['1'] }); 
		}
	},

	/* just pause */
	pause: function() {
		this.video.pause();
		this.isPlaying(false);
		$(vi2.observer.player).bind('player.pause');
		vi2.observer.log({context:'player',action:'pause2-click', values:['1'] }); 
	},
	
	/*
	**/
	isPlaying : function(x){
		if( x === undefined){
			return this.videoIsPlaying;
		}else{
			this.videoIsPlaying = x;
		}
	},

	/* returns duration of video */
	duration: function() {   
		return this.video.duration; //$(this.options.selector).attr('duration');
	},

	/* return current playback time or set the time */
	currentTime: function(x) { 
		if (x === undefined) {
			return this.video.currentTime; //$(this.options.selector).attr('currentTime');
		}else { 
			$(this.video).trigger('play');
			this.video.currentTime = x;
			this.play();
			
		}
	},

	/* sets or returns video width */
	width: function(x) {
		if (x === null) {
			return $('#video1').width();
		}else {
			this.video.width = x;
		}
	},

	/* sets or return video width */
	height: function(x) {
		if (x === null) {
			return $('#video1').height();
		}else {
			this.video.height = x;
		}
	},
	

	/* prints errors */
	errorHandling: function(e) { 
//		console.log('Error - Media Source not supported: ' + this.video.error.code == this.video.error.MEDIA_ERR_SRC_NOT_SUPPORTED); // true
//	 	console.log('Error - Network No Source: ' + this.video.networkState == this.video.NETWORK_NO_SOURCE); // true
	},
	
	
	/*
	* Logger
	**/
	logger : function(){
		var
			_this = this,
			interval = 5,
			lastposition = -1, 
    	timer
    	;
    	
		function loop() {
        var currentinterval;
        currentinterval = (Math.round( _this.currentTime() ) / interval) >> 0;
        //console.log("i:" + currentinterval + ", p:" + player.getPosition());
        if (currentinterval != lastposition) { 
            vi2.observer.log({context:'player', action:'playback', values:[ currentinterval ]});
            lastposition = currentinterval;
        }
    }

    function start() { 
        if (timer) {
            timer = clearInterval(timer);
        }
        timer = setInterval(loop, interval * 1000);
        setTimeout(loop, 100);
    }

    function restart() {
        if (timer) {
            timer = clearInterval(timer);
        }
        lasttime = -1;
        timer = setInterval(loop, interval * 1000);
        setTimeout(loop, 100);
    }

    function stop() {
        timer = clearInterval(timer);
        loop();
    }
/*
    player.oncanplay(start);
   	 player.onSeek(restart);
    player.onPause(stop);
    	player.onBuffer(stop);
    player.onIdle(stop);
    player.onComplete(stop);
    	player.onError(stop);
  */  
    this.video.addEventListener('play', function(e){ 
			start();	
		});
		
		this.video.addEventListener('pause', function(e){ 
			stop();
		});
		
		this.video.addEventListener('abort', function(e){  
			stop();
		});

		this.video.addEventListener('timeupdate', function(e) { 
							
		});
		
		this.video.addEventListener('ended', function(e) { 
			stop();
		}, false);
    
	}
	
	
}); // end video class


