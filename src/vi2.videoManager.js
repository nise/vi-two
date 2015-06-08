/* VideoManager
author: niels.seidel@nise81.com

description: 

- list streams by category / tag / author / date / ...
- offers different rendering styles: 
Karussell, Liste, Card-Deck, Matrix, Stack, Video-Wall, Slide-Row, Slide-Matrix, ...


*/



var Vi2_VideoManager = $.inherit(/** @lends VideoManager# */{ // 

	/** 
	*		@constructs 
	*		@param {object} options An object containing the parameters
	*/
	__constructor : function(options) {
			this.options = $.extend(this.options, options);  
	},
	
	name : 'video-manager',
	type : 'collection',
	content_selector : '#content',
	options : {},
	
	
	
	/* -- */
	listByTag : function(tag_name){
		var _this = this;
		var tags = tag_name.split('+');
		if(tag_name.split('+') == 0){ tags = []; tags[0] = tag_name; }
	
		var template = $("#item_template").val();
		$(_this.content_selector)
			.empty()
			.trigger('clear')
			.append($('<h2></h2>').text('Lectures with keyword: '+tags[0]));
		var j = 0;
		var all_streams = [];
	
		$.each(tags, function(i, the_tag_name){	
			$.each(vi2.db.json_data.stream, function(i, stream){
				$.each(stream.tags, function(i, tag){
					if(this.tagname == the_tag_name){
					 all_streams.push(stream.id);
					}
				});
			});			
		});
	
		all_streams = removeDuplicates(all_streams.sort());
	
		// render
		$.each(all_streams, function(i, val){
			var item =$('<div></div>')
						.addClass('content-item')
						.setTemplate(template)
						.processTemplate(vi2.db.getStreamById(val))
						.appendTo($(_this.content_selector));
					if(j % 2 == 1){ item.css('margin-right', '0');}	
					j++;
		});
	
		// enable card toggle
		$('.toggle-card').click(function(e){ if($(this).text() == 'view abstract'){ $(this).text('view metadata');}else{ $(this).text('view abstract');} $(this).parent().find('.show').toggle(); });
	
		// enable playlist // dirty call xxx
		vi2.appendPlaylist();//observer.widget_list['playlist'].handlePlaylist();
	
		// reset drop downs
		$('.getStreamsByTitle').val(-1);
		$('.getStreamsByCategory').val(-1);
	},
	
	
	
	/* -- */
	// 
	listByCategory : function(cat_name){
		var _this = this; 
			var z = []; 
			z['Technical measures'] = [1, "This cluster deals with technical measures that are important for IWRM. It covers issues from the field of urban water management (centralized and decentralized wastewater treatment) as well as important reservoir management topics. Furthermore, flood protection measures as an integral part of flood management are shown."];
			z['Economic instruments'] = [2, "In this part of the module, economic instruments regulating the water demand are explained and illustrated as well as their interaction with hydrologic models. Furthermore, economic problems in multilateral cooperation on shared watercourses as well as the issue of water pricing are successively explained."];
			z['Water governance'] = [3, "Issues of governance prove to be of utmost importance for sustainable water resources management. Following an illustrated introduction into the topic of water governance, fundamentals in water law, gender issues, options for participation as well as prevailing spatial and sectoral challenges in river basin management are addressed. Particular emphasis is given to capacity development."];
			z['Tools'] = [4, "Tools for understanding the natural and societal systems that facilitate decision-making processes are becoming increasingly important. A wide range of tools and methods is shown, e.g. modelling, model coupling, Geographic Information Systems (GIS) and consequently their usage within decision-support-systems (DSS). The cluster further addresses issues related to vulnerability and uncertainty in decision-making, e.g. showing tools such as scenario planning."];
			z['Water and the physical environment'] = [5, "This cluster discusses the components and processes within the hydrologic cycle and resulting management options. It includes different methods to quantify soil erosion, water balance, sediment and contaminant transport. Issues are covered that are related to groundwater quantity and quality, surface water quality, climate change and hydrological extremes."];
			z['IWRM implementation and case studies'] = [6, "The implementation of Integrated Water Resources Management (IWRM) is still in its infancy. Thus, case studies from different hydrologically sensitive regions of the world are shown in order to discuss challenges that often occur when one tries to practically implement IWRM. Topics include important issues such as transboundary water management as well as the implementation of IWRM in Europe and in the development cooperation."];
			var i = z[cat_name];	
			
			
		$(_this.content_selector)
			.empty()
			.trigger('clear')
			.setTemplate($("#cat_header").val())
			.processTemplate({title:cat_name, desc: vi2.db.getCategory(cat_name).desc, style: 'background: no-repeat url(img/cat_s'+i[0]+'.png) white 0px 10px;'});
				
		$.each(vi2.db.json_data.stream, function(i, stream){
				if(stream.metadata[0].category == cat_name){			
					var item =$('<div></div>')
						.addClass('content-item')
						.setTemplate($("#item_template").val())
						.processTemplate(stream);
					$(_this.content_selector).append(item);
				}
		});
		
		$(_this.content_selector+' > .content-item')
			// sort by weight (expression of didactical order)
			.tsort('.weight', {order:"asc"})
			// fix two column layout
			.each(function(i, val){ 
				if(i % 2 == 1){ $(this).css('margin-right', '0');}	 
			});
		
		// enable card toggle
		$('.toggle-card').click(function(e){ if($(this).text() == 'view abstract'){ $(this).text('view metadata');}else{ $(this).text('view abstract');} $(this).parent().find('.show').toggle(); });
		
		// enable playlist
		vi2.appendPlaylist();//observer.widget_list['playlist'].handlePlaylist();
				
		// reset drop downs
		$('.getStreamsByTitle').val(-1);
		$('.getStreamsByTag').val(-1);
	},
	
	
	
	/* buggy ... */
	listAllItems : function(){
			var template = $("#item_template").val();
			
		// list items of all categories		
		$.each(this.getCategoryTaxonomie(), function(i, cat_name){
			// cat name
			$(_this.content_selector).append($("<h2></h2>").addClass('cat'+i).text(cat_name)).append('<br>');
			$.each(_this.json_data.stream, function(i, stream){
				if(stream.metadata[0].category == cat_name){
					var item =$('<div></div>')
						.setTemplate(template)
						.processTemplate(stream)
						.appendTo($(_this.content_selector));
						//$('div.hyphenate').hyphenate({remoteloading:true,});//.css('color','red');
						//$('.text').hidetext();						
				}
			});		
		});
	
	}
	
	
	
}); // end class VideoManager		
