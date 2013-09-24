(function($) {
  $.fn.pieMenu = function(menuSelector, options) {
    var opts = $.extend({}, $.fn.pieMenu.defaults, options);
    
    //globals
    var clickX, clickY;
 	  var pressed=false;
  	var minItem = -1;
  	var num = $(menuSelector).children().size();
	  var step = (2.0 * Math.PI) / num;
	  var rotation = .5 * Math.PI;
	  
	  return this.each(function() {
      $this = $(this);
      
      $this.bind(opts.show,function(e) {
       	 e.preventDefault();
       	 
       	 if (e.which == 1 || e.button == 1) //left mouse click?
       	 {
    	   	 minItem = -1;
    	   	 pressed = true;
    	   	 clickX = e.pageX;
    	   	 clickY = e.pageY;
    	   	 
    	   	 $(menuSelector).css({"left": clickX + "px", "top": clickY + "px", "display": "block"});
    	     $(menuSelector + " li img").each(function(i, e){
    	     	var elem = $(e);
    	     	elem.width(opts.minWidth + "px");
    	     	elem.css({
    	     		"position": "absolute", 
    	     		"border": "none", 
    	     		"display": "inline",
    	     		"left": 
    	     		Math.round(Math.cos(i*step - rotation) * opts.radius - (elem.width() / 2)) + "px",
    	     		"top": 
    	     		Math.round(Math.sin(i*step - rotation) * opts.radius - (elem.height() / 2)) + "px"
         		});
    	     });
    	     $(menuSelector).fadeIn(200);
    	  }
       });
       
      $this.mousemove(function(e) {
       	 e.preventDefault();
       	 
         if(pressed){
    	    var minDist = 100000;
         	$(menuSelector + " li img").each(function(i, elem){
         	   var width = $(elem).width();
         	   var height = $(elem).height();
         	   var xPos = $(elem).offset().left + Math.round(width/2);
         	   var yPos = $(elem).offset().top + Math.round(height/2);
         	   var dist = Math.sqrt((xPos-e.pageX)*(xPos-e.pageX) + (yPos-e.pageY)*(yPos-e.pageY));
         	   if(dist<minDist){
     	   	      minDist = dist;
     	   	      minItem = i;
         	   }
         	   width = Math.round(width + (opts.radius - dist*opts.scale));
         	   width = (width < opts.minWidth) ? opts.minWidth : (width > opts.maxWidth) ? opts.maxWidth : width;
         	   $(elem).width(width + "px");
         	   $(elem).css({
    	     		"left": 
    	     		Math.round(Math.cos(i*step - rotation) * opts.radius - ($(elem).width() / 2)) + "px",
    	     		"top": 
    	     		Math.round(Math.sin(i*step - rotation) * opts.radius - ($(elem).height() / 2)) + "px"
         		});
            });
         }
         
       });
       
      $('body').mouseup(function(e) {
       	 e.preventDefault();
       	 if (pressed)//check for left mouse button
       	 {
    	   	 pressed = false;
    	   	 var minRadius2 = 25; //square of radius to cancel
    	   	 var rad = (e.pageX - clickX)*(e.pageX - clickX) + (e.pageY - clickY)*(e.pageY - clickY);
    	     $(menuSelector).hide();
    	   	 $(menuSelector + " li img").each(function(i, elem){
    	     	$(elem).width(opts.minWidth + "px");
    	     	if (rad > opts.minRadius2 && i == minItem){
    	     		$(elem).parent().click();
    	     	}
    	     });
         }
       });
       
    });
  };
  
  $.fn.pieMenu.defaults = {
    radius: 40,
    minWidth: 20,
    maxWidth: 45,
    minRadius2: 25,
    scale: 1.2,
    show: 'mousedown'
  };
  
})(jQuery);
