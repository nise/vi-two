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
    hasMenu: true, // control bar menu for selecting language
    displaySubtitles: true,
    displayTranscript: true,
    menuSelector: '.transcript', // unclear naming xxx
    tracks: []
  },
  cueList: [],
  currentLanguage: 'en',

  
  /* Initialize */
  init : function (ann) {
    var 
    	_this = this,
    	db_tracks = vi2.db.getClosedCaptionsById( vi2.observer.current_stream );
    	;
    
    if( this.options.tracks.length === 0 && db_tracks === undefined){ //&& 
    	console.log("Missing data to setup closed caption or transcript");
    	return;
    }else if( this.options.tracks.length === 0){
    	this.options.tracks = db_tracks ;
    }

    if ( this.options.displaySubtitles ) {
      this.displaySubtitles();
    }
    
    if ( this.options.hasMenu ) { 
      this.builtTrackLanguageSelectMenu();
    }
    
    // map events on the timeline
		if( this.options.hasTimelineMarker ){ // xx convert data
			//vi2.observer.player.timeline.addTimelineMarkers( 'closedCaptions', events, this.options.timelineSelector );
		}	
		
		this.currentLanguage = _this.options.tracks[ 0 ].srclang; // select the first language as default
    
    vi2.observer.player.video.addEventListener('loadedmetadata', function (e) {   
      for (var x = 0; x < _this.options.tracks.length; x++) { 
        var track = document.createElement('track');
        track.kind = _this.options.tracks[x].kind;
        track.label = _this.options.tracks[x].label;
        track.srclang = _this.options.tracks[x].srclang; 
        track.src = _this.options.tracks[x].src; // xxx convert JSON to vtt-file
//        track.data()
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
  	var _this = this;
		var closedCaptionsButton = document.createElement('div');
		    
    closedCaptionsButton.innerHTML += 'CC';
    closedCaptionsButton.classList.add('vi2-caption-controls');
    document.querySelector('.control-bar').appendChild(closedCaptionsButton);

    closedCaptionsButton.addEventListener('mouseenter', function () {
      document.querySelector('.vi2-caption-controls > ul').classList.add('display-block');//.style.display = 'block';
    });

    closedCaptionsButton.addEventListener('mouseleave', function () {
      document.querySelector('.vi2-caption-controls > ul').classList.remove('display-block');
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
    var _this = this;
    var video = vi2.observer.player.video;
    var transcript = document.querySelector(this.options.menuSelector);
    var trackElements = video.querySelectorAll('track'); // xxx search and select current language
    // var currentTrack = $('track [scrlang="'+ this.currentLanguage +'"]');
    var _this = this;

    // for each track element
    for (var i = 0; i < trackElements.length; i++) { 
      // it is to hide all DEFAULT subtitles; it is used HTMLTrackElement, because it works better in Firefox
      trackElements[i].track.mode = 'hidden';
      //alert(trackElements[i].track +'---'+_this.currentLanguage)
      console.dir(trackElements[i].track)
      if( trackElements[i].track.language === this.currentLanguage ){ 

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
		        //xxx _this.begin(video, transcript, cueList);
		      } else {
		        // do NOT delete console.log
		        console.log('If you want to see the transcript on the page, ' +
		          'then change attribute kind like so: <track kind="subtitles"> or <track kind="captions">')
		      }
		    }); // end track loop
			}// end if 
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
   this.currentLanguage = language;
   // xxx change track for transcript and subtitles if necessary
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
  	begin : function(e, id, obj){ 
    //**** event handler for displaying a caption or highlighting a cue inside the transcript text
    	vi2.observer.player.currentTime( obj.displayPosition.t1 ); //$('.transcript-cue[id="transcript_start_' obj.displayPosition.t1'"]').attr('id').split('_')[1] );

   /* for (var i = 0; i < allCues.length; i++) {
      if (currentTime >= allCues[i].startTime && currentTime <= allCues[i].endTime) {
        transcriptElement.children[i].classList.add('current-cue');
      }
    }*/
  },

 
  /*
   * Remove caption content from _this.options.selector
   **/
  end : function (e, id) {
    // xxx
    transcriptElement.children[i].classList.remove('current-cue');
  }
  	
	}); // end class 
