"use strict";

(function() {
	var dashboard = angular.module('app.dashboard', []);

    dashboard.config([ '$compileProvider', '$logProvider', function($compileProvider, $logProvider) {
        $compileProvider.debugInfoEnabled(true);
        $logProvider.debugEnabled(true);
    } ]);
})();



