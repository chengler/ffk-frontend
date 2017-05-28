
"use strict";

(function () {
    var dashboard = angular.module('app.dashboard');

    dashboard.controller('DashboardCtrl', [
        '$scope',
        '$rootScope',
        '$log',
        '$locale',
        'FfkUtils',
        function ( $scope, $rootScope,  $log, $locale, FfkUtils) {
            $log.info("init DashboardCtrl");

            // starte asyncrones laden
            // ergebniss landet in $rootScope.fehlendeRueckmeldungen = [];
        var  fehlendeRuekmeldungen =   FfkUtils.getFehlendeRuekmeldungen();

            //http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file#4551467
            // http://stackoverflow.com/questions/18826320/what-is-the-hashkey-added-to-my-json-stringify-result#23656919
    $scope.speicher = function(name){
        console.log("speicher" );
        var pom = document.createElement('a');
        var data ={};

        if (name != "datensatzFfK"){ // einzelner Satz
            var myobjektname;
            data[name] =  [$rootScope[name]];
        } else {  // konstruiere kompletten Datensatz
            data = {'users': $rootScope.users,
                    'spielorte': $rootScope.spielorte,
                    'verleiher': $rootScope.verleiher,
                    'verleihBuchungen': $rootScope.verleihBuchungen,
                    'ringBuchungen': $rootScope.ringBuchungen,
                    'filmlauf': $rootScope.filmlauf,
                    'filme': $rootScope.filme // nur zur entwicklung
                    };
        }
        console.log(name + "zum download bereit");
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(angular.toJson(data,true)));
        pom.setAttribute('download', name +".js");


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
        FfkUtils.ladeDatensatz(fileContent)
    //console.log($fileContent);
    };

// zeige details ... Variablen im- und exportfunktion
            $scope.details = {};
            $scope.details.btn = "btn-success";
            $scope.details.txt = "zeige Variableninhalte"
            $scope.details.status = false;
            $scope.toggleDetails = function (){
                if ($scope.details.status) { //if true
                    $scope.details.btn = "btn-success";
                    $scope.details.txt = "zeige Variableninhalte"
                    $scope.details.status = false;
                    console.log("verberge erweiterte Einstellungen");
                } else {
                    $scope.details.btn = "btn-danger";
                    $scope.details.txt = "verberge Variableninhalte"
                    $scope.details.status = true;
                    console.log("zeige erweiterte Einstellungen");
                }
            }

         //  $scope.showContent = function($fileContent){
           //         $scope.content = $fileContent;
             //   };
            // erstelle Kinowoche
            console.log("finde Kinowoche");
            $scope.datum = new Date(); //heute
            var kwDonnerstag = FfkUtils.getKinoWocheFromDate( $scope.datum);
            var kwEnde = moment(kwDonnerstag).add(6, 'days');
            var filmlaufKW = moment(kwDonnerstag).format("YYYY")+"W"+moment(kwDonnerstag).isoWeek(); // Bsp: 2017W48
            console.log("in Filmlauf KW "+filmlaufKW);
            $scope.kw =  "Kinowoche "+ moment(kwDonnerstag).isoWeek();
            $scope.kwDonnerstag =  moment(kwDonnerstag).format('DD.MM.')
            $scope.kwEnde =  moment(kwEnde).format('DD.MM.')

// Datumsanzeige Kinowoche
                var kw40 = $rootScope.filmlauf[40].datum.substr(5);
                var mykw = filmlaufKW.substr(5);
                var diff = mykw-kw40;
                var myIdx = 40+(diff*8);
                //console.log($rootScope.filmlauf[40])
                //console.log("kw40 "+kw40+" mykw "+mykw+" diff "+diff+" myIdx "+myIdx)

            // wird vom watcher aufgerufen nachdem alle Daten geladen sind
            var ladeAnsichten = function(){
                console.log("lade Ansichten");
//wer ist eingeloged
                switch ($rootScope.logedInUser.role){

                    case "spieler":
                    console.log("*** präsentiere Spielerinfos");

                    break;

                    case "admin":
                        console.log("*** präsentiere Admininfos");
                        break;
                    case "verleih":      //Verleihansicht
                            console.log("*** präsentiere Verleihinfos");
                            // sollte eigentlich vom Server kommen, Workaround
                            console.log(JSON.stringify($rootScope.filmlauf[myIdx]));
                            // film in filme
                            // ein Array mit Objecten
                            $scope.filme=[];
                            var film ={};
                            // suche nach  Filmen wie in col angegeben
                            // suche in der KW ZEile
                            for (var i=1; i<=   $rootScope.filmlauf[myIdx].col ; i++){
                                console.log("suche nach Film in col "+i);
                                if ( 'col'+i in $rootScope.filmlauf[myIdx] &&
                                    $rootScope.filmlauf[myIdx]['col'+i] != undefined ) { // film gibts
                                    var myfilm = $rootScope.filmlauf[myIdx]['col'+i];
                                    film['name'] = $rootScope.verleihBuchungen[myfilm.vBID].titel;
                                    film['besucher'] = $rootScope.verleihBuchungen[myfilm.vBID]['fw'+myfilm.fw][0];
                                    film['eintritt'] = $rootScope.verleihBuchungen[myfilm.vBID]['fw'+myfilm.fw][1];
                                    film['filmwoche'] = myfilm.fw;

                                    $scope.filme.push(film);
                                    i += 1; // suche nach weiterem Film
                                    film={}; // leere Film für neuen Eintrag
                                }

                            }
                            console.log(JSON.stringify($scope.filme));
                        break;






                }

            }


                var allesGeladen = $scope.$watch(function () {
                    return ($rootScope.status.filmlaufGeladen &&
                    $rootScope.status.verleihBuchungenGeladen && $rootScope.status.fehlendeRueckmeldungenGeladen);
                }, function () {
                    if ($rootScope.status.filmlaufGeladen &&
                        $rootScope.status.verleihBuchungenGeladen && $rootScope.status.fehlendeRueckmeldungenGeladen) {
                        allesGeladen(); // clear watcher
                        console.log("***** starte Dashboardübersicht");
                        console.log($rootScope.filmlauf[myIdx])
                        ladeAnsichten();
                    }
                }, true);



}]);
})();