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

// for tests: file:///C:/Users/Dmitry/Desktop/vi-two/examples/hello-world/index.html#!/video/seidel2
Vi2.Loop = $.inherit({

  /** @constructs
   *		@param {object} options An object containing the parameters
   *		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
   *
   */
  __constructor : function(options) {
    this.options = $.extend(this.options, options);
  },

  name : 'loop',
  type : 'player-widget',
  options : {
    selector : '.control-bar',
    label : 'Start the loop'
  },

  /**
   * Initializes the loop button of content and handles options
   */
  init : function() {
    // THIS IS FROM THE SKIP BACK WIDGET, DO WE STILL NEED TO CLEAR THE SELECTOR?
    // $(this.options.selector + '> .vi2-loop-controls').remove();

    var _this = this;
    var clicks = 0;
    var video = vi2.observer.player.video;
    var firstClickCurrentTime;
    var secondClickCurrentTime;
    var endLoop = function() {
      if (this.currentTime >= secondClickCurrentTime) {
        this.currentTime = firstClickCurrentTime;
      }
    };

    // add button to player control bar
    var container = $('<div></div>')
      .append($('<div></div>')
        .text(this.options.label)
        .addClass('vi2-loop-label')
      )
      .addClass('vi2-loop-controls vi2-btn')
      .attr('title', 'click to define the start point of the loop')
      .click(function() {
        if (clicks == 0) {
          firstClickCurrentTime = vi2.observer.player.currentTime();
          container.attr('title', 'click to define the end point of the loop');
          container.text('End the loop');
          clicks++;

        } else if (clicks == 1) {
          secondClickCurrentTime = vi2.observer.player.currentTime();
          container.attr('title', 'click to delete the loop');
          video.addEventListener('timeupdate', endLoop, false);
          container.text('Delete the loop');
          clicks++;

        } else {
          video.removeEventListener('timeupdate', endLoop, false);
          container.attr('title', 'click to define the start point of the loop');
          container.text(_this.options.label);
          clicks -= 2;
        }
      })
      .appendTo(this.options.selector);
  }
});
