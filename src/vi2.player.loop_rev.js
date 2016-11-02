/*
 * name: Vi2.Loop
 * author: Dmitriy Kolotov
 * license: MIT License
 * description:
 * dependencies:
 *  - jquery-1.11.2.min.js
 *  - jquery.inherit-1.1.1.js
 * todo:
 *  - find some nice icons representing the three button states 
 * example: 
 *	- vi-two/examples/hello-world/index.html#!/video/huppert3
 */


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
    label : '',
    timeline: '.vi2-timeline-main'
  },
  loopButton : {},
  clicks: 0,
  currentTime: 0,
  firstClickCurrentTime: 0,
 	secondClickCurrentTime:0,

  /**
   * Initializes the loop button of content and handles options
   */
  init : function () {
		var _this = this;
    // clear control bar, before playing another video (delete the looping button)
    $(this.options.selector + '> .vi2-loop-controls').remove();

    this.clicks = 0;
		this.loopButton = document.createElement('div');

    // add loop button to player control bar
    this.loopButton.classList.add('vi2-loop-controls', 'vi2-btn', 'vi2-loop-controls-first-point');
    this.loopButton.title = 'Click to define the first point of the loop';
    this.loopButton.addEventListener('click', function(){ _this.loopButtonClickHandler() }, false);
    document.querySelector(this.options.selector).appendChild( this.loopButton );

  },
  
  
  /*
   **/	
	loopButtonClickHandler : function () {
      if (this.clicks === 0) {
        this.firstClickCurrentTime = vi2.observer.player.currentTime();
        // this - div class="vi2-loop-controls"
        this.loopButton.title = 'Click to define the last point of the loop';
        this.loopButton.classList.remove('vi2-loop-controls-first-point');
        this.loopButton.classList.add('vi2-loop-controls-last-point');
        vi2.observer.player.timeline.highlightTimeline( vi2.observer.player.video, this.options.timelineSelector, this.firstClickCurrentTime, this.secondClickCurrentTime, this.clicks);
        this.clicks++;

      } else if (this.clicks === 1) {
        if (vi2.observer.player.currentTime() > this.firstClickCurrentTime) {
          this.secondClickCurrentTime = vi2.observer.player.currentTime();
          vi2.observer.player.timeline.highlightTimeline( vi2.observer.player.video, this.options.timelineSelector, this.firstClickCurrentTime, this.secondClickCurrentTime, this.clicks);

        } else {
          this.secondClickCurrentTime = this.firstClickCurrentTime;
          this.firstClickCurrentTime = vi2.observer.player.currentTime();
          vi2.observer.player.timeline.highlightTimeline( vi2.observer.player.video, this.options.timelineSelector, this.firstClickCurrentTime, this.secondClickCurrentTime, this.clicks);
        }

        // this - div class="vi2-loop-controls"
        this.loopButton.title = 'Click to delete the loop';
        this.loopButton.classList.remove('vi2-loop-controls-last-point');
        this.loopButton.classList.add('vi2-loop-controls-delete');
        vi2.observer.player.video.addEventListener('timeupdate', this.endLoop, false);
        this.clicks++;

      } else {
        vi2.observer.player.video.removeEventListener('timeupdate', this.endLoop, false);
        // this - div class="vi2-loop-controls"
        this.loopButton.title = 'Click to define the first point of the loop';
        this.loopButton.classList.remove('vi2-loop-controls-delete');
        this.loopButton.classList.add('vi2-loop-controls-first-point');
        vi2.observer.player.timeline.deleteHighlightTimeline( this.options.timelineSelector );
        this.clicks -= 2;

  		}
	},
	
	
	/*
	 **/
	endLoop : function() {
      this.loopButton = document.querySelector('.vi2-loop-controls');

      // this - <video></video>
      if (this.currentTime >= this.secondClickCurrentTime + 0.5 || this.currentTime < this.firstClickCurrentTime) {
        this.removeEventListener('timeupdate', this.endLoop, false);
        this.loopButton.title = 'Click to define the first point of the loop';
        this.loopButton.classList.remove('vi2-loop-controls-delete');
        this.loopButton.classList.add('vi2-loop-controls-first-point');
        vi2.observer.player.timeline.deleteHighlightTimeline( this.options.timelineSelector );
        this.clicks -= 2;

      } else if (this.currentTime >= this.secondClickCurrentTime) {
        this.currentTime = this.firstClickCurrentTime;
      }
    }

});
