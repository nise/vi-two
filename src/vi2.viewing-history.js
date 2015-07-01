/* 
* name: Vi2.ViewingHistory
* author: niels.seidel@nise81.com
* license: BSD New
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  
*/


Vi2.ViewingHistory = $.inherit(/** @lends Vi2.ViewingHistory# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'viewing history',
		type : 'portal-widget',
		options : {
			selector : '.viewing-history',
			route: '/viewing-history',
			label : 'viewing hisory'
		},
		history_log : [],


		/**
		* Initializes the 
		*/
		init : function(){
			var _this = this;
			// event binding
			$(vi2.observer).bind('stream.loaded', function(e, data, i){ alert(data.time);
				data.time = timeDifference(data.time.toString(), '');  
				_this.history_log.push(data);
			});
			
			// add path to the video manager
			vi2.videoManager.addRoute( this.options.route, this, 'renderHistory'); 
		},
		
		
		/*
		*
		**/
		renderHistory : function(){
			var html = vi2.videoManager.render('vi2.viewing-history.ejs', { items: this.history_log } );
			$( this.options.selector ).html(html);
		}
}); // end class  
