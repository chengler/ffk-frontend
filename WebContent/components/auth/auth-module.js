"use strict";

(function() {
	var auth = angular.module('app.auth', [ 'modalVenue', 'modalUser', 'ffkUtils' ]);

	auth.controller('loginCtrl', function($log, $scope, $rootScope, $http, FfkUtils, OpenModalVenueService, OpenModalUserService, OpenModalDistributorService, $sce) {
		console.log("auth.controller called");


        $scope.myVidauth =($sce.trustAsResourceUrl("https://www.youtube.com/embed/87y3bFmNGeg"));
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
            var dateiname = "../example_data/datensatzFfK-4.js";
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
                //erstelleGrundtabelle();
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





        // was erledigt werden kann während das Programm auf das login wartet.
        FfkUtils.erstelleGrundtabelle();

/*

idx 0 = [ {"datum":"2016W49","bc":"bc-g0","lines":1,"col":0} ],
idx 208 = [ {"datum":"2017W23","bc":"bc-g0","lines":1,"col":1,"col1":{"bc":"bc-10","vBID":"vp2","fID":"fp1","fw":1},"col1w":{"bc":"bc-00","vBID":"vp12","fID":"fp11"}} ],
idx 211 = [ {"datum":"20170610","bc":"bc-g2","lines":1,"col":1,"col1":{"bc":"bc-11"},"col1w":{"bc":"bc-00","sids":[["sid5",false]]}} ],

struktur= [                  [0],                                    [1],                              [2] ]
                           Spalte 1                              Buchungen                           Wünsche
idx 0 =   [ [ "bc-g0", false,  "2016-W49",  1          ], [           false                    ], [      false           ] ],  minimum Verleih
idx 1 =   [ [ "bc-g2", 1-7,  "2016-12-18", 1        ], [           false                    ], [      false           ] ],  minimum Ring
idx 208 = [ [ "bc-g0", false,  "2017-W23", "bc-g0", 1  ], [ ["bc-10", "vp2", 1], ["bc-20"..        ], [[ "bc-10","vp12" ],[bc-20 ..   ] ], standard Verleih
idx 211 = [ [ "bc-g2", 1-7, "2017-06-10", "bc-g2", 1], [ ["bc-11", [fBID, ..]] , ["bc-22", [fBID] ], [[ ["bc-11", fBID],["bc-22",fBID] .. ], standard Ring

                [0] =  [ 0, 1, 2, 3 ] =[background, spieltag  , datum, lines in row] = [ int,  true|false , JJJJ-Www | JJJJ-MM-TT , int ]
                [1]    [ [0] .. ]   =  [background, vBID, filmwoche]  =   [ bc-10, vInt, int ]    ; kw true  =>   verleihBuchungen
                [2]    [ [0] .. ]   =  [background, vBID, filmwoche]  =   [ bc-20, vInt, int ]    ; kw true  =>   verleihWunsch
                [1] =  [[0],[1] ..,[n]]  =  [background, [fBID,fBID]] .. =   [ bc-11, [fBID,fBID..]]      ; kw false =>  ringBuchungen

                [2]    [ [0],[1] ..,[n] ]   =  [background, [fBID,fBID]] .. =   [ bc-20, [fBID,fBID..]]      ; kw false =>  ringWunsch

       */



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
                console.log("********** starte mit erstelleFilmlauf");
                FfkUtils.erstelleFilmlauf();
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