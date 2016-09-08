/* 
* name: Vi2.ClosedCaptions 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: displays captions in a layer on top of the video
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	- srt files, font size, multi language, colored text, bg-contrast
* - for tests: file:///C:/Users/Dmitry/Desktop/vi-two/examples/hello-world/index.html#!/video/seidel2
*/


Vi2.ClosedCaptions = $.inherit( Vi2.Annotation, /** @lends Vi2.SyncMedia# */{

  /** @constructs 
  *		@extends Annotation
  *		@param {object} options An object containing the parameters
  */
  __constructor : function (options) {
      this.options = $.extend(this.options, options);
  },

  /* class variables */
  name : 'closedCaptions',
  type : 'annotation',
  // defaults
  options : {
    selector: '.closedCaption',
    hasTimelineMarker: true,
    controls: true,
    timelineSelector: 'div.vi2-video-seek',
    hasMenu: true,
    displaySubtitles: true,
    displayTranscript: true,
    menuSelector: '.transcript',
    tracks: []
  },
  cueList: [],
  selectedLanguage: 'en',

  
  /* Initialize */
  init : function (ann) {
    var 
    	_this = this,
    	db_tracks = vi2.db.getClosedCaptionsById( vi2.observer.current_stream );
    	;
    
    if( this.options.tracks.length === 0 && db_tracks !== undefined ){
    	this.options.tracks = db_tracks ;
    }

    if (this.options.displaySubtitles) {
      this.displaySubtitles();
    }
    
    if ( _this.options.hasMenu ) { // xxx check conditions
      this.builtTrackLanguageSelectMenu();
    }
		
		this.selectedLanguage = _this.options.tracks[ 0 ].srclang; // select the first language as default
    
    vi2.observer.player.video.addEventListener('loadedmetadata', function (e) {   
      for (var x = 0; x < _this.options.tracks.length; x++) { 
        var track = document.createElement('track');
        track.kind = _this.options.tracks[x].kind;
        track.label = _this.options.tracks[x].label;
        track.srclang = _this.options.tracks[x].srclang;
        track.src = _this.options.tracks[x].src; // xxx convert JSON to vtt-file
        this.appendChild(track);
      }
			if( _this.options.displayTranscript ){
      	_this.displayTranscript();
      }
    });
  },
  
  
  /*
   *
   **/
  builtTrackLanguageSelectMenu(){
		var closedCaptionsButton = document.createElement('div');
		    
    closedCaptionsButton.innerHTML += 'CC';
    closedCaptionsButton.classList.add('vi2-caption-controls');
    document.querySelector('.control-bar').appendChild(closedCaptionsButton);

    closedCaptionsButton.addEventListener('mouseenter', function () {
      document.querySelector('.vi2-caption-controls > ul').style.display = 'block';//classList.add('display-block');
    });

    closedCaptionsButton.addEventListener('mouseleave', function () {
      document.querySelector('.vi2-caption-controls > ul').style.display = 'none';//.classList.add('display-none');
    });

    var trackLanguageOptions = document.createElement('ul');
    closedCaptionsButton.appendChild(trackLanguageOptions);

    for (var y = 0; y < (_this.options.tracks.length + 1); y++) {
      var languageOption = document.createElement('li');
      trackLanguageOptions.appendChild(languageOption);

      if (y < _this.options.tracks.length) {
        languageOption.innerHTML += _this.options.tracks[y].label;
        languageOption.classList.add(_this.options.tracks[y].srclang);
      } else if (languageOption.innerHTML.length === 0) {
        languageOption.innerHTML += 'Off';
        languageOption.classList.add('off');
      }

      languageOption.addEventListener('click', function () { 
      	document.querySelector('.vi2-caption-controls > ul').style.display = 'none';
        _this.setCurrentLanguage(this.className);
      });
    }
  }, 


	/*
	 * 
	 **/
  displayTranscript : function () {
    // accessing tag mit class="transcript"
    var video = vi2.observer.player.video;
    var transcript = document.querySelector(this.options.menuSelector);
    var trackElements = video.querySelectorAll('track');
    var _this = this;

    // for each track element
    for (var i = 0; i < trackElements.length; i++) { 
      // it is to hide all DEFAULT subtitles; it is used HTMLTrackElement, because it works better in Firefox
      trackElements[i].track.mode = 'hidden';

      trackElements[i].addEventListener('load', function() { 
        // "this" is an HTMLTrackElement, NOT a TextTrack object; HTMLTrackElement is used, because it works better in Firefox
        var textTrack = this.track;

        if (textTrack.kind === 'subtitles' || textTrack.kind === 'captions') {
          _this.cueList = textTrack.cues;
          var transcriptText = '';
          // console.log(_this.cueList);

          for (var i = 0; i < _this.cueList.length; i++) {

            if (_this.isJson(_this.cueList[i].text)) {
              transcriptText += ('<div id="' + (i+1) + '" class="transcript-cue">' + JSON.parse(_this.cueList[i].text).description + '</div>' + ' ');
            } else if (_this.cueList[i].text[0] === '{' && _this.cueList[i].text[_this.cueList[i].text.length - 1] === '}') {
              transcriptText += ('<div id="' + (i+1) + '" class="transcript-cue">' + 'No Subtitle' + '</div>' + ' ');
            } else {
              transcriptText += ('<div id="' + (i+1) + '" class="transcript-cue">' + _this.cueList[i].text + '</div>' + ' ');
            }
          }

          if (transcriptText) {
            transcript.innerHTML = transcriptText;
          }

          transcript.addEventListener('click', function () {
            var transcript = this;

            _this.clickOnCueHandler(video, transcript, cueList)
          }, false);

          // call the begin method; "begin" is a timeupdate handler
          _this.begin(video, transcript, cueList);
        } else {
          // do NOT delete console.log
          console.log('If you want to see the transcript on the page, ' +
            'then change attribute kind like so: <track kind="subtitles"> or <track kind="captions">')
        }
      });
    }
  },
  
  
  /*
   * Handles click events on certain cue elements
   **/
  clickOnCueHandler : function (videoElement, transcriptElement, allCues) {
    var elementHover = transcriptElement.querySelector(':hover');
    console.log(this.cueList);
    for (var i = 0; i < allCues.length; i++) {

      // xxx all id-s in the source file of subtitles should be from 1 to ... in the ascending order
      // so it is NECESSARY to organize subtitles in the source file with the right id-s
      // this is NOT the best limitation
      // THINK how to override it
      // TELL Niels

      if (elementHover.id === allCues[i].id) {
        vi2.observer.player.currentTime( allCues[i].startTime );
      }
    }
  },

  
  /*
   * xxx
   **/
  setCurrentLanguage : function (language) {
    // var trackList = this.video.querySelectorAll('track');
    // console.log(trackList);

    // setCurrentSpeed : function(speed){
    //   if( this.options.speed_steps.indexOf( parseFloat(speed) ) !== -1){
    //     // log event
    //     vi2.observer.log({context:'playbackSpeed', action:'change-speed', values:[this.speed, speed]});
    //     // set speed
    //     this.video.defaultPlaybackRate = 1.0;
    //     this.video.playbackRate = speed;
    //     this.speed = speed;
    //     this.speedIndex = this.options.speed_steps.indexOf( parseFloat(speed) );
    //     // set label
    //     $('.speed-label').text( speed + 'x');
    //     // close select menu
    //     $('.vi2-speed-controls > ul').css('display','none');
    //   }
    // },
  },
  
  
  /*
   **/
  isJson : function (str) {
    try {
      JSON.parse(str);
    } catch (err) {
      return false;
    }

    return true;
  },
  
  
  /*
   * xxx
   **/
  displaySubtitles : function () {
    var video = vi2.observer.player.video;
    var trackElements = video.querySelectorAll('track');

    for (var j = 0; j < trackElements.length; j++) {
      trackElements[j].track.mode = 'hidden';

      trackElements[j].onclick = function () {

        console.log(trackElements[j]);

        trackElements[j].track.mode = 'showing';
      };
    }
  },
  

  /*
   * Converts subtitle formats like SubRip, W3C WEBVVT, W3C TTML into the internal representation
   * todo: optain data form subtitle files & convert to the following format:
   * output: <div type="closedCaptions" starttime=1344 duration="165"></div>
   **/
  appendToDOM : function (id){
    //**** usually any annotations need to be converted into the internal represetation of code. Therefore, it is necessary to append these contents to the dom structure first. The parser of the core components then will take care of everthing
    $(vi2.dom).find('[type="closedCaptions"]').each(function(i,val){ $(this).remove(); });
    $.each(	vi2.db.getClosedCaptionsById(id), function(i, val){  //alert(JSON.stringify(val))
      var slides = $('<div></div>')
      .attr('type',"closedCaptions")
      .attr('starttime', val.startTime )
      .attr('duration', val.duration ) //**** you need to calculate the duration
      .attr('id', val.id)
      .text(this.tagname ) //**** dedicated for the content of the caption
      //**** feel free to add other necessary elements
      .appendTo( vi2.dom );
    });

  },


  /* 
   * Append caption content to _this.options.selector
   **/
  begin : function (videoElement, transcriptElement, allCues) {
    //**** event handler for displaying a caption or highlighting a cue inside the transcript text
    var currentTime = vi2.observer.player.currentTime();

    for (var i = 0; i < allCues.length; i++) {
      if (currentTime >= allCues[i].startTime && currentTime <= allCues[i].endTime) {
        transcriptElement.children[i].classList.add('current-cue');
      }
    }
  },

 
  /*
   * Remove caption content from _this.options.selector
   **/
  end : function (e, id) {
    // xxx
    transcriptElement.children[i].classList.remove('current-cue');
  }
  	
	}); // end class 
