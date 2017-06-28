/*
SERVICES // ehemals modalFilmKW

editBuchung( vBID, art)
 vBID BuchungsID
 1 Buchung
 2 Wunsch
Bearbeite VerleihBuchung
*

*/

// ModalVerleihBuchungsInstanceCtrl
// bezieht sich auf die Verleihbuchung oder Verleihwunsch
angular.module('modalVerleihBuchung').controller('ModalVerleihBuchungsInstanceCtrl',
		function(FfkUtils, $rootScope, $scope, $uibModalInstance, vBID, art) {

			console.log("    ModalVerleihBuchungsInstanceCtrl gestartet mit vBID " + vBID + " und art " + art + " (1Buchung/2Wunsch)");
			var buchung; // die VerleihBuchung oder der Verleihwunsch
            // lade Verleihbuchung, ausser es ist ein Wunsch
            if (art == 2) {
                buchung = $rootScope.verleihWunsch[vBID];
            } else {
                buchung = $rootScope.verleihBuchungen[vBID];
            }
            console.log("buchung geladen: "+JSON.stringify(buchung));
            console.log("    buchung.laufzeit: "+      buchung.laufzeit);


			// background Farbe
			$scope.bcColor = buchung.bc
			var alteBC = $scope.bcColor;
			// die VerleihbuchungsID
			// die FilmID
			var fID = buchung.fID
			// der Verleih
            $scope.verleih = $rootScope.verleiher[buchung.vid];
          //  console.log($scope.verleih);
            // heute
			$scope.today = function() {
				$scope.dt = new Date();
                $scope.dt.setHours(12); // contra zeitverschiebungen
			};
			$scope.today();

			// suche Start des Filmblocks
			$scope.laufzeitNeu =JSON.parse(JSON.stringify(buchung.laufzeit));
			var start = moment(buchung.start).hour(12);
		//	console.log("start=" + start._d);
			$scope.dtStart = start._d;
			var endDatum = function() {
				$scope.dtEnd = moment(start).add($scope.laufzeitNeu * 7 - 1, 'days').format('DD.MM.YY');
			};
			endDatum();

			var dtStartDateWatcher;
            var startDiff = 0;
			// Änderungen des Startdatums ändert die Enddatum
			watchDtStart = function() {
				dtStartDateWatcher = $scope.$watch('dtStart', function(newValue, oldValue) {
					if (!(newValue == oldValue)) {
						dtStartDateWatcher(); // beende watcher
                        // start immer am DO
                        start = moment(newValue).isoWeekday(4);
//						$scope.dtStart = moment(start).format('DD.MM.YY'); // setze Startdatum
                        $scope.dtStart = start._d;

                        endDatum(); // berechne neues enddatum
						updateOptionsMedien(); // zeitraum Medienwahl
						watchDtStart(); // starte watcher
						// Änderung des Startdatums in Wochen
						console.log("Start neu: ", $scope.dtStart ); // 1 );
					}
				});
			};
			watchDtStart();

			// Änderungen laufzeit ändert enddatum
			$scope.neueLaufzeit = function(val) {
				if ($scope.laufzeitNeu <= 1 && val == -1) {
					alert("Die Laufzeit muss mindestens eine Woche betragen.");
				} else {
					// setze neue laufzeit
					$scope.laufzeitNeu = $scope.laufzeitNeu + val;
					endDatum(); // setze enddatum
					updateOptionsMedien(); // zeitraum Medienwahl
                    console.log("laufzeitNeu" + $scope.laufzeitNeu)
				}
			};

			/*var maximalDate = moment().set({'year': 2017, 'month': 11, 'date': 31, 'hour': 12});
			maximalDate = moment(maximalDate).format('YYYY-MM-DD');
			console.log("************** maximalDate"+maximalDate);
            var minimalDate = moment().set({'year': 2017, 'month': 01, 'date': 01, 'hour': 12});
            minimalDate = moment(minimalDate).format('YYYY-MM-DD');*/

			// gesperte Datumsfelder
			$scope.dateOptionsStart = {
		//		dateDisabled : disabledStart,
				formatYear : 'yy',
		//		maxDate : new Date($scope.dt.getFullYear(), 11, 31),
		//		maxDate : maximalDate,
		//		minDate : new Date($scope.dt.getFullYear(), 0, 1),
        //        minDate : minimalDate,
				startingDay : 1
			};

			// wird aktualisiert, wenn die laufzeit geändert wird
			var updateOptionsMedien = function() {
				$scope.dateOptionsMedien = {
					// dateDisabled : disabledEnd,
					formatYear : 'yy',
			//		maxDate : $scope.dtEnd,
			//		minDate : $scope.dtStart,
					startingDay : 1
				};
			};
			updateOptionsMedien();

			// Disable weekend selection
			function disabledStart(data) {
				var date = data.date, mode = data.mode;
				return mode === 'day' && (date.getDay() !== 4);
			}

			function disabledEnd(data) {
				var date = data.date, mode = data.mode;
				return mode === 'day' && (date.getDay() !== 3);
			}

			$scope.openStartDatum = function() {
				$scope.popupStartDatum.opened = true;
			};


			$scope.popupStartDatum = {
				opened : false
			};


			// Darstellung des Datums
			$scope.format = 'dd.MM.yy';

			// die feste reihenfolge für den view
			$scope.medienTypen = [ "BD", "DCP", "DVD", "analog" ];
			
			$scope.medium = {};
			$scope.menge = {};
			// setze Medienvariblen
			 for (var typ of $scope.medienTypen){
				$scope.medium[typ] = {};
				$scope.medium[typ].typ = typ;
				$scope.medium[typ].dt = $scope.dtStart;
				$scope.medium[typ].set = false;
				$scope.medium[typ].btn = "btn-danger";
				$scope.medium[typ].popup = {
					opened : false
				};
				$scope.menge[typ] =0;
			};
			
			// fülle Medienvariablen aus buchung
			for (var key in buchung.medien) {
				  if (buchung.medien.hasOwnProperty(key)) {
					var typ = key;
				if (buchung.medien[key] != false) {


                     var datum = moment(buchung.medien[key]).hour(12)._d;
					//console.log("typ "+ typ);
					//console.log("datum "+ datum);
					// setze datum für medium
					$scope.medium[typ]['dt'] = datum;
					$scope.medium[typ].set = true;
					$scope.medium[typ].btn = "btn-success";
				   };

                  }

				   if (buchung.menge != undefined ) {
					   $scope.menge[key] = buchung.menge[key];
				   };
				};
				// fülle Mengenvariablen aus buchung
			

			
			
			$scope.openMediumDatum = function(typ) {
				console.log("openMediumDatum "+typ);
				$scope['medium'][typ].popup.opened = true;
				$scope['medium'][typ].set = true;
				$scope['medium'][typ].btn = "btn-success";
			};
			
			$scope.toggleMedium = function(typ) {
			//	console.log("toogle "+typ);
				if ($scope['medium'][typ].set) {
					$scope['medium'][typ].set = false;
					$scope['medium'][typ].btn = "btn-danger";
				} else {
					$scope['medium'][typ].set = true;
					$scope['medium'][typ].btn = "btn-success";
				}
			};

			

			// Farben
			$scope.farbModel = {
				"bc-00" : "Filmtyp A",
				"bc-10" : "Filmtyp B",
				"bc-20" : "Filmtyp C",
				"bc-30" : "Filmtyp D",
				"bc-40" : "Filmtyp E",
				"bc-50" : "Filmtyp F",
				"bc-60" : "Filmtyp G",
				"bc-70" : "Filmtyp H",
				"bc-80" : "Filmtyp I",
				"bc-90" : "Filmtyp J"
			};

			$scope.neueFarbe = function(farbe) {
				$scope.bcColor = farbe;
			};

            $scope.header = "Filmlauf für '"+ buchung.titel+"' bearbeiten";
            $scope.filmtitel = buchung.titel;


/*

			// neuer Filmlauf oder bestehender
			if (colIdx == 0) {
				$scope.isNew = true;
				$scope.isOld = false;
				$scope.header = "Neuen Filmlauf anlegen";
				$scope.filmtitel = "titel";
			} else {
				$scope.isNew = false;
				$scope.isOld = true;
				// wochenBuchung =
				// $rootScope.verleihBuchungen[$rootScope.filmlauf[filmlaufIdx][col]["vBID"]];
				$scope.header = "Filmlauf bearbeiten";
				$scope.filmtitel = wochenBuchung["titel"];
			}
*/

			$scope.delete = function() {
				console.log("delete VerleihBuchung, bzw Wunsch "+art+ " mit (vBID): " + vBID);
			    if (confirm("VerleihBuchung/Wunsch '" + buchung.titel + "' wirklich löschen?") == true) {
                    //TODO REST vBID;
                    var myBuchung;
                    var myRingBuchungen;
                    if (art == 1 ){
                        $rootScope.verleihBuchungen[vBID] = null;
                        delete $rootScope.verleihBuchungen[vBID];
                        myRingBuchungen = $rootScope.ringBuchungen;
                               } else {
                        $rootScope.verleihWunsch[vBID] = null;
                        delete $rootScope.verleihWunsch[vBID];
                        myRingBuchungen = $rootScope.ringWunsch;
                    }
                    console.log(myBuchung);
                    myBuchung = null;
                    delete myBuchung;
                    console.log(myBuchung);


                    //
                    for (ringB in myRingBuchungen ){

                       // eine Ringbuchung zur Verleihbuchung
                       if (myRingBuchungen[ringB].vBID == vBID){
                           console.log("Ringbuchung "+ringB+ " wird gelöscht, da Verleihbuchung "
                               +vBID + " gelöscht wurde");
                           myRingBuchungen[ringB] = null;
                           delete myRingBuchungen[ringB];

                       }
                    }

                    $uibModalInstance.close({});

			    } else {
			    	console.log("delete abgebrochen");
			    };

			};
		
			
			
			// modal speichern
			$scope.speichern = function() {
				console.log("speichern: ");
				var result = {};


				//Änderung der Laufzeit
                if ($scope.laufzeitNeu != buchung.laufzeit){
                    result['laufzeit'] = $scope.laufzeitNeu;
				}
                //Änderung des Starts
                if (moment(start).format('YYYYMMDD') != buchung.start){
                    result['start'] = moment(start).format('YYYYMMDD');
                }
                if($scope.bcColor != buchung.bc){
                    result['bc'] = $scope.bcColor;
                }
                //Änderung Medium
                var medienDateNeu;
                var medienStatusNeu;
                var medienStatusAlt;
                result['medien'] = {};
                result['menge'] = {};
                for( var typ in $scope['medium']){
                    //menge
                    if( $scope.menge[typ] != buchung.menge[typ]) {
                        result['menge'][typ] = $scope.menge[typ];
                    }

                    //medien":{"BD":"20170526"}
                    medienDateNeu = moment($scope['medium'][typ].dt).format('YYYYMMDD');
                    medienStatusNeu = $scope['medium'][typ].set;
                     if( buchung.medien[typ] == undefined | buchung.medien[typ] == false){
                         medienStatusAlt = false;
                     } else {
                         medienStatusAlt = true;
                     }
                                         // neues Datum
                    if (medienStatusNeu == true & medienStatusAlt == false){
    //                    console.log(typ + " hat nun datum");
                        result.medien[typ] = medienDateNeu;
                    }
                    // kein Datum mehr
                    if (medienStatusNeu == false & medienStatusAlt == true){
  //                      console.log(typ +" hat kein Datum mehr");
                        result.medien[typ] = false;
                    }
                    //anderes Datum
                    if (medienStatusNeu == true & medienStatusAlt == true){
                        if (medienDateNeu != buchung.medien[typ]){
//                            console.log(typ + " hat nun anderes Datum");
                            result.medien[typ] = medienDateNeu;
                        }
                        // medium hat nun datum
                    }

                }
                //console.log(" $scope.medium " + JSON.stringify($scope.medium));
                //console.log(" $scope.menge " + JSON.stringify($scope.menge));





                console.log("result "+JSON.stringify(result));
				$uibModalInstance.close(result);
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss('cancel');
			};
		});
