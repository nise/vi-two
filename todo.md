
# Vi-Two
## overall improvements
- grunt :: https://scotch.io/tutorials/a-simple-guide-to-getting-started-with-grunt
- start widgets from config.json / /json/vi-two-config
- multilingual support for all text and controls
- use a template engine, maybe ejs
- eliminate parser
- consider html-track as storage/timing mechanism


## new widgets for my dissertation
- follow revisions => server
- loop
- video manipulation
- closed captions 
- transcript
- user notes
- media fragments 
	`<html>
		<head>
			<style>
				video {
					position: absolute;
					clip: rect(30px, 190px, 120px, 90px);
					-webkit-clip-path: inset(30px 190px 120px 90px); 	
				}
		
			</style>
		</head>
		<body>
			<video width="320" height="240" controls autoplay=true>
				<source src="http://localhost/elearning/vi2/vi-two/examples/iwrm/videos/iwrm_ayenew1.mp4" type="video/mp4">
				<source src="http://localhost/elearning/vi2/vi-two/examples/iwrm/videos/iwrm_ayenew1.webm" type="video/webm">
				Your browser does not support the video tag.
			</video>
		</body>
		</html>`
- object tracking
- add video => server


## contribute examples
- assessment
- search
- tags
- hyperlinks
- playlist


## Datenformate
Video-Annotation Format from the Advene people
http://liris.cnrs.fr/advene/cinelab/




## beauty of code 
- reduce dependencies: 
 - replace jquery.tooltip by the native jquery tooltip
 - remove jquery in the core
 - avoid inherit-class
 - make it a server side plugin / node.js
- type and value check at every data input (e.g. options ) 
- Error handling: throw new Error('...')
- make the docs look better
- use delegate(obj, func) instead of _this




## NiceToHave
- popcorn plugin für assessment.
- popcorn-plugin en-/disable via Widget Editor (??? Wie soll das gehen)
- add links > IWRM
-- placholder @ videoplayer in css einbinden


Admin:
- Metadaten in popcorn einpflegen >> IWRM
- define selector for flexible theme adoption
- video upload via firefogg? 

