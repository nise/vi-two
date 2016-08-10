/* 
*	name: Vi2.Clock
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Checks which annotations need to be activated or deactivated in given time intervall during video playback
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	 	- implement checkAnnotation in order to trigger certain events at the listenning instances
* 		- use timeUpdate insteate of setTimeOut or setIntervall: http://blog.gingertech.net/2009/08/19/jumping-to-time-offsets-in-videos/
http://stackoverflow.com/questions/3255/big-o-how-do-you-calculate-approximate-it
https://de.wikipedia.org/wiki/Bin%C3%A4re_Suche#Intervallschachtelung
https://de.wikipedia.org/wiki/Interpolationssuche
https://en.wikipedia.org/wiki/Search_engine_indexing#Inverted_indices
https://en.wikipedia.org/wiki/Inverted_index
https://en.wikipedia.org/wiki/Index#Computer_science

- Indexstruktur wird bei Änderungen (z.B. einer neuen Annotation) neu berechnet. Muss das so sein?
- es handelt sich um eine eindimensionale Indexstruktur, in der die Anzeigezeit indiziert ist 
- Alternative Implementierung: B-Baum
- Ermittlung der optimalen Länge des Index  ... Abspielzeit in Minuten / Anzahl der Annotation ... Videolänger / Prüfungsintervall ??
- Ziel müsste es sein, die Annotationen möglichst gleich auf die Indexeinträge zu verteilen, so dass in jedem Indexeintrag so wenig wie möglich und immer gleichviele Suchoperationen vorgenommen werden müssten.
- Ein Nebenziel müsste sein, die Bestimmung des aktuellen Index so einfach wie möglich zu gestalten. 
- Landau-Notation:: Man müsste Testfälle generieren, in dem man die Anzahl der Annotation verdoppelt, um dazu den Zeitaufwand misst. = Zeitkomplexität. Diese Messung müsste in verschiedenen Browsern durchgeführt werden.
%http://de.wikipedia.org/wiki/Landau-Symbole#Beispiele_und_Notation 

*/
	

Vi2.Clock = $.inherit(/** @lends vi2.core.Clock# */
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
		
		/**
		* Checks whether the provided type of annotation has been already added as a hook
		* @param {String} type
		* @return {boolean}
		*/
  	isHook : function(type){
  		return this.hooks[type] !== null;	
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
								description:obj.description,
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
			var annoLength = this.annotations.length;
			for (var i=0; i < annoLength; i++ ){ 
				var oAnn = this.annotations[i];
				if(iTime >= oAnn.displayPosition.t1 && iTime < (Number(oAnn.displayPosition.t1) + Number(oAnn.displayPosition.t2))) {
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
			//$('#debug').val(_this.prepAnno[x].length);	
			$.each(_this.prepAnno[x], function(i, oAnn){  
				
				if(iTime >= oAnn.displayPosition.t1 && iTime < (Number(oAnn.displayPosition.t1) + Number(oAnn.displayPosition.t2))) {
					if(!oAnn.active){
						oAnn.active = true; //alert(oAnn.type);
	  				$(_this.player).trigger('annotation.begin.'+oAnn.type, [i, oAnn]); 
					}
				}else {
					oAnn.active = false;
	  			$(_this.player).trigger('annotation.end.'+oAnn.type, [i]);
				}
			});
		},
		
		
		// Another approach
		/*
		1. generate an inverted index where Index[ playbacktime_rounded ] = {annotation_1, annotation_2, ..., annotation_n}. The Index contains all annotations, that should be visible at time. 
		2. at a given playbacktime just test whether the time in ms exists in the Index.
		
		Problem:: Size of Index
		*/
		
							
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
			//var aTime = strTime.toString().split(":");
			//return parseInt(aTime[0],10) * 60 + parseInt(aTime[1],10) * 1;// + parseFloat(aTime[2]);
		},
	
		/* ... */
		getCurrentTime : function(){
			return this.player.currentTime();
		}
	
}); // end class Clock 
	

