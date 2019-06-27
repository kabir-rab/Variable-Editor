/*
Developed by: Kabir Rab
Version: 0.92
*/

//Please update your server details here if required
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );
var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
require.config( {
	baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {
	//Toasts - displays alerts, currently using primary class - future implantations will utilise success and error class
	qlik.setOnError( function ( error ) {
		$( '#toast-text' ).append( error.message + "<br>" );
		$( '#alert-toast' ).fadeIn( 500 );
	} );
	//Closes the alert
	$( "#btn-clear" ).click( function () {
		$( '#alert-toast' ).hide();
		$( '#toast-text' ).empty();
	} );	
	
	var app, appID, appName, varTypeIcon, totalApp = 0, totalVariable = 0, variableList = [];
	
	//Retrieving the applications list from the server.
	qlik.getAppList(function(list) {		
		$("#applist").empty();
		$('<option value="0">Please select an app</option>').appendTo("#applist");
		list.forEach(function(value) {			
			totalApp++;			
			$('<option value="' + value.qDocId + '">' + value.qDocName + '</option>').appendTo("#applist");
			if (totalApp === list.length) {
				callbackMess("App List Loaded");
				overlay(false);
				$('<p align="center"> Please Select an app from the drop down list at the top </p>').appendTo("#varlist");
			}
		});
	}, config);
	
	//Change event trigger for the app dropdown to open the selected app and then get list of all variables for that selected app
	$('#applist').change(function () {
		
		appName = $("#applist :selected").text(); // The text content of the selected option
		appID = $("#applist :selected").val(); // The value of the selected option
		
		//Only fetch the list when a valid selection has been made
		if(appID != 0){
			
			variableList = [];
			
			//Displays wait overlay - stops the users from selecting another app.
			overlay(true);
			
			//Clear the html from the acordian - so that new list can be added.
			$('#varlist').empty();
			$(".panel-title").html(appName);

			//Opening the selected app
			app = qlik.openApp(appID+"", config);
			callbackMess(appName + " is Selected.");

			//Retriving all the variables from the opened app
			app.getList("VariableList", function(reply){
				var	scriptOnlyVariable = 0,
					dashboardVariable = 0,
					SubHeaderHtml,
					accordionHtml;					
				
				//Retriving total number of variables in the selected app
				totalVariable = reply.qVariableList.qItems.length;				
				
				//Looping through the list to create an acordian to display to the end user
				$.each(reply.qVariableList.qItems, function(key, value) {
					var isScripted, editIcon='';
					
					variableList.push(value);
					//console.log(value, "variable item");

					//Adds icons to visually display the variable that are created in script or at the front end.
					if(value.qIsScriptCreated === true){
						varTypeIcon = '<span class="icon-space lui-icon lui-icon--script" aria-hidden="true"> </span>';
						scriptOnlyVariable++;
						isScripted = value.qIsScriptCreated;
						editIcon = '<div class="float-right accord-menu"><button class="btn btn-success btn-sm disabled"><i class="icon icon-edit"></i></button></div></div>';
					}
					else {
						varTypeIcon = '<span class="icon-space lui-icon lui-icon--line-chart" aria-hidden="true"> </span>';
						isScripted = false;
						editIcon = '<div class="float-right accord-menu"><button data-var="'+ value.qInfo.qId +'" class="btn btn-success btn-sm"><i class="icon icon-edit"></i></button></div></div>';
					}
					
					accordionHtml = '<button class="accordion" data-type="'+ value.qIsScriptCreated +' all">'+ varTypeIcon + value.qName +'</button><div class="var-panel">';
					accordionHtml += '<div class="acordion-box-header">Definition<div class="acordion-box">'+ value.qDefinition +'</div>';
					accordionHtml += editIcon;								
					
					$(accordionHtml).appendTo("#varlist");
				});
				dashboardVariable = totalVariable - scriptOnlyVariable;
				
				//This is the sub header - displays the summary.
				SubHeaderHtml = 'There are <span class="highlight">'+totalVariable+'</span> variables in this app. ';
				SubHeaderHtml +='<span class="highlight"><span class="icon-space lui-icon lui-icon--script" aria-hidden="true"> </span>'+ scriptOnlyVariable +'</span> variables are in the script ';
				SubHeaderHtml +='and <span class="highlight"><span class="icon-space lui-icon lui-icon--line-chart" aria-hidden="true"> </span>'+ dashboardVariable + '</span> are at the frontend.';
				
				$(".panel-nav").html(SubHeaderHtml);
			}).then(function(){
				//This created the accordian for the variables loaded from the app
				var accordionVar = document.getElementsByClassName("accordion"),
				 	i;
				
				for (i = 0; i < accordionVar.length; i++) {
				  accordionVar[i].addEventListener("click", function() {
					this.classList.toggle("accordion-active");
					var panel = this.nextElementSibling;
					if (panel.style.maxHeight){
					  panel.style.maxHeight = null;
					} else {
					  panel.style.maxHeight = panel.scrollHeight + "px";
					} 
				  });
				}
			}).then(function(){
				//Hides the overlay and allow user to click on objects again
				overlay(false);
			}).then(function(){
				//Modal close button event
				$(".close-modal").on("click", function() {
					$(this).closest('.modal').removeClass('active');
				});
				
				//Modal for showing the variable details.
				$(".btn-success").on("click", function() {
					$('.modal').addClass('active');
					var url = $(this).data('var');
					var selected = variableList.filter(x => x.qInfo.qId === url);
									
					$('#input-title').val(selected[0].qName); 
					$('#input-definition').val(selected[0].qDefinition); 
					$('#input-description').val(selected[0].qDescription);
				});
				
				$(".downloadbtn").show();
			});
		}
	});
	

	//Functions
	//Alert function
	function callbackMess(mess) {
		$("#toast-text").empty();
		$('#toast-text').append(mess + "<br>");
		$('#alert-toast').fadeIn(1000).delay(2000).fadeOut(1000);		
	}
	
	//Loading overlay function
	function overlay(trig) {
		$('.overlay').toggle(trig);	
	};		
	
	//Search function
	/*
	Search function needs to be a combined function. This to be implemented in the next version.
	*/
	//this drives the check box to hide and show script variables
	function listSearch(){
		var searchType;	
				
		if($('#list-filter').prop("checked") == true){
			searchType = 'undefined';
		}else{
			searchType = 'all';
		};	
		//console.log(searchType);
		$('.accordion').filter(function () {
			$(this).toggle($(this).attr('data-type').toLowerCase().indexOf(searchType) > -1)
			$(this).next().toggle($(this).attr('data-type').toLowerCase().indexOf(searchType) > -1);
		});	
	}
	
	//This drives the search box
	$('#search-string').on('keyup', function () {
		var search = $(this).val().toLowerCase();				
		
		$('.accordion').filter(function () {
			$(this).toggle($(this).text().toLowerCase().indexOf(search) > -1)
			$(this).next().toggle($(this).text().toLowerCase().indexOf(search) > -1);
		});
	});
	
	//Button event
	$('#list-filter').click(function(){
		listSearch();	
	});
	
	/*
		Download CSV function - This is limited to chrome for now. There are issues with special characters too that require some more time.
		This to be reviewed at the next release.
	*/
	$('#downloadcsv').click(function(){
		var results = variableList;							
		var finalJSON = [];

		$.each(results, function(key, value) {
			var definitionFinal = removeReturns(value.qDefinition);
			var qIsScriptCreatedFinal = checkScripted(value.qIsScriptCreated);
			
			finalJSON.push({'"qId"': '"'+value.qInfo.qId +'"', '"qName"': '"'+value.qName +'"','"qDefinition"': '"'+ definitionFinal +'"', '"qIsScriptCreated"': '"'+qIsScriptCreatedFinal+'"'});
		});
		
		var csv = toCSV(finalJSON);
		//var csvContent = "data:application/octet-stream;charset=utf-8,\uFEFF" + csv;
		var csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csv;
		var encodedUri = encodeURI(csvContent);
		var download = document.createElement("a");
		
		download.setAttribute("href", encodedUri);
		download.setAttribute("download", appName+".csv");		
		download.click();
	})
		
	//Removes carriage returns, white spaces and replaces # with url encode
	function removeReturns(defString) {
		var newdefString = defString.replace(/[\n\r]+/g, '');
		newdefString = newdefString.replace(/\s{2,10}/g, '');
		newdefString = newdefString.replace(/#/g, '%23');

		return newdefString;//str.replace(/\n|\r/g, "");
	};
	
	//This cheks to see if the variable is script generated or not
	function checkScripted(defString) {
		var isScriptedCheck;
		if(defString === true){			
			isScriptedCheck = defString;			
		}
		else {
			isScriptedCheck = false;
		}
		
		return isScriptedCheck;
	}
	
	//This converts the object into csv
	function toCSV(json) {
		json = Object.values(json);
		var csv = "";
		var keys = (json[0] && Object.keys(json[0])) || [];
		csv += keys.join(',') + '\n';
	
		for (var line of json) {
			csv += keys.map(key => line[key]).join(',') +'\n' ;
		}	

		return csv;
	};

} );