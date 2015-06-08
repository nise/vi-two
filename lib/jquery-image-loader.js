/** @preserve
 * jquery-image-loader
 *
 * Created at: 2011-12-01 08:32:01 +0200
 * Author: Yves Van Broekhoven
 * Version: 1.2.0
 * https://github.com/mrhenry/jquery-image-loader
 *
 * How to use:
 *
 * HTML:
 *
 * <div class="wrapper">
 *   <img data-src="url-to-image.jpg">
 * </div>
 *
 *
 * JS:
 *
 * $('.wrapper').loadImages({
 *   imgLoadedClb: function(){},
 *   allLoadedClb: function(){},
 *   imgErrorClb:  function(){},
 *   noImgClb:     function(){},
 *   dataAttr:     'src'
 * });
 *
 */

/*global jQuery:false*/

(function($) {
  "use strict";

  var _load,
      _callback,
      _removeData;

  $.fn.loadImages = function(options){
    options = $.extend({}, $.fn.loadImages.defaults, options);

    this.each(function(){
      var _this = this,
          $this = $(_this),
          $images;

      // Check if "this" is an image or an image container
      if ( $this.is('img') ) {
        $images = $this;
      } else {
        $images = $this.find('*[data-' + options.dataAttr + ']');
      }

      // If there are no images, exit immediately
      if ($images.length < 1) {
        if ($.isFunction(options.noImgClb)) {
          options.noImgClb.call(_this);
          return;
        }
      }

      // Attach dfd & options to our context element
      $this.data( 'dfd', $.Deferred() );
      $this.data( 'options', options );

      // Initialize counters
      $this.data('total_images_count', $images.length);
      $this.data('processed_count', 0);
      $this.data('failed_count', 0);

      // Async
      $.when( _load.call(_this, $images) )
       .then( function() {
          if ( $.isFunction( options.allLoadedClb ) ) {
            options.allLoadedClb.call(_this);
          }
       });

    });

    return this;
  };

  /*
   * Load image(s)
   * this [object] plugin selector object
   * @param $images [$object] $array of <img>
   */
  _load = function($images) {
    var _this   = this,
        $this   = $(_this),
        options = $this.data('options'),
        dfd     = $this.data('dfd');

    // Iterate images
    $images.each(function(){
      var $this = $(this),
          $img;

      if ( $this.is('img') ) {
        $img = $this;

      } else {
        $img = $('<img/>');

      }

      $img
        .load(function(){
          if ( !$this.is('img') ) {
            $this.css({
              'background-image': 'url("' + $this.data(options.dataAttr) + '")'
            });
          }
          _callback.call(_this, $this[0], 'success');
        })
        .error(function(){
          _callback.call(_this, $this[0], 'error');
        })
        .attr( 'src', $this.data(options.dataAttr) );
    });

    return dfd.promise();
  };


  /*
   * Callback after load/error
   *
   * this [object] plugin selector object
   * @param img    [object]  processed image object
   * @param status [string]  'success' or 'error'
   */
  _callback = function(img, status){
    var _this               = this,
        $this               = $(_this),
        dfd                 = $this.data('dfd'),
        options             = $this.data('options'),
        processed_count     = $this.data('processed_count') + 1,
        total_images_count  = $this.data('total_images_count');

    // Increase process count
    $this.data('processed_count', processed_count);

    // Image success callback
    if ( status === 'success' && $.isFunction(options.imgLoadedClb) ) {
      options.imgLoadedClb.call(img, processed_count, total_images_count);
    }

    // Image error callback
    if (status === 'error') {
      $this.data('failed_count', $this.data('failed_count') + 1);

      // Unbind load event to avoid triggering our load function again
      // when you for example add a fallback image
      $(this).unbind('load');

      if ( $.isFunction(options.imgErrorClb) ) {
        options.imgErrorClb.call(img, processed_count, total_images_count);
      }

    }

    // If all images are processed, resolve
    if ( processed_count === total_images_count ) {
      // If failed count equals image count, then reject
      // otherwise resolve
      if ( $this.data('failed_count') === total_images_count ) {
        if ( $.isFunction(options.noImgClb) ) {
          options.noImgClb.call(_this);
        }
        dfd.reject();

      } else {
        dfd.resolve();

      }
      _removeData.call(_this);

    }

  };

  /*
   * Remove all plugin temporary data
   * this [object] plugin selector object
   */
  _removeData = function() {
    $(this).removeData('dfd', 'options', 'total_images_count', 'processed_count', 'failed_count');
  };


  /*
   * Plugin defaults
   */
  $.fn.loadImages.defaults = {
    imgLoadedClb: false, /* callback when an image is loaded.
                            this [object] loaded image
                            @params processed [integer] processed images
                            @params total  [integer] total images
                         */
    allLoadedClb: false, /* callback when all images are loaded.
                            this [object] wrapper element
                         */
    imgErrorClb: false,  /* callback when an image fails loading.
                            this [object] failed image
                         */
    noImgClb: false,     /* callback when there are no images to be loaded,
                            or all are failed.
                            this [object] wrapper element
                         */
    dataAttr: 'src'       /* the data attribute that contains the src */

  };

}(jQuery));
