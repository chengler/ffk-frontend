
"use strict";

(function () {
    var dashboard = angular.module('app.dashboard');

    dashboard.controller('DashboardCtrl', [
        '$scope',
        '$rootScope',
        '$log',
        function ( $scope, $rootScope,  $log) {
            $log.info("init DashboardCtrl");



            //http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file#4551467
$scope.speicher = function(name){
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify ($scope[name])));
        pom.setAttribute('download', name +".txt");

        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }

    $scope.lade = function(objekt, $fileContent){
    console.log("lade Datei in das Objekt "+ objekt);
    //console.log($fileContent);
        $rootScope[objekt] = JSON.parse($fileContent);
        console.log($scope[objekt]);



    };

           $scope.showContent = function($fileContent){
                    $scope.content = $fileContent;
                };







}]);
})();