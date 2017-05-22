
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
            // http://stackoverflow.com/questions/18826320/what-is-the-hashkey-added-to-my-json-stringify-result#23656919
    $scope.speicher = function(name){
        console.log("speicher" );
        var pom = document.createElement('a');
        var data ={};

        if (name != "datensatzFfK"){
            var myobjektname;
            data[name] =  $rootScope[name];
        } else {  // konstruiere Datensatz
            data = {'users': $rootScope.users,
                    'spielorte': $rootScope.spielorte,
                    'verleiher': $rootScope.verleiher,
                    'buchungen': $rootScope.buchungen,
                    'filmlauf': $rootScope.filmlauf
                    };
        }
        console.log(name + "zum download bereit");
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(angular.toJson(data,4,1)));
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
    $scope.lade = function(objektname, fileContent){
    console.log("lade Datei für "+ objektname);
    //console.log($fileContent);

    fileContent =  JSON.parse(fileContent);
    for ( var key in fileContent ){
         console.log("lade "+ key);
        //$rootScope[objektname] = JSON.parse(fileContent);
        $rootScope[key] = fileContent[key];

       // console.log($scope[objektname]);
        switch(objektname) {
            case 'users':
                // wenn Objekt 'users' geladen wurde erstelle und sortiere usersSortiert
                FfkUtils.sortiereUsers();
                break;
            case 'spielorte':
                FfkUtils.sortiereSpielorte();
                break;
            case 'verleiher':
                FfkUtils.sortiereVerleiher();
                break;
            case 'filme':
                // unklar was zu ändern ist.wird durch PCtrl geändert
                FfkUtils.loadFilme();
                break;
            case 'buchungen':
                break;
            case 'filmlauf':
                break;

        }
    }
    };

// zeige details ... Variablen im- und exportfunktion
            $scope.details = {};
            $scope.details.btn = "btn-success";
            $scope.details.txt = "zeige erweiterte Einstellungen"
            $scope.details.status = false;
            $scope.toggleDetails = function (){
                if ($scope.details.status) { //if true
                    $scope.details.btn = "btn-success";
                    $scope.details.txt = "zeige erweiterte Einstellungen"
                    $scope.details.status = false;
                    console.log("verberge erweiterte Einstellungen");
                } else {
                    $scope.details.btn = "btn-danger";
                    $scope.details.txt = "verberge erweiterte Einstellungen"
                    $scope.details.status = true;
                    console.log("zeige erweiterte Einstellungen");
                }

            }


           $scope.showContent = function($fileContent){
                    $scope.content = $fileContent;
                };







}]);
})();