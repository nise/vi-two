
# Vi-Two
## overall improvements
- start widgets from config.json
- multilingual support for all text and controls
- reduce dependencies: 
 - replace jquery.tooltip by the native jquery tooltip
 - remove jquery in the core
 - avoid inherit-class
 - make it a server side plugin / node.js
- use a template engine, maybe ejs
- Error handling: throw new Error('...')
- type and value check at every data input (e.g. options ) 
- comment: re-comment
- ass: Aufgabenstatistik 
- ass: semantische Nähe zw. Feedback und Aufgabe
- ass: Benachrichtigungen
- ass: scrollbares feld bei aufgabenbearbeitung
- ass: Benutzerbenachrichtigung
- tags automatische Verlinkung via tags

## new widgets
- closed captions
- transcript
- user notes
- media fragments 
- journaled naviagtion
- follow revisions => server
- loop
- viewing history


## contribute examples
- assessment
- tags
- hyperlinks
- search
- playlist


# nice to have
- make the docs look better
- use delegate(obj, func) instead of _this


# Others

## vi-lab.js
- tooltip für Funktionen
- bearbeitungsdatum im tooltip anzeigen, damit andere sich zeitnah anschließen können
- add Hyperlink
- convertierung von popcorn auf IWRM-ähnliche seite 
- editieren der Zeit via 'edit'
- tag/toc: input type=text statt textarea
- usability: feedback beim speichern!!!
- usability: delete realy?

#vi-lab node
- user online
- @script: bearbeitungsstand anzeigen
-- anzahl items je toc/tags/comments/...
-- gesamtstand anhand von relativer metrik
- script scheduler
- gzip compression
- VI-TWO Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten








NiceToHave

- popcorn plugin für assessment.
- screencast, tagesschau-beispiel...
- popcorn-plugin en-/disable via Widget Editor (??? Wie soll das gehen)
- add links > IWRM

-- placholder @ videoplayer in css einbinden


Admin:
- Metadaten in popcorn einpflegen >> IWRM
- define selector for flexible theme adoption
- video upload via firefogg? 

}else if(location.substr(0,6) == 't=npt:'){
	alert(location.substr(7,location.length));

