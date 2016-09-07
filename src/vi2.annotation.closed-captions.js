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
    displaySubtitles: false,
    menuSelector: '.transcript',
    tracks: []
  },
  cueList: [],
  selectedLanguage: 'en',

  // for tests: file:///C:/Users/Dmitry/Desktop/vi-two/examples/hello-world/index.html#!/video/seidel2
  /* Initialize */
  init : function (ann) {
    //**** write the code to add the track element to the video
    // 1. add track element video
    var video = vi2.observer.player.video;
    var _this = this;
    var controlBar = document.querySelector('.control-bar');
    // receipt of all tracks from the _this.options.tracks
    var trackList = _this.options.tracks;
    // receipt of closed captions from the json file directly
    var jsonClosedCaptions = vi2.db.getClosedCaptionsById(vi2.observer.current_stream);

    // ========================== displaySubtitles NOT tested ===================================
    if (this.options.displaySubtitles) {
      this.displaySubtitles();
    }
    // ========================== displaySubtitles NOT tested ===================================


    // ========================== done only for track elements ===================================
    video.addEventListener('loadedmetadata', function () {
      if (trackList.length > 0) {
        // addition of all track elements to the video for different languages
        for (var x = 0; x < trackList.length; x++) {
          var track = document.createElement('track');

          track.kind = _this.options.tracks[x].kind;
          track.label = _this.options.tracks[x].label;
          track.srclang = _this.options.tracks[x].srclang;
          track.src = _this.options.src;

          // 'this' is a reference to the video
          this.appendChild(track);
        }
      }
      // it is to read the data from the json file
      // else if (jsonClosedCaptions) {
      //   var trackList = getDataFromDataJson;
      // }
      // else if (both _this.options.tracks.length > 0 && jsonClosedCaptions.length > 0) {
      //   combine the first condition with this one
      //   use _this.options.src, so the track elements
      // }

      _this.displayTranscript();
    });
    // ========================== done only for track elements ===================================


    // ========================== setCurrentLanguage is missing ===================================
    // if (trackList.length > 0 || jsonClosedCaptions.length > 0 || trackList.length > 0 && jsonClosedCaptions.length > 0)
    // if statement should be something like above
    if (trackList.length > 0) {
      var closedCaptionsButton = document.createElement('div');
      var languageOptionsMenu = document.querySelector('.vi2-speed-controls > ul');

      closedCaptionsButton.innerHTML += 'CC';
      closedCaptionsButton.classList.add('vi2-caption-controls');
      controlBar.appendChild(closedCaptionsButton);

      closedCaptionsButton.addEventListener('mouseenter', function () {
        languageOptionsMenu.classList.add('display-block');
      });

      closedCaptionsButton.addEventListener('mouseleave', function () {
        languageOptionsMenu.classList.add('display-none');
      });

      var trackLanguageOptions = document.createElement('ul');
      closedCaptionsButton.appendChild(trackLanguageOptions);

      for (var y = 0; y < (trackList.length + 1); y++) {
        var languageOption = document.createElement('li');
        trackLanguageOptions.appendChild(languageOption);

        if (y < trackList.length) {
          languageOption.innerHTML += _this.options.tracks[y].label;
          languageOption.classList.add(_this.options.tracks[y].srclang);
        } else if (languageOption.innerHTML.length === 0) {
          languageOption.innerHTML += 'Off';
          languageOption.classList.add('off');
        }

        languageOption.addEventListener('click', function () {
          this.setCurrentLanguage(this.className);
        });
      }
    }
    // ========================== setCurrentLanguage is missing ===================================
  },

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
  
  clickOnCueHandler : function (videoElement, transcriptElement, allCues) {
    var elementHover = transcriptElement.querySelector(':hover');
    console.log(this.cueList);
    for (var i = 0; i < allCues.length; i++) {

      // all id-s in the source file of subtitles should be from 1 to ... in the ascending order
      // so it is NECESSARY to organize subtitles in the source file with the right id-s
      // this is NOT the best limitation
      // THINK how to override it
      // TELL Niels

      if (elementHover.id === allCues[i].id) {

        // i could use something like that:
        // var video = vi2.observer.player;
        // video.currentTime(allCues[i].startTime);

        // BUT i used native method, which seems to be more effective, because native
        videoElement.currentTime = allCues[i].startTime;
      }
    }
  },

  // ========================== WRITE THIS ===================================
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
  // ========================= WRITE THIS =====================================

  isJson : function (str) {
    try {
      JSON.parse(str);
    } catch (err) {
      return false;
    }

    return true;
  },

  // ========================= NOT TESTED =====================================
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
  // ========================= NOT TESTED =====================================

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

  /* Append caption content to _this.options.selector
   **/

  // ========================= problems with the currentTime =====================================
  // to control the player use: vi2.observer.player.video | vi2.observer.player.currentTime | vi2.observer.player.play or .pause
  begin : function (videoElement, transcriptElement, allCues) {
    //**** event handler for displaying a caption or highlighting a cue inside the transcript text
    var currentTime = videoElement.currentTime;

    for (var i = 0; i < allCues.length; i++) {
      var cue = allCues[i];

      // i have only "0" currentTIme the whole time, so timeupdate event doesn't fire properly, or doesn't fire at all
      // begin function
      if (currentTime >= cue.startTime && currentTime <= cue.endTime) {
        transcriptElement.children[i].classList.add('current-cue');
      }
    }
  },
  // ========================= problems with the currentTime =====================================

  // ========================= problems with the transcriptElement =====================================
  /*
   * Remove caption content from _this.options.selector
   **/
  end : function (e, id) {
    //**** event handler to hide a caption or disable highlighting
    transcriptElement.children[i].classList.remove('current-cue');
  }
  	
	}); // end class 
