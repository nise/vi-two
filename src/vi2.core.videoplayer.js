/* 
* name: Vi2.VideoPlayer 
*	author: niels.seidel@nise81.com
* license: BSD New
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:

 - bug: keydown binding vary in different browsers

 - @createVideoHiding: build function to turn of the video screen in order to listen to the audio only.

 - visualize loaded bytes
  - simultanous playback of two clips
 - cache mangement for videos: http://www.misfitgeek.com/2012/10/html5-off-line-storing-and-retrieving-videos-with-indexeddb/
 - refine cycle including event bindings


 - manage to play parts of a video: http://www.xiph.org/oggz/doc/group__seek__api.html
- options: supported codecs / mime types
 - further: API calls: http://code.google.com/apis/youtube/js_api_reference.html
 - media fragment URI ..parser ..:: http://tomayac.com/mediafragments/mediafragments.html

-- ZEITLEISTE in extra Klasse auslagern
Alternative Zeitleiste: http://propublica.github.com/timeline-setter/doc/twitter-demo.html
- cluster / zoom
- diagramm
- filter
- multi tracks
--- Vergleiche Darstellung von sehr vielen Markern bei Google Maps ...



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
		this.spinner = new Spinner(this.spinner_options); //this.stopSpinning();
		this.video = document.getElementById( (this.options.selector).replace(/\#/,'') );  
  	//this.loadVideo( undefined, this.options.seek); // load nil video to build player interface
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
		videoControlsSelector: '', 
		childtheme: '', 
		thumbnail:'/vi-lab/img/placeholder.jpg', 
		skipBackInterval:5
	},
	video: null,
	observer: null,
	url: '',
	video_volume: 0,
  video_container: null,
	video_wrap: null,
	play_btn: $(''),
	video_seek: null,
	video_progress: null,
	video_timer: null,
	volume: null,
	isMuted: false,
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
  	zIndex: 29, // The z-index (defaults to 2000000000)
  	top: 'auto', // Top position relative to parent in px
  	left: 'auto' // Left position relative to parent in px
	},
	buffclick: 0,

	/* load video */
	// param: url= url of video; seek = time seek within video in seconds
	loadVideo: function(url, seek) {   
		var _this = this;
		this.url = url;
	  this.seek = seek == undefined ? 0 : seek;
	  this.video = document.getElementById( ( this.options.selector ).replace(/\#/,'') );
	  this.video.pause();
		this.startSpinning(); 
		vi2.observer.log('loadvideo:'+url); 
		var supportedCodec = this.detectVideoSupport();
		this.video = $.extend(this.video, {
			loop: false,
	  	preload: 'metadata', // 'metadata' | true ??
	  	autoplay: true,
	  	controls: false,
	  	poster: '/vi-lab/img/placeholder.jpg',
	 		// 	width: this.options.width,
	  	//	height: this.options.height,
	  	onerror: function(e) { _this.errorHandling(e); }
		});

		// event binding: on can play
		this.video.addEventListener('readystate', function(e) { 
			_this.readyStateHandler(e); 
		});

		// event binding: on can play
		//this.video.addEventListener('loadedmetadata', function(e) {});

		// event binding: on can play
		this.video.addEventListener('canplay', function(e) {  
			//_this.canPlayHandler(e);
		});

		// event binding: on duration change; trigger when duration is known
		this.video.addEventListener('durationchange', function(e) { 
			//if( $(_this.options.selector).attr('duration') != undefined )  
				_this.currentTime( _this.seek ); 
				_this.durationChangeHandler(e, _this.seek); 	
		});

		// event binding: on time update
		this.video.addEventListener('timeupdate', function(e) { 
			_this.timeUpdateHandler(e); 
			_this.setProgressRail(e);
			//_this.setCurrentRail(e);
		});
		
		// event binding: on ended
		$(this.video).bind('ended', function(e) { 
			_this.endedHandler(e); 
		}, false);


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


	 	// get sources and load video
	 	if( url != undefined){
			$(this.video).html( this.createSource(url, supportedCodec ), this.video.firstChild);
		}
	},


	/* HTML5 playback detection 
	* 	returns: mime type of supported video or empty string if there is no support
	*		called-by: loadVideo()
	* 	toDo: check support for video element
	*/
	detectVideoSupport: function() {
		var dummy_video = document.createElement('video');

		// prefer mp4 over webm over ogv 
		if (dummy_video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') != '') {
			return 'video/mp4'; 		
		}else if (dummy_video.canPlayType('video/webm; codecs="vp8, vorbis"') != '') {
			return 'video/webm'; 
		}else	 if(dummy_video.canPlayType('video/ogg; codecs="theora, vorbis"') != ''){
			return 'video/ogv';
		}else{
			// no suitable video format is avalable
			$('#content').html('<h3>We appologize that video application is currently not supported by your browser.</h3>The provided video material can be played on Mozilla Firefox, Google Chrome and Opera. If you prefer Internet Explorer 9 you need to install a <a href="https://tools.google.com/dlpage/webmmf">webm video extension</a> provided by Google. In the near future we are going to server further video formats which will be supported by all major browsers.<br /><br /> Thank you for your understanding.');
		}
		return '';
	},

	/* load sequence */
	loadSequence: function(sources, num) {  
		this.seqList = sources;
		this.isSequence = true;
		if (num == undefined) {
			this.seqNum = 0;
		}else {
			this.seqNum = num % this.seqList.length;
		} 
		this.loadVideo(this.seqList[this.seqNum]['url'], this.seek);
	},

	/* build video source element
			param: src = video url; mime_type = mime_type of video
			returns: video source element including src and type attribute
	*/
	createSource: function(src, mime_type) {
  	var source = document.createElement('source'); 
  	// extract file type out of mime type
  	source.src = src+"?foo="+(new Date().getTime());//src.replace('.webm', '') + '.' + mime_type.replace('video/', '');
  	//"php/download.php?video="+src.replace('videos/', '').replace('.webm', '.' + mime_type.replace('video/', ''))+'&mime='+mime_type;
  	// set mime type
  	source.type = mime_type;
  	return source;
	},


/* UI ******************************************/


	/** 
	load UI 
	*/
	loadUI: function() { 
		var _this = this;
		this.play_btn = $('.vi2-video-play', this.video_container);
		this.video_seek = $('.vi2-video-seek', this.video_container);
		this.video_progress = $('.vi2-video-progress', this.video_container);
		this.video_timer = $('.vi2-video-timer', this.video_container);
		this.volume = $('.vi2-volume-slider', this.video_container);
		this.volume_btn = $('.vi2-volume-button', this.video_container);

		this.skipBack_btn = $('.vi2-skip-back', this.video_container);


		// keep the native HTML5 controls hidden
		$(this.video).removeAttr('controls');
$(_this.options.videoControlsSelector).addClass("open-controls");
		$("#video1, #overlay").hover(function() {  
		  	$(_this.options.videoControlsSelector).addClass("open-controls");
			}, function() { 
		  	//$(_this.options.videoControlsSelector).removeClass("open-controls");
		});
		//$('#overlay').css('height', $('video').height() );
		//$('#overlay').css('width', $('#video1').width() );

		// load other ui elements
		this.createVolumeControl();
		this.createVideoHiding();
		
		this.skipBack_btn.click(function(){
			_this.skipBack();
		})
		
		// keyboard / space bar for play/pause
	//	$('body-xxx').unbind('keydown').bind('keydown', function(e) { 
			//_this.keyboardCommandHandler(e);  xxx bug
	//	});
		
		this.play_btn.bind('click', function() {  
			_this.play(); 
		});

		$(this.video).bind('play', function(e) {
			_this.play_btn.addClass('vi2-video-pause');
			vi2.observer.play();
			$('.screen').remove();
		});

		$(this.video).bind('pause', function(e) {
			_this.play_btn.removeClass('vi2-video-pause');
			vi2.observer.pause();
		});
		
	},


/************ AUDIO VOLUME ********************/

	/* Creates a volume control element */
	createVolumeControl : function(){
		var _this = this;
		$(this.volume).slider({
				value: _this.video_volume,
				orientation: 'vertical',
				range: 'min',
				max: 1,
				step: 0.05,
				animate: true,
				slide: function(e,ui) { 
					_this.isMuted = false;
					_this.video.volume = ui.value;
					_this.video_volume = parseFloat(ui.value);
				},
				change : function(e,ui){
					_this.isMuted = false;
					_this.video.volume = ui.value;
					_this.video_volume = parseFloat(ui.value);
				}	
		});
		//alert(this.volume)
		$(this.volume).show();
		
		this.volume_btn
			.bind('click', function(e) {
				_this.muteVolume();
			})
	},
	
	/* Increases audio volume by 5 percent */
	increaseVolume : function(){ 
		$(this.volume).slider('value', $(this.volume).slider('value') + 0.05 );
	},
	
	/* Decreases audio volume by 5 percent */
	decreaseVolume : function(){
		$(this.volume).slider('value', $(this.volume).slider('value') - 0.05 );
	},

	tmp_volume : 0,
	/* Mute audio volume */
	muteVolume: function() { 
		if(this.isMuted) {
			this.volume.slider('value', tmp_volume);
			this.volume_btn.removeClass('vi2-volume-mute');
			this.isMuted = false;
		}else {
			tmp_volume = this.video.volume;
			this.volume.slider('value', 0);
			this.volume_btn.addClass('vi2-volume-mute');
			this.isMuted = true;
		}
	},


/*****SEEK ************/

	/* Creates a timeline slider to seek within the playback time */
	createSeekControl: function() {
		var _this = this;
		if (this.video.readyState) {
			clearInterval(this.interval);
			clearInterval(this.interval);

			//var video_duration = _this.video.duration; //$(this.options.selector).attr('duration');
			this.video_seek.slider({
				value: 0,
				step: 0.01,
				orientation: 'horizontal',
				range: 'min',
				max: this.duration(),
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
						_this.video.currentTime = parseFloat(Math.ceil(ui.value)); // XXX bugy / webkit fix
						//_this.video.currentTime = ui.value;
					//}else{
					 //alert(33); // bugy xxx
					//}	
				}
			});
		} else {
			// try reinitiate the slider as long the
			this.interval = setInterval(function() { _this.createSeekControl(); }, 150);
		}
		$(vi2.observer.player).bind('player.play', function(e, a, b) { 
  			$('.navbar').hide();
  	});
  	
  	$(vi2.observer.player).bind('player.pause', function(e, a, b) { 
  			$('.navbar').show();
  	});
	},

	/* updates after seeking */
	seekUpdate: function() {
		//var currenttime = this.video.currentTime;//$(this.options.selector).attr('currentTime');
		//$('#debug').append(currenttime+'\n');
		if (!this.seeksliding) {
			this.video_seek.slider('value', this.currentTime() );
		}
		this.timeUpdate();
		
	},
	
	
	
	/* Creates controle element to hide/show the video frame 
	*	todo: this should be accomplished with a audio description and other accessibility assistance
	*/
	createVideoHiding: function(){
		
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
			$('#screen').find('.toggle-pair').toggle().hide();
			$('.toggle-moving-picture').hide();
		
	},
	
	/* Adds some meta data to the page header in order support SEO */


/********* LOADING Indicator *********************************/

	/* Starts the loading indicator in terms of a spinner. Function is called if video data is loading */
	startSpinning : function(){
		this.spinner.spin(document.getElementById('overlay'));
		$('.spinner').css('top','200px'); // xxx hardcoded repositioning of spinner element
	},

	/* Stops the loading indicator */
	stopSpinning : function(){
		this.spinner.stop();
	},



/* EVENT HANDLER *************************/


	/* time update */
	timeUpdate: function() { 
		this.video_timer.text( vi2.utils.seconds2decimal( this.video.currentTime ) + ' / ' + vi2.utils.seconds2decimal( this.video.duration ));
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
		this.createSeekControl();
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
			
			//vi2.observer.log('videoruns:'+this.url+' '+this.currentTime());
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
		vi2.observer.log('videoended:'+this.url);
		vi2.observer.ended();
		this.video.removeEventListener('ended', arguments.callee, false);
		this.play_btn.removeClass('vi2-video-pause');
		// load next video clip if its a sequence
		if (this.isSequence && ((this.seqNum + 1) < this.seqList.length || this.seqLoop)) {
			this.seqNum = (this.seqNum + 1) % this.seqList.length;
			this.loadVideo(this.seqList[this.seqNum]['url']);
		}else { 
			$(vi2.observer.player).trigger('video.end', null);
		}
	},
	
	
	/* Handles certain keyboad commends */
	keyboardCommandHandler : function(e){	
		
		//alert(e.which)
		//if ( _this.video.paused == false) { 
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
				vi2.observer.widget_list['toc'].nextElement();
				break;
			case 37: // 37:left		
				vi2.observer.widget_list['toc'].previousElement();
				break;
			case 34: // 39: right  presenter
				vi2.observer.player.play();
				//vi2.observer.widget_list['toc'].nextElement();
				break;
			case 33: // 37:left		presenter
				vi2.observer.widget_list['toc'].previousElement();
				break;	
		}
		this.video.focus(); // yyy
		//}	
	},


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











	/* INTERFACES *************************/

	/* just play */
	play: function() {   
		if ( this.video.paused == false) { 
			this.video.pause(); 
			$(vi2.observer.player).trigger('player.pause', []);
			vi2.observer.log('videopaused:'+this.url);
			
		} else {  
			this.video.play(); 
			$(vi2.observer.player).trigger('player.play', []);
			vi2.observer.log('videoplayed:'+this.url);
		}
	},

	/* just pause */
	pause: function() {
		this.video.pause();
		$(vi2.observer.player).bind('player.pause');
	},
		
	/* skips back for a short time frame */
	skipBack : function(){
		this.currentTime( this.currentTime() - this.options.skipBackInterval );
	},

	/* returns duration of video */
	duration: function() {   
		return this.video.duration; //$(this.options.selector).attr('duration');
	},

	/* return current playback time or set the time */
	currentTime: function(x) { 
		if (x == undefined) {
			return this.video.currentTime; //$(this.options.selector).attr('currentTime');
		}else { 
			$(this.video).trigger('play');
			//if(this.percentLoaded > ($(this.options.selector).attr('currentTime') / this.duration())){  // xxx bugy
				this.video.currentTime = x;
			//}	
		}
	},

	/* sets or returns video width */
	width: function(x) {
		if (x == null) {
			return $('#video1').width();
		}else {
			this.video.width = x;
		}
	},

	/* sets or return video width */
	height: function(x) {
		if (x == null) {
			return $('#video1').height();
		}else {
			this.video.height = x;
		}
	},
	

	/* prints errors */
	errorHandling: function(e) {
//		console.log('Error - Media Source not supported: ' + this.video.error.code == this.video.error.MEDIA_ERR_SRC_NOT_SUPPORTED); // true
//	 	console.log('Error - Network No Source: ' + this.video.networkState == this.video.NETWORK_NO_SOURCE); // true
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




















