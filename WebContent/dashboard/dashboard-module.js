"use strict";

(function() {
    var dashboard;
    dashboard = angular.module('app.dashboard', ["ngLocale"]);

    dashboard.config([ '$compileProvider', '$logProvider', function($compileProvider, $logProvider) {
        $compileProvider.debugInfoEnabled(true);
        $logProvider.debugEnabled(true);
    } ]);
})();



