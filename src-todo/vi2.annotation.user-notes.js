/* 
* name: Vi2.UserNotes
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - 
*/


Vi2.UserNotes = $.inherit(/** @lends Vi2.UserNotes# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'user-notes',
		type : 'player-widget',
		options : {
			selector : '.user-notes',
			videoSelector : '#video1',
			e:''
		},
		textarea : '',
		line_time_map : []

		/**
		* Initializes the table of content and handles options
		*/
		init : function(){
			var _this = this;
			// add container with textarea
			var container = $('<div></div>')
				.addClass('user-notes-controls')
				.appendTo( this.options.selector );
				
			this.textarea = $('<textarea style="position:absolute; top:300px; right:0; width:300px; height:100px; font-size:14px; padding:5px 10px;"></textarea>')
				.addClass('user-notes')
				.appendTo( container );
			var tracker = $('<div class="tracker">xxx</div>').appendTo( container );	
			
			this.textarea.bind('keyup focus', function(){
				$(tracker).text( _this.getCurrentLine(this) );
			});
			
		},
		
		
		/**
		* Returns the current line number of the give textarea
		*/	
		getCurrentLineNumber : function (textarea) { //alert(22)
			return textarea.value.substr(0, textarea.selectionStart).split("\n").length;
		},


		/**
		* Returns the content of the current line of the given textarea
		*/
		getCurrentLine : function (textarea) { //alert(22)
			return textarea.value.split("\n")[ this.getCurrentLineNumber( textarea ) - 1 ];
		}

	
}); // end class  















