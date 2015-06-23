/* 
*	name: Vi2.Assessment
*	author: niels.seidel@nise81.com
* license: BSD New
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 further options:
	- zeitliche trennung von frage und antwort
	- wiederholung der frage erlauben
	- ...
*/

var Assessment = $.inherit(Annotation, /** @lends Vi2.Assessment# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters	
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'assessment',
		type : 'annotation',
		options : {selector: '#overlay', vizOnTimeline: true, path: '/'},
		timelineSelector : 'div.vi2-video-seek',

		/* ... */
		init : function(ann){  
			var _this = this;
			
			var comments = $('<ul></ul>').addClass('assessmentlist'); 
			var li = function(author, title, target, time, id){ 
				var userIcon = new Image();
				$(userIcon)
				//	.attr('src', _this.options.path+'icon.png')
					.addClass('assessment-user-icon');
				var a = $('<a></a>')
					//.append(userIcon)
					.append(title)
					.attr('author', author)
					//.attr('href', '#'+vi2.observer.options.id)
					.addClass('id-'+time)
					.click(function(){
						vi2.observer.log('clickassessmentfromlist:'+title +' '+author+' '+time+' '+id);
						vi2.observer.player.currentTime(time);
					});			
				var user = vi2.db.getUserById(author);	
				return $('<li></li>')
					.attr('id', 't'+time)
					.attr('author', author)
					.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text('Frage von '+user.firstname+' '+user.name);} })
					.addClass('assessment-user-icon list-item')
					//.css('list-style-image',  "url('"+_this.options.path+"user-"+author+".png')")
					.html(a);
			};
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){ 
				if(val.type == 'assessment'){ 
					var obj = JSON.parse( decodeURIComponent( val.title ) ); 
					var x = li(val.author, obj.question, obj.target, this.t1, this.t1, val.date)
					comments.append(x);
					//alert($(x).html())
					e.tags.push({name: obj.question, occ:val.t1}); 
				}
			});
			
			this.showQuestionsOnTimeline(e);
			
			// sort list entries by time and append them
			comments.find('li').tsort({attr:"id"}); 
			$('#assessment').html(comments);		
			
						
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
					.text(decodeURIComponent(val.title))
					.appendTo( vi2.dom )
					; 
			});
		},
				
		/* ... */
		begin : function(e, id, obj){ 
			obj = JSON.parse( decodeURIComponent( obj.content.title ) );  
			var _this = this;
			var question_selector = 'vi2assessment'+id;
			vi2.observer.player.pause();
			vi2.observer.log('assessmentdisplaybegin');
			//{"question":"bimel","answ":[{"id":"answ0","answ":"hier"},{"id":"answ1","answ":"we"},{"id":"answ2","answ":"go"}],"correct":"answ2"}
			var o = $('<div></div>')
				.attr('id', 'vi2assessment')
				.addClass(question_selector)
				.html('')
				.show();
				
			var quest = $('<h2></h2>')
				.addClass('assessment-question')
				.text(''+obj.question);	
			var answ = $('<div></div>')
				.addClass('assessment-answers');
			
			// fill in answers box
			if(obj.answ.length == 1 && obj.answ[0].questiontype == 'fill-in'){ 
				var answer = $('<div></div>')
					.attr('id', 'answ0')
  				.addClass('assessment-answer')
  				.append('<textarea name="quest"></textarea>')
  				.append('<br/>')
  				.appendTo(answ);
			}else{ // mc answer options
				$.each(obj.answ, function(i, val){ 
					var answer = $('<div></div>')
						.attr('id', val.id)
						.addClass('assessment-answer')
						.append('<input type="checkbox" name="quest" value="1" />')
						.append(val.answ)
						.click(function(){ $(this).find('input[type="checkbox"]').attr('checked',true) })
						.append('<br/>')
						.appendTo(answ);
				});
			}	
			
			var solve = $('<div></div>')
				.addClass('assessment-btn')
				.text('abschicken')
				.button()
				.click(function(){
					$('.assessment-btn').hide();
					vi2.observer.log('submitassessmenttask:'+id);
					_this.evaluateAnswer('.'+question_selector, obj)
				});
				
			$(o).append(quest).append(answ).append(solve); 
			$(this.options.selector).append(o);
	
			/*
			if(this.currImgId == obj.content.target){
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
		
		
		/* ... */
		evaluateAnswer : function(question_selector, obj){
			if(obj.answ[0].questiontype == 'fill-in'){
				$(question_selector).append($('<p>Vielen Dank für die Bearbeitung der Frage.</p>').addClass('assessment-msg-correct'));
			}else{ 
				var one_checked = false, correct = true;
				obj.checked = [];
				$('.assessment-msg-warning').hide();
				$('.assessment-answers').find('div.assessment-answer').each(function(i, val){
					if($(this).find("input[name='quest']:checked").val() == 1){
						obj.checked.push($(this).text())
						one_checked = true;
						$.each(obj.correct, function(j, corr){ 
							if(corr == $(val).attr('id')){	
								obj.correct[j] = true; 
							}
						});
					}
				});
			
				// VALIDATION
				if( ! one_checked ){
					//vi2.observer.log('[call:run_assessment, result:empty_selection]'); 
					//alert('pls select one');
					$(question_selector).append($('<p>Bitte wählen Sie eine Antwortoption</p>').addClass('assessment-msg-warning'));
					$('.assessment-btn').show();
					return false;
				}
			
				// CORRECT?
				$.each(obj.correct, function(i, val){ 
					if( val != true ) {
						vi2.observer.log('assessmentwrong');
						correct = false;
					}
				});
				if(correct == true){
					vi2.observer.log('assessmentcorrect');
					$(question_selector).append($('<p>Ihre Antwort ist richtig.</p>').addClass('assessment-msg-correct'));
					//vi2.observer.log('[call:run_assessment, result:correct]');
				}else{ // wrong
					//vi2.observer.log('[call:run_assessment, result:wrong]');
					 
					$(question_selector).append($('<p>Ihre Antwort ist leider falsch.</p>').addClass('assessment-msg-wrong'));
				}
			}
			// save result to node
			obj.type = obj.answ[0].questiontype;
			var result = {
				correct: correct,
				question : encodeURIComponent(obj.question),
				answ : obj.answ,
				res : obj.type == 'mc' ? encodeURIComponent(obj.checked) : encodeURIComponent($('.assessment-answers').find('textarea').val()),
				videoid : vi2.currentVideo
			}; 
			var question_result = {
		  	from : vi2.wp_user, // the user that answered the question
		  	to : obj.author, // the author of the question
		  	date : (new Date()).getTime(),
		  	type : 'test-result',
		  	read : false, 
		  	replied: false,
		  	title : 'Result: '+encodeURIComponent(obj.question),
		  	content : result 
    	};
			$.post('/messages', {"data":question_result}, function(res){ 
        //alert('Has been saved: '+ JSON.stringify(res)); 
    	});
		
			// proceed	
			$(question_selector).append($('<div></div>').addClass('assessment-btn-proceed').text('proceed playback').button().click(function(){
				$(question_selector).remove();
				vi2.observer.log('[call:finish_assessment]');
				vi2.observer.player.play();
			}))
		},
		
		getLogTime : function(){
			var date = new Date();
			var s = date.getSeconds();
			var mi =date.getMinutes();
			var h = date.getHours();
			var d = date.getDate();
    	var m = date.getMonth()+1;
    	var y = date.getFullYear();
    	return date.getTime()+', ' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d)+', '+(h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds();
			//return date.getTime();
		},
		
		
		/** 
		*	Displays questions on timeline
		*/
		showQuestionsOnTimeline : function(e){
			if(! this.options.vizOnTimeline ){ return; }
			var _this= this; 
				// display tag occurence on timeline to motivate further selection
				var f = function(_left, _name){
					var sp = $('<span></span>');					
					sp.addClass('timetag taccessment').attr('style','left:'+(_left-3)+'px;')
						.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text(_name);} });
						
					return sp;
				};
				//				
				$.each(e.tags, function(i, val){
					var progress = this.occ / vi2.observer.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width()); 
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector).append(f(progress, val.name));
 				});
		},
		
		
		/**
		* Util function to convert seconds into decimal notation. XXX hours missing 
		*	@param {Number} Time in seconds
		*	@returns {String} Time as decimal notation  
		*/		
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "-" + seconds;
		}
		
	}); // end class Comments
