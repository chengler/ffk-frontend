angular
		.module('ffkTableModul', [ 'ui.bootstrap', 'ffkUtils' ])
		.constant('MODULE_VERSION', '0.0.1')
		.service(
				'RenderProgrammTableServices',
				function($rootScope, $log, FfkUtils) {
					//
					//
					// render Datum
					this.datumsRenderer = function datumsRenderer(params) {
						// $log.debug("ffkTableModul <- RenderTableServices <-
						// datumsRenderer");
						// $log.debug(" params : " + params);
						var datumsClass = " class='ok pointer' ";
						var rowIdx = params.rowIndex;
						var d = params.data["datum"]; // Render aus ISO
						var titel; // der link Title mouseover
						var sign; // clickbares zeichen
						var directive; // bei click
                        var myReturn = "";
						// Li
                        if ( $rootScope.logedInUser.role != "verleih") {
                            // kw Wochenübersicht
                            if (d.charAt(4) == "W") {
                                d = d.substr(5, 2) + " KW " + d.substr(2, 2);
                                titel = " title='Filmlauf oder Wunschfilm hinzufügen.'";
                                sign = '<strong>&plus;</strong>';
                                directive = " ng-click='openModalFilm(" + rowIdx + ")' ";
                                myReturn = "<span " + titel + datumsClass + directive + ">" + sign + "</span>" + d;
                                // Spieltage mit Datum

                            } else  {
                                d = moment(d).format('DD.MM. dd');
                                titel = " title='Filminfos anzeigen, Film buchen oder Wunschfilm hinzufügen.' ";
                                sign = "<strong>&oplus; </strong>";
                                directive = " ng-click='openModalFilm(" + rowIdx + ")' ";
                                myReturn = "<span " + titel + datumsClass + directive + ">" + sign + "</span>" + d;

                            }
                            // if != verleih
                        } else if (d.charAt(4) == "W") { // Rückgabe wenn verleih
                            d = d.substr(5, 2) + " KW " + d.substr(2, 2);
                            myReturn = "<span " + datumsClass + "></span>" + d;
                        } else {
                            d = moment(d).format('DD.MM. dd');
                            myReturn = "<span " + datumsClass + "></span>" + d;
                        }
						// $log.debug("return datumsRenderer " + myReturn);
						return myReturn;
					}; // end render Datum


					// render die Buchungsausgabe (Film1 ...)
					this.buchungsRenderer = function buchungsRenderer(params, zeigeWunschFilme) {
						// $log.debug("ffkTableModul <- RenderTableServices <-
						// buchungsRenderer");
						// $log.debug(" params : " + params);
						// $log.debug(" spielorte : " +
						// Object.keys(spielorte).length + " spielorte");
						// $log.debug(" filmlauf : " +
						// Object.keys(filmlauf).length + " Objecte (Reihen)");
						// $log.debug(" buchungen : " +
						// Object.keys(buchungen).length + " Verleihbuchungen");
						// $log.debug(" zeigeWunschFilme : " +
						// zeigeWunschFilme);

						var datum = params.data["datum"];
						var colIdx = params.colDef.headerName.substr(4);
						var col = "col" + colIdx; // basis für rowData col1
						var rowIdx = params.rowIndex;
						var buchung = params.data[col]; // {einzelBuchungObject aus filmlauf}
						var buchungW = params.data[col + 'w']; // wunschfilme
						var link = ""; // wenn links gelegt werden
						// in col

						// gebe wochenBuchung zurück KW
						// dies ist die normale anzeige
						function wochenBuchung() {
							// z.B. nur Wunschfilm
							if (buchung["vBID"] == false) {
								return "";
							}
							// console.log(JSON.stringify(buchungen,0,4));
							// console.log("buchung "+JSON.stringify(buchung));
							// console.log("$rootScope.buchungen[buchung['vBID']
							// für 'vBID' = "+ buchung['vBID']+ " -> "+
							// JSON.stringify($rootScope.buchungen[buchung['vBID']])
							// );
							var wochenBuchung = $rootScope.buchungen[buchung['vBID']];
							// console.log("buchungen"+
							// JSON.stringify($rootScope.buchungen,1,1));

							var medien = "";
							// wann startet diese KinoW in ms
							var datumInMs = moment(datum).isoWeekday(4);
							for ( var key in wochenBuchung.medien) {
								if (wochenBuchung.medien.hasOwnProperty(key)) {
									// ab wann ist dieses medium verfügbar
									var medienStart = moment(wochenBuchung.medien[key]);
									// console.log("datumInMs "+ datumInMs);
									// console.log("ab "+
									// moment(wochenBuchung.medien[key]));
									if (medien.length > 0) {
										medien = medien + "// ";
									}
									if (medienStart > datumInMs) {
										medien = medien + key + " ab " + moment(medienStart).format('DD.MM. ');
									} else {
										medien = medien + key + " ";
									}

								}
							}
                            var wochenBesucher 	= "";
                            // Besucherzahlen in der Filmwoche
                            if ( "fw" in buchung) { // Filmwoche angegeben als fw: int
								// in buchung Key:value fw: 1
								var myfw = "fw"+buchung.fw;
                                // in wochenBuchung Key:value fw1: [besucher,cent]
                                if (myfw in wochenBuchung) {
                                    var besucher = " <span class='glyphicon glyphicon-user'>"
                                        + wochenBuchung[myfw][0] + " </span>"
                                    var eintritt = "<span class='glyphicon glyphicon-euro'>"
                                        + (wochenBuchung[myfw][1] / 100).toFixed(2) + "</span>"
                                    wochenBesucher = " (Filmwoche"+buchung.fw+ ": " + besucher + eintritt+")";
                                }
                            }

							// wochenBuchung.medien.forEach(function(medium) {
							// medien = medien + medium + " ";
							// });
							var link = "";
							if ( $rootScope.logedInUser.role == "admin"){
								link = "<span title='Diesen Filmlauf bearbeiten' "
									+ "class='glyphicon glyphicon-edit pointer' ng-click='openModalKW(" + rowIdx + ","
									+ colIdx + ")' >" + "</span> ";
							}
							return  link + wochenBuchung.titel + " ( " + medien + ")" + wochenBesucher;
						}
						// gebe wochenBuchung kurz (wunschfilme true)
						function wochenBuchungKurz() {
							// nur wenn vorhanden
							if (buchung["vBID"] == false) {
								return "";
							}
							var wochenBuchung = $rootScope.buchungen[buchung["vBID"]];
							return wochenBuchung.titel;
						}
						// wochenBuchung wunsch
						function wochenBuchungWunsch() {
							var wunsch = ""; // return "" wenn kein
							// Wunsch buchungW
							if (buchungW) {
								// änder Format filmlauf
								// wunsch =
								// $rootScope.buchungen["wuensche"][Object.keys(buchungW)]["titel"];
								console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUU " + JSON.stringify(buchungW, 0, 0));
								var wunschObjekt = $rootScope.buchungen["wuensche"][buchungW["vBID"]];
								wunsch = wunschObjekt['titel'];
								var bc = buchungW['bc'];
								// wrapper für Wunschfilme
								if ( $rootScope.logedInUser.role == "admin"){
									wunsch = "<span ng-click='openModalKW("+ rowIdx	+ "," + colIdx + ", 1 )' title='Diesen Wunsch bearbeiten' class=' "
										+ bc + " label glyphicon glyphicon-edit pointer' style = ' opacity:1; z-index: 2; float: right; color: black;'> "
										+ wunsch + "</span>";
								} else {
									wunsch = "<span title='Diesen Wunsch bearbeiten' class=' "	+ bc + " label' style = ' opacity:1; z-index: 2; float: right; color: black;'> "
										+ wunsch + "</span>";
								}

							}

							// if (buchung["wunschF"]) {
							// wunsch =
							// buchungen["wuensche"][Object.keys(buchung["wunschF"])]["titel"];
							//
							// // wrapper für Wunschfilme
							// wunsch = "<span class='label label-warning' style
							// = ' opacity:1; z-index: 2; float: right; color:
							// black;'>"
							// + wunsch + "</span>";
							// }
							return wunsch;
						} // end wochenBuchung wunsch

						// gebe tagesBuchungLang zurück datum
						// dies ist die übliche Anzeige in der Programmtabelle
						function tagesBuchungLang() {
							var fmax = 1;
							var filmnr = 'f' + fmax;
							var aktuelleBuchung;
							var myReturn = ""; // alle Einzelbuchungen
							// ein film mit "f1" "f2" ...
							while (filmnr in buchung) {
								aktuelleBuchung = buchung[filmnr];

								var filmBID = aktuelleBuchung.fBID; // hole fBID
								//console.log("aktuelleBuchung "+ JSON.stringify(aktuelleBuchung,0,0));

								var filmOrt = $rootScope.spielorte[aktuelleBuchung.ortID]["ort"]; // sid

								// der Array index der Wochenbuchung
								// var bfIdx = rowIdx -
								// moment(datum).format("E");
								var bfIdx = FfkUtils.getKinoWochenRowIdx(rowIdx, datum);
								var bFensterId = $rootScope.filmlauf[bfIdx][col]["vBID"];
								// für links
								var sourceIndex = " " + rowIdx + " " + col + " " + filmnr;

								// die zwei Checks
								//
								// belege check1 und check2
								//
								var check = [ "" ];
								for (var i = 1; i <= 2; i++) {
									if (aktuelleBuchung["check" + i]) {
										check
												.push("<span title='schalte bei Klick um.' class='ok pointer'  flipOnClick click='handleFlip' id='check"
														+ i + sourceIndex + "' > &#10003; </span>");
									} else {
										check
												.push("<span title='schalte bei Klick um.' class='notOK pointer' flipOnClick click='handleFlip' id='check"
														+ i + sourceIndex + "' > &#10008; </span>");
									}
									;
								}
								// Medium, von und nach
								var medium;
								var von = " ";
								var nach = "";
								// wenn Medium vorhanden,
								// auch filmVon vorhanden
								if (aktuelleBuchung.medienID) {
									medium = "<span  class = ' ok' >" + aktuelleBuchung.medium
											+ aktuelleBuchung.medienID + " </span>";
									var filmVon = $rootScope.spielorte[aktuelleBuchung.vonID]["ort"];
									von = "<span class='ok'> " + filmVon + "↝ </span>";
									// wenn NACH bereits vergeben
									if (aktuelleBuchung.nachID) {
										var filmNach = $rootScope.spielorte[aktuelleBuchung.nachID]["ort"];
										nach = "<span class='ok '>↝" + filmNach + " </span>";
										// sonst draggable NACH (von
										// wo
										// wird
										// gezogen)
									} else {
										medium = aktuelleBuchung.medium + aktuelleBuchung.medienID + " ";
										nach = "<span title='Film weiterleiten: ziehe den Filme auf ein rotes Filmsymbol' class='grabbing draggable glyphicon glyphicon-film' id='"
												+ bFensterId + sourceIndex + "'  draggable>↴ </span>";
									}
									;
									// kein Medium vorhanden:
									// droppable aufs Medium
								} else {
									medium = aktuelleBuchung.medium
											+ " <span title='Filmmedium benötigt!  Auf dieses Feld kann ein passendes gelbes Filmsymbol gezogen werden' class='notOK glyphicon glyphicon-film' id='"
											+ bFensterId + sourceIndex + "' droppable drop='handleDrop'> ← ↵ </span>";
								}
								if ( $rootScope.logedInUser.sid == aktuelleBuchung.ortID || $rootScope.logedInUser.role == "admin" ){
									myReturn = myReturn + "<span class=' pointer' ng-click='openModalBuchung(" + rowIdx + ","
										+ colIdx + ","+ fmax + ")' >" + "<small>" + filmBID + "</small> " + filmOrt + "</span>"
										+ check[1] + check[2] + von + medium + nach ;
								} else {
									myReturn = myReturn + "<small>" + filmBID + "</small> " + filmOrt + check[1] + check[2] + von + medium + nach ;
								}
								// Bei false zeige fehlende Besucherzahlen, ansonsten zeige Besucherzahlen
                                if ( "besucher" in aktuelleBuchung ) {
									if ( aktuelleBuchung.besucher == false || aktuelleBuchung.besucher == undefined){
                                        myReturn = myReturn + " Besucherzahlen fehlen!";
									} else {
                                        var arrayLength = aktuelleBuchung.besucher.length;
                                        for (var i = 0; i < arrayLength; i++) {
                                            var besucher  = aktuelleBuchung.besucher[i][0];
                                            // formatiere cent zu euro
											var eur = (aktuelleBuchung.besucher[i][1] / 100).toFixed(2);
                                            myReturn = myReturn + " //" + besucher +"a"+ eur +"€";
                                        }
									}


								}


                                myReturn = myReturn + "<br />";

								fmax = fmax + 1; // schaue, ob weiterer Film
								// in col
								filmnr = 'f' + fmax;
							}
							; // end while

							return myReturn;
						} // end tagesBuchunglang

						// gebe tagesBuchungKurz zurück
						function tagesBuchungenKurz() {
							var fmax = 1;
							var filmnr = 'f' + fmax;
							var aktuelleBuchung;
							var myReturn = ""; // alle Einzelbuchungen
							// ein film mit "f1" "f2" ...
							while (filmnr in buchung) {
								aktuelleBuchung = buchung[filmnr];
								fmax = fmax + 1;
								filmnr = 'f' + fmax;
								var filmBID = aktuelleBuchung.fBID; // hole fBID
								var filmOrt = $rootScope.spielorte[aktuelleBuchung.ortID]["ort"]; // sid
								myReturn = myReturn + "<small>" + filmBID + "</small> " + filmOrt + "<br />";
							}
							// end while

                           // myReturn = myReturn + "tagesBuchungenKurz";
							return myReturn;
						} // end tagesBuchungenKurz

                        function tagesBuchungVerleih() {
                            var fmax = 1;
                            var filmnr = 'f' + fmax;
                            var aktuelleBuchung;
                            var myReturn = ""; // alle Einzelbuchungen
                            // ein film mit "f1" "f2" ...
                            while (filmnr in buchung) {
                                aktuelleBuchung = buchung[filmnr];
                                fmax = fmax + 1;
                                filmnr = 'f' + fmax;
                                var filmOrt = $rootScope.spielorte[aktuelleBuchung.ortID]["ort"]; // sid
                                myReturn = myReturn + filmOrt
								// Ort gesetzt und nun zu den Zahlen
								// ZAhlen
                                if ( "besucher" in aktuelleBuchung ) {
                                    if ( aktuelleBuchung.besucher == false || aktuelleBuchung.besucher == undefined){
                                        myReturn = myReturn + "<small> Besucherzahlen fehlen!</small>";
                                    } else {
                                        var arrayLength = aktuelleBuchung.besucher.length;
                                        for (var i = 0; i < arrayLength; i++) {
                                            var besucher  = aktuelleBuchung.besucher[i][0];
                                            // formatiere cent zu euro
                                            var eur = (aktuelleBuchung.besucher[i][1] / 100).toFixed(2);
                                            myReturn = myReturn + " //" + besucher +"a"+ eur +"€";
                                        }
                                    }
                                }
								// beende diesen Ort
                                myReturn = myReturn + "<br />";
                            }
                            // end while




                            return myReturn;

						}

						// gebe wunschfilme zurück
						function wunschFilme() {
							var wunsch = ""; // return "" wenn kein
							// Wunsch
							if (buchungW) {
								// das wunschF Object der Zelle
								var bc = buchungW.bc;
								// hole sid array aus Object
								buchungW = buchungW.sids;
								buchungW.forEach(function(derWunsch) {
									// if (buchung["wunschF"]) {
									// // das wunschF Object der Zelle
									// buchung.wunschF.forEach(function(derWunsch)
									// {
									$log.debug("derWunsch: " + JSON.stringify(derWunsch, 1, 0));
									// einzelner Wunsch
									wunsch = wunsch + "<span class='label " + bc + "' style =  'color: black;'>"
											+ $rootScope.spielorte[derWunsch[0]]["ort"] + "</span> ";
								});
								// wrapper für Wunschfilme
								wunsch = "<span style = ' opacity:1; z-index: 2; float: right;'>" + wunsch + "</span>";
							}


							return wunsch;
						} // end wunschfilme

						// START RENDER
						//
						// gibt es einen Eintrag für diese Spalte in Reihe
						if (typeof buchung != 'undefined') {
							//
							// WOCHENbuchung (KW Zeilen)
							if ('vBID' in buchung) {
								if (zeigeWunschFilme) {
									return "<span style = 'position:absolute; z-index: 1; opacity:0.3;'> "
											+ wochenBuchungKurz() + "</span>"
											+ "<span style = ' opacity:1; z-index: 2; float: right;'>"
											+ wochenBuchungWunsch() + "</span>";

								} else {
									return wochenBuchung();
								}
								;
								//
								// Tagesbuchung (die Zeilen mit Datum)
							} else if ( $rootScope.logedInUser.role != "verleih") {
								// mit Wunschfilmen
								if (zeigeWunschFilme) {
									return "<span style = 'position:absolute; z-index: 1; opacity:0.3;'> "
											+ tagesBuchungenKurz() + "</span>"
											+ "<span style = ' opacity:1; z-index: 2; float: right;'>" + wunschFilme()
											+ "</span>";
								} else {
									// ohne Wunschfilme
									return tagesBuchungLang();
								}
								// Tagesbuchungsanzeige für Verleih, Buchung und Geld
							} else {
                                return tagesBuchungVerleih();

							}
						} else { // kein eintrag in Spalte dieser Reihe
							// $log.debug("Kein Eintrag für Reihe - Spalte " +
							// rowIdx + " - " + col);
							return "";
						} // END Render
					}; // END buchungsRenderer
				}); // End Service
