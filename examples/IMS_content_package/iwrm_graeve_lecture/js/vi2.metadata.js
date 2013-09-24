/*****************************************/
	/* Metadata
	
	- integrate it as a widget
	*/
var Metadata = $.inherit(
	{
			/**/
  		__constructor : function(options) {
  			this.options = $.extend(this.options, options);
  			this.render();
  		},
  		
  		// defaults
  		options : {selector:'#metadata', author: 'Niels Seidel', title: 'An Interactive Video', category: 'Prototype', date: '2011/06/01', rating: 5, titleselector:''},
  		labels : {author: 'Author:', title: 'Title:', category: 'Category:', date: 'Date:', rating: 'Rating:'},
  		
  		/**/
  		render : function(){
  			var _this = this;
  			var data = $('<div></div>')
  			$.each(this.labels, function(i, val){
  				data.append('<strong>'+val+'</strong> '+_this.options[i]+'</br>');
  			});	
  			$(this.options.titleselector).html(this.options.author+': '+this.options.title);
  			$(this.options.selector).html(data);
  		},

});

