
"use strict";

(function () {
    var dashboard = angular.module('app.dashboard');

    dashboard.controller('DashboardCtrl', [
        '$scope',
        '$rootScope',
        '$log',
        'FfkUtils',
        function ( $scope, $rootScope,  $log, FfkUtils) {
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

    // lade eine Datei im Array Format in das objekt mit dem name objektname
    $scope.lade = function(objektname, $fileContent){
    console.log("lade Datei in das Objekt "+ objektname);
    //console.log($fileContent);
        $rootScope[objektname] = JSON.parse($fileContent);
        console.log($scope[objektname]);

        // wenn Objekt 'users' geladen wurde erstelle und sortiere usersSortiert
        if (objektname == 'users'){
            FfkUtils.sortiereUsers();
        }
        if (objektname == 'spielorte'){
            FfkUtils.sortiereSpielorte();
        }







    };

           $scope.showContent = function($fileContent){
                    $scope.content = $fileContent;
                };







}]);
})();