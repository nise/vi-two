# Set the source directory
srcdir = src/

# Create the list of modules
modules =   ${srcdir}jquery.inherit-1.1.1.js\
						${srcdir}jquery.json-2.2.min.js\
            ${srcdir}jquery.tinysort.js\
            ${srcdir}jquery.tooltip.js\
            ${srcdir}jquery.piemenu.js\
 						${srcdir}jquery.tag-it.js\
            ${srcdir}jquery.spin.js\
            ${srcdir}jquery.maphilight.min.js\
            ${srcdir}jquery-ui-1.8.6.custom.min.js\
            ${srcdir}jquery-jtemplates.js\
            ${srcdir}purl.js\
            ${srcdir}vi2.core.js\
						${srcdir}vi2.core.observer.js\
						${srcdir}vi2.core.database.js\
						${srcdir}vi2.core.parser.js\
						${srcdir}vi2.core.videoplayer.js\
						${srcdir}vi2.core.clock.js\
						${srcdir}vi2.core.annotation.js\
						${srcdir}vi2.core.utils.js\
						${srcdir}vi2.core.log.js\
						${srcdir}vi2.core.api.js\
						${srcdir}vi2.syncMedia.js\
						${srcdir}vi2.comments.js\
						${srcdir}vi2.assessment.js\
						${srcdir}vi2.tags.js\
						${srcdir}vi2.toc.js\
						${srcdir}vi2.xlink.js\
						${srcdir}vi2.metadata.js\
						${srcdir}vi2.search.js\
						${srcdir}vi2.playlist.js\
						${srcdir}vi2.relatedVideos.js\
						${srcdir}vi2.videoManager.js\
						
	#					${srcdir}vi2.utils.maintanance.js\
            
slides = 		./data-slides-raw.json\

vi2 = ${srcdir}vi2.assessment.fill-in.js\
			${srcdir}vi2.assessment.js\
			${srcdir}vi2.assessment.written.js\
			${srcdir}vi2.comments.js\
			${srcdir}vi2.core.annotation.js\
			${srcdir}vi2.core.api.js\
			${srcdir}vi2.core.clock.js\
			${srcdir}vi2.core.database.js\
			${srcdir}vi2.core.js\
			${srcdir}vi2.core.log.js\
			${srcdir}vi2.core.observer.js\
			${srcdir}vi2.core.parser.js\
			${srcdir}vi2.core.utils.js\
			${srcdir}vi2.core.videoplayer.js\
			${srcdir}vi2.highlight.js\
			${srcdir}vi2.map.js\
			${srcdir}vi2.core.metadata.js\
			${srcdir}vi2.playback-speed.js\
			${srcdir}vi2.temporal-bookmarks.js\
			${srcdir}vi2.playlist.js\
			${srcdir}vi2.relatedVideos.js\
			${srcdir}vi2.search.js\
			${srcdir}vi2.seqv.js\
			${srcdir}vi2.syncMedia.js\
			${srcdir}vi2.tags.js\
			${srcdir}vi2.toc.js\
			${srcdir}vi2.traces.js\
			${srcdir}vi2.utils.maintanance.js\
			${srcdir}vi2.videoManager.js\
			${srcdir}vi2.xlink.js\
			#${srcdir}vi-videolab.js

         
# Bundle all of the modules into vi-two.js
bundle: ${modules}
		cat $^ > vi-two.js


#	Compress al of the modules into vi-two.min.js
compress: ${modules}
		cat $^ > vi-two.js
	  java -jar /usr/bin/compiler.jar --js vi-two.js --js_output_file vi-two.min.js
	  
	  
# minimize slides data
min: $(slides)
	  cat $^ | tr '\n' ' ' > ./data-slides.min.json 


test:	${vi2}
	jshint $^ 
	  
	  
# generate documentation of vi-two
#	setup jsdoc:
# 1) JSDOCDIR="$HOME/Documents/www/elearning/vi2/vi-two/tools/jsdoc/jsdoc-toolkit"
# 2) JSDOCTEMPLATEDIR="$JSDOCDIR/templates/jsdoc"
# 3) make documentation

# Manual: http://usejsdoc.org/tags-requires.html
# Result: file:///home/abb/Documents/www2/vi-two/doc/symbols/VI-TWO.html
doc: $(vi2)
		#cat $^ > vi2doc.js
		java -jar tools/jsdoc/jsdoc-toolkit/jsrun.jar tools/jsdoc/jsdoc-toolkit/app/run.js -a -t=tools/jsdoc/jsdoc-toolkit/templates/jsdoc $^ 
		# copy docs to the dedicated folder
		cp -r tools/jsdoc/jsdoc-toolkit/out/jsdoc/* doc/


#		
iwrm: ${modules}
		cat $^ > examples/iwrm/js/vi-two.js
	  java -jar /usr/bin/compiler.jar --js examples/iwrm/js/vi-two.js --js_output_file examples/iwrm/js/vi-two.min.js
		
	 
		
		
		
		
		 

