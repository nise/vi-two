/* Clock 
	author: niels.seidel@nise81.com
	 	- implement checkAnnotation in order to trigger certain events at the listenning instances
 	- use timeUpdate insteate of setTimeOut or setIntervall: http://blog.gingertech.net/2009/08/19/jumping-to-time-offsets-in-videos/
*/
	

	/* class Clock */ 
	var Clock = $.inherit(/** @lends Clock# */
	{
			/** 
			*		@constructs 
			*		@param {Videoplayer} player Related video player 
			*		@param {Number} clockInterval Interval of clock granularity in milliseconds
			*/
  		__constructor : function(player, clockInterval) {
  			this.player = player;
  			this.clockInterval = clockInterval;  		
  		},
  		
		
		name : 'clock',
		player : null,
		clockInterval : 500, // = default
		isRunning : false,
		timelineSelector : 'div.vi2-video-seek',
		interval : -1,	
		annotations : [],
		hooks : [],
		
		/* ... */
  	isHook : function(type){
  		return this.hooks[type] != null;	
  	},
  	
  	/* ... */
  	addHook : function(type, fn){
  		this.hooks[type] = fn;
  		return true;
  	},
	
		/* push annotation on their stack by mapping the parser object to the specific annotation object structure */
		addAnnotation : function(obj){ 					
			if(this.isHook(obj.type)){   
				this.annotations.push({
						active:false,
						author: obj.author,
						width: obj.width, 
						content: {
								title: obj.title, 
								target:obj.target,
								note:obj.note
							}, 
						linktype:obj.linktype, 
						type: obj.type, 
						displayPosition: {
								x: obj.x, 
								y: obj.y, 
								t1: obj.t1, 
								t2: obj.t2
							},
							seek : obj.seek,
							duration : obj.duration
						});
		 	}	
		},
	
		/* Trivial */
		checkAnnotation : 	function() {
			var iTime = this.parseTime( this.player.currentTime() );

			for (var i=0; i < this.annotations.length;i++){
				var oAnn = this.annotations[i];
				if(iTime >= oAnn.displayPosition.t1 && iTime < (new Number(oAnn.displayPosition.t1) + new Number(oAnn.displayPosition.t2))) {
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
		
	/* Optimized algorithm, making advantage of indexing the time of appearance */
		/* to do: 
		-generate test data, 
		-try different approaches to generate the index, 
		-measure time, 
		-calculate complexity in landau notation
		*/
		prepAnno : [],
		
		buildAnnotationIndex : function(){
			var prepAnno = [];
			for (var i = 0; i < 1000; i++){ prepAnno[i] = [];} 
			$.each(this.annotations, function(i, val){
				var index = val.displayPosition.t1 < 1 ? 0 : Math.ceil(val.displayPosition.t1 / 100);
				prepAnno[index].push(val);
			});
			this.prepAnno = prepAnno;
		},
		
		checkAnnotation_new : 	function() {
			var _this = this;
			var iTime = this.parseTime( this.player.currentTime() ); // returns time in decimal 
			var x = this.player.currentTime() < 1 ? 0 : Math.ceil(iTime / 100); 
			$('#debug').val(_this.prepAnno[x].length);	
			$.each(_this.prepAnno[x], function(i, oAnn){
				
				if(iTime >= oAnn.displayPosition.t1 && iTime < (new Number(oAnn.displayPosition.t1) + new Number(oAnn.displayPosition.t2))) {
					if(!oAnn.active){
						oAnn.active = true; 
	  				$(_this.player).trigger('annotation.begin.'+oAnn.type, [i, oAnn]); 
					}
				}else {
					oAnn.active = false;
	  			$(_this.player).trigger('annotation.end.'+oAnn.type, [i]);
				}
			});
		},
							
		/* ... */
		startClock : function(){  
			//this.buildAnnotationIndex();
			if(this.isRunning){ return;}
			var _this = this;
			this.isRunning = true;
			this.interval = setInterval(function() { _this.checkAnnotation();  }, this.clockInterval);		
		},
		
		/* ... */
		stopClock : function(){
			clearInterval(this.interval);
			clearInterval(this.interval);
			this.isRunning = false;
		},

		/* ... */		
		reset : function(){
			$('#overlay').html('');
			this.annotations = [];
		},
	
		/* ... */
		parseTime : function (strTime) { 
			return strTime;
			var aTime = strTime.toString().split(":");
			return parseInt(aTime[0],10) * 60 + parseInt(aTime[1],10) * 1;// + parseFloat(aTime[2]);
		},
	
		/* ... */
		getCurrentTime : function(){
			return this.player.currentTime();
		}
	
}); // end class Clock 
	

