/*	Utils
		author: niels.seidel@nise81.com

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
