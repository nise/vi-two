
# overall improvements
- start widgets from config.json
- multilingual support for all text and controls
- fix player control bar
- reduce dependencies: 
 - replace jquery.tooltip by the native jquery tooltip
 - avoid inherit-class
 - make it a server side plugin / node.js
- use a template engine, maybe ejs
- use delegate(obj, func) instead of _this
- Error handling: throw new Error('...');
- type and value check at every data input

# new widgets
- closed captions
- transcript
- user notes
- media fragments 
- journaled naviagtion
- follow revisions => server
- loop
- viewing history


# contribute examples
- tags
- hyperlinks
- search
- playlist


# nice
- make the docs look better




to do:
- vi-two core integrieren
- boostrap ... responsive design
- aktuelle jquery-version nutzen

NODE:
- script scheduler
- gzip compression
- VI-TWO Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten

---------------------------------------------
VI-TWO
- usability: feedback beim speichern!!!
- usability: delete realy?
- re-comment
- bearbeitungsstand anzeigen
-- anzahl items je toc/tags/comments/...
-- gesamtstand anhand von relativer metrik
- editieren der Zeit via 'edit'
- mehrsprachigkeit / spracheinheitlichkeit: l('')
- tag/toc input type=text statt textarea
- ass: Aufgabenstatistik 
- ass: semantische Nähe zw. Feedback und Aufgabe
- ass: Benachrichtigungen
- ass: scrollbares feld bei aufgabenbearbeitung
- ass: Benutzerbenachrichtigung
- tooltip für Funktionen
- bearbeitungsdatum im tooltip anzeigen, damit andere sich zeitnah anschließen können
- user online
- vereinheitlichung der widget in vi-two settings
- add Hyperlink
- convertierung von popcorn auf IWRM-ähnliche seite 
--- automatische Verlinkung via tags



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

