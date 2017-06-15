angular.module('modalVerleihBuchung', [ 'ui.bootstrap', 'ffkUtils' ]).constant('MODULE_VERSION', '0.0.1')
//
// SERVICES // ehemals modalFilmKW

//
// modal
// http://angular-ui.github.io/bootstrap/#/modal
.service('ModalVerleihBuchungsService', function($uibModal, $log, FfkUtils) {
	this.editKW = function($scope, rowIdx, colIdx, colTyp) {
		var modalInstance = $uibModal.open({
			templateUrl : './components/distributores/modalVerleihBuchung.html?' + Math.random(),
			controller : 'ModalKWInstanceCtrl',
			size : "lg",
			resolve : {
				filmlaufIdx : function() {
					return rowIdx;
				},
				colIdx : function() {
					return colIdx;
				},
				scope : function() {
					return $scope;
				},
				colTyp : function() {
					var typ = "";
					// nix = Film; 1 = Wunschfilm
					if ( colTyp != undefined){
						typ = colTyp;
					}
					return typ;
				}
			}
		});
		// Filmtyp 1 ist Wunschfilmm undefined = normal
		$log.debug("distributores/modalVerleihBuchung.js mit filmlaufIdx: " + rowIdx + " colIdx: " + colIdx + " Filmtyp " + colTyp);
		// die Rückgabe
		modalInstance.result.then(function(res) {
			$log.debug("ModalReturn: " + JSON.stringify(res, 1, 4));
			var col = 'col' + colIdx; // col1 ...
			var typ = 'film';
			if ( 1 == res.colTyp){
				typ = 'wunsch';
				col= col +'w';
			}
			switch (res.typ) {
				case ("speichern"):
					$log.debug("case speichern");
				/*if (res.colTyp == 1){ // wunschfilm
					$scope.verleihBuchungen['wuensche'][res.vBID]['menge'] = res.menge;
				} else {
					$scope.verleihBuchungen[res.vBID]['menge'] = res.menge;
				}*/
				// wunschfilm oder bereits gebucht?
					var zuSpeichern =   $scope.verleihBuchungen[res.vBID];
                    if (res.colTyp == 1){ // wunschfilm
                        zuSpeichern = $scope.verleihBuchungen['wuensche'][res.vBID];
                    }

                    zuSpeichern['menge'] = res.menge;
// laufzeitänderung

				if (res.hasOwnProperty("laufzeitNeu")) {
                    // neue laufzeit
                    zuSpeichern["laufzeit"] = res.laufzeitNeu;
                    console.log("neue Laufzeit gesetzt. Nun " + zuSpeichern.laufzeit);
                    // fw (filmwoche) für einspielergebnisse fw1:[0,0]
                    var dif = res.laufzeitNeu - res.laufzeit;
                    // neue fw
                    if (dif >= 0) {
                        for (var i = (res.laufzeit + 1); i <= res.laufzeitNeu; i++) {
                            zuSpeichern['fw' + i] = [0, 0];
                        }
// lösche fw's

                    } else {
                        for (var i = (res.laufzeit); i > res.laufzeitNeu; i--) {
                            zuSpeichern['fw' + i] = null;
                            delete zuSpeichern['fw' + i];
                        }
                    }
                }


					// res.startIdx;
					// res.laufzeit;
					// res.vBID
					// result['fID'] = fID;
					// result['delete'] = false;
					// result['new'] = false;
					// result['renew'] = false;
					// result['laufzeitNeu']
					
					// bleibt falls kein neuer Startindex
					var neustart = res.startIdx; 
					// bleibt vielleicht
					var neuend =  res.startIdx + res.laufzeitNeu * 8 -1 ;
					// das alte ende bleibt
					var altend =  res.startIdx + res.laufzeit * 8 -1;
					// alter start bleibt immer
					var altstart = res.startIdx;
					
					var typ = 'film';
					if ( 1 == res.colTyp){
						typ = 'wunsch';
					}

					if ("bc" in res) { // Hintergrundfarbe geändert
						// setze Farbe
						FfkUtils.newBackgroundFilmlauf( res.startIdx, res.laufzeit, col, res.bc, typ);
					}
					
				
					
					
					if ('medien' in res) {
						var buchung =zuSpeichern;
						/*if (res.colTyp == 1){ // wunschfilm
							buchung = $scope.verleihBuchungen['wuensche'][res.vBID];
						} else {
							buchung = $scope.verleihBuchungen[res.vBID];
						}*/
// $log.debug("Medien alt: "+JSON.stringify($scope.verleihBuchungen[res.vBID].medien));
						for (var med in res.medien){
// $log.debug("änderungen "+ med +" : "+JSON.stringify(res.medien[med]));
							if (res.medien[med] == false) {
								delete buchung.medien[med];
							} else {
								buchung.medien[med] = res.medien[med];
							}
						}
						$log.debug("Medien neu: "+JSON.stringify(buchung.medien));
										
					}

					//
					// suche ob veränderung der Laufzeit
// if ('endDiff' in res | 'startDiff' in res) {
						console.log("änderung der Laufzeit");
						// neuer start?
						if ('startDiff' in res) {
							neustart = neustart + res.startDiff * 8;
							neuend = neustart + res.laufzeitNeu * 8 -1;
							// lösche ehemalig vorige
							if (res.startDiff > 0){
								var delend = neustart -1; // lösche bis dahin
								if (neustart > altend){
									delend = altend; // lösche nie weiter als
														// altes ende
								}
								console.log("lösche ehemalig vorige von " + res.startIdx + " bis " + delend);
								for (var index = res.startIdx; index <= delend; index++) {
                                    if ($scope.filmlauf[index][col].f1 ) {
                                        FfkUtils.deleteRingBuchung(index, col);
                                    }
									delete $scope.filmlauf[index][col];
						//			console.log("index "+index);
								}
							}
						}
						// lösche ehemalig nachfolgende
						// wenn Buchungen in nachfolgenden, => mache sie zu wünschen daher:
						// speicher vBID
						// schaue ob ringBuchung gelöscht wird
						// kopiere verleihbuchung zu Verleihwunsch
						// verschiebe Ringbuchung Ringwunsch
						if ( altend > neuend) {
							var startdel = neuend +1;
							if(altstart > neuend){ // lösche nie vor altstart
								startdel = altstart;
							}
							console.log("lösche ehemalig nachfolgende von " +  startdel  + " bis " + altend);
							for (var index = startdel ; index <= altend; index++) {
							    //true wenn film gefunden
                                if ($scope.filmlauf[index][col].f1 ) {
                                    FfkUtils.deleteRingBuchung(index, col);
                                }
								delete $scope.filmlauf[index][col];
							}
						}
					// der neue Platzbedarf
					console.log("neuer Platzbedarf von idx "+ neustart + " bis idx "+ neuend);
					
					// suche erste freie Splate wenn kein Platz vorhanden
					var neuColIdx = 0;
					
					console.log("suche freie col in index " + neustart);
					
					
					while (true){
						neuColIdx = neuColIdx +1;
						// suche freien startindex
						neuColIdx = FfkUtils.getFirstFreeCol( $scope, $scope.filmlauf[neustart], typ,  neuColIdx, res.vBID);
						if (typ == 'wunsch'){
							console.log("Wunsch, Tiefe wird nicht überprüft");
							break;
						}
						$log.debug("Platz in neuCol "+ neuColIdx);
						// schaue ob tiefe passt
						var platzInTiefe = FfkUtils.checkPlatzInCol( neustart, 'col'+ neuColIdx, neuend,res.vBID );
						$log.debug("Platz in Tiefe? "+ platzInTiefe);
						if (platzInTiefe) {
							break;	
						};
					}
				
					// neue Spalte nun in colIDX
					var neuCol = 'col'+ neuColIdx;
					if ( 1 == res.colTyp){
						neuCol = neuCol + 'w';
					}
					var copyStart = altstart;
					var copyEnd = altend;
					// gibt es eine Schnittmenge ?
					// suche kopierstart
					if ( (neustart > altstart) & neustart < altend)  {
							$log.debug("  copyStart " + copyStart);
							copyStart = neustart;
							}
						// suche kopierEnde
						if ( (neuend < altend) & (neuend > altstart) ) {
								$log.debug("  copyEnd " + copyEnd);
								copyEnd = neuend;
							}
						
						// schreibe filmlauf bis copystart
						if (neustart < copyStart) {
							var end = copyStart;
							if (neuend < copyStart){
								end = neuend;
							}
							console.log("verlänger nach vorn von  "+ neustart +" nach " + end);
							addFilmlauf(neustart, end, neuColIdx, res.bc, res.vBID, res.fID);
						}
						
						// kopiere falls nötig
						// neue Spalte / kopierstart vorhanden /kopierende
						// vorhanden
						if ( (col != neuCol) & ( neustart < copyEnd ) & ( neuend > copyStart )){
							console.log("kopiere von "+ col +" nach " + neuCol);
							console.log("kopiere von IDX"+ copyStart +" bis IDX" + copyEnd);
							for (var idx = copyStart; idx <= copyEnd; idx++){
								$scope.filmlauf[idx][neuCol] = {};
								$scope.filmlauf[idx][neuCol] = $scope.filmlauf[idx][col];
								delete $scope.filmlauf[idx][col];
							}
						}
						// schreibe Filmlauf ab copyend
						if ( neuend > copyEnd ){
							var start = copyEnd +1;
							if (neustart > copyEnd){
								start = neustart;
							}
							console.log("verlänger nach hinten von  "+ start +" nach " + neuend);
							addFilmlauf(start ,neuend, neuColIdx, res.bc, res.vBID, res.fID);
						}
// }
					break;	
					
				
					
				
			case ("delete"):
				// kürze um alle Wochen
				res.endDiff = 0 -res.laufzeit;
			console.log("lösche alle: "+res.endDiff);
				shortFilmlauf(res.startIdx, res.laufzeit, col, res.endDiff);
				delete $scope.verleihBuchungen[res.vBID];
				break;
			}
			// Meldung zum Server
			$scope.server = "http.post('../vBIDchange') data: { TODO }";
			// zeichne Tabelle neu
			$scope.gridOptions.api.setRowData($scope.filmlauf);
			
			
	
			
			

		}, modalInstance.opened.then(function() {
			console.log('open ModalFilmKWService');
		}),

		function() {
			$log.info('Modal dismissed at: ' + new Date());
		});

		
		// verkürze Angebot um delWochen
		shortFilmlauf = function(startIdx, laufzeit, col, delWochen) {
			$log.debug("shortFilmlauf = function(startIdx, laufzeit, col, delWochen)");
			var enDelIdx = (laufzeit * 8) + startIdx;
			var startDelIdx = enDelIdx + (delWochen * 8);
			console.log("startDelIdx "+startDelIdx+" endDelIdx: "+enDelIdx);
			console.log("col "+col);
				for (var woche = startDelIdx; woche < enDelIdx; woche = woche + 8) {
				// WochenÜberschrift
				console.log("lösche woche idx " + woche);
				console.log(JSON.stringify($scope.filmlauf[woche][col]));
				delete $scope.filmlauf[woche][col];
				
				// iteriere durch Wochentage
				for (var t = 1; t < 8; t++) {
					var idx = woche + t;
					delete $scope.filmlauf[idx][col];
					}
			}
		
		};
		
		// füge neue Wochen hinzu
		addFilmlauf = function(start, ende, colIdx, bc, vBID, fID) {
			console.log("addFilmlauf = function(start, ende, colIdx, bc, vBID, fID) "+start +" "+ ende+ " "+ colIdx);
			// farbwert ist z.B. bc-5 von bc-50
			var farbwert = bc.substr(0, bc.length - 1);
			var col =  'col' + colIdx;
			var filmwoche = 0;
			for (var woche = start; woche <  ende; woche = woche + 8) {
				// WochenÜberschrift
				console.log("******************* START "+start);
				console.log("woche idx " + woche);
                filmwoche += 1;
				$scope.filmlauf[woche][col] = {};
				$scope.filmlauf[woche][col]['bc'] = bc;
				$scope.filmlauf[woche][col]['vBID'] = vBID;
				$scope.filmlauf[woche][col]['fID'] = fID;
                $scope.filmlauf[woche][col]['fw'] = filmwoche;
				// überprüfe col in Wochenüberschrift
				var maxCol = $scope.filmlauf[woche]['col'];
				// setze col neu wenn nötig
				if (colIdx > maxCol) {
					$scope.filmlauf[woche]['col'] = colIdx;
				}

				// iteriere durch Wochentage
				for (var t = 1; t < 8; t++) {
					var idx = woche + t;
					$scope.filmlauf[idx][col] = {};
					if (t % 2 == 0) { // Do, Sa ..
						$scope.filmlauf[idx][col]['bc'] = farbwert + 1;
					} else { // Fr, So ..
						$scope.filmlauf[idx][col]['bc'] = farbwert + 2;
					}
				}
			}
			
		};
	
	};
});



// ModalKWInstanceCtrl
// bezieht sich auf den Filmlauf der KW
angular.module('modalVerleihBuchung').controller('ModalKWInstanceCtrl',
		function(FfkUtils, $rootScope, $scope, $log, $uibModalInstance, filmlaufIdx, colIdx, colTyp) {

			$log.debug("ffkFilmModul <- ModalKWInstanceCtrl (FilmverleihBuchungen KW Wochenübersicht)");
			$log.debug("    filmlaufIdx : " + filmlaufIdx);
			$log.debug("    colIdx : " + colIdx);
			$log.debug("    colTyp : " + colTyp);
			$log.debug("    filmlauf : " + Object.keys($rootScope.filmlauf).length + " Objecte");
			$log.debug("    verleihBuchungen : " + Object.keys($rootScope.verleihBuchungen).length);
			var col = 'col' + colIdx;
			$scope.colType = ""; // "" bei Film
			// 1 bei Wunschfilm
			if (colTyp == 1 ){
				col = col +"w";
				$scope.colType = "w";
			}
			$log.debug("    col : " + col);

			// background Farbe
			$scope.bcColor = $rootScope.filmlauf[filmlaufIdx][col]['bc'];
			var alteBC = $scope.bcColor;

			// die VerleihbuchungsID
			var vBID = $rootScope.filmlauf[filmlaufIdx][col]['vBID'];
			// die FilmID
			var fID = $rootScope.filmlauf[filmlaufIdx][col]['fID'];

			// die ausgewählte Buchung
			var buchung = $rootScope.verleihBuchungen[vBID];
			var wochenBuchung = $rootScope.verleihBuchungen[$rootScope.filmlauf[filmlaufIdx][col]["vBID"]];

			if ( colTyp == 1){ // wunsch
				//buchung = $rootScope.verleihBuchungen["wuensche"][vBID];
                buchung = $rootScope.verleihWunsch[vBID];
                //wochenBuchung = $rootScope.verleihBuchungen["wuensche"][$rootScope.filmlauf[filmlaufIdx][col]["vBID"]];
                wochenBuchung = $rootScope.verleihWunsch[$rootScope.filmlauf[filmlaufIdx][col]["vBID"]];
			}

			// der Verleih
			$scope.verleih = $rootScope.verleiher[buchung.vid];

			// heute
			$scope.today = function() {
				$scope.dt = new Date();
			};
			$scope.today();

			// suche Start des Filmblocks
			var result = FfkUtils.getFilmstart($rootScope.filmlauf, filmlaufIdx, colIdx, vBID);
			var checkIDX = result.checkIDX;
			var lz = result.laufzeit;
			// suche nachfolgende Laufzeit
			result = FfkUtils.getLaufzeit($rootScope.filmlauf, filmlaufIdx, colIdx, vBID);
			lz = lz + result;
			$log.debug("laufzeit gesammt =" + lz);
			$scope.laufzeit = lz;

			
			
			// berechne Startdatum
			var start = moment($rootScope.filmlauf[checkIDX]['datum']);
			start.add(3, 'days'); // Donnerstag der Woche
			$log.debug("start=" + start._d);
			$scope.dtStart = start._d;
			var startIDX = checkIDX;

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
					console.log("typ "+ typ);
					console.log("datum "+ datum);
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
				console.log("toogle "+typ);
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

			$scope.delete = function() {
				$log.debug("delete Filmlauf (vBId): " + vBID);
			    if (confirm("Filmlauf '" + buchung.titel + "' wirklich löschen?") == true) {
			    	$scope.ok('delete');

			    } else {
			    	$log.debug("delete abgebrochen");
			    };
			};
		
			
			
			// modal speichern
			$scope.ok = function(type) {
				var result = {};
				// speichern oder löschen
				result['typ'] = type;
				result['colTyp'] = colTyp;
				
				result['startIdx'] = startIDX; // alter startindex
				result['laufzeit'] = lz; // alte laufzeit
				result['laufzeitNeu'] = $scope.laufzeit; 
				
				result['vBID'] = vBID;
				result['fID'] = fID;
				result['delete'] = false;
				result['new'] = false;
				result['renew'] = false; // ??
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
