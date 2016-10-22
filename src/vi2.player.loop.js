/*
 * name: Vi2.Loop
 * author: niels.seidel@nise81.com
 * license: MIT License
 * description:
 * dependencies:
 *  - jquery-1.11.2.min.js
 *  - jquery.inherit-1.1.1.js
 * todo:
 *  -
 */

// for tests: file:///C:/Users/Dmitry/Desktop/vi-two/examples/hello-world/index.html#!/video/huppert3
// THIS IS A METHOD INSIDE THE CORE.ANOTATED-TIMELINE WIDGET
// vi2.observer.player.timeline.startHighlightTimeline();
Vi2.Loop = $.inherit({

  /** @constructs
   *		@param {object} options An object containing the parameters
   *		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
   *
   */
  __constructor : function (options) {
    this.options = $.extend(this.options, options);
  },

  name : 'loop',
  type : 'player-widget',
  options : {
    selector : '.control-bar',
    label : ''
  },

  /**
   * Initializes the loop button of content and handles options
   */
  init : function () {

    // clear control bar, before playing another video (delete the looping button)
    $(this.options.selector + '> .vi2-loop-controls').remove();

    var clicks = 0;
    var video = vi2.observer.player.video;
    var firstClickCurrentTime;
    var secondClickCurrentTime;
    var timeline = document.querySelector('.vi2-timeline-main');
    var loopButton = document.createElement('div');

    var endLoop = function() {
      var loopButton = document.querySelector('.vi2-loop-controls');

      // this - <video></video>
      if (this.currentTime >= secondClickCurrentTime + 0.5 || this.currentTime < firstClickCurrentTime) {
        this.removeEventListener('timeupdate', endLoop, false);
        loopButton.setAttribute('title', 'Click to define the first point of the loop');
        loopButton.classList.remove('vi2-loop-controls-delete');
        loopButton.classList.add('vi2-loop-controls-first-point');
        vi2.observer.player.timeline.deleteHighlightTimeline(timeline);
        clicks -= 2;

      } else if (this.currentTime >= secondClickCurrentTime) {
        this.currentTime = firstClickCurrentTime;
      }
    };

    var loopButtonClickHandler = function () {
      if (clicks === 0) {
        firstClickCurrentTime = vi2.observer.player.currentTime();
        // this - div class="vi2-loop-controls"
        this.setAttribute('title', 'Click to define the last point of the loop');
        this.classList.remove('vi2-loop-controls-first-point');
        this.classList.add('vi2-loop-controls-last-point');
        vi2.observer.player.timeline.highlightTimeline(video, timeline, firstClickCurrentTime, secondClickCurrentTime, clicks);
        clicks++;

      } else if (clicks === 1) {
        if (vi2.observer.player.currentTime() > firstClickCurrentTime) {
          secondClickCurrentTime = vi2.observer.player.currentTime();
          vi2.observer.player.timeline.highlightTimeline(video, timeline, firstClickCurrentTime, secondClickCurrentTime, clicks);

        } else {
          secondClickCurrentTime = firstClickCurrentTime;
          firstClickCurrentTime = vi2.observer.player.currentTime();
          vi2.observer.player.timeline.highlightTimeline(video, timeline, firstClickCurrentTime, secondClickCurrentTime, clicks);
        }

        // this - div class="vi2-loop-controls"
        this.setAttribute('title', 'Click to delete the loop');
        this.classList.remove('vi2-loop-controls-last-point');
        this.classList.add('vi2-loop-controls-delete');
        video.addEventListener('timeupdate', endLoop, false);
        clicks++;

      } else {
        video.removeEventListener('timeupdate', endLoop, false);
        // this - div class="vi2-loop-controls"
        this.setAttribute('title', 'Click to define the first point of the loop');
        this.classList.remove('vi2-loop-controls-delete');
        this.classList.add('vi2-loop-controls-first-point');
        vi2.observer.player.timeline.deleteHighlightTimeline(timeline);
        clicks -= 2;

      }
    };

    // add loop button to player control bar
    loopButton.classList.add('vi2-loop-controls', 'vi2-btn', 'vi2-loop-controls-first-point');
    loopButton.setAttribute('title', 'Click to define the first point of the loop');
    loopButton.addEventListener('click', loopButtonClickHandler, false);
    document.querySelector(this.options.selector).appendChild(loopButton);

  }

});
