/* 
*	name: Vi2.Utils
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*/


////////////////////////////////
/* Defines custom drop out box  (style: #div.klappe)*/
		jQuery.fn.dropdown = function(obj) {
				var head = $(this).find('h4');
				var all = $(this).html();
				$(this).toggle(
					function(){
						$(this).html(head.wrapInner('<h4></h4>').html());
					},
					function(){
						$(this).html(all).find('h4').attr('style','background-image:url(images/arrow_d.png); display:inline;');
					}
				).click();
			};

////////////////////////////////
/* ...*/
		jQuery.fn.hidetext = function(obj) {
			var text = $(this).text();
			var el = $(this).text(text.substr(0, 250)+' ').append($('<span>more</span>')); //.button()
			return el;
			};
			
			
////////////////////////////////			
		jQuery.fn.round = function(dec) {	
	    if (!dec) { dec = 0; }
    	return Math.round(this*Math.pow(10,dec))/Math.pow(10,dec);
  	};

//////////////////////////////
function delegate(obj, func){
	var f = function() {
		var target = arguments.callee.target;
		var func = arguments.callee.func;
		return func.apply(target, arguments);
	}; 
	f.target = obj;
	f.func = func; 
	return f;
}

//////////////////////////////
function removeDuplicates (cat){
	cat = cat.sort();
  for(var i = 1; i < cat.length;){
  	if(cat[i-1] == cat[i]){ cat.splice(i, 1); } 
  	else { i++; }
  }
  return cat;     
}


/*
* calcs temporal distance to a given time stamp
**/
function timeDifference (s, prefix, postfix){
			//prefix = prefix === undefined ? 'vor ' : prefix;
			//postfix = postfix === undefined ? ' ago' : postfix; 
			
			var b = moment( s );  
			var a = moment( s ); 
			
			
			var diff = a.diff(b, 'seconds'); 
			if(diff <= 60 ){
				return prefix + diff.toFixed(1) + 's' + postfix; 
			}
			
			diff = a.diff(b, 'minutes'); 
			if(diff <= 60){
				return prefix + diff.toFixed(1) + 'min' + postfix;
			}
			
			diff = a.diff(b, 'hours', true); 
			if(diff <= 24){
				return prefix + diff.toFixed(1) + 'h' + postfix; 
			}
			
			diff = a.diff(b, 'days', true); 
			if(diff < 30){
				return prefix + diff.toFixed(1) + 'd' + postfix; 
			}
			
			diff = a.diff(b, 'months', true);
			if(diff < 12){
				return prefix + diff.toFixed(1) + 'm' + postfix; 
			}
			
			diff = a.diff(b, 'years', true);
			return prefix + diff.toFixed(1) + 'y' + postfix; 
			
}




/////////////////////////////
Object.size = function(obj) {
    var 
    	size = 0, 
    	key = {}
    	;
    for (key in obj) {
        if (obj.hasOwnProperty(key)){
        	size++;
        }	
    }
    return size;
};



Vi2.Utils = $.inherit(/** @lends Utils # */{

	/** 
	*		@constructs 
	*		
	*/
	__constructor : function(options) { },
	
	name : 'utils',
	
	
	/* Converts seconds into decimal format */
	seconds2decimal : function(seconds) {
		d = Number(seconds);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "00:") + (s < 10 ? "0" : "") + s); 
	},
	
	/* 
	*Converts decimal time format into seconds 
	**/
	deci2seconds: function( decimal ){
		if(Number(decimal) < 0 || decimal === undefined ){ return 0; }
		var arr = decimal.split(':');
		return Number(arr[0])*3600+Number(arr[1])*60+Number(arr[2]);
	}
	
}); // end utils


