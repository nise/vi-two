/* 
*	name: Vi2.Assessment
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- zeitliche trennung von frage und antwort
	- wiederholung der frage erlauben
	- ...
*/

Vi2.Assessment = $.inherit( Vi2.Annotation, /** @lends Vi2.Assessment# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters	
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'assessment',
		type : 'annotation',
		options : { 
			displaySelector: '#overlay',
			hasTimelineMarker: true,
		  timelineSelector : '.vi2-timeline-top', 
			hasMenu : true,
			menuSelector: '#assessment',
			allowComments : true,
			allowEditing : true,
			allowCreation : true, 
			path: '/static/img/user-icons/'
		 },

		/* ... */
		init : function(ann){  
			var _this = this;
			var events = []; 
			$.each(ann, function(i, val){  
				if(val.type === 'assessment' && val.title !== '' ){ 
					//var obj = JSON.parse( decodeURIComponent( val.title ) );  
					events.push({ 
						name: val.title,
						occ:[val.t1],
						time:[val.t1], 
						author: val.author, 
						date: val.date 
					}); 
				}
			}); 
			
			// show comments in a menu
			if( this.options.hasMenu ){
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'assessment', events, this.options.timelineSelector );
			}		
					
		},
		
		
		/*
		**/
		createMenu : function( assessmentData ){
			var _this = this;
			$(this.options.menuSelector).empty();
			var assess = $('<ul></ul>')
				.addClass('assessment-list')
				.appendTo( this.options.menuSelector )
				;
			$.each( assessmentData, function(i, val){
				var user = vi2.db.getUserById(val.author);	
				
				var header = $('<span></span>')
					.addClass('assessment-header');
					
				$('<span></span>')
					//.text( user.firstname +' '+user.name )
					.text( user.username )
					.addClass('assessment-user')
					.appendTo( header )
					;  
				header.append(' ' + moment(Number(val.date), "x").fromNow() );	
				
				
				var userIcon = new Image();
				$(userIcon)
				//	.attr('src', _this.options.path+'icon.png')
					.addClass('assessment-user-icon');
				var a = $('<a></a>')
					//.append(userIcon)
					.append( val.name.question )
					.attr('author', val.author)
					//.attr('href', '#'+vi2.observer.options.id)
					.addClass('id-'+ val.time+' assessment-menu-question')
					.click(function(){
						vi2.observer.log({context:'assessment', action:'menu-click', values:[ val.name.question, val.author, val.time ]});
						vi2.observer.player.currentTime( val.time );
					});			
				
				var li = $('<li></li>')
					.attr('id', 't'+ val.time)
					.attr('author', val.author)
					.addClass('list-item')
					//.css('list-style-image',  "url('"+_this.options.path+"user-"+author+".png')")
					.html( header )
					.append( a )
					.appendTo( assess )
					;	
				
				// edit
				if( _this.options.allowEditing && Number(val.author) === Number(vi2.wp_user) ){	 
					var edit_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-pencil' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'assessment')
						.data('annotationdata', { 
							content: val.name, 
							time: val.time[0], 
							date: val.date,
							author: val.author 
						} )
						.appendTo( header )
						;
				}		
				
			});	
			// sort list entries by time and append them
			assess.find('li').tsort({attr:"id"}); 
			
		},							
		
		appendToDOM : function(id){ 
			var _this = this; 
			$(vi2.dom).find('[type="assessment"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getAssessmentById(id), function( i, val ){  
				var toc = $('<div></div>')
					.attr('type',"assessment")
					.attr('starttime', val.start)
					//.attr('data', val.start)
					.attr('duration', 10)
					.attr('author', val.author)
					.attr('date', val.date)
					.attr('id', "assessment-"+i)
					.data('task', val.title )
					.appendTo( vi2.dom )
					; 
			});
		},
		
			/*
		**/
		updateDOMElement : function( obj ){ 
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]') // .date
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.data('task', obj.content )
				;
		},
		
		
		/*
		* { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
		**/
		addDOMElement : function( obj ){ 
			$('<div></div>')
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.data('task', obj.content )
				.appendTo( vi2.dom )
				;
		},			
		
				
		/* ... */
		begin : function(e, id, obj){ 
			$('body').unbind('keydown'); 
			 
			var _this = this;
			var question_selector = 'vi2assessment'+id; 
			vi2.observer.player.pause();
			vi2.observer.log({context:'assessment', action:'display-question',values:[encodeURIComponent(obj.content.title.question), obj.author, vi2.observer.player.currentTime() ]});
			//{"question":"bimel","answ":[{"id":"answ0","answ":"hier"},{"id":"answ1","answ":"we"},{"id":"answ2","answ":"go"}],"correct":"answ2"}
			var o = $('<div></div>')
				.attr('id', 'vi2assessment')
				.addClass(question_selector)
				.html('')
				.show();
				
			var head = $('<h3></h3>')
				.text('Testfrage');
			var quest = $('<div></div>')
				.addClass('assessment-question')
				.text(''+obj.content.title.question);	
			var answ = $('<div></div>')
				.addClass('assessment-answers');
			
			
			if( obj.content.title.answ.length > 0 ){
				
				if(obj.content.title.answ.length === 1 && obj.content.title.answ[0].questiontype === 'fi'){
					// fill in answers box 
					var answer = $('<div></div>')
						.attr('id', 'answ0')
						.addClass('assessment-answer')
						.append('<textarea name="quest"></textarea>')
						.append('<br/>')
						.appendTo(answ);
				}else{ 
					// mc answer options
					$.each(obj.content.title.answ, function(i, val){
						var answer = $('<div></div>')
							.attr('id', val.id)
							.addClass('assessment-answer')
							.append( $('<input type="checkbox" name="quest" value="1" />').attr('id', val.id))
							.append(val.answ)
							.click(function(){ 
								$(this).find('input[type="checkbox"]').trigger('click'); 
							})	
							.append('<br/>')
							.appendTo(answ);
							
					});
				}
			}		
			
			var solve = $('<button></button>')
				.addClass('btn btn-default assessment-btn')
				.text('abschicken')
				.click(function(){
					$(this).hide();					
					_this.evaluateAnswer('.'+question_selector, obj.content.title, obj.author);
				});
			
			// skip test
			var skip = $('<a></a>')
				.text(' Frage überspringen')
				.click(function(){
					$(question_selector).remove();
					vi2.observer.log({context:'assessment', action:'skip-question',values:[ encodeURIComponent(obj.content.title.question), obj.author, vi2.observer.player.currentTime() ]});
					vi2.observer.player.play();
					$('body').unbind('keydown').bind('keydown', function(e) { 
						vi2.observer.player.keyboardCommandHandler(e); 
					});
				});
				
			$(o).append(head).append(quest).append(answ).append(solve).append(skip); 
			$(this.options.displaySelector).append(o);
	
			/*
			if(this.currImgId === obj.content.target){
				return false;
			}else{
				// reset highlight
				$(this.options.selector+' li').each(function(i){ $(this).removeClass('highcomment');})
				// highlight comment entry
				$(this.options.selector+' li#t'+this.formatTime(obj.content.target)).addClass('highcomment');
			}
			*/
		},
	
		/* ... */
		end : function(e, id){ 
			$('.vi2assessment'+id).remove();
		},
		
		
		/* 
		* This function gets called in order to fill a user dialog with a form in order to define assessment task (multiple choice and fill-in text. 
		* * {"content":{"question":"Eine Frage","answ":[{"id":"answ78","answ":"Antwort a","questiontype":"mc"},{"id":"answ32","answ":"Antwort b","questiontype":"mc"},{"id":"answ43","answ":"Antwort c","questiontype":"mc"}],"correct":["answ43"]},"time":["300"],"date":"1386505607283"}
  	**/
		createAnnotationForm : function(json){ 
			
			if( json.content === '' ){ // form with existing data
				json = {
					time: vi2.observer.player.currentTime(),
					date: (new Date().getTime()),
					author : vi2.wp_user,
					content: {
						question:'', 
						answ:[], 
						correct:[], 
						time: vi2.observer.player.currentTime(), 
						date: (new Date().getTime())
					}	
				}; 
			}
			
			var question = $('<textarea></textarea>')
				.attr('id', 'annotationQuestion')
				.val(json.content.question);
			var answer_box = $('<div></div>').attr('id','answerbox');
		
				var ii = 0;
				var add = $('<div></div>')
					.append( $('<span></span>').addClass('glyphicon glyphicon-plus ') ) // glyphicon glyphicon-list
					.addClass('mc-question add-btn')
					.append(' Multiple-Choice-Antwort hinzufügen')
					.click(function(){
						var rm = $('<span></span>')
							.addClass('close-btn glyphicon glyphicon-remove-circle')
							.attr('title', 'Antwortoption entfernen')
							.click(function(){ 
								$(this).parent().remove();
								if($('.answer').length === 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').hide();
									$('.mc-question').show();
								}	
							})
							;
						$('.fi-question').hide();	
						var idd = 'answ'+Math.ceil(Math.random()*100);
						var answ = $('<div></div>')
							.attr('id', idd)
							.addClass('answer')
							.append('<input id="'+idd+'" type="checkbox" title="Setze ein Häckchen für richtige Lösungen" name="quest" value="1" />')
							.append('<input id="'+idd+'" type="text" class="mc-option" value=""/>')
							.append(rm)
							.append('<br/>');
						ii++;
						answer_box.append(answ);
					});
			
				// fill in questions
				var add2 = $('<div></div>')
					.append( $('<span></span>').addClass('glyphicon glyphicon-align-left') ) // glyphicon glyphicon-list
					.addClass('fi-question  add-btn')
					.append(' Freitext-Antwort hinzufügen')
					.click(function(){
						var rm = $('<span></span>')
							.addClass('close-btn glyphicon glyphicon-remove-circle')
							.attr('title', 'Lösung entfernen')
							.click(function(){ 
								$(this).parent().remove();
								if($('.answer').length === 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').hide();
									$('.mc-question').hide();
								}	
							})
							;
						$('.mc-question').hide();
						$('.fi-question').hide();
						var answ = $('<div></div>')
							.attr('id', 'answ'+Math.ceil(Math.random()*100))
							.addClass('answer fi-answer')
							.append($('<label></label>').text('Lösung:'))
							.append('<textarea></textarea>')
							.append(rm)
							.append('<br/>');
						ii++;
						answer_box.append(answ);
					});	
		
		
		
			// handle existing answers
			if( json.content.answ.length > 0 ){
				if(json.content.answ[0].questiontype === 'mc'){
					// add existing answers
					$.each(json.content.answ, function(i, val){ 
						var rm = $('<span></span>')
							.addClass('close-btn glyphicon glyphicon-remove-circle')
							.attr('title', 'Antwortoption entfernen')
							.click(function(){ 
								$(this).parent().remove(); 
								if($('.answer').length === 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').hide();
									$('.mc-question').show();
								}
							});
						var checkbox = $('<input type="checkbox" title="Setze ein Häckchen für richtige Lösungen" name="quest" value="1" />')
							.attr('id', val.id);
							
						if( json.content.correct.indexOf( val.id ) !== -1 ){
//							checkbox.attr('checked', 'checked');
							checkbox.attr('checked', true);
						}	
						var answ = $('<div></div>')
							.attr('id', val.id)
							.addClass('answer')
							.append(checkbox)
							.append($('<input type="text" class="mc-option" />')
								.attr('id', val.id)
								.val(val.answ)
							)
							.append(rm)
							.append('<br/>')
							.appendTo(answer_box)
							;
					}); 
				}else if(json.content.answ[0].questiontype === 'fi'){ 
					var rm = $('<span></span>')
						.addClass('close-btn glyphicon glyphicon-remove-circle')
						.attr('title', 'Lösung entfernen')
						.click(function(){ 
							$(this).parent().remove();
							if($('.answer').length === 0){
								$('.fi-question').show();
								$('.mc-question').show();
							}else{
								$('.fi-question').hide();
								$('.mc-question').hide();
							}
						})
						;
					var answ = $('<div></div>')
							.attr('id', 'answ'+Math.ceil(Math.random()*100))
							.addClass('answer fi-answer')
							.append($('<label></label>').text('Lösung:'))
							.append($('<textarea></textarea>').val(json.content.answ[0].answ))
							.append(rm)
							.append('<br/>')
							.appendTo(answer_box)
							;	 
				}
			}
			/*jshint multistr: true */
			var time_field = "\
				<div class='input-group'>\
					<span class='input-group-addon' id='hyperlinks-form3'>Zeitpunkt (s)</span>\
					<input type='text' class='form-control' value='" + json.time + "' name='assessment-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='hyperlinks-form3'>\
				</div>";
		
			var form =  $('<div></div>')
			.addClass('questionanswers')
			.append($('<label></label>').text('Frage:'))
			.append(question)
			.append(answer_box)
			.append(add)
			.append(add2)
			.append( time_field )
			;
			
			if( json.content.answ !== undefined){
				if( json.content.answ[0] !== undefined  && json.content.answ[0].questiontype === 'mc'){
					add2.hide();
				}
			
				if( json.content.answ[0] !== undefined  && json.content.answ[0].questiontype === 'fi'){
					add.hide();
					add2.hide();
				}
			}	
			return form;
			
		},
		
		
		
		/*
		* todo: 
		*  - check data types: string, number, decimal-time, ... from .data('datatype', 'decimal-time')
		*  - change messages
		**/
		validateAnnotationForm : function(selector, type){ 
			var textarea_flag = 0, textinput_flag = 0, msg = '', sum_checked = 0, sum_checkbox = 0;
			
			
			// validate textareas
			$(selector).find('#annotationQuestion').each(function(i,val){
				if(String($(val).val()).length < 2){
					$(val).addClass( 'validation-conflict' );
					textarea_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textarea_flag){
				msg += "<br> Definieren Sie bitte einen Text für diese Frage.";
			}
			
			if( $('#answerbox').find('div').length === 0 ) {
				msg += '<br> Bitte definieren Sie für diese Frage entsprechende Antwortoptionen oder Lösungen.';
			}else{
				// if its a fill-in task
				$('#answerbox').find('textarea').each(function(i,val){
					if(String($(val).val()).length < 2){
						$(val).addClass( 'validation-conflict' );
						textarea_flag = true;
					}else{
						$(val).removeClass( 'validation-conflict' );
					}
				});
				if(textarea_flag){
					msg += "<br> Definieren Sie bitte die Lösung zu der Frage.";
				}
				
				//alert($('#answerbox').find('input[type=text]').length)
				// validate input fields
				$('#answerbox').find('input[type=text]').each(function(i,val){
					if($(val).val() === ''){
						$(val).addClass( 'validation-conflict' );
						textinput_flag = true;
					}else{
						$(val).removeClass( 'validation-conflict' );
					}
				});
				if(textinput_flag){
					msg += "<br> Versehen Sie bitte jede Antwortoption mit einem Text.";
				}
		
				// validate checkboxes
				if($('#answerbox').find('input[type=checkbox]').length > 0 && $('#answerbox').find('input:checked').length === 0){ 
					$('#answerbox').find('input[type=checkbox]').addClass( 'validation-conflict' );
					msg += "<br> Mindestens eine Antwortoption sollte als richtig markiert werden.";
				}else{
					$('#answerbox').find('input[type=checkbox]').removeClass( 'validation-conflict' );
				}
			}
			
			// final output of validation messages
			if(String(msg).length === 0){ 
				return msg; 
			}else{ 
				console.log('Validation Error:' + msg); 
				return msg;
			}
		},
		
		
		/*
		* example: {"content":{"question":"Eine Frage","answ":[{"id":"answ78","answ":"Antwort a","questiontype":"mc"},{"id":"answ32","answ":"Antwort b","questiontype":"mc"},{"id":"answ43","answ":"Antwort c","questiontype":"mc"}],"correct":["answ43"]},"time":["300"],"date":"1386505607283"}
		**/
		getAnnotationFormData : function( selector ){
			var obj = {
				time : $( selector ).find('[name="assessment-entry-time"]').val(),
				content : {
					question : $('#annotationQuestion').val(),
					time : $('#annotationTime').attr('value'),
					date : String( new Date().getTime() ),
					answ : [],
					correct : []
				}	
			};
			// get fill-in solution
			$('#answerbox').find('textarea').each(function(i,val){
					obj.content.answ[i] = { id: $(val).attr('id'), answ: $(val).val(), questiontype:"fi" };
			});
			
			// get multiple choice answer options
			$('#answerbox').find('input[type=text]').each(function(i,val){ 
					obj.content.answ[i] = { id: $(val).attr('id'), answ: $(val).val(), questiontype:"mc" };	
			});
			
			
			// find correct answers
			$('#answerbox').find(':checked').each(function(i, val){ 
					obj.content.correct.push( $(val).attr('id') );
			});
			return obj;
			/*
			{	"content": {
					"question":"Eine Frage",
					"answ": [
						{"id":"answ78","answ":"Antwort a","questiontype":"mc"}
					],
					"correct":["answ43"]},
					"time":["300"],
					"date":"1386505607283"
				}
			*/
			//return obj;
		},
		
		
		
		
		
		
		/*
		* Evaluates the quizz results provided by the user. 
		**/
		evaluateAnswer : function(question_selector, obj, author){
			var one_checked = false, correct = [];
			if(obj.answ[0].questiontype === 'fi'){ //alert($('#answ0').find('textarea').val())
				if( String($('#answ0 > textarea').val()).length > 3){
					correct.push(true);
					vi2.observer.log({context:'assessment', action:'submited-answer',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime(), encodeURIComponent($('.assessment-answers').find('textarea').val()) ]});
					$(question_selector)
						.append($('<p><strong>Vielen Dank für die Bearbeitung der Frage. Folgende Musterlösung wurde für diese Frage hinterlegt:</strong></p>'))
						.addClass('assessment-msg-correct');
					$('<div></div>')
						.text( obj.answ[0].answ )
						.addClass('correct-answ')
						.appendTo(question_selector)
						;
				}		
			}else{ 
				
				obj.checked = [];
				$('.assessment-msg-warning').hide();
				$('div.assessment-answers').find("input[type='checkbox']:checked").each(function(i, val){ 
					
					obj.checked.push( $(val).attr('id') );
					one_checked = true;
					if( obj.correct.indexOf( $(val).attr('id') ) > -1 ){
						correct.push(true); 
					}else{
						correct.push(false); 
					}
				});
			
				// check whether a option has been selected
				if( ! one_checked ){
					//vi2.observer.log('[call:run_assessment, result:empty_selection]'); 
					$(question_selector)
						.append($('<p>Bitte wählen Sie eine Antwortoption</p>')
						.addClass('assessment-msg-warning'));
					$('.assessment-btn').show();
					return false;
				}
			
				
				// log event
				vi2.observer.log({context:'assessment', action:'submited-answer',values:[ encodeURIComponent(obj.question), author, vi2.observer.player.currentTime(), (obj.checked).toString() ]});
				
				// give feedback to the user
				if( correct.indexOf(false) === -1){
					vi2.observer.log({context:'assessment', action:'submited-correct-result',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime() ]});
					$(question_selector).append($('<p>Ihre Antwort ist richtig.</p>').addClass('assessment-msg-correct'));
				}else{ // wrong
					vi2.observer.log({context:'assessment', action:'submited-incorrect-result',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime() ]});
					$(question_selector).append($('<p>Ihre Antwort ist leider falsch.</p>').addClass('assessment-msg-wrong'));
				}
			}
			// save result to node
			obj.type = obj.answ[0].questiontype;
			
			var question_result = {
		  	from : vi2.wp_user, // the user that answered the question
		  	//to : obj.author, // the author of the question // bug xxx
		  	date : (new Date()).getTime(),
		  	type : 'test-result',
		  	read : false, 
		  	replied: false,
		  	title : 'Result: '+encodeURIComponent(obj.question),
		  	content : {
					correct: correct,
					question : encodeURIComponent(obj.question),
					answ : obj.answ,
					res : obj.type === 'mc' ? encodeURIComponent(obj.checked) : encodeURIComponent($('.assessment-answers').find('textarea').val()),
					videoid : vi2.currentVideo
				} 
    	};
			/*
			$.post('/messages', {"data":question_result}, function(res){ 
        //alert('Has been saved: '+ JSON.stringify(res)); 
    	});
    	*/
		
			// proceed	
			var proceed = $('<button></button>')
				.addClass('btn btn-default')
				.text('Video fortsetzen')
				.click(function(){
					$(question_selector).remove();
					vi2.observer.log({context:'assessment', action:'continue-playback',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime() ]});
					vi2.observer.player.play();
					$('body').unbind('keydown').bind('keydown', function(e) { 
						vi2.observer.player.keyboardCommandHandler(e); 
					});
				})
				.appendTo( question_selector )
				;
				
		}
		
	
		
	}); // end class Comments
