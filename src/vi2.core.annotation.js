	/* Annotation
	author: niels.seidel@nise81.com
	
	abstract class
	*/

 
	var Annotation = $.inherit(/** @lends Annotation# */{

		/** 
		* 	@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  		this.options = options;  
		},
		
		name : 'annotation',
		type : 'annotation',
		options : {},

		/* ... */
		init : function(ann){},	
		
		/* -- */
		appendToDOM : function(id){},						
				
		/* ... */
		begin : function(e, id, obj){},
	
		/* ... */
		end : function(e, id){},
		
		
		/* ... */		
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "" + seconds;
		}
		
	}); // end class Annotation
