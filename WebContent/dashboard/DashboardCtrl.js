
"use strict";

(function () {
    var dashboard = angular.module('app.dashboard', [ 'modalRingBuchungsBearbeitung' , 'modalVenue', 'modalDistributor' ]);



    dashboard.controller('DashboardCtrl', [
        '$scope',
        '$rootScope',
        '$log',
        '$locale',
        'FfkUtils',
        'ModalRingBuchungEintrittBearbeitenService',
        'OpenModalVenueService',
        'OpenModalDistributorService',
        function ( $scope, $rootScope,  $log, $locale, FfkUtils, ModalRingBuchungEintrittBearbeitenService,
                   OpenModalVenueService, OpenModalDistributorService) {
            $log.info("init DashboardCtrl");
        //    $scope.version = $rootScope.version; // damit templates nachgeladen werden, nach fertigstellung des Progs bsésser progversion


            // starte asyncrones laden
            // ergebniss landet in $rootScope.fehlendeRueckmeldungen = [];
        var  fehlendeRuekmeldungen =   FfkUtils.getFehlendeRuekmeldungen();
        $scope.fbids ={}


            $scope.zeigeVerleih= true;
            switch ($rootScope.logedInUser.role){

                case "spieler":
                    console.log("*** präsentiere Spielerinfos");
                    $scope.spieler= true;

                    break;

                case "admin":
                    console.log("*** präsentiere Admininfos");
                    $scope.zeigeVerleih= false;

                    break;
                case "verleih":      //Verleihansicht
                    console.log("*** präsentiere Verleihinfos");

                    break;
            }


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
                    'verleihWunsch': $rootScope.verleihWunsch,
                    'ringWunsch': $rootScope.ringWunsch,
                    'filme': $rootScope.filme, // nur zur entwicklung
                    'myProvID' : {"counter " : $rootScope.myProvID.counter}
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
            var filmlaufKW = moment(kwDonnerstag).format("YYYY")+"-W"+moment(kwDonnerstag).isoWeek(); // Bsp: 2017W48
            console.log("in Filmlauf KW "+filmlaufKW);
            $scope.kw =  "Kinowoche "+ moment(kwDonnerstag).isoWeek();
            $scope.kwDonnerstag =  moment(kwDonnerstag).format('DD.MM.')
            $scope.kwEnde =  moment(kwEnde).format('DD.MM.')

// Datumsanzeige Kinowoche
              // 0  [ "bc-g0", false,  "2016-W49",  1          ]
                var kw40 = $rootScope.filmlauf[40][0][2].substr(6);
                var mykw = filmlaufKW.substr(6);
                var diff = mykw-kw40;
                var myIdx = 40+(diff*8);
                //console.log($rootScope.filmlauf[40])
                //console.log("kw40 "+kw40+" mykw "+mykw+" diff "+diff+" myIdx "+myIdx)

            // wird vom watcher aufgerufen nachdem alle Daten geladen sind
            var ladeAnsichten = function(){
                console.log("lade Ansichten");
                //wer ist eingeloged

                // hole Infos zu fehlenden Rückmeldungen
               console.log(JSON.stringify($rootScope.ringBuchungen));
               console.log("fehlendeRueckmeldungen " + JSON.stringify($rootScope.fehlendeRueckmeldungen));

                $rootScope.fehlendeRueckmeldungen.forEach(function (fBID) {
                   $scope.fbids[fBID] = {};
                   $scope.fbids[fBID].titel =
                       $rootScope.verleihBuchungen[  $rootScope.ringBuchungen[fBID]['vBID']]['titel'];
                   $scope.fbids[fBID].ort =
                       FfkUtils.getNamezurId( $rootScope.spielorteSortiert , $rootScope.ringBuchungen[fBID]['sid']);

                   $scope.fbids[fBID].sid = $rootScope.ringBuchungen[fBID]['sid'];
                   $scope.fbids[fBID].vid = $rootScope.verleihBuchungen[$rootScope.ringBuchungen[fBID]['vBID']].vid;


                   // TODO verleichID !!
                   $scope.fbids[fBID].verleih = FfkUtils.getNamezurId( $rootScope.verleiherSortiert ,
                       $rootScope.verleihBuchungen[$rootScope.ringBuchungen[fBID]['vBID']].vid);


                   $scope.fbids[fBID].datum = moment($rootScope.ringBuchungen[fBID]['datum']).hour(12).format('DD.MM.YY');
                    $scope.fbids[fBID].id = $rootScope.ringBuchungen[fBID]['fBID'];

                });



            }



            $scope.besucherEintragen = function (fBID) {
                console.log("bearbeite fBID " + fBID);
                // [0] = verarbeitungsart [1] = input

                ModalRingBuchungEintrittBearbeitenService.editBesucher( ['fBID' , fBID ] );

            };

            $scope.showSpielort = function(sid) {
                console.log("showSpielort mit sid "+ sid);
                OpenModalVenueService.editVenue(sid);
            };

            $scope.showVerleih = function(vid) {
                $log.debug("showVerleih mit vid: " + vid);
                // $scope.vid = vid;
                OpenModalDistributorService.editDistributor(vid);

            };


                var allesGeladen = $scope.$watch(function () {
                    return ($rootScope.status.filmlaufGeladen &&
                    $rootScope.status.verleihBuchungenGeladen && $rootScope.status.fehlendeRueckmeldungenGeladen);
                }, function () {
                    if ($rootScope.status.filmlaufGeladen &&
                        $rootScope.status.verleihBuchungenGeladen && $rootScope.status.fehlendeRueckmeldungenGeladen) {
                        allesGeladen(); // clear watcher
                        console.log("***** starte Dashboardübersicht");
                        console.log(JSON.stringify($rootScope.filmlauf[myIdx]));
                        ladeAnsichten();
                    }
                }, true);



}]);
})();