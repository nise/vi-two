/* Metadata
	
	- integrate it as a widget
	*/
var Metadata = $.inherit(/** @lends Metadata# */
	{
			/** 
			*		@constructs 
			*		@param {object} options An object containing the parameters
			*/
  		__constructor : function(options) {
  			if(options){
	  			this.options = $.extend(this.options, options);
  			}
  			this.render();
  		},
  		
  		// defaults
  		options : {selector:'#metadata', author: 'Niels Seidel', title: 'An Interactive Video', category: 'Prototype', date: '2011/06/01', rating: 5, titleselector:'.header'},
  		labels : {author: 'Author:', title: 'Title:', category: 'Category:', date: 'Date:', rating: 'Rating:'},
  		
  		/* ... */
  		render : function(){
  			var _this = this;
  			var data = $('<div></div>')
  			$.each(this.labels, function(i, val){
  				data.append('<strong>'+val+'</strong> '+_this.options[i]+'</br>');
  			});	
  			$('.meta-title').html(this.options.title);
  			$('.meta-desc').html(this.options.author);

  			
  			//$(this.options.selector).html(data);
  			//$(this.options.selector).append(this.options.author);
  		}

});

