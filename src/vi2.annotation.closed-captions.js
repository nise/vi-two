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
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options);	
  	},
  	
  	/* class variables */
		name : 'closedCaptions',
		type : 'annotation',
		// defaults
		options : {    //hasTimelineMarker: true, hasMenu: true, menuSelector:'.toc'
			selector: '.closedCaption', 
			hasTimelineMarker: true, 
			controls: true,
			timelineSelector : 'div.vi2-video-seek',
			hasMenu: true,
      displaySubtitles: false,
			menuSelector:'.transcript',
      src: 'test.vvt'
		},

    // for tests: file:///C:/Users/Dmitry/Desktop/vi-two/examples/hello-world/index.html#!/video/seidel2
		/* Initialize */
		init : function(ann){
  		//**** write the code to add the track element to the video
      // 1. add track element video
      var video = vi2.observer.player.video;
      var _this = this;

      // i should write a function, which controls display subtitles !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      if (this.options.displaySubtitles) {
        _this.displaySubtitles();
      }

      video.addEventListener('loadedmetadata', function () {
        var track = document.createElement('track');

        track.kind = 'subtitles';
        track.label = 'English';
        track.srclang = 'en';
        track.src = _this.options.src;

        // 'this' is a reference to the videoElement
        this.appendChild(track);

        _this.displayTranscript();
      });
		},
		
    displayTranscript : function(){

      // 2. loop
      // accessing tag mit class="transcript"
      var video = vi2.observer.player.video;
      var transcript = document.querySelector(this.options.menuSelector);
      var trackElements = video.querySelectorAll('track');
      var _this = this;

      // for each track element
      for (var i = 0; i < trackElements.length; i++) {
        // it is to hide all subtitles; it is used HTMLTrackElement, because it works better in Firefox
        trackElements[i].track.mode = 'hidden';

        trackElements[i].addEventListener('load', function() {
          // "this" is an HTMLTrackElement, NOT a TextTrack object; HTMLTrackElement is used, because it works better in Firefox
          var textTrack = this.track;

          if (textTrack.kind === 'subtitles' || textTrack.kind === 'captions') {
            var cueList = textTrack.cues;
            var transcriptText = '';

            for (var i = 0; i < cueList.length; i++) {

              if (_this.isJson(cueList[i].text)) {
                transcriptText += ('<div id="' + (i+1) + '" class="transcript-cue">' + JSON.parse(cueList[i].text).description + '</div>' + ' ');
              } else if (cueList[i].text[0] === '{' && cueList[i].text[cueList[i].text.length - 1] === '}') {
                transcriptText += ('<div id="' + (i+1) + '" class="transcript-cue">' + 'No Subtitle' + '</div>' + ' ');
              } else {
                transcriptText += ('<div id="' + (i+1) + '" class="transcript-cue">' + cueList[i].text + '</div>' + ' ');
              }
            }

            if (transcriptText) {
              transcript.innerHTML = transcriptText;
            }

            // timeupdate event does NOT fire, why?
            transcript.addEventListener('timeupdate', function () {
              console.log('hi');
              var transcript = this;

              _this.highlightCue(video, transcript, cueList);
            }, false);

            // click event fires okay
            transcript.addEventListener('click', function () {
              var transcript = this;

              _this.clickOnCueHandler(video, transcript, cueList)
            }, false);
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

    // to control the player => vi2.observer.player.video | vi2.observer.player.currentTime | vi2.observer.player.play
    highlightCue : function (videoElement, transcriptElement, allCues) {
        var currentTime = videoElement.currentTime;

        for (var i = 0; i < allCues.length; i++) {
          var cue = allCues[i];

          if (currentTime >= cue.startTime && currentTime <= cue.endTime) {
            transcriptElement.children[i].classList.add('current-cue');
          } else {
            transcriptElement.children[i].classList.remove('current-cue');
          }
        }
    },

    isJson : function (str) {
      try {
        JSON.parse(str);
      } catch (err) {
        return false;
      }

      return true;
    },

    // how to test it?
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
		appendToDOM : function(id){ 
			//**** usually any annotations need to be converted into the internal represetation of code. Therefore, it is necessary to append these contents to the dom structure first. The parser of the core components then will take care of everthing
			$(vi2.dom).find('[type="closedCaptions"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getSlidesById(id), function(i, val){  //alert(JSON.stringify(val))
				var slides = $('<div></div>')
				.attr('type',"closedCaptions")
				.attr('starttime', val.starttime )
				.attr('duration', val.duration ) //**** you need to calculate the duration
				.attr('id', val.id)
				.text(this.tagname ) //**** dedicated for the content of the caption
				//**** feel free to add other necessary elements
				.appendTo( vi2.dom );
			}); 
			
		},

		/* Append caption content to _this.options.selector
		 **/
		begin : function(e, id, obj){ 
			//**** event handler for displaying a caption or highlighting a cue inside the transcript text
		},


		/*
		 * Remove caption content from _this.options.selector
		 **/
		end : function(e, id){
			//**** event handler to hide a caption or disable highlighting
		},
  	
	}); // end class 
