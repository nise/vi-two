
	/*****************************************/
	/* Clock 
	author: niels.seidel@nise81.com
	
 	- implement checkAnnotation in order to trigger certain events at the listenning instances
	*/
	

	/** class Clock **/ 
	var Clock = $.inherit(
	{
			/**/
  		__constructor : function(player, clockInterval) {
  			this.player = player;
  			this.clockInterval = clockInterval;  		
  		},
  		
		
		name : 'clock',
		player : null,
		clockInterval : 500, // = default
		timelineSelector : 'div.vi2-video-seek',
		interval : -1,	
		annotations : [],
		hooks : [],
		
		/**/
  	isHook : function(type){
  		return this.hooks[type] != null;	
  	},
  	
  	/**/
  	addHook : function(type, fn){
  		this.hooks[type] = fn;
  		return true;
  	},
	
		/* push annotation on their stack by mapping the parser object to the specific annotation object structure */
		addAnnotation : function(obj){ 					
			if(this.isHook(obj.type)){   
				this.annotations.push({active:false, content: {title: obj.title, target:obj.target}, linktype:obj.linktype, type: obj.type, displayPosition: {x: obj.x, y: obj.y, t1: obj.t1, t2: obj.t2}});
		 	}	
		},
	
		/**/
		checkAnnotation : 	function() {
			var iTime = this.player.currentTime();

			for (var i=0; i < this.annotations.length;i++){
				var oAnn = this.annotations[i];
				if(this.parseTime(iTime) >= oAnn.displayPosition.t1 && (this.parseTime(iTime) < (new Number(oAnn.displayPosition.t1) + new Number(oAnn.displayPosition.t2)))) {
					if(!oAnn.active){
						oAnn.active = true; 
	  				$(this.player).trigger('annotation.begin.'+oAnn.type, [i, oAnn]);
					}
				}else {
					oAnn.active = false;
	  			$(this.player).trigger('annotation.end.'+oAnn.type, [i]);
				}
			}
		},
								
		/**/
		startClock : function(){
			var _this = this;
			this.interval = setInterval(function() { _this.checkAnnotation();  }, this.clockInterval);		
		},
		
		/**/
		stopClock : function(){
			clearInterval(this.interval);
			clearInterval(this.interval);
		},

		/**/		
		reset : function(){
			$('#overlay').html('');
			this.annotations = [];
		},
	
		/**/
		parseTime : function (strTime) { 
			return strTime;
			var aTime = strTime.toString().split(":");
			return parseInt(aTime[0],10) * 60 + parseInt(aTime[1],10) * 1;// + parseFloat(aTime[2]);
		},
	
		/**/
		getCurrentTime : function(){
			return this.player.currentTime();
		},
	
}); // end class Clock 
	

