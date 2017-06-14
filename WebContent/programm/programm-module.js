"use strict";
agGrid.initialiseAgGridWithAngular1(angular);

(function() {

	var programm = angular.module('app.programm', [  'agGrid', 'ui.bootstrap', 'modalFilmRow', 'modalFilmKW', 'programmTabellenRenderer', 'modalBuchungsBearbeitung',	'ffkUtils' ]);

	
	programm.config([ '$compileProvider', '$logProvider', function($compileProvider, $logProvider) {
		$compileProvider.debugInfoEnabled(true);
		$logProvider.debugEnabled(true);
	} ]);


	
	
})();