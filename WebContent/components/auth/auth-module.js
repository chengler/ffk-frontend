"use strict";

(function() {
	var auth = angular.module('app.auth', [ 'modalVenue', 'modalUser', 'ffkUtils' ]);

	auth.controller('loginCtrl', function($log, $scope, $rootScope, $http, FfkUtils, OpenModalVenueService, OpenModalUserService, OpenModalDistributorService) {
		console.log("auth.controller called");
		// $rootScope.username = "";
		// $rootScope.loggedIn = false;

        // lade demousers users
        // usersSortiert
        // [ "uid", "logName", "role", "id", "name" ] id is sid oder vid
        $http.get('../example_data//JSONusers.js?' + Math.random()).success(
            function(data) {
                $rootScope.users = data[0];
                console.log(Date.now() + " JSONusers: " + Object.keys($rootScope.users).length
                    + " user in $rootScope geladen");
                FfkUtils.sortiereUsers();
            });

        // fülle Loginfenster
        $scope.auth = {
            "username" : "jh",
            // "username" : "username2",
            "password" : "passwordForUser2"
        };


        var loadDatei = function(){
            var dateiname = "../example_data/datensatzFfK-3.js";
            if ($rootScope.logedInUser.role == "verleih") {
                switch ($rootScope.logedInUser.vid) {
                    case "vid1":
                        dateiname = "../example_data/datensatzVID-1.js";
                        break;
                }
            }
            console.log("lade Datei  "+ dateiname);
            console.log("+ async loadDatei $http.get("+dateiname+"?");
            var fileContent = {}
            $http.get(dateiname + '?' + Math.random()).then(
                function (data) {
                    console.log("+ async loadDatei loaded");
                    console.log( data);
                    fileContent=data.data;
                    FfkUtils.ladeDatensatz(fileContent);
                });
        };

		// das login
		$scope.login = function() {
			console.log("demo/login mit:", $scope.auth);
			console.log("passwort ist hier egal");
			FfkUtils.loginIfTrue($scope.auth.username);
			// anmeldung erfolgreich | gescheitert
			if ($rootScope.loggedIn) {
				console.log("angemeldet ist nun " + JSON.stringify($rootScope.logedInUser));
                //ladeGrundtabelle();
                loadDatei();
			} else {
				console.log("anmeldung gescheitert");
				$scope.auth.username = "jh(admin), max(spieler) oder em(verleih)!";
			}
		};

		$scope.logout = function() {
			$rootScope.username = "";
			$rootScope.spielort = [];
			$rootScope.loggedIn = false;

		};

		$scope.demoPost = function() {
			$http.post("api/v1/demo/demo-post-method").then(function(data) {
				console.log("demo-post-method", data);

			});
		};

		$scope.showUser = function() {
			OpenModalUserService.editUser($rootScope.logedInUser.uid);
		};
		
		$scope.showReferenz = function() {
			$log.debug("zeige Ref für "+JSON.stringify($rootScope.logedInUser,0,0));
			if ($rootScope.logedInUser.sid != undefined) {
					OpenModalVenueService.editVenue($rootScope.logedInUser.sid);
				} else if ($rootScope.logedInUser.vid != undefined) {
					OpenModalDistributorService.editDistributor($rootScope.logedInUser.vid);
					
				} else {
					console.log("Keine Referenz definiert");
				}
			};




		//erstelle  Grundtabelle

        var ladeGrundtabelle = function () {
            $log.info("***** erstelle  grundTabelle");
            // erstelle row data
            // 60 Wochen KW 1 minus 4 Wochen, KW 52 plus 4 Wochen
            // buggy iso30 !important
            var ersterDo = moment().isoWeek(30).isoWeekYear(new Date().getFullYear()).isoWeek(1).isoWeekday(4)
                .hour(12);
            // 4 Wochen zurück
            ersterDo = moment(ersterDo).subtract(4, 'weeks');
            console.log("ersterDo " + ersterDo._d);
            // erstelle grundwert für die Programmtabelle
            // dies ist der Zeit Grundwert für idx0(KW) und idx1(Tag)
            $rootScope.ersterDo = moment(ersterDo).hours(12).minutes(0).seconds(0).millisecond(0);
            // erstelle 60 Wochen a 8 einträge

            for (var w = 0; w < 60; w++) {
                var datum = moment(ersterDo).format('YYYY');
                datum = datum + 'W';
                datum = datum + moment(ersterDo).format('ww');
                $rootScope.filmlauf.push({
                    "datum": datum,
                    "bc": "bc-g0",
                    "lines": 1,
                    "col": 0
                });
                for (var t = 0; t < 7; t++) {
                    $rootScope.filmlauf.push({
                        "datum": moment(ersterDo).format('YYYYMMDD'),
                        "bc": "bc-g2",
                        "lines": 1,
                        "col": 0
                    });
                    ersterDo = moment(ersterDo).add(1, 'day');
                }

            }

            $rootScope.status.grundTabelleGeladen = true;
           // $rootScope.status.filmlaufGeladen = true;
            console.log("grundTabelleGeladen " + $rootScope.status.grundTabelleGeladen);

        };
        // was erledigt werden kann während das Programm auf das login wartet.
        ladeGrundtabelle();


        var erstelleFilmlauf = function(){
            console.log("erstelle Filmlauf");
            var vBID; // die je aktuelle vBID
            var fBID; // die je aktuelle fBID

            if ($rootScope.status.filmlaufGeladen == true) {
                console.log("************** Filmlauf wurde bereits geladen, also wird er nun auch nicht mehr berechnet");
            } else {
                $rootScope.status.erstelleFilmlauf = true; // verhinder, das jetzt noch ein Filmlauf aus einem Datensatz geladen wird.
            //START
               //  erstelle array mit datum und vbid
                var verleihBuchungSortiert = [];
                // erstelle array
                for (  vBID in $rootScope.verleihBuchungen ){
                    verleihBuchungSortiert.push( [$rootScope.verleihBuchungen[vBID].start, vBID]);
                }
                verleihBuchungSortiert = FfkUtils.sortList(verleihBuchungSortiert , 0)
                //console.log("sortierte Verleihbuchungen " + JSON.stringify(verleihBuchungSortiert));

                // iteriere durch alle sortierte Verleihbuchungen
                var idx=0; // zielindex der Buchung
                var colint = 0
                var eintrag = {"bc":null, "vBID": null, "fID": null, "fw": null };
                for (var i = 0; i < verleihBuchungSortiert.length; i++){ // alle Buchungen einzeln
                    idx = FfkUtils.getKwIdxVomDatum(verleihBuchungSortiert[i][0]);
                    vBID = verleihBuchungSortiert[i][1]

                    eintrag = {"bc":$rootScope.verleihBuchungen[vBID].bc,
                        "vBID": vBID,
                        "fID": $rootScope.verleihBuchungen[vBID].fID,
                        "fw" : null
                         };
                    colint = $rootScope.filmlauf[idx].col + 1;
                    for (var fw = 1; fw <= $rootScope.verleihBuchungen[vBID].laufzeit; fw = fw+1 ){  //einzelbuchung
                        $rootScope.filmlauf[idx].col = colint; // maxcol für diese zeile
                        $rootScope.filmlauf[idx]["col"+colint] = eintrag; // erstelle wocheneintrag
                        $rootScope.filmlauf[idx]["col"+colint]["fw"] =  fw;
                        //deep copy
                        $rootScope.filmlauf[idx]["col"+colint] = JSON.parse(JSON.stringify($rootScope.filmlauf[idx]["col"+colint]));

                        console.log("datum "+verleihBuchungSortiert[i] + " auf idx "+ idx + " in col" + colint);
//tageseintragungen

                        var basis = eintrag.bc.substring( 0, eintrag.bc.length -1); // schneide letze zahl ab
                        var endung ;
                        for (var tage = 1 ; tage < 8; tage += 1){ //Farbschema für die Wochentage
                            if ( tage % 2 == 0){ // gerade
                                endung = "2";        //hänge 1 oder 2 ran
                            } else { //ungerade
                                endung = "1";
                            }
                            $rootScope.filmlauf[idx+tage].col = colint; // setze richtige spaltenzahl für zeile
                            $rootScope.filmlauf[idx+tage]["col"+colint] = {"bc": basis+endung}; // tageseintrag
                        };
                        // mehr als eine Filmwoche
                        idx += 8; // erhöhe idx um 8
                    }
                }
            }
            verleihBuchungSortiert = null;
            //  erstelle array mit datum und fBID
            var ringBuchungSortiert = [];
            // erstelle array
            for (  fBID in $rootScope.ringBuchungen ){
                ringBuchungSortiert.push( [$rootScope.ringBuchungen[fBID].datum, fBID]);
            }
            ringBuchungSortiert = FfkUtils.sortList(ringBuchungSortiert , 0);
            console.log("sortierte Ringbuchung " + JSON.stringify(ringBuchungSortiert));


            idx=0; // zielindex der Buchung
            var fnr; // die filmnummer
            var kwidx = 0;
            eintrag = { "fBID":null,"check1":false,"check2":false,"sid":null,"medium":"","medienID":false,
                "vonID":false,"nachID":false,"garantie":false,"datum":"","vBID": null};
            for (var i = 0; i < ringBuchungSortiert.length; i++) { // alle Buchungen einzeln
                fBID = ringBuchungSortiert[i][1];
                idx = FfkUtils.getKwIdxVomDatum(ringBuchungSortiert[i][0]) + 1;//+1 weil nicht kw zeile
                kwidx = FfkUtils.getKinoWochenRowIdx(idx); // um die buchungen zu finden
                colint = FfkUtils.getColFromVbid( kwidx,  $rootScope.ringBuchungen[fBID].vBID ); //welche Spalte
                fnr = FfkUtils.getBuchungenProTag($rootScope.filmlauf[idx], "col"+colint); // der wievilete film f1 f2 ...
                console.log("datum "+ringBuchungSortiert[i][0] + " idx: "+idx +"kw zeile "+kwidx+ "und col " + colint +" filmnr "+fnr);
                // schreibe defaults
                var meinZiel = $rootScope.filmlauf[idx]["col"+colint];
                meinZiel["f"+fnr] = eintrag;
                // schreibe details
                var myRing = $rootScope.ringBuchungen[ringBuchungSortiert[0][1]];
                for (var key in myRing){
                    meinZiel["f"+fnr][key] = myRing[key];
                }
            }


            $rootScope.status.filmlaufGeladen = true;
        }

        // setze watcher der mit dem berechnen des Filmlaufes beginnt, sobald alle daten da sind
		 // setze watcher

		// ringBuchunggeladen
		// verleihBuchunggeladen

		// filme nicht nötig, wird nachgeladen

		 var allesGeladen = $scope.$watch(function () {
		 return ($rootScope.status.verleihBuchungenGeladen
                    && $rootScope.status.ringBuchungenGeladen);
		 }, function () {
		 if ($rootScope.status.verleihBuchungenGeladen
                    && $rootScope.status.ringBuchungenGeladen )
		    {
             allesGeladen(); // clear watcher
                console.log("******************** starte mit erstelleFilmlauf");
                erstelleFilmlauf();
		 }
		 }, true);
		 // lade Filmlauf sobald bekannt ist, wer sich angemeldet hat

        // spielorte geladen
        // verleiher geladen


        $scope.reMasquerade = function(){
            //hole alten namen
        	$rootScope.logedInUser["idName"] = $rootScope.logedInUser.maskedIdName;
            //lösche alte ids
            $rootScope.logedInUser["vid"]= null;
            $rootScope.logedInUser["sid"]= null;

			// setze neue id, falls es früher eine gab
            var id = $rootScope.logedInUser.maskedID;
            console.log("reMasquerade zu id "+ id);
            if (id) {  //false, falls keine vorhanden war
                $rootScope.logedInUser[id.substr(0, 3)] =     $rootScope.logedInUser.maskedID; // z.B. {vid: vid1}
			}

            $rootScope.logedInUser.maskedIdName = false;
            $rootScope.logedInUser.maskedID = false;
            $rootScope.logedInUser["masked"] = false;
        };


    });
})();