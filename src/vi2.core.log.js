	/* Log
	author: niels.seidel@nise81.com
	 
	 
	Input:
	* client IP Adress via PHP
	* client browser, operating system, 
	* time in ms since 1970	
	* clicks: tags, category, startpage, lecture 
	* search terms
	* video: seek on timeline, link clicks, seek2link, toc clicks
	* 
	
	Output options
	* debug
	* log.txt via PHP
	 
	*/

	var Log = $.inherit(/** @lends Log# */{

		/** 
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
  			// get client IP
  			$.ajax({
  				url: this.options.logger_path,
   				success: function(res){ 
						_this.ip = res.ip;
					},
  				dataType: 'json'
				});			
				// clear
				$('#debug').html('');
		},
		
		name : 'log',
		options : {output: 'logfile', debug_selector: '#debug', logfile:'log.txt', parameter: 'time,ip,msg,user', logger_path: '../php/ip.php'}, // output: debug/logfile
		bucket : '',
		ip : '',
	
		/* ... */
		init : function(){},		
		
		/* -- */
		add : function(msg){
			var logEntry = this.getLogTime()+', '+this.getIP()+', '+msg+', '+this.getUser()+'\n';
			
			// handle output
			switch(this.options.output){
				case 'debug' :
					$(this.options.debug_selector).append(logEntry);
					break;
				case 'logfile' :
					this.writeLog(logEntry);
					break;
			}
			
			// fill bucket for internal usage	
			this.bucket += logEntry;
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
    	return date.getTime()+', ' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d)+', '+(h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds();
			//return date.getTime();
		},
		
		/* -- */
		getIP : function(){
			return this.ip;
		},
						
		/* -- */
		getUser : function(){
		 var ua = $.browser; //return '';
  		return	navigator.userAgent;
		},
		
		/* -- */
		writeLog : function (entry){
			$.post('php/log.php', { entry:entry }); 
		}					
				
	
		
	}); // end class Log
