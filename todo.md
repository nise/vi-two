
# Vi-Two
## overall improvements
- start widgets from config.json / /json/vi-two-config
- multilingual support for all text and controls
- use a template engine, maybe ejs






## new widgets for my dissertation
- follow revisions => server
- loop
- video manipulation
- closed captions 
- transcript
- user notes
- media fragments 
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



# Others


#vi-lab node
- gzip compression
- VI-TWO Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten



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




NiceToHave

- popcorn plugin für assessment.
- popcorn-plugin en-/disable via Widget Editor (??? Wie soll das gehen)
- add links > IWRM
-- placholder @ videoplayer in css einbinden


Admin:
- Metadaten in popcorn einpflegen >> IWRM
- define selector for flexible theme adoption
- video upload via firefogg? 

