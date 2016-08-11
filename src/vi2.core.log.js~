/* 
*	name: Vi2.Log
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 further options:
	** standardisazion:
	* https://sites.google.com/site/camschema/home
	* http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/cam_sjtu/CamInstance.js
	* http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/html5Video/videoGadget.xml
	*/

	Vi2.Log = $.inherit(/** @lends Log# */{

		/** 
		*	Input:
		* 	client IP Adress via server side request
		* 	client browser, operating system, 
		* 	time in ms since 1970	
		* 	clicks: tags, category, startpage, lecture 
		* 	search terms
		* 	video: seek on timeline, link clicks, seek2link, toc clicks
		* 
		* Output options:
		* 	dom #debug
		* 	log.txt via PHP
		* 	console.log (default)
		*
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*		@param {String} options.output Output channel that could be a 'logfile' or a 'debug' panel
		*		@param {Selector} options.debug_selector If options.output is set to debug at following DOM selector will used to output log data
		*		@param {String} options.logfile If options.output is set to logfile that option indicates the filename of the logfile
		*		@param {String} options.parameter Its a comma separated list of data parameters that should be logged. Possible values are: time, ip, msg, user
		*		@param {object} options.logger_path Relative path to a remote script that writes text messages to options.file
		*/
  	__constructor : function(options) { 
  			var _this = this;
  			this.options = $.extend(this.options, options); 
  			this.userAgent = this.getUserAgent();
  			// get client IP
  			if(this.options.logger_path !== '-1'){ 
					$.ajax({
						url: this.options.logger_path,
		 				success: function(res){ 
							_this.ip = res.ip;
						},
						dataType: 'json'
					});
				}				
				// clear
				$('#debug').html('');
		},
		
		name : 'log',
		options : {
			output: 'logfile', 
			debug_selector: '#debug', 
			prefix: '', 
			logfile:'log.txt', 
			parameter: 'time,ip,msg,user', 
			logger_path: '-1'//'../php/ip.php'
		}, // output: debug/logfile
		bucket : '',
		ip : '',
	
		/* ... */
		init : function(){},		
		
		/* -- */
		add : function(msg){
			//var logEntry = this.getLogTime()+', '+this.options.prefix+', '+this.getIP()+', '+msg+', '+this.getUserAgent()+'\n';
			
			//var logEntry = this.getLogTime()+', '+vi2.currentVideo+', '+', '+vi2.currentGroup+', '+vi2.userData.id+', '+msg+', '+this.getUserAgent()+'\n'; 
			//'clickcommentfromlist:'+val.name +' '+val.author+' '+ val.time 
			if(typeof msg === 'string'){
				console.log('warning: uncaptured log emtrie: ' +msg);
				return;
			}else{
				//console.log(msg.context);
			}
			var 
				pt = vi2.observer.player.currentTime();
				t = new Date()
				;
			t = t.getTime();
			
			var logEntry = {
				utc: 								t, 
				//phase: 						vi2.current,
				//date:  						String, 
				//time:  						String, 
				//group:  					vi2.currentGroup, 
				user:  						vi2.userData.id,   
				//user_name:  			String,
				//user_gender:			String,
				//user_culture:			String,
				//user_session:			Number,
				video_id:  				vi2.currentVideo,
				//video_file:  			String,
				//video_length:  		String,
				//video_language:  	String,
				action: msg,  /*{
					context: msg.context,
					action: msg.action,
					values: msg.values
				},						*/
				playback_time:		pt === undefined ? -1 : pt,
				user_agent:  			this.getUserAgent()
				//ip: 							String,
			
			};
			
			this.writeLog( logEntry );
			
			return;
		},
		
		/* -- */
		getLogs : function(){
			return this.bucket;
		},
		
		/* -- */
		getLogTime : function(){
			var date = new Date();
			var s = date.getSeconds();
			var mi =date.getMinutes();
			var h = date.getHours();
			var d = date.getDate();
    	var m = date.getMonth()+1;
    	var y = date.getFullYear();
    	//return date.getTime()+', ' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d)+', '+(h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds();
			return { 
				utc: date.getTime(), 
				date: y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d),
				time: (h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds()
			};	
		},
		
		/* -- */
		getIP : function(){
			return this.ip;
		},
						
		/* -- */
		getUserAgent : function(){
		 var ua = $.browser; 
  		return	navigator.userAgent.replace(/,/g,';');
		},
		
		/* -- */
		writeLog : function (entry){ 
			//$.post('php/log.php', { entry:entry });
			if(this.options.logger_path !== '-1'){ 
				$.post(this.options.logger_path, { data: entry }, function(data){}); 
			}
		}					
				
	
		
	}); // end class Log
	
