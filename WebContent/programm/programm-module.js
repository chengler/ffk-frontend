"use strict";
agGrid.initialiseAgGridWithAngular1(angular);

(function() {

	var programm = angular.module('app.programm', [  'agGrid', 'ui.bootstrap', 'modalFilmWoche', 'modalVerleihBuchung', 'programmTabellenRenderer', 'modalRingBuchung',	'ffkUtils' ]);

	
	programm.config([ '$compileProvider', '$logProvider', function($compileProvider, $logProvider) {
		$compileProvider.debugInfoEnabled(true);
		$logProvider.debugEnabled(true);
	} ]);


	
	
})();