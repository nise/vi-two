/**
 * Inheritance plugin
 *
 * Copyright (c) 2009 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 1.1.1
 */

(function($) {

var hasIntrospection = (function(){_}).toString().indexOf('_') > -1,
	emptyBase = function() {};

$.inherit = function() {

	var withMixins = $.isArray(arguments[0]),
		hasBase = $.isFunction(arguments[0]) || withMixins,
		base = hasBase? withMixins? arguments[0][0] : arguments[0] : emptyBase,
		props = arguments[hasBase? 1 : 0] || {},
		staticProps = arguments[hasBase? 2 : 1],
		result = props.__constructor || base.prototype.__constructor?
			function() {
				this.__constructor.apply(this, arguments);
			} : function() {};

	if(!hasBase) {
		result.prototype = props;
		result.prototype.__self = result.prototype.constructor = result;
		return $.extend(result, staticProps);
	}

	var inheritance = function() {};

	$.extend(result, base, staticProps);

	inheritance.prototype = base.prototype;
	result.prototype = new inheritance();
    var resultPtp = result.prototype;
	resultPtp.__self = resultPtp.constructor = result;

	var propList = [];
	$.each(props, function(i) {
		props.hasOwnProperty(i) && propList.push(i);
	});
	// fucking ie hasn't toString, valueOf in for
	$.each(['toString', 'valueOf'], function() {
		props.hasOwnProperty(this) && $.inArray(this, propList) == -1 && propList.push(this);
	});

	var basePtp = base.prototype;
	$.each(propList, function() {
		if(hasBase
			&& $.isFunction(basePtp[this]) && $.isFunction(props[this])
			&& (!hasIntrospection || props[this].toString().indexOf('.__base') > -1)) {

			(function(methodName) {
				var baseMethod = basePtp[methodName],
					overrideMethod = props[methodName];
				resultPtp[methodName] = function() {
					var baseSaved = this.__base;
					this.__base = baseMethod;
					var result = overrideMethod.apply(this, arguments);
					this.__base = baseSaved;
					return result;
				};
			})(this);

		}
		else {
			resultPtp[this] = props[this];
		}
	});

	if(withMixins) {
		var i = 1, mixins = arguments[0], mixin, __constructors = [];
		while(mixin = mixins[i++]) {
			$.each(mixin.prototype, function(propName) {
				if(propName == '__constructor') {
					__constructors.push(this);
				}
				else if(propName != '__self') {
					resultPtp[propName] = this;
				}
			});
		}
		if(__constructors.length > 0) {
			resultPtp.__constructor && __constructors.push(resultPtp.__constructor);
			resultPtp.__constructor = function() {
				var i = 0, __constructor;
				while(__constructor = __constructors[i++]) {
					__constructor.apply(this, arguments);
				}
			};
		}
	}

	return result;

};

})(jQuery);
(function($){$.toJSON=function(o)
{if(typeof(JSON)=='object'&&JSON.stringify)
return JSON.stringify(o);var type=typeof(o);if(o===null)
return"null";if(type=="undefined")
return undefined;if(type=="number"||type=="boolean")
return o+"";if(type=="string")
return $.quoteString(o);if(type=='object')
{if(typeof o.toJSON=="function")
return $.toJSON(o.toJSON());if(o.constructor===Date)
{var month=o.getUTCMonth()+1;if(month<10)month='0'+month;var day=o.getUTCDate();if(day<10)day='0'+day;var year=o.getUTCFullYear();var hours=o.getUTCHours();if(hours<10)hours='0'+hours;var minutes=o.getUTCMinutes();if(minutes<10)minutes='0'+minutes;var seconds=o.getUTCSeconds();if(seconds<10)seconds='0'+seconds;var milli=o.getUTCMilliseconds();if(milli<100)milli='0'+milli;if(milli<10)milli='0'+milli;return'"'+year+'-'+month+'-'+day+'T'+
hours+':'+minutes+':'+seconds+'.'+milli+'Z"';}
if(o.constructor===Array)
{var ret=[];for(var i=0;i<o.length;i++)
ret.push($.toJSON(o[i])||"null");return"["+ret.join(",")+"]";}
var pairs=[];for(var k in o){var name;var type=typeof k;if(type=="number")
name='"'+k+'"';else if(type=="string")
name=$.quoteString(k);else
continue;if(typeof o[k]=="function")
continue;var val=$.toJSON(o[k]);pairs.push(name+":"+val);}
return"{"+pairs.join(", ")+"}";}};$.evalJSON=function(src)
{if(typeof(JSON)=='object'&&JSON.parse)
return JSON.parse(src);return eval("("+src+")");};$.secureEvalJSON=function(src)
{if(typeof(JSON)=='object'&&JSON.parse)
return JSON.parse(src);var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered))
return eval("("+src+")");else
throw new SyntaxError("Error parsing JSON, source is not valid.");};$.quoteString=function(string)
{if(string.match(_escapeable))
{return'"'+string.replace(_escapeable,function(a)
{var c=_meta[a];if(typeof c==='string')return c;c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}
return'"'+string+'"';};var _escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;var _meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};})(jQuery);/*
* jQuery TinySort - A plugin to sort child nodes by (sub) contents or attributes.
*
* Version: 1.0.4
*
* Copyright (c) 2008 Ron Valstar
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
* description
*   - A plugin to sort child nodes by (sub) contents or attributes.
*
* Usage:
*   $("ul#people>li").tsort();
*   $("ul#people>li").tsort("span.surname");
*   $("ul#people>li").tsort("span.surname",{order:"desc"});
*   $("ul#people>li").tsort({place:"end"});
*
* Change default like so:
*   $.tinysort.defaults.order = "desc";
*
* in this update:
*	- changed setArray to pushStack
*
* in last update:
*	- tested with jQuery 1.4.1
*	- correct isNum return
*
* Todos
*   - fix mixed literal/numeral values
*   - determine if I have to use pushStack or pushStack
*
*/
;(function($) {
	// default settings
	$.tinysort = {
		 id: "TinySort"
		,version: "1.0.4"
		,defaults: {
			 order: "asc"	// order: asc, desc or rand
			,attr: ""		// order by attribute value
			,place: "start"	// place ordered elements at position: start, end, org (original position), first
			,returns: false	// return all elements or only the sorted ones (true/false)
		}
	};
	$.fn.extend({
		tinysort: function(_find,_settings) {
			if (_find&&typeof(_find)!="string") {
				_settings = _find;
				_find = null;
			}

			var oSettings = $.extend({}, $.tinysort.defaults, _settings);

			var oElements = {}; // contains sortable- and non-sortable list per parent
			this.each(function(i) {
				// element or sub selection
				var mElm = (!_find||_find=="")?$(this):$(this).find(_find);
				// text or attribute value
				var sSort = oSettings.order=="rand"?""+Math.random():(oSettings.attr==""?mElm.text():mElm.attr(oSettings.attr));
				// to sort or not to sort
				var mParent = $(this).parent();
				if (!oElements[mParent]) oElements[mParent] = {s:[],n:[]};	// s: sort, n: not sort
				if (mElm.length>0)	oElements[mParent].s.push({s:sSort,e:$(this),n:i}); // s:string, e:element, n:number
				else				oElements[mParent].n.push({e:$(this),n:i});
			});
			//
			// sort
			for (var sParent in oElements) {
				var oParent = oElements[sParent];
				oParent.s.sort(
					function zeSort(a,b) {
						var x = a.s.toLowerCase?a.s.toLowerCase():a.s;
						var y = b.s.toLowerCase?b.s.toLowerCase():b.s;
						if (isNum(a.s)&&isNum(b.s)) {
							x = parseFloat(a.s);
							y = parseFloat(b.s);
						}
						return (oSettings.order=="asc"?1:-1)*(x<y?-1:(x>y?1:0));
					}
				);
			}
			//
			// order elements and fill new order
			var aNewOrder = [];
			for (var sParent in oElements) {
				var oParent = oElements[sParent];
				var aOrg = []; // list for original position
				var iLow = $(this).length;
				switch (oSettings.place) {
					case "first": $.each(oParent.s,function(i,obj) { iLow = Math.min(iLow,obj.n) }); break;
					case "org": $.each(oParent.s,function(i,obj) { aOrg.push(obj.n) }); break;
					case "end": iLow = oParent.n.length; break;
					default: iLow = 0;
				}
				var aCnt = [0,0]; // count how much we've sorted for retreival from either the sort list or the non-sort list (oParent.s/oParent.n)
				for (var i=0;i<$(this).length;i++) {
					var bSList = i>=iLow&&i<iLow+oParent.s.length;
					if (contains(aOrg,i)) bSList = true;
					var mEl = (bSList?oParent.s:oParent.n)[aCnt[bSList?0:1]].e;
					mEl.parent().append(mEl);
					if (bSList||!oSettings.returns) aNewOrder.push(mEl.get(0));
					aCnt[bSList?0:1]++;
				}
			}
			//
			return this.pushStack(aNewOrder); // pushStack or pushStack?
		}
	});
	// is numeric
	function isNum(n) {
		var x = /^\s*?[\+-]?(\d*\.?\d*?)\s*?$/.exec(n);
		return x&&x.length>0?x[1]:false;
	};
	// array contains
	function contains(a,n) {
		var bInside = false;
		$.each(a,function(i,m) {
			if (!bInside) bInside = m==n;
		});
		return bInside;
	};
	// set functions
	$.fn.TinySort = $.fn.Tinysort = $.fn.tsort = $.fn.tinysort;
})(jQuery);
/*
 * jQuery Tooltip plugin 1.3
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-tooltip/
 * http://docs.jquery.com/Plugins/Tooltip
 *
 * Copyright (c) 2006 - 2008 Jörn Zaefferer
 *
 * $Id: jquery.tooltip.js 5741 2008-06-21 15:22:16Z joern.zaefferer $
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
 
;(function($) {
	
		// the tooltip element
	var helper = {},
		// the current tooltipped element
		current,
		// the title of the current element, used for restoring
		title,
		// timeout id for delayed tooltips
		tID;
		// IE 5.5 or 6
		var IE = false;
		if( $.browser != undefined){ 
			IE = $.browser.msie && /MSIE\s(5\.5|6\.)/.test(navigator.userAgent);
		}else {
			
		}
		// flag for mouse tracking
		var track = false;
	
	$.tooltip = {
		blocked: false,
		defaults: {
			delay: 200,
			fade: false,
			showURL: true,
			extraClass: "",
			top: 15,
			left: 15,
			id: "tooltip"
		},
		block: function() {
			$.tooltip.blocked = !$.tooltip.blocked;
		}
	};
	
	$.fn.extend({
		tooltip: function(settings) {
			settings = $.extend({}, $.tooltip.defaults, settings);
			createHelper(settings);
			return this.each(function() {
					$.data(this, "tooltip", settings);
					this.tOpacity = helper.parent.css("opacity");
					// copy tooltip into its own expando and remove the title
					this.tooltipText = this.title;
					$(this).removeAttr("title");
					// also remove alt attribute to prevent default tooltip in IE
					this.alt = "";
				})
				.mouseover(save)
				.mouseout(hide)
				.click(hide);
		},
		fixPNG: IE ? function() {
			return this.each(function () {
				var image = $(this).css('backgroundImage');
				if (image.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
					image = RegExp.$1;
					$(this).css({
						'backgroundImage': 'none',
						'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
					}).each(function () {
						var position = $(this).css('position');
						if (position != 'absolute' && position != 'relative')
							$(this).css('position', 'relative');
					});
				}
			});
		} : function() { return this; },
		unfixPNG: IE ? function() {
			return this.each(function () {
				$(this).css({'filter': '', backgroundImage: ''});
			});
		} : function() { return this; },
		hideWhenEmpty: function() {
			return this.each(function() {
				$(this)[ $(this).html() ? "show" : "hide" ]();
			});
		},
		url: function() {
			return this.attr('href') || this.attr('src');
		}
	});
	
	function createHelper(settings) {
		// there can be only one tooltip helper
		if( helper.parent )
			return;
		// create the helper, h3 for title, div for url
		helper.parent = $('<div id="' + settings.id + '"><h3></h3><div class="body"></div><div class="url"></div></div>')
			// add to document
			.appendTo(document.body)
			// hide it at first
			.hide();
			
		// apply bgiframe if available
		if ( $.fn.bgiframe )
			helper.parent.bgiframe();
		
		// save references to title and url elements
		helper.title = $('h3', helper.parent);
		helper.body = $('div.body', helper.parent);
		helper.url = $('div.url', helper.parent);
	}
	
	function settings(element) {
		return $.data(element, "tooltip");
	}
	
	// main event handler to start showing tooltips
	function handle(event) {
		// show helper, either with timeout or on instant
		if( settings(this).delay )
			tID = setTimeout(show, settings(this).delay);
		else
			show();
		
		// if selected, update the helper position when the mouse moves
		track = !!settings(this).track;
		$(document.body).bind('mousemove', update);
			
		// update at least once
		update(event);
	}
	
	// save elements title before the tooltip is displayed
	function save() {
		// if this is the current source, or it has no title (occurs with click event), stop
		if ( $.tooltip.blocked || this == current || (!this.tooltipText && !settings(this).bodyHandler) )
			return;

		// save current
		current = this;
		title = this.tooltipText;
		
		if ( settings(this).bodyHandler ) {
			helper.title.hide();
			var bodyContent = settings(this).bodyHandler.call(this);
			if (bodyContent.nodeType || bodyContent.jquery) {
				helper.body.empty().append(bodyContent)
			} else {
				helper.body.html( bodyContent );
			}
			helper.body.show();
		} else if ( settings(this).showBody ) {
			var parts = title.split(settings(this).showBody);
			helper.title.html(parts.shift()).show();
			helper.body.empty();
			for(var i = 0, part; (part = parts[i]); i++) {
				if(i > 0)
					helper.body.append("<br/>");
				helper.body.append(part);
			}
			helper.body.hideWhenEmpty();
		} else {
			helper.title.html(title).show();
			helper.body.hide();
		}
		
		// if element has href or src, add and show it, otherwise hide it
		if( settings(this).showURL && $(this).url() )
			helper.url.html( $(this).url().replace('http://', '') ).show();
		else 
			helper.url.hide();
		
		// add an optional class for this tip
		helper.parent.addClass(settings(this).extraClass);

		// fix PNG background for IE
		if (settings(this).fixPNG )
			helper.parent.fixPNG();
			
		handle.apply(this, arguments);
	}
	
	// delete timeout and show helper
	function show() {
		tID = null;
		if ((!IE || !$.fn.bgiframe) && settings(current).fade) {
			if (helper.parent.is(":animated"))
				helper.parent.stop().show().fadeTo(settings(current).fade, current.tOpacity);
			else
				helper.parent.is(':visible') ? helper.parent.fadeTo(settings(current).fade, current.tOpacity) : helper.parent.fadeIn(settings(current).fade);
		} else {
			helper.parent.show();
		}
		update();
	}
	
	/**
	 * callback for mousemove
	 * updates the helper position
	 * removes itself when no current element
	 */
	function update(event)	{
		if($.tooltip.blocked)
			return;
		
		if (event && event.target.tagName == "OPTION") {
			return;
		}
		
		// stop updating when tracking is disabled and the tooltip is visible
		if ( !track && helper.parent.is(":visible")) {
			$(document.body).unbind('mousemove', update)
		}
		
		// if no current element is available, remove this listener
		if( current == null ) {
			$(document.body).unbind('mousemove', update);
			return;	
		}
		
		// remove position helper classes
		helper.parent.removeClass("viewport-right").removeClass("viewport-bottom");
		
		var left = helper.parent[0].offsetLeft;
		var top = helper.parent[0].offsetTop;
		if (event) {
			// position the helper 15 pixel to bottom right, starting from mouse position
			left = event.pageX + settings(current).left;
			top = event.pageY + settings(current).top;
			var right='auto';
			if (settings(current).positionLeft) {
				right = $(window).width() - left;
				left = 'auto';
			}
			helper.parent.css({
				left: left,
				right: right,
				top: top
			});
		}
		
		var v = viewport(),
			h = helper.parent[0];
		// check horizontal position
		if (v.x + v.cx < h.offsetLeft + h.offsetWidth) {
			left -= h.offsetWidth + 20 + settings(current).left;
			helper.parent.css({left: left + 'px'}).addClass("viewport-right");
		}
		// check vertical position
		if (v.y + v.cy < h.offsetTop + h.offsetHeight) {
			top -= h.offsetHeight + 20 + settings(current).top;
			helper.parent.css({top: top + 'px'}).addClass("viewport-bottom");
		}
	}
	
	function viewport() {
		return {
			x: $(window).scrollLeft(),
			y: $(window).scrollTop(),
			cx: $(window).width(),
			cy: $(window).height()
		};
	}
	
	// hide helper and restore added classes and the title
	function hide(event) {
		if($.tooltip.blocked)
			return;
		// clear timeout if possible
		if(tID)
			clearTimeout(tID);
		// no more current element
		current = null;
		
		var tsettings = settings(this);
		function complete() {
			helper.parent.removeClass( tsettings.extraClass ).hide().css("opacity", "");
		}
		if ((!IE || !$.fn.bgiframe) && tsettings.fade) {
			if (helper.parent.is(':animated'))
				helper.parent.stop().fadeTo(tsettings.fade, 0, complete);
			else
				helper.parent.stop().fadeOut(tsettings.fade, complete);
		} else
			complete();
		
		if( settings(this).fixPNG )
			helper.parent.unfixPNG();
	}
	
})(jQuery);
//fgnass.github.com/spin.js#v1.2.4
(function(window, document, undefined) {

/**
 * Copyright (c) 2011 Felix Gnass [fgnass at neteye dot de]
 * Licensed under the MIT license
 */

  var prefixes = ['webkit', 'Moz', 'ms', 'O']; /* Vendor prefixes */
  var animations = {}; /* Animation rules keyed by their name */
  var useCssAnimations;

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div');
    var n;

    for(n in prop) {
      el[n] = prop[n];
    }
    return el;
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++) {
      parent.appendChild(arguments[i]);
    }
    return parent;
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = function() {
    var el = createEl('style');
    ins(document.getElementsByTagName('head')[0], el);
    return el.sheet || el.styleSheet;
  }();

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-');
    var start = 0.01 + i/lines*100;
    var z = Math.max(1-(1-alpha)/trail*(100-start) , alpha);
    var prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase();
    var pre = prefix && '-'+prefix+'-' || '';

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:'+z+'}' +
        start + '%{opacity:'+ alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail)%100 + '%{opacity:'+ alpha + '}' +
        '100%{opacity:'+ z + '}' +
        '}', 0);
      animations[name] = 1;
    }
    return name;
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   **/
  function vendor(el, prop) {
    var s = el.style;
    var pp;
    var i;

    if(s[prop] !== undefined) return prop;
    prop = prop.charAt(0).toUpperCase() + prop.slice(1);
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop;
      if(s[pp] !== undefined) return pp;
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop) {
      el.style[vendor(el, n)||n] = prop[n];
    }
    return el;
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i];
      for (var n in def) {
        if (obj[n] === undefined) obj[n] = def[n];
      }
    }
    return obj;
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = {x:el.offsetLeft, y:el.offsetTop};
    while((el = el.offsetParent)) {
      o.x+=el.offsetLeft;
      o.y+=el.offsetTop;
    }
    return o;
  }

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    color: '#000',        // #rgb or #rrggbb
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: 'auto',          // center vertically
    left: 'auto'          // center horizontally
  };

  /** The constructor */
  var Spinner = function Spinner(o) {
    if (!this.spin) return new Spinner(o);
    this.opts = merge(o || {}, Spinner.defaults, defaults);
  };

  Spinner.defaults = {};
  Spinner.prototype = {
    spin: function(target) {
      this.stop();
      var self = this;
      var o = self.opts;
      var el = self.el = css(createEl(0, {className: o.className}), {position: 'relative', zIndex: o.zIndex});
      var mid = o.radius+o.length+o.width;
      var ep; // element position
      var tp; // target position

      if (target) {
        target.insertBefore(el, target.firstChild||null);
        tp = pos(target);
        ep = pos(el);
        css(el, {
          left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : o.left+mid) + 'px',
          top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : o.top+mid)  + 'px'
        });
      }

      el.setAttribute('aria-role', 'progressbar');
      self.lines(el, self.opts);

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0;
        var fps = o.fps;
        var f = fps/o.speed;
        var ostep = (1-o.opacity)/(f*o.trail / 100);
        var astep = f/o.lines;

        !function anim() {
          i++;
          for (var s=o.lines; s; s--) {
            var alpha = Math.max(1-(i+s*astep)%f * ostep, o.opacity);
            self.opacity(el, o.lines-s, alpha, o);
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps));
        }();
      }
      return self;
    },
    stop: function() {
      var el = this.el;
      if (el) {
        clearTimeout(this.timeout);
        if (el.parentNode) el.parentNode.removeChild(el);
        this.el = undefined;
      }
      return this;
    },
    lines: function(el, o) {
      var i = 0;
      var seg;

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.width>>1) + 'px'
        });
      }
      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, i, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        });
        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}));
        ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')));
      }
      return el;
    },
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val;
    }
  };

  /////////////////////////////////////////////////////////////////////////
  // VML rendering for IE
  /////////////////////////////////////////////////////////////////////////

  /**
   * Check and init VML support
   */
  !function() {
    var s = css(createEl('group'), {behavior: 'url(#default#VML)'});
    var i;

    if (!vendor(s, 'transform') && s.adj) {

      // VML support detected. Insert CSS rules ...
      for (i=4; i--;) sheet.addRule(['group', 'roundrect', 'fill', 'stroke'][i], 'behavior:url(#default#VML)');

      Spinner.prototype.lines = function(el, o) {
        var r = o.length+o.width;
        var s = 2*r;

        function grp() {
          return css(createEl('group', {coordsize: s +' '+s, coordorigin: -r +' '+-r}), {width: s, height: s});
        }

        var margin = -(o.width+o.length)*2+'px';
        var g = css(grp(), {position: 'absolute', top: margin, left: margin});

        var i;

        function seg(i, dx, filter) {
          ins(g,
            ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
              ins(css(createEl('roundrect', {arcsize: 1}), {
                  width: r,
                  height: o.width,
                  left: o.radius,
                  top: -o.width>>1,
                  filter: filter
                }),
                createEl('fill', {color: o.color, opacity: o.opacity}),
                createEl('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          );
        }

        if (o.shadow) {
          for (i = 1; i <= o.lines; i++) {
            seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)');
          }
        }
        for (i = 1; i <= o.lines; i++) seg(i);
        return ins(el, g);
      };
      Spinner.prototype.opacity = function(el, i, val, o) {
        var c = el.firstChild;
        o = o.shadow && o.lines || 0;
        if (c && i+o < c.childNodes.length) {
          c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild;
          if (c) c.opacity = val;
        }
      };
    }
    else {
      useCssAnimations = vendor(s, 'animation');
    }
  }();

  window.Spinner = Spinner;

})(window, document);
/* jTemplates 0.7.8 (http://jtemplates.tpython.com) Copyright (c) 2009 Tomasz Gloc */
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('a(37.b&&!37.b.38){(9(b){6 m=9(s,A,f){5.1M=[];5.1u={};5.2p=E;5.1N={};5.1c={};5.f=b.1m({1Z:1f,3a:1O,2q:1f,2r:1f,3b:1O,3c:1O},f);5.1v=(5.f.1v!==F)?(5.f.1v):(13.20);5.Y=(5.f.Y!==F)?(5.f.Y):(13.3d);5.3e(s,A);a(s){5.1w(5.1c[\'21\'],A,5.f)}5.1c=E};m.y.2s=\'0.7.8\';m.R=1O;m.y.3e=9(s,A){6 2t=/\\{#14 *(\\w*?)( .*)*\\}/g;6 22,1x,M;6 1y=E;6 2u=[];2v((22=2t.3N(s))!=E){1y=2t.1y;1x=22[1];M=s.2w(\'{#/14 \'+1x+\'}\',1y);a(M==-1){C j Z(\'15: m "\'+1x+\'" 2x 23 3O.\');}5.1c[1x]=s.2y(1y,M);2u[1x]=13.2z(22[2])}a(1y===E){5.1c[\'21\']=s;c}N(6 i 24 5.1c){a(i!=\'21\'){5.1N[i]=j m()}}N(6 i 24 5.1c){a(i!=\'21\'){5.1N[i].1w(5.1c[i],b.1m({},A||{},5.1N||{}),b.1m({},5.f,2u[i]));5.1c[i]=E}}};m.y.1w=9(s,A,f){a(s==F){5.1M.B(j 1g(\'\',1,5));c}s=s.U(/[\\n\\r]/g,\'\');s=s.U(/\\{\\*.*?\\*\\}/g,\'\');5.2p=b.1m({},5.1N||{},A||{});5.f=j 2A(f);6 p=5.1M;6 1P=s.1h(/\\{#.*?\\}/g);6 16=0,M=0;6 e;6 1i=0;6 25=0;N(6 i=0,l=(1P)?(1P.V):(0);i<l;++i){6 17=1P[i];a(1i){M=s.2w(\'{#/1z}\');a(M==-1){C j Z("15: 3P 1Q 3f 1z.");}a(M>16){p.B(j 1g(s.2y(16,M),1,5))}16=M+11;1i=0;i=b.3Q(\'{#/1z}\',1P);1R}M=s.2w(17,16);a(M>16){p.B(j 1g(s.2y(16,M),1i,5))}6 3R=17.1h(/\\{#([\\w\\/]+).*?\\}/);6 26=I.$1;2B(26){q\'3S\':++25;p.27();q\'a\':e=j 1A(17,p);p.B(e);p=e;D;q\'J\':p.27();D;q\'/a\':2v(25){p=p.28();--25}q\'/N\':q\'/29\':p=p.28();D;q\'29\':e=j 1n(17,p,5);p.B(e);p=e;D;q\'N\':e=2a(17,p,5);p.B(e);p=e;D;q\'1R\':q\'D\':p.B(j 18(26));D;q\'2C\':p.B(j 2D(17,5.2p));D;q\'h\':p.B(j 2E(17));D;q\'2F\':p.B(j 2G(17));D;q\'3T\':p.B(j 1g(\'{\',1,5));D;q\'3U\':p.B(j 1g(\'}\',1,5));D;q\'1z\':1i=1;D;q\'/1z\':a(m.R){C j Z("15: 3V 2H 3f 1z.");}D;2I:a(m.R){C j Z(\'15: 3W 3X: \'+26+\'.\');}}16=M+17.V}a(s.V>16){p.B(j 1g(s.3Y(16),1i,5))}};m.y.K=9(d,h,z,H){++H;6 $T=d,2b,2c;a(5.f.3b){$T=5.1v(d,{2d:(5.f.3a&&H==1),1S:5.f.1Z},5.Y)}a(!5.f.3c){2b=5.1u;2c=h}J{2b=5.1v(5.1u,{2d:(5.f.2q),1S:1f},5.Y);2c=5.1v(h,{2d:(5.f.2q&&H==1),1S:1f},5.Y)}6 $P=b.1m({},2b,2c);6 $Q=(z!=F)?(z):({});$Q.2s=5.2s;6 19=\'\';N(6 i=0,l=5.1M.V;i<l;++i){19+=5.1M[i].K($T,$P,$Q,H)}--H;c 19};m.y.2J=9(1T,1o){5.1u[1T]=1o};13=9(){};13.3d=9(3g){c 3g.U(/&/g,\'&3Z;\').U(/>/g,\'&3h;\').U(/</g,\'&3i;\').U(/"/g,\'&40;\').U(/\'/g,\'&#39;\')};13.20=9(d,1B,Y){a(d==E){c d}2B(d.2K){q 2A:6 o={};N(6 i 24 d){o[i]=13.20(d[i],1B,Y)}a(!1B.1S){a(d.41("2L"))o.2L=d.2L}c o;q 42:6 o=[];N(6 i=0,l=d.V;i<l;++i){o[i]=13.20(d[i],1B,Y)}c o;q 2M:c(1B.2d)?(Y(d)):(d);q 43:a(1B.1S){a(m.R)C j Z("15: 44 45 23 46.");J c F}2I:c d}};13.2z=9(2e){a(2e===E||2e===F){c{}}6 o=2e.47(/[= ]/);a(o[0]===\'\'){o.48()}6 2N={};N(6 i=0,l=o.V;i<l;i+=2){2N[o[i]]=o[i+1]}c 2N};6 1g=9(2O,1i,14){5.2f=2O;5.3j=1i;5.1d=14};1g.y.K=9(d,h,z,H){6 2g=5.2f;a(!5.3j){6 2P=5.1d;6 $T=d;6 $P=h;6 $Q=z;2g=2g.U(/\\{(.*?)\\}/g,9(49,3k){1C{6 1D=10(3k);a(1E 1D==\'9\'){a(2P.f.1Z||!2P.f.2r){c\'\'}J{1D=1D($T,$P,$Q)}}c(1D===F)?(""):(2M(1D))}1F(e){a(m.R){a(e 1G 18)e.1j="4a";C e;}c""}})}c 2g};6 1A=9(L,1H){5.2h=1H;L.1h(/\\{#(?:J)*a (.*?)\\}/);5.3l=I.$1;5.1p=[];5.1q=[];5.1I=5.1p};1A.y.B=9(e){5.1I.B(e)};1A.y.28=9(){c 5.2h};1A.y.27=9(){5.1I=5.1q};1A.y.K=9(d,h,z,H){6 $T=d;6 $P=h;6 $Q=z;6 19=\'\';1C{6 2Q=(10(5.3l))?(5.1p):(5.1q);N(6 i=0,l=2Q.V;i<l;++i){19+=2Q[i].K(d,h,z,H)}}1F(e){a(m.R||(e 1G 18))C e;}c 19};2a=9(L,1H,14){a(L.1h(/\\{#N (\\w+?) *= *(\\S+?) +4b +(\\S+?) *(?:12=(\\S+?))*\\}/)){L=\'{#29 2a.3m 3n \'+I.$1+\' 2H=\'+(I.$2||0)+\' 1Q=\'+(I.$3||-1)+\' 12=\'+(I.$4||1)+\' u=$T}\';c j 1n(L,1H,14)}J{C j Z(\'15: 4c 4d "3o": \'+L);}};2a.3m=9(i){c i};6 1n=9(L,1H,14){5.2h=1H;5.1d=14;L.1h(/\\{#29 (.+?) 3n (\\w+?)( .+)*\\}/);5.3p=I.$1;5.x=I.$2;5.W=I.$3||E;5.W=13.2z(5.W);5.1p=[];5.1q=[];5.1I=5.1p};1n.y.B=9(e){5.1I.B(e)};1n.y.28=9(){c 5.2h};1n.y.27=9(){5.1I=5.1q};1n.y.K=9(d,h,z,H){1C{6 $T=d;6 $P=h;6 $Q=z;6 1r=10(5.3p);6 1U=[];6 1J=1E 1r;a(1J==\'3q\'){6 2R=[];b.1e(1r,9(k,v){1U.B(k);2R.B(v)});1r=2R}6 u=(5.W.u!==F)?(10(5.W.u)):(($T!=E)?($T):({}));6 s=1V(10(5.W.2H)||0),e;6 12=1V(10(5.W.12)||1);a(1J!=\'9\'){e=1r.V}J{a(5.W.1Q===F||5.W.1Q===E){e=1V.4e}J{e=1V(10(5.W.1Q))+((12>0)?(1):(-1))}}6 19=\'\';6 i,l;a(5.W.1W){6 2S=s+1V(10(5.W.1W));e=(2S>e)?(e):(2S)}a((e>s&&12>0)||(e<s&&12<0)){6 1K=0;6 3r=(1J!=\'9\')?(4f.4g((e-s)/12)):F;6 1s,1k;N(;((12>0)?(s<e):(s>e));s+=12,++1K){1s=1U[s];a(1J!=\'9\'){1k=1r[s]}J{1k=1r(s);a(1k===F||1k===E){D}}a((1E 1k==\'9\')&&(5.1d.f.1Z||!5.1d.f.2r)){1R}a((1J==\'3q\')&&(1s 24 2A)){1R}6 3s=u[5.x];u[5.x]=1k;u[5.x+\'$3t\']=s;u[5.x+\'$1K\']=1K;u[5.x+\'$3u\']=(1K==0);u[5.x+\'$3v\']=(s+12>=e);u[5.x+\'$3w\']=3r;u[5.x+\'$1U\']=(1s!==F&&1s.2K==2M)?(5.1d.Y(1s)):(1s);u[5.x+\'$1E\']=1E 1k;N(i=0,l=5.1p.V;i<l;++i){1C{19+=5.1p[i].K(u,h,z,H)}1F(2T){a(2T 1G 18){2B(2T.1j){q\'1R\':i=l;D;q\'D\':i=l;s=e;D;2I:C e;}}J{C e;}}}1l u[5.x+\'$3t\'];1l u[5.x+\'$1K\'];1l u[5.x+\'$3u\'];1l u[5.x+\'$3v\'];1l u[5.x+\'$3w\'];1l u[5.x+\'$1U\'];1l u[5.x+\'$1E\'];1l u[5.x];u[5.x]=3s}}J{N(i=0,l=5.1q.V;i<l;++i){19+=5.1q[i].K($T,h,z,H)}}c 19}1F(e){a(m.R||(e 1G 18))C e;c""}};6 18=9(1j){5.1j=1j};18.y=Z;18.y.K=9(d){C 5;};6 2D=9(L,A){L.1h(/\\{#2C (.*?)(?: 4h=(.*?))?\\}/);5.1d=A[I.$1];a(5.1d==F){a(m.R)C j Z(\'15: 4i 3o 2C: \'+I.$1);}5.3x=I.$2};2D.y.K=9(d,h,z,H){6 $T=d;6 $P=h;1C{c 5.1d.K(10(5.3x),h,z,H)}1F(e){a(m.R||(e 1G 18))C e;}c\'\'};6 2E=9(L){L.1h(/\\{#h 1T=(\\w*?) 1o=(.*?)\\}/);5.x=I.$1;5.2f=I.$2};2E.y.K=9(d,h,z,H){6 $T=d;6 $P=h;6 $Q=z;1C{h[5.x]=10(5.2f)}1F(e){a(m.R||(e 1G 18))C e;h[5.x]=F}c\'\'};6 2G=9(L){L.1h(/\\{#2F 4j=(.*?)\\}/);5.2U=10(I.$1);5.2V=5.2U.V;a(5.2V<=0){C j Z(\'15: 2F 4k 4l 4m\');}5.2W=0;5.2X=-1};2G.y.K=9(d,h,z,H){6 2Y=b.O(z,\'1X\');a(2Y!=5.2X){5.2X=2Y;5.2W=0}6 i=5.2W++%5.2V;c 5.2U[i]};b.1a.1w=9(s,A,f){a(s.2K===m){c b(5).1e(9(){b.O(5,\'2i\',s);b.O(5,\'1X\',0)})}J{c b(5).1e(9(){b.O(5,\'2i\',j m(s,A,f));b.O(5,\'1X\',0)})}};b.1a.4n=9(1L,A,f){6 s=b.2Z({1t:1L,1Y:1f}).3y;c b(5).1w(s,A,f)};b.1a.4o=9(30,A,f){6 s=b(\'#\'+30).2O();a(s==E){s=b(\'#\'+30).3z();s=s.U(/&3i;/g,"<").U(/&3h;/g,">")}s=b.4p(s);s=s.U(/^<\\!\\[4q\\[([\\s\\S]*)\\]\\]>$/3A,\'$1\');s=s.U(/^<\\!--([\\s\\S]*)-->$/3A,\'$1\');c b(5).1w(s,A,f)};b.1a.4r=9(){6 1W=0;b(5).1e(9(){a(b.2j(5)){++1W}});c 1W};b.1a.4s=9(){b(5).3B();c b(5).1e(9(){b.3C(5,\'2i\')})};b.1a.2J=9(1T,1o){c b(5).1e(9(){6 t=b.2j(5);a(t===F){a(m.R)C j Z(\'15: m 2x 23 3D.\');J c}t.2J(1T,1o)})};b.1a.31=9(d,h){c b(5).1e(9(){6 t=b.2j(5);a(t===F){a(m.R)C j Z(\'15: m 2x 23 3D.\');J c}b.O(5,\'1X\',b.O(5,\'1X\')+1);b(5).3z(t.K(d,h,5,0))})};b.1a.4t=9(1L,h,G){6 X=5;G=b.1m({1j:\'4u\',1Y:1O,32:1f},G);b.2Z({1t:1L,1j:G.1j,O:G.O,3E:G.3E,1Y:G.1Y,32:G.32,3F:G.3F,4v:\'4w\',4x:9(d){6 r=b(X).31(d,h);a(G.2k){G.2k(r)}},4y:G.4z,4A:G.4B});c 5};6 2l=9(1t,h,2m,2n,1b,G){5.3G=1t;5.1u=h;5.3H=2m;5.3I=2n;5.1b=1b;5.3J=E;5.33=G||{};6 X=5;b(1b).1e(9(){b.O(5,\'34\',X)});5.35()};2l.y.35=9(){5.3K();a(5.1b.V==0){c}6 X=5;b.4C(5.3G,5.3I,9(d){6 r=b(X.1b).31(d,X.1u);a(X.33.2k){X.33.2k(r)}});5.3J=4D(9(){X.35()},5.3H)};2l.y.3K=9(){5.1b=b.3L(5.1b,9(o){a(b.4E.4F){6 n=o.36;2v(n&&n!=4G){n=n.36}c n!=E}J{c o.36!=E}})};b.1a.4H=9(1t,h,2m,2n,G){c j 2l(1t,h,2m,2n,5,G)};b.1a.3B=9(){c b(5).1e(9(){6 2o=b.O(5,\'34\');a(2o==E){c}6 X=5;2o.1b=b.3L(2o.1b,9(o){c o!=X});b.3C(5,\'34\')})};b.1m({38:9(s,A,f){c j m(s,A,f)},4I:9(1L,A,f){6 s=b.2Z({1t:1L,1Y:1f}).3y;c j m(s,A,f)},2j:9(z){c b.O(z,\'2i\')},4J:9(14,O,3M){c 14.K(O,3M,F,0)},4K:9(1o){m.R=1o}})})(b)}',62,295,'|||||this|var|||function|if|jQuery|return|||settings||param||new|||Template|||node|case||||extData|||_name|prototype|element|includes|push|throw|break|null|undefined|options|deep|RegExp|else|get|oper|se|for|data|||DEBUG_MODE|||replace|length|_option|that|f_escapeString|Error|eval||step|TemplateUtils|template|jTemplates|ss|this_op|JTException|ret|fn|objs|_templates_code|_template|each|false|TextNode|match|literalMode|type|cval|delete|extend|opFOREACH|value|_onTrue|_onFalse|fcount|ckey|url|_param|f_cloneData|setTemplate|tname|lastIndex|literal|opIF|filter|try|__tmp|typeof|catch|instanceof|par|_currentState|mode|iteration|url_|_tree|_templates|true|op|end|continue|noFunc|name|key|Number|count|jTemplateSID|async|disallow_functions|cloneData|MAIN|iter|not|in|elseif_level|op_|switchToElse|getParent|foreach|opFORFactory|_param1|_param2|escapeData|optionText|_value|__t|_parent|jTemplate|getTemplate|on_success|Updater|interval|args|updater|_includes|filter_params|runnable_functions|version|reg|_template_settings|while|indexOf|is|substring|optionToObject|Object|switch|include|Include|UserParam|cycle|Cycle|begin|default|setParam|constructor|toString|String|obj|val|__template|tab|arr|tmp|ex|_values|_length|_index|_lastSessionID|sid|ajax|elementName|processTemplate|cache|_options|jTemplateUpdater|run|parentNode|window|createTemplate||filter_data|clone_data|clone_params|escapeHTML|splitTemplates|of|txt|gt|lt|_literalMode|__1|_cond|funcIterator|as|find|_arg|object|_total|prevValue|index|first|last|total|_root|responseText|html|im|processTemplateStop|removeData|defined|dataFilter|timeout|_url|_interval|_args|timer|detectDeletedNodes|grep|parameter|exec|closed|No|inArray|ppp|elseif|ldelim|rdelim|Missing|unknown|tag|substr|amp|quot|hasOwnProperty|Array|Function|Functions|are|allowed|split|shift|__0|subtemplate|to|Operator|failed|MAX_VALUE|Math|ceil|root|Cannot|values|has|no|elements|setTemplateURL|setTemplateElement|trim|CDATA|hasTemplate|removeTemplate|processTemplateURL|GET|dataType|json|success|error|on_error|complete|on_complete|getJSON|setTimeout|browser|msie|document|processTemplateStart|createTemplateURL|processTemplateToText|jTemplatesDebugMode'.split('|'),0,{}));
