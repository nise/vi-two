	/* Comments
	author: niels.seidel@nise81.com
	
	further options:
	- zeitliche trennung von frage und antwort
	- wiederholung der frage erlauben
	- ...
	*/


	/* class Comments **/ 
	var Assessment = $.inherit(/** @lends Assessment# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters	
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'assessment',
		options : {selector: '#overlay', vizOnTimeline: true},
		player : null,
		timelineSelector : 'div.vi2-video-seek',

		/* ... */
		init : function(ann){  
			var _this = this;
			
			var comments = $('<ul></ul>').addClass('assessmentlist'); 
			var li = function(title, target, time, id){
				var a = $('<a></a>')
					.text(title)
					.attr('href', '#'+main.options.id)
					.addClass('id-'+id)
					.click(function(){
						_this.player.currentTime(time);
					});				
				return $('<li></li>').attr('id', 't'+target).html(a);
			};
			var e = {}; e.tags = []; e.tags.occ = [];
			$.each(ann, function(i, val){ 
				if(val.type == 'assessment'){ 
					var obj = JSON.parse( decodeURIComponent( val.title ) ); 
					comments.append(li(obj.question /* +' ('+_this.formatTime(val.t1).replace(/-/, ':')+')'*/, _this.formatTime(val.t1), val.t1, val.date));
					e.tags.push({name: obj.question, occ:val.t1}); 
				}
			});

			this.showTimelineComments(e);
			
			// sort list entries by time and append them
			comments.find('li').tsort({attr:"id"}); 
			$('#assessment').html(comments);		
			
						
		},							
				
		/* ... */
		begin : function(e, id, obj){ 
			obj = JSON.parse( decodeURIComponent( obj.content.title ) );
			var _this = this;
			var question_selector = 'vi2assessment'+id;
			main.player.pause();
			main.log('[call:run_assessment, result:open]');
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
				
			$.each(obj.answ, function(i, val){ 
				var answer = $('<div></div>')
					.attr('id', val.id)
  				.addClass('assessment-answer')
  				.append('<input type="radio" name="quest" value="1" />')
  				.append(val.answ)
  				.click(function(){ $(this).find('input[type="radio"]').attr('checked',true) })
  				.append('<br/>')
  				.appendTo(answ);
			});
			// if fill in text answers
			if(obj.answ.length == 0){ 
				var answer = $('<div></div>')
					.attr('id', 'answ0')
  				.addClass('assessment-answer')
  				.append('<textarea name="quest"></textarea>')
  				.append('<br/>')
  				.appendTo(answ);
			}
			
			var solve = $('<div></div>')
				.addClass('assessment-btn')
				.text('abschicken')
				.button()
				.click(function(){
					$('.assessment-btn').hide();
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
			main.log('[call:abort_assessment]');
		},
		
		
		/* ... */
		evaluateAnswer : function(question_selector, obj){ 
			var one_checked = false, correct = false;
			$('.assessment-msg-warning').hide();
			$('.assessment-answers').find('div.assessment-answer').each(function(i, val){
				if($(this).find("input[name='quest']:checked").val() == 1){
					one_checked = true;
					
					if(obj.correct == $(this).attr('id')){
						correct = true;
						//alert('richtig');
						$(question_selector).append($('<p>richtig</p>').addClass('assessment-msg-correct'));
						main.log('[call:run_assessment, result:correct]');
					}
				}
			});
			if( ! one_checked ){
				main.log('[call:run_assessment, result:empty_selection]'); 
				//alert('pls select one');
				$(question_selector).append($('<p>Bitte wählen Sie eine Antwortoption</p>').addClass('assessment-msg-warning'));
				$('.assessment-btn').show();
				return false;
			}
			if( ! correct ){
				main.log('[call:run_assessment, result:wrong]');
				//alert('wrong'); 
				$(question_selector).append($('<p>falsch</p>').addClass('assessment-msg-wrong'));
			}
			// proceed	
			$(question_selector).append($('<div></div>').addClass('assessment-btn-proceed').text('proceed playback').button().click(function(){
				$(question_selector).remove();
				main.log('[call:finish_assessment]');
				main.player.play();
			}))
		},
		
		
		/* ... */
		showTimelineComments : function(e){
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
					var progress = this.occ / _this.player.duration();
					progress = ((progress) * $(_this.timelineSelector).width()); 
  	    	if (isNaN(progress) || progress > $(_this.timelineSelector).width()) { return;}
	 				$(_this.timelineSelector).append(f(progress, val.name));
 				});
		},
		
		
		/* ... */		
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "-" + seconds;
		}
		
	}); // end class Comments
