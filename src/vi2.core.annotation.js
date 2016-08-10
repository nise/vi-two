/* 
*	name: Vi2.Assessment
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Abstract class for video annotations
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- include hourse at format time
*/

 
Vi2.Annotation = $.inherit(/** @lends Annotation# */{

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
		
		
		/*
			* 
			**/
		animation : function(selector, effect){
			$( selector ).animate({
				left: 100
			}, {
				duration: 1000
				
			});
		},
		
		/*
		* todo: 
		*  - check data types: string, number, decimal-time, ... from .data('datatype', 'decimal-time')
		*  - change messages
		**/
		validateAnnotationForm : function(selector, type){ 
			var textarea_flag = 0, textinput_flag = 0, msg = '', sum_checked = 0, sum_checkbox = 0;
			
			// validate input fields
			$(selector).find('input[type=text]').each(function(i,val){
				if($(val).val() === ''){
					$(val).addClass( 'validation-conflict' );
					textinput_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textinput_flag){
				msg += "\n Versehen Sie bitte die/das Textfeld/er mit einem Text.";
			}
			
			// validate textareas
			$(selector).find('textarea').each(function(i,val){
				if(String($(val).val()).length < 2){
					$(val).addClass( 'validation-conflict' );
					textarea_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textarea_flag){
				msg += "\n Definieren Sie bitte einen Text für das Textfeld.";
			}
			
			// validate checkboxes
			if($(selector).find('input[type=checkbox]').length > 0 && $(selector).find('input:checked').length === 0){ 
				$(selector).find('input[type=checkbox]').addClass( 'validation-conflict' );
				msg =+ "\n Mindestens eine Antwortoption sollte als richtig markiert werden.";
			}else{
				$(selector).find('input[type=checkbox]').removeClass( 'validation-conflict' );
			}
			
			if(String(msg).length === 0){ 
				return msg; 
			}else{ 
				console.log('Validation Error:' + msg); 
				return msg;
			}
		},
		
		
		/*
		* Formats time from seconds to decimal mm:ss
		* @todo: include hours
		**/		
		formatTime : function(secs, delimiter){
			delimiter = delimiter ? delimiter : '';
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + delimiter + seconds;
		}
		
	}); // end class Annotation
