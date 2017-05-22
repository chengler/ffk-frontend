angular.module('ffkFilmModul', [ 'ui.bootstrap', 'ffkUtils' ]).constant('MODULE_VERSION', '0.0.1')
//
// SERVICES
//
// modal
// http://angular-ui.github.io/bootstrap/#/modal
.service(
		'OpenModalFilmService',
		function($uibModal, $log, FfkUtils, $rootScope) {
			this.editFilm = function($scope, rowIdx) {
				var modalInstance = $uibModal.open({
					templateUrl : './components/filme/modalFilmBuchung.html?' + Math.random(),
					controller : 'ModalFilmlRowInstanceCtrl',
					size : "lg",
					resolve : {
						rowIdx : function() {
							return rowIdx;
						}
					}
				});
				// ModalFilmlRowInstanceCtrl wird auf rowIdx des Filmlaufs
				// gestartet
				$log.info("ffkFilmModul OpenModalFilmService rowIdx: " + rowIdx);

				// TODO stack für asyncrone Serverantworten

				// Die Antwort des ModalFilmlRowInstanceCtrl
				modalInstance.result.then(function(res) {
					$log.debug("ffkFilmModul OpenModalFilmService ModalReturn: " + JSON.stringify(res, 1, 4));
					// die zu bearbeitende Tabellenreihe
					var buchungsTag = $rootScope.filmlauf[res.row];

					switch (res.typ) {
					case ("machBuchbar"): // wandel wunsch in Buchung
						// hole erste freie col in filmlauf
						var buchungsWoche = $rootScope.filmlauf[res.kwRow];
					   // hole freie Col
						var colnr = FfkUtils.getFirstFreeCol( $scope, buchungsWoche , "film", 1, res.wfID);
						// erstelle eintrag in Buchungen
						
						console.log("buchungen['wuensche'][res.wfID] mit [res.wfID] "+ [res.wfID] +" -> "+ JSON.stringify($rootScope.buchungen['wuensche'][res.wfID],0,0));
						// lege an , kopiere , änder bc
						$rootScope.buchungen[res.wfID] = {};
						$rootScope.buchungen[res.wfID]['fID'] =$rootScope.buchungen['wuensche'][res.wfID]['fID'];
						$rootScope.buchungen[res.wfID]['titel'] = $rootScope.buchungen['wuensche'][res.wfID]['titel'] ;
						$rootScope.buchungen[res.wfID]['medien'] = $rootScope.buchungen['wuensche'][res.wfID]['medien'];
						$rootScope.buchungen[res.wfID]['vid'] = $rootScope.buchungen['wuensche'][res.wfID]['vid'];
						// startdatum der gewählten kw
						$rootScope.buchungen[res.wfID]['start'] = moment($rootScope.filmlauf[res.kwRow]['datum']).isoWeekday(4).format('YYYYMMDD');
						$rootScope.buchungen[res.wfID]['laufzeit'] = $rootScope.buchungen['wuensche'][res.wfID]['laufzeit'];
						$rootScope.buchungen[res.wfID]['bc'] = "bc-10";
						$rootScope.buchungen[res.wfID]['col'] = "col"+colnr;
						// leere und lösche
						$rootScope.buchungen["wuensche"][res.wfID] = null;
						console.log("buchungen[res.wfID] für [res.wfID] "+ [res.wfID] +" -> "+ JSON.stringify($rootScope.buchungen[res.wfID],0,0));
						delete $rootScope.buchungen["wuensche"][res.wfID];
// console.log("buchungen"+ JSON.stringify($rootScope.buchungen,1,1));

						// TODO BC !!!!!!!!!
						// erstelle eintrag in filmlauf
						buchungsWoche['col'+colnr] =	{
								"bc" : "bc-10",
								"vBID" : res.wfID,
								"fID" : res.fID };
						delete buchungsWoche[res.col+'w']; // lösche Wunsch
						// mitspielwünsche zur Buchung
						var idx = parseInt(res.kwRow) +1 ;
						var end = idx + 7;
						for( idx ; idx <= end; idx++){
							console.log(idx);
							// lege leeren eintrag an
							$rootScope.filmlauf[idx]['col'+ colnr] = {};
							// kopiere Spielort falls mitspielwunsch
							if ($rootScope.filmlauf[idx][res.col+'w'] != undefined){
								var mitspieler = $rootScope.filmlauf[idx][res.col+'w'].sids;
								mitspieler.forEach(function(sid){
									FfkUtils.setBuchung( idx , ['col'+ colnr], sid, medium);
// FfkUtils.setBuchung($scope, idx , ['col'+ colnr], sid, medium);

									console.log("mitspieler "+ sid );
								});
							delete $rootScope.filmlauf[idx][res.col+'w']; // lösche
																		// Wunsch
							}
						}

						// setze Farben
						FfkUtils.newBackgroundFilmlauf(res.kwRow, 1, 'col'+colnr, 'bc-10');
						
						
// console.log(JSON.stringify(buchungsWoche, 5, 4));
					
						break;
					case ("buchen"): // filmbuchung
						// TODO Anbindung zum Sever
// $scope.server = "http.post('../vBIDnewBooking') data: { vBID: " + res.vBID +
// ", datum: "
// + res.datum + ", sid : " + res.sid + ", medium : " + res.medium + " } ";
						var row = res.row;
						var sid = res.sid;
						var medium = res.medium;
						var col = res.col;
						FfkUtils.setBuchung(row , col, sid, medium);
					
						break;
					case ("mitspielen"): // mitspielwunsch
						// TODO Anbindung zum Sever
						$scope.server = "http.post('../neuerMitspielwunsch') data: { wfID: " + res.wfID + ", datum: "
								+ res.datum + ", sid : " + res.sid + ", medium : " + res.medium + " }  ";
						// wenn col eintrag nicht existiert
						if (!(res.col in buchungsTag)) {
							buchungsTag[res.col] = {};

						}
						// erster oder weiterer wunsch dieses tages
						
						if (buchungsTag[res.col + 'w']) {
							buchungsTag[res.col + 'w']['sids'].push([res.sid]);
						} else {
// this.getKinoWochenRowIdx = function(rowIdx, datum) {
							var kwRow = FfkUtils.getKinoWochenRowIdx(res.row, res.datum);
							var bc = $rootScope.filmlauf[kwRow][res.col + 'w']['bc'];
// "col1w":{"bc":"bc-40","sids":[["sid2"]]}
							buchungsTag[res.col + 'w'] = { "bc" : "bc-40", "sids": [[ res.sid ]]};
						}
						break;

					case ("wunschAnlegen"): // neuen wunsch anlegen
						// TODO Anbindung zum Sever
						$scope.server = "http.post('../wfIDneuerWunsch') data: { " + "datum: " + res.datum + ", fid: "
								+ res.fid + ", titel: " + res.titel + ", text : " + res.text + ", vBID : " + res.wfID
								+ ", vid : " + res.vid + ", medium : " + res.medium + " }";
						// film anlegen
						$scope.filme[res.fid] = {
							"titel" : res.titel,
							"text" : res.text
						};
						// console.log(JSON.stringify($scope.filme, 0, 4));
						// buchung anlegen
						$scope.buchungen["wuensche"][res.wfID] = {
							"fID" : res.fid,
							"titel" : res.titel,
							"medien" : res.medium,
							"vid" : res.vid
						};
						// console.log(JSON.stringify($scope.buchungen["wuensche"],
						// 0, 4));
						// in filmlauf einfügen
						// KW ZEile
						
						// hole buchungswoche
						var buchungsWoche = $scope.filmlauf[res.kwRow];
						// suche erste freie col
						var colnr = FfkUtils.getFirstFreeCol($scope, buchungsWoche, 'wunsch', 1 ,res.wfID);
						var inner = {};
						inner = {
							"bc" : "bc-00",
							"fID" : res.fid,
							"vBID" : res.wfID
						};
						// setze wunschfilm
						buchungsWoche['col'+colnr + 'w'] = inner;

						
						// console.log(JSON.stringify(buchungsWoche, 0, 4));
						break;
					default:
						$log.info("Weis nicht, was mit " + res.typ + " geschehen soll!");

					}
					// zeichne Tabelle neu
					$scope.gridOptions.api.setRowData($rootScope.filmlauf);

				}, modalInstance.opened.then(function() {
					console.log('opened OpenModalFilmService');
				}),
				// Modal wurde abgebrochen
				function() {
					$log.info('Modal dismissed at: ' + new Date());
				});
			};
// spalte
		}).service('OpenModalKwFilmlauf', function($uibModal, $log, FfkUtils) {
	this.editKW = function($scope, rowIdx, colIdx, colTyp) {
		var modalInstance = $uibModal.open({
			templateUrl : './components/filme/modalFilmKW.html?' + Math.random(),
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
		$log.debug("openModalFilmlauf mit filmlaufIdx: " + rowIdx + " colIdx: " + colIdx + "Filmtyp " + colTyp);
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
				if (res.colTyp == 1){ // wunschfilm
					$scope.buchungen['wuensche'][res.vBID]['menge'] = res.menge;
				} else {
					$scope.buchungen[res.vBID]['menge'] = res.menge;
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
						var buchung;
						if (res.colTyp == 1){ // wunschfilm
							buchung = $scope.buchungen['wuensche'][res.vBID];
						} else {
							buchung = $scope.buchungen[res.vBID];
						}
// $log.debug("Medien alt: "+JSON.stringify($scope.buchungen[res.vBID].medien));
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
								var delend = neustart; // lösche bis dahin
								if (neustart > altend){
									delend = altend; // lösche nie weiter als
														// altes ende
								}
								console.log("lösche ehemalig vorige von " + res.startIdx + " bis " + delend);
								for (var index = res.startIdx; index < neustart; index++) {
									delete $scope.filmlauf[index][col];
								}
							}
						}
						// lösche ehemalig nachfolgende
						if ( altend > neuend) {
							var startdel = neuend +1;
							if(altstart > neuend){ // lösche nie vor altstart
								startdel = altstart;
							}
							console.log("lösche ehemalig nachfolgende von " +  startdel  + " bis " + altend);
							for (var index = startdel ; index <= altend; index++) {
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
				delete $scope.buchungen[res.vBID];
				break;
			}
			// Meldung zum Server
			$scope.server = "http.post('../vBIDchange') data: { TODO }";
			// zeichne Tabelle neu
			$scope.gridOptions.api.setRowData($scope.filmlauf);
			
			
	
			
			

		}, modalInstance.opened.then(function() {
			console.log('open OpenModalKwFilmlauf');
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
			for (var woche = start; woche <  ende; woche = woche + 8) {
				// WochenÜberschrift
				console.log("woche idx " + woche);
				$scope.filmlauf[woche][col] = {};
				$scope.filmlauf[woche][col]['bc'] = bc;
				$scope.filmlauf[woche][col]['vBID'] = vBID;
				$scope.filmlauf[woche][col]['fID'] = fID;
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

//
// CONTROLLERS
//
// ModalFilmlRowInstanceCtrl REIHE
// bezieht sich auf die Filmbuchungen in einer Woche (mit Datum)
angular.module('ffkFilmModul').controller('ModalFilmlRowInstanceCtrl',
		function($rootScope, $scope, $log, $uibModalInstance, rowIdx,  FfkUtils) {
			console.log("ModalFilmlRowInstanceCtrl");
			// die Programmtabelle
// var filmlauf = $rootScope.filmlauf ;
			$scope.filmobject = []; // die ausgewälten filme

			var buchungen = $rootScope.buchungen;
			// die einelnen Filme
			var filme = $rootScope.filme;
			
			console.log("ModalFilmlRowInstanceCtrl $rootScope.filmlauf[rowIdx] für rowIdx " + rowIdx+ " ->" +$rootScope.filmlauf[rowIdx]);
			var filmlaufTag = $rootScope.filmlauf[rowIdx]; // Alle Filme dieses
															// Tages
			$log.debug("    filmlaufTag : " + JSON.stringify(filmlaufTag));
			var datum = moment(filmlaufTag["datum"]).hour(12);
			$scope.wahl = {};

			// KW Zeile oder nicht
			if ( filmlaufTag["datum"].substr(4,1) == 'W') {
				datum = moment(datum).isoWeekday(4); // fake day
				$scope.datum = "KinoWoche " + moment(datum).format('w');
				rowIdx = rowIdx +1; // in KW Zeile keine Filme!
				filmlaufTag = $rootScope.filmlauf[rowIdx];
				$log.debug("Kalenderwochenübersicht gewählt");
				$scope.wahl.modus = 'kw';
				} else {
					$log.debug("Tagesübersicht gewählt");
					$scope.datum = moment(datum).format('dd. DD.MM.YYYY');
					$scope.wahl.modus = 'tag';

				}
			
			$scope.kw = moment(datum).format('w');
			
			$scope.filminfos = [];
			$scope.filminfos.titel = "← Bitte wählen Sie einen Film.";
			// steurinfos für die html anzeige
			$scope.filminfos.trailer = "";
			$scope.filminfos.modus = "filmInfos";
			$scope.filminfos.modusText = "Infos zum Film";
			$scope.filminfos.filmtitel;
			$scope.filminfos.filmseite;

			// verleiherid vid
// $scope.verleiherSortiert = $rootScope.verleiherSortiert;
			$scope.filminfos.verleih = "";

			// sid und Name der Spielorte
// $scope.spielorte = scope.spielortSortiert;

// // Medienverfügbarkeit
// $scope.checkboxMedienModel = {
// BD : false,
// DCP : false,
// DVD : false,
// analog : false
// };
// $scope.checkboxMedienResult = [];
//
// $scope.$watchCollection('checkboxMedienModel', function() {
// $scope.checkboxMedienResult = [];
// angular.forEach($scope.checkboxMedienModel, function(value, key) {
// if (value) {
// $scope.checkboxMedienResult.push(key);
// }
// });
// });

			$scope.medienLeihbar = [];
			var zeigeWunschFilme = $rootScope.zeigeWunschFilme; // false

			$log.debug("ffkFilmModul <- ModalFilmlRowInstanceCtrl (Filmbuchungen Datum Tagesübersicht)");
			$log.debug("    rowIdx : " + rowIdx);
			$log.debug("    filmlauf : " + Object.keys($rootScope.filmlauf).length + " Objecte (Reihen)");
			$log.debug("    buchungen : " + Object.keys($rootScope.buchungen).length);

			// medienverfügbarkeit
			$scope.wochenWunschFilme = {};
			$scope.datum;
			$scope.isNew = false;
			if ( $scope.wahl.modus == 'kw') {
				$scope.header = "Filmlauf hinzufügen";
			} else {
				$scope.header = "Film auswählen für ";
			}
			$scope.checkboxModel = {
				mindestgarantie : false,
			};

			
// var filmlaufTag = filmlauf[rowIdx]; // Alle Filme dieses Tages
// $log.debug(" filmlaufTag : " + JSON.stringify(filmlaufTag));
// var datum;
// // KW Zeile oder nicht
// if ( filmlaufTag["datum"].substr(4,1) == 'W') {
// datum = moment(filmlaufTag["datum"]).isoWeekday(4).hour(12);
// $scope.datum = "KinoWoche " + moment(datum).format('w');
// rowIdx = rowIdx +1;
// filmlaufTag = filmlauf[rowIdx];
// $log.debug("Kalenderwochenübersicht gewählt");
// } else {
// datum = moment(filmlaufTag["datum"]).hour(12);
// $scope.datum = moment(datum).format('dd. DD.MM.YYYY');
// }
//			
// $scope.kw = moment(datum).format('w');
			
			

			// der row Indefilmex der KW Zeile
			// var wochenBuchungenIDX = rowIdx - moment(datum).format('E');
			var wochenBuchungenIDX = FfkUtils.getKinoWochenRowIdx(rowIdx, datum);

			// die KW Zeile vBID und Medien
			var wochenBuchungen = $rootScope.filmlauf[wochenBuchungenIDX];
			$log.debug("wochenBuchungenIDX " + wochenBuchungenIDX);
			$log.debug(JSON.stringify(wochenBuchungen));
			$log.debug("******************");

			// gebuchte Filme
			// lade infos zur vBID filmobject: key=col value = buchungsobj +bc
			// lade infos zur wfID wochenWunschFilme: key=wfID v
			var myObject;
			for (var i = 1; i <= wochenBuchungen.col; i++) {
				// wenn col existiert Filme in dieser Woche
				if (typeof wochenBuchungen['col' + i] != 'undefined') {
					// ist false wenn nur Wunschfilme
					var myVBID = wochenBuchungen['col' + i]["vBID"];
					if (!(myVBID == false)) {
						// buchungsinfos zum Film
						myObject = buchungen[wochenBuchungen['col' + i]["vBID"]];
						// hintergrundfarbe
						myObject.bc = wochenBuchungen['col' + i]['bc'];
						// Spalte
						myObject.col = 'col' + i;
						$scope.filmobject.push(myObject);
					}
					// Filmwünsche in dieser Woche
					if (typeof wochenBuchungen['col' + i + 'w'] != 'undefined') {
						var wb = wochenBuchungen['col' + i + 'w'];
						console.log("WWWWW " + JSON.stringify(wb,0,0));
						myObject = $rootScope.buchungen["wuensche"][wb["vBID"]];
						myObject.bc = wb['bc'];
						myObject.col = 'col' + i;
						myObject.wfID = wb["vBID"];
						$scope.wochenWunschFilme[myObject.wfID] = myObject;
					 $log.debug(" wochenWunschFilme : " + JSON.stringify($scope.wochenWunschFilme));
					}
				}
			}
			// der clone auf dem gearbeitet wird ab IE9
			$scope.filmobjectTOSort = Object.create($scope.filmobject);
			console.log("filmobjectTOSort 1: " + $scope.filmobjectTOSort);

			// setze Header
			$scope.setHeader = function() {
				if ($scope.isNew) { // neu = true
					// setze Titel wunsch oder nicht
					if ($scope.checkboxModel.mindestgarantie) {
						$scope.header = "Neue Filmbuchung anlegen";
					} else {
						$scope.header = "Neuen Wunschfilm anlegen";
					}
				} else {
					$scope.header = "Diesen Film buchen";
				}

			};

// // setze Verleih in Menü
// $scope.setVerleih = function(verleih) {
// $scope.filminfos.verleih = verleih;
// console.log("$scope.filminfos.verleih " + $scope.filminfos.verleih[1]);
// };
			$scope.setMedien = function() {
				// medien vor Ort abspielbar
				if ( $scope.sid != "" & $scope.sid != undefined){
					$scope.medienSpielort = $rootScope.spielorte[$scope.sid].medien;
					$scope.spielOrtInfo = "In " + $rootScope.spielorte[$scope.sid].ort + " abspielbare Medien:";
					} else {
						$scope.spielOrtInfo = "noch kein Spielort gewählt";
						$scope.medienSpielort = "";
					}
				console.log("+++++++++++++++++++++++++++++");
				console.log($scope.wahl.wunsch);
				console.log($scope.filmobjectTOSort);

				console.log("filmobject " + JSON.stringify($scope.filmobject));
				// aktualisere filminfos medienmenge
				if ($scope.wahl.buchbar) {
					$scope.loadBuchbar($scope.wahl.col);
				} else if ($scope.wahl.buchbar == false) {

					$scope.loadGewunschen($scope.wahl.wunsch);
				}
			};
			
			
			$scope.medienSpielort = "";
		
// // setze Ort in Menü
// // die sid des ortes
			$scope.sid = $rootScope.users[$rootScope.logedInUser.uid]['ref'];
			if ( $scope.sid == "" ) {
				$scope.spielOrtInfo = "noch kein Spielort gewählt";
			} else {
				$scope.setMedien();
			}
			

			// functionsaufruf für HTML Seite
			//
			// https://docs.angularjs.org/api/ng/input/input%5Btext%5D
			// wunschfilm anlegen
			$scope.neuerWunsch = function() {
				$scope.filminfos.modusText = "Neuen Wunschfilm anlegen";
				$scope.filminfos.modus = "neuerWunsch";
				$scope.filminfos.titel = "";
				$scope.filminfos.text = "";
				$scope.wahl.buchbar = false;
				

			};

			// HTML Infos zum gewählten Film
			$scope.loadBuchbar = function(col) {
				// schaue ob Tag oder KW Übersicht
				// nicht KW übersicht
				
				$scope.wahl.col = col; // infos $scope.buchen
				

				$scope.kwinfos = wochenBuchungen[col];
				$scope.buchung = $rootScope.buchungen[$scope.kwinfos["vBID"]];
				if ($scope.wahl.modus == 'tag'){
					$log.debug("suche Medienverfügbarkeit für 'tag'");
					$scope.medienLeihbar = FfkUtils.getLeihbar(filmlaufTag["datum"], $scope.buchung.medien);
					$scope.wahl.buchbar = true;
				}
				
				$scope.filminfos = filme[$scope.kwinfos["fID"]];
				$scope.filminfos.modusText = "Infos zum Film";
				$scope.filminfos.modus = "filmInfos";

				console.log("wahl.col " + $scope.wahl.col);
				console.log("$scope.kwinfos " + JSON.stringify($scope.kwinfos));
				console.log("$scope.verleihinfos " + JSON.stringify($scope.buchung));
				console.log("$scope.filminfos " + JSON.stringify($scope.filminfos));

				// suche medienmenge
				
			};
			
			// VERLEIHINFOS

			$scope.loadGewunschen = function(wunsch) {
				$scope.wahl.wunsch = wunsch;

				$scope.wahl.buchbar = false;
				console.log(wunsch);
				$scope.filminfos = filme[wunsch.fID];
				$scope.filminfos.modusText = "Infos zum Filmvorschlag";
				$scope.filminfos.modus = "filmInfos"; // sachaltet die
				// infoanzeige
				
// $scope.verleihinfos = wunsch;
				
			};

			// $uibModalInstance.close Varianten
			//
			$scope.machBuchbar = function(){
				console.log("machBuchbar");
				var col = $scope.wahl.wunsch.col;
				var result = {
						"typ" : "machBuchbar",
						"kwRow" : wochenBuchungenIDX,
						"col" : col,
						"wfID" : $scope.wahl.wunsch.wfID,
						'fID' : $scope.wahl.wunsch.fID
				};
				
				var newVal = [];
				result["val"] = newVal;
				$uibModalInstance.close(result);
			};
			
			// neuen Wunsch anlegen
			$scope.wunschAnlegen = function() {
				// benötigte variablen
				console.log($scope.filminfos);
				var result = {
					"typ" : "wunschAnlegen",
					// film
					"titel" : $scope.filminfos.titel,
					"text" : $scope.filminfos.text,
					"fid" : FfkUtils.getNewProvID('f'),
					"trailer" : $scope.filminfos.trailer,
					"filmseite" : $scope.filminfos.filmseite,
					// buchung
					"vid" : $scope.filminfos.verleih,
					"wfID" :  FfkUtils.getNewProvID('v'),
					"medium" : $scope.checkboxMedienResult,
					// filmlauf
					"row" : rowIdx,
					"col" : Object.keys($scope.wochenWunschFilme).length + 1,
					"kwRow" : wochenBuchungenIDX,
					"sid" : $scope.spielortWahl[0],
					// server
					"datum" : filmlaufTag["datum"],
				};
				var newVal = [];
				result["val"] = newVal;
				$uibModalInstance.close(result);
			};

			// Mitspielinteresse bekunden
			$scope.mitspielen = function(medium) {
				if ($scope.sid) { // nur wenn Spieort angegeben
					// wohin mit der Buchung
					var result = {
						"typ" : "mitspielen",
						"row" : rowIdx,
						"col" : $scope.wahl.wunsch.col,
						"sid" : $scope.sid,
						"datum" : filmlaufTag["datum"],
						"wfID" : $scope.wahl.wunsch.wfID,
						"medium" : medium
					};
					// was in die Buchung
					var newVal = [ $scope.sid ];

					result["val"] = newVal;
					$uibModalInstance.close(result);
				} else { // Spielort fehlt
					alert("Welcher Spielort soll mitspielen?\nBitte wählen sie einen aus.");

				}
			};

			// Film buchen
			var einzelBuchungen; // fBID
			$scope.buchen = function(medium) {
				if ($scope.spielortWahl[0]) { // nur wenn Spieort angegeben
					// wievielte Buchung dieses Films an diesem TAg
					// "f1" oder "f2" ...
// einzelBuchungen = filmlaufTag[$scope.wahl.col];
// var fnext = 1;
// while ('f' + fnext in einzelBuchungen) {
// fnext = fnext + 1; // schaue, ob weiterer Film in col
// }
					// wohin mit der Buchung
					var result = {
						"typ" : "buchen",
						"row" : rowIdx,
						"col" : $scope.wahl.col,
						"sid" : $scope.spielortWahl[0],
// "datum" : filmlaufTag["datum"],
// "vBID" : $scope.kwinfos.vBID,
						"medium" : medium
					};
					
					result["val"] = {};
					$uibModalInstance.close(result);

				} else { // Spielort fehlt
					alert("Welcher Spielort soll mitspielen?\nBitte wählen sie einen aus.");

				}
			};

			// $uibModalInstance.dismiss
			$scope.abbrechen = function() {
				$uibModalInstance.dismiss('Filmauswahl geschlossen');
			};
		});

// ModalKWInstanceCtrl
// bezieht sich auf den Filmlauf der KW
angular.module('ffkFilmModul').controller('ModalKWInstanceCtrl',
		function(FfkUtils, $rootScope, $scope, $log, $uibModalInstance, filmlaufIdx, colIdx, colTyp) {

			$log.debug("ffkFilmModul <- ModalKWInstanceCtrl (Filmbuchungen KW Wochenübersicht)");
			$log.debug("    filmlaufIdx : " + filmlaufIdx);
			$log.debug("    colIdx : " + colIdx);
			$log.debug("    colTyp : " + colTyp);
			$log.debug("    filmlauf : " + Object.keys($rootScope.filmlauf).length + " Objecte");
			$log.debug("    buchungen : " + Object.keys($rootScope.buchungen).length);
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
			var buchung = $rootScope.buchungen[vBID];
			var wochenBuchung = $rootScope.buchungen[$rootScope.filmlauf[filmlaufIdx][col]["vBID"]];

			if ( colTyp == 1){
				buchung = $rootScope.buchungen["wuensche"][vBID];
				wochenBuchung = $rootScope.buchungen["wuensche"][$rootScope.filmlauf[filmlaufIdx][col]["vBID"]];
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

			// gesperte Datumsfelder
			$scope.dateOptionsStart = {
				dateDisabled : disabledStart,
				formatYear : 'yy',
				maxDate : new Date($scope.dt.getFullYear(), 11, 31),
				minDate : new Date($scope.dt.getFullYear(), 0, 1),
				startingDay : 1
			};
			$scope.dateOptionsEnd = {
				dateDisabled : disabledEnd,
				formatYear : 'yy',
				maxDate : new Date($scope.dt.getFullYear() + 1, 0, 31),
				minDate : $scope.dtStart,
				// minDate : new Date($scope.dt.getFullYear(), 0, 1),
				startingDay : 1
			};
			// wird aktualisiert, wenn die laufzeit geändert wird
			var updateOptionsMedien = function() {
				$scope.dateOptionsMedien = {
					// dateDisabled : disabledEnd,
					formatYear : 'yy',
					maxDate : $scope.dtEnd,
					minDate : $scope.dtStart,
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
				   if (buchung.menge.hasOwnProperty(key)) {
					   $scope.menge[key] =buchung.menge[key];
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
				// $rootScope.buchungen[$rootScope.filmlauf[filmlaufIdx][col]["vBID"]];
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
				// result['medien'] erhält änderungentoogle
				// entweder neues datum oder false bei löschung
				// console.log("buchung.medien
				// "+JSON.stringify(buchung.medien));toogle
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
