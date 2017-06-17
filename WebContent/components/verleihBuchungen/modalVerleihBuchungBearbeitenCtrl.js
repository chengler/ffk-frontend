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
         //   console.log("buchung geladen: "+JSON.stringify(buchung));

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
            var laufz = buchung.laufzeit; // die alte laufzeit bei lzänderungen
			$scope.laufzeit = laufz;
			var start = moment(buchung.start).hour(12);
		//	console.log("start=" + start._d);
			$scope.dtStart = start._d;
			var endDatum = function() {
				$scope.dtEnd = moment($scope.dtStart).add($scope.laufzeit * 7 - 1, 'days')._d;
			};
			endDatum();
			var dtStartDateWatcher;
			var dtEndDateWatcher;

			// Änderungen des Enddatums ändert die Laufzeit
			var endDiff = 0;
			watchDtEnd = function() {
				dtEndDateWatcher = $scope.$watch('dtEnd', function(newValue, oldValue) {
					if (!(newValue == oldValue)) { // Änderung
						// Änderung des Enddatums in Wochen
						var diff = moment(newValue).diff(moment(oldValue), 'weeks');
						console.log("endDvvvvvvvvvvvvvvvviffendDiffendDiff "+endDiff);
						// min 1 Woche Laufzeit oder setze End zurück
						endDiff = endDiff +diff; // was ändert sich
													// insgesammt
							$scope.laufzeit = $scope.laufzeit + diff; // änderung
																		// scope
							updateOptionsMedien(); // zeitraum Medienwahl
							console.log("Ende verschoben um Woche(n): " +diff);
						
					}
				});
			};
			watchDtEnd();
			var startDiff = 0;
			// Änderungen des Startdatums ändert die Enddatum
			watchDtStart = function() {
				dtStartDateWatcher = $scope.$watch('dtStart', function(newValue, oldValue) {
					if (!(newValue == oldValue)) {
						dtStartDateWatcher(); // beende watcher
						dtEndDateWatcher();
						$scope.dtStart = newValue; // setze Startdatum
						endDatum(); // berechne neues enddatum
						updateOptionsMedien(); // zeitraum Medienwahl
						watchDtStart(); // starte watcher
						watchDtEnd();
						// Änderung des Startdatums in Wochen
						startDiff = moment(newValue).diff(moment(oldValue), 'weeks');
						console.log("Start verschoben um Woche(n) : ", startDiff); // 1 );
					}
				});
			};
			watchDtStart();

			// Änderungen laufzeit ändert enddatum
			$scope.neueLaufzeit = function(val) {
				if ($scope.laufzeit <= 1 && val == -1) {
					alert("Die Laufzeit muss mindestens eine Woche betragen.");
				} else {
					// setze neue laufzeit
					$scope.laufzeit = $scope.laufzeit + val;
					dtEndDateWatcher();
					endDatum(); // setze enddatum
					updateOptionsMedien(); // zeitraum Medienwahl
					watchDtEnd();
					endDiff = endDiff + val;
					console.log("Ende verschoben um Woche(n): ", endDiff);
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
			$scope.dateOptionsEnd = {
		//		dateDisabled : disabledEnd,
				formatYear : 'yy',
		//		maxDate : new Date($scope.dt.getFullYear() + 1, 0, 31),
		//		minDate : $scope.dtStart,
				// minDate : new Date($scope.dt.getFullYear(), 0, 1),
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
			$scope.openEndDatum = function() {
				$scope.popupEndDatum.opened = true;
			};

			$scope.popupStartDatum = {
				opened : false
			};
			$scope.popupEndDatum = {
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
					var datum = moment(buchung.medien[key]).hour(12)._d; 
					//console.log("typ "+ typ);
					//console.log("datum "+ datum);
					// setze datum für medium
					$scope.medium[typ]['dt'] = datum;
					$scope.medium[typ].set = true;
					$scope.medium[typ].btn = "btn-success";
				   };
				   if (buchung.menge != undefined) {
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
				"bc-00" : "Filmtyp J",
				"bc-10" : "Filmtyp A",
				"bc-20" : "Filmtyp B",
				"bc-30" : "Filmtyp C",
				"bc-40" : "Filmtyp D",
				"bc-50" : "Filmtyp E",
				"bc-60" : "Filmtyp F",
				"bc-70" : "Filmtyp G",
				"bc-80" : "Filmtyp H",
				"bc-90" : "Filmtyp I"
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
				console.log("delete VerleihBuchung, bzw Wunsch mit (vBID): " + vBID);
			    if (confirm("VerleihBuchung/Wunsch '" + buchung.titel + "' wirklich löschen?") == true) {
			    	$scope.ok('delete');

			    } else {
			    	console.log("delete abgebrochen");
			    };
			};
		
			
			
			// modal speichern
			$scope.ok = function(type) {
				var result = {};
				// speichern oder löschen
				result['art'] = art;
				result['startIdx'] = startIDX; // alter startindex
				result['laufzeit'] = laufz; // alte laufzeit
				result['laufzeitNeu'] = $scope.laufzeit;
				result['vBID'] = vBID;
				result['fID'] = fID;
				result['delete'] = false;
				result['medien'] = {};
				result['menge'] = $scope.menge;
				// 
				// neue Medienverfügbarkeit
				// result['medien'] erhält änderungen
				// entweder neues datum oder false bei löschung
				// console.log("buchung.medien
				// "+JSON.stringify(buchung.medien));

                if (  buchung.medien == undefined){
                    buchung['medien'] = {};
				}
				for (var typ in $scope.medium){
					var geaendert = false;
					// console.log("eintrag "+typ);
					var isoDate = moment($scope.medium[typ].dt).format('YYYYMMDD');
					
					// typ gabs nicht
					if (  buchung.medien[typ] == undefined){
						// gibts aber jetzt
					  if ($scope.medium[typ].set) {
						  geaendert = true;
						  };
						  // gabs, aber nun neues Datum oder gibts nun nicht
							// mehr
					  } else if ( ((buchung.medien[typ] != isoDate) & ($scope.medium[typ].set)) | ( ! ($scope.medium[typ].set)  )){
						  geaendert = true;
			 				 
						 };
					if (geaendert) {
						if ($scope.medium[typ].set) {
						result['medien'][typ] = isoDate;
						} else {
							result['medien'][typ] = false;
						}
						$log.info("   Eintrag geändert "+ [typ] + " : " + result['medien'][typ]);
						};
				}
				// lösche object, wenn kein Inhalt
				if (Object.keys(result['medien']).length == 0 ) {
					delete result['medien'];
				}
				// console.log(JSON.stringify(result['medien']));
				

				
				
				
				// änderung der Farbe Farbe ?
					result['bc'] = $scope.bcColor;;
				if ($scope.bcColor != alteBC) {
					result['renew'] = true;
				}
				// Änderung der Medien

				// Änderung Start
				if (startDiff != 0) {
					result['startNeu'] = $scope.dtStart;
					result['startDiff'] = startDiff;
					result['delete'] = true;
					result['new'] = true;

				}
				// Änderung End
				if (endDiff != 0) {
					result['endDiff'] = endDiff;
					result['delete'] = true;
					result['new'] = true;

				}
				$uibModalInstance.close(result);
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss('cancel');
			};
		});
