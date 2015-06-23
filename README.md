# vi-two
*vi-two* is an Javascript framework for interactive videos. The framework consists of core components that can be extended by widgets. A widget encapsulates functionalities regarding spatio temporal events of a video (e.g. hyperlinks, comments, overlays). Further more widgets can facilitate operations on a collection of videos (e.g. in-video search, determine related videos). Last but not least there are widgets that improve the overall usage of videos (e.g. adjustable playback speed, zoom, ...)

The framework is completly written in Javascript but dedicated for the use in the browser. The server side is covered by its big node.js brother *vi-lab*.

# Usage
Add the following lines to your HTML <header>:

	<link type="text/css" href="../../css/vi2.assessment.css" rel="stylesheet" media="screen" />
	<script src='js/vi2.lib.js'></script>
	<script src='js/vi2.min.js'></script>
	
	<script language ="javascript">
			var observer = undefined, vi2 = undefined, ocr = undefined;
		var Vi2 = {}; // set the Namespace
		$(document).ready(function(){
			var core = new Vi2.Example();	
		});
		</script>

# Examples
See all examples inside the *examples* folder. A video learning environment that has been build with vi2 is online:

* [IWRM education](http://www.iwrm-education.de/)

# Documantation
There are some jsDoc files inside the *doc* folder


