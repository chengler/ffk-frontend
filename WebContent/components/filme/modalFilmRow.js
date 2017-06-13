angular
    .module('modalFilmRow', ['ui.bootstrap', 'ffkUtils'])
    .constant('MODULE_VERSION', '0.0.1')
    //
    // SERVICES
    //
    // modal
    // http://angular-ui.github.io/bootstrap/#/modal
    .service(
        'ModalFilmRowService',
        function ($uibModal, $log, FfkUtils, $rootScope) {
            this.editFilm = function ($scope, rowIdx, colIdx) { //nur row bei ganzer zeile (+ in der KW anzeige)
                var modalInstance = $uibModal.open({            // col zur direkten filminfo (filmlinks in der kw zeile)
                    templateUrl: './components/filme/modalFilmRow.html?' + Math.random(),
                    controller: 'ModalFilmlRowInstanceCtrl',
                    size: "lg",
                    resolve: {
                        rowIdx: function () {
                            return rowIdx
                        },
                        colIdx: function () {
                            return colIdx
                        },
                        programmCtrlScope: function () {
                            return $scope;
                        }
                    }
                });
                // ModalFilmlRowInstanceCtrl wird auf rowIdx des
                // Filmlaufs
                // gestartet
                $log.info("ffkFilmModul ModalFilmRowService rowIdx: " + rowIdx);

                // TODO stack für asyncrone Serverantworten

                // Die Antwort des ModalFilmlRowInstanceCtrl
                modalInstance.result
                    .then(
                        function (res) {
                            $log.debug("ffkFilmModul ModalFilmRowService ModalReturn: "
                                + JSON.stringify(res, 1, 4));
                            // die zu bearbeitende Tabellenreihe
                            if (res.msg != undefined) {
                                console.log("zeige nur noch Meldung: " + res.msg);
                            } else {
                                var buchungsTag = $rootScope.filmlauf[res.row];

                                switch (res.typ) {
                // wandel  wunsch in Buchung
                                    case ("machBuchbar"):
                                        console.log("*** mach buchbar")

                                        var buchungsWoche = $rootScope.filmlauf[res.kwRow];
                // hole erste freie col in filmlauf
                                        var colnr = FfkUtils.getFirstFreeCol($scope, buchungsWoche, "film", 1,
                                            res.wfID);

                // erstelle eintrag in Buchungen

                                        console.log("verleihWunsch][res.wfID] mit [res.wfID] "
                                            + [res.wfID] + " -> " + JSON.stringify($rootScope.verleihWunsch[res.wfID], 0,  0));
               // lege Film an, kopiere , änder bc
                                        console.log("lege verleihBuchungen an.");
                                        $rootScope.verleihBuchungen[res.wfID] = {};
                                        $rootScope.verleihBuchungen[res.wfID]['fID'] = $rootScope.verleihWunsch[res.wfID]['fID'];
                                        $rootScope.verleihBuchungen[res.wfID]['titel'] = $rootScope.verleihWunsch[res.wfID]['titel'];
                                        console.log("speicher fID " + res.fID);
                                        console.log("speicher Verleih von " + JSON.stringify($rootScope.filme[res.fID]));
                                        console.log("der dsa istn " + $rootScope.filme[res.fID].verleih);

                                        $rootScope.verleihBuchungen[res.wfID]['verleih'] = $rootScope.filme[res.fID].verleih;
                                        $rootScope.verleihBuchungen[res.wfID]['medien'] = {};
                                        $rootScope.verleihBuchungen[res.wfID]['menge'] = {};
                                        $rootScope.verleihBuchungen[res.wfID]['vid'] = $rootScope.verleihWunsch[res.wfID]['vid'];
                                        // startdatum der gewählten kw
                                        $rootScope.verleihBuchungen[res.wfID]['start'] = moment(
                                            $rootScope.filmlauf[res.kwRow]['datum']).isoWeekday(4).format(
                                            'YYYYMMDD');
                                        $rootScope.verleihBuchungen[res.wfID]['laufzeit'] = $rootScope.verleihWunsch[res.wfID]['laufzeit'];
                                        $rootScope.verleihBuchungen[res.wfID]['bc'] = $rootScope.verleihWunsch[res.wfID]['bc'];
                                        $rootScope.verleihBuchungen[res.wfID]['col'] = "col" + colnr;
                                        $rootScope.verleihBuchungen[res.wfID]['menge'] = {};
                                        // "laufzeit":1,"fw1":[30,11850]},
                                        // Film beginnt immer mit einer Woche
                                        $rootScope.verleihBuchungen[res.wfID]['laufzeit'] = 1;
                                        // und hatt noch keine einnahmen in filmwoche  1
                                        $rootScope.verleihBuchungen[res.wfID]['fw1'] = [0,0];

               // leere und lösche den Wunsch
                                        $rootScope.verleihWunsch[res.wfID] = null;
                                        console
                                            .log("verleihBuchungen[res.wfID] für [res.wfID] " + [res.wfID]
                                                + " -> "
                                                + JSON.stringify($rootScope.verleihBuchungen[res.wfID], 0, 0));
                                        delete $rootScope.verleihWunsch[res.wfID];
                                        // console.log("verleihBuchungen"+
                                        // JSON.stringify($rootScope.verleihBuchungen,1,1));

                                        // TODO BC !!!!!!!!!
              // erstelle eintrag in filmlauf
                                        buchungsWoche['col' + colnr] = {
                                            "bc": $rootScope.verleihBuchungen[res.wfID]['bc'],
                                            "vBID": res.wfID,
                                            "fID": res.fID,
                                            "fw" : 1
                                        };
                                        delete buchungsWoche[res.col + 'w']; // lösche
// erhöhe Anzahl der Filme in dieser Woche auf richtige anzahl
            // falls colnr des Films > als col der Buchungswoche=> gleiche an
                                        if ( colnr > buchungsWoche.col){
                                            buchungsWoche.col = colnr;
                                        }

                                //        console.log("******** col"+buchungsWoche.col+" colnr "+colnr);

           // Wunsch
           // mitspielwünsche zur Buchung
                                        var idx = parseInt(res.kwRow) + 1;
                                        var end = idx + 6; // bug15
                                        for (idx; idx <= end; idx++) {
                                            console.log(idx);
                                            // lege leeren eintrag an
                                            $rootScope.filmlauf[idx]['col' + colnr] = {};
                                            // kopiere Spielort falls  mitspielwunsch
                                            if ($rootScope.filmlauf[idx][res.col + 'w'] != undefined) {
                                                var mitspieler = $rootScope.filmlauf[idx][res.col + 'w'].sids;
                                                mitspieler.forEach(function (sid) {
                                                    FfkUtils.setBuchung(idx, ['col' + colnr], sid[0], "", sid[1]);
                                                    // FfkUtils.setBuchung( idx , ['col'+ colnr], sid, medium);
                                                    console.log("mitspieler " + sid);
                                                    // setze mindestgarantien wenn übernommen
                                                    if (sid[1] != undefined && sid[1] != false) {
                                                        var datum = $rootScope.filmlauf[idx].datum;
                                                        if ($rootScope.verleihBuchungen[res.wfID]['garantie'] == undefined) {
                                                            $rootScope.verleihBuchungen[res.wfID]['garantie'] = [];
                                                        }
                                                        $rootScope.verleihBuchungen[res.wfID].garantie = [datum, sid[0], sid[1]];
                                                    }
                                                });
                                                delete $rootScope.filmlauf[idx][res.col + 'w']; // lösche
                                                // Wunsch
                                            }
                                        }

                                        // setze Farben
                                        FfkUtils.newBackgroundFilmlauf(res.kwRow, 1, 'col' + colnr, 'bc-10');
//
                                         console.log(JSON.stringify(buchungsWoche, 5, 4));
                // filmbuchung
                                        break;
                                    case ("buchen"):
                                        // TODO OBSOLET  wir nicht mehr aufgerufen
                                        console.log("Ausgelagert in Ffk Utils!");
                                        break;
                                    case ("mitspielen"): // mitspielwunsch

                                        // wenn col eintrag nicht  existiert
                                        if (!(res.col in buchungsTag)) {
                                            buchungsTag[res.col] = {};

                                        }
                                        // erster oder weiterer wunsch dieses tages
                                        if (buchungsTag[res.col + 'w']) {
                                            buchungsTag[res.col + 'w']['sids'].push([res.sid]);
                                        } else {
                                            var kwRow = FfkUtils.getKinoWochenRowIdx(res.row, res.datum);
                                            var bc = $rootScope.filmlauf[kwRow][res.col + 'w']['bc'];
                                            // "col1w":{"bc":"bc-40","sids":[["sid2"]]}
                                            buchungsTag[res.col + 'w'] = {
                                                "bc": "bc-40",
                                                "sids": [[res.sid]]
                                            };
                                        }
                                        break;
                                    default:
                                        $log.info("Weis nicht, was mit " + res.typ + " geschehen soll!");

                                }
                            }
                            // zeichne Tabelle neu
                            console.log("zeichne Tabelle neu");
                            $scope.gridOptions.api.setRowData($rootScope.filmlauf);

                        }, modalInstance.opened.then(function () {
                            console.log('');
                        }),
                        // Modal wurde abgebrochen
                        function () {
                            $log.info('Modal dismissed at: ' + new Date());
                        });
            };
            // spalte
        });

//
// CONTROLLER
//
// ModalFilmlRowInstanceCtrl REIHE
// bezieht sich auf die FilmverleihBuchungen in einer Woche (mit Datum)
angular.module('modalFilmRow').controller('ModalFilmlRowInstanceCtrl',
    function ($rootScope, $scope, $log, $uibModalInstance, rowIdx, FfkUtils, programmCtrlScope, colIdx) {
        console.log("ModalFilmlRowInstanceCtrl für rowIdx " + rowIdx +" und colIdx " + colIdx);

        $scope.filmObject = []; // Film der Woche aus Filmlauf
        $scope.wochenWunschFilme = {}; // Wünsche der Woche
        $scope.medienLeihbar = []; // medien für ausgewählten Film
        $scope.fID = false; //die ausgewählte fID
        $scope.wfID = false; // wunschfilmID für verleihBuchungen

        $scope.sid = 'false';
        if ($rootScope.logedInUser.sid){
            $scope.sid = $rootScope.logedInUser.sid // spielort aktuell
        }
        console.log("die sid "+$scope.sid);

        $scope.bisherigerVerleih = false;
        $scope.filmChanges = {};

        // Object.create($rootScope.film(fBID
        // Alle Filme dieses Tages

        var filmlaufTag = $rootScope.filmlauf[rowIdx];
        var datum = moment(filmlaufTag["datum"]).hour(12);

        // steurinfos für die html anzeige
        $scope.modus = {};
        $scope.modus.abspielmoeglichkeiten = ""; // am Spielort
        $scope.modus['hinweis'] = "← Bitte wählen Sie einen Film.";
        $scope.modus["filmInfos"] = false;
        $scope.modus['text'] = "Infos zum Film";
        $scope.modus['status'] = "unbekannt" // Wunschfilm
        $scope.modus['col']; // welche Spalte

        $scope.datum;
        $scope.modus['row'];
        // KW Zeile oder Tageszeile =>
        // $scope.wahl.row = 'kw' || 'tag'
        // $scope.datum = KW || datum
        if (filmlaufTag["datum"].substr(4, 1) == 'W') {
            $log.debug("Kalenderwochenübersicht gewählt");
            datum = moment(datum).isoWeekday(4); // fake day
            $scope.datum = "KinoWoche " + moment(datum).format('w');
            $scope.modus.row = 'kw';
            rowIdx = rowIdx + 1; //zum Filme einlesen
        } else {
            $log.debug("Tagesübersicht gewählt");
            $scope.datum = moment(datum).format('dd. DD.MM.YYYY');
            $scope.modus.row = 'tag';
        }

        if ($scope.modus.row == 'kw') {
            $scope.header = "Filme dieser Woche";
        } else {
            $scope.header = "Film auswählen für ";
        }
// hole KW Woche
        // der row Indefilmex der KW Zeile
        // var wochenBuchungenIDX = rowIdx - moment(datum).format('E');
        var wochenBuchungenIDX = FfkUtils.getKinoWochenRowIdx(rowIdx, datum);
        // die KW Zeile vBID und Medien
        var wochenBuchungen = $rootScope.filmlauf[wochenBuchungenIDX];

        // gebuchte Filme
        // lade infos zur vBID filmobject: key=col value = buchungsobj +bc
        // lade infos zur wfID wochenWunschFilme: key=wfID v
        var myObject;
// sammel filme aus kw woche
        var machMenus = function () {
            console.log("machMenus: status = " + $scope.modus.status);
            $scope.filmObject = []; // Film der Woche aus Filmlauf
            $scope.wochenWunschFilme = {}; // Wünsche der Woche
            for (var i = 1; i <= wochenBuchungen.col; i++) {
                // wenn col existiert Filme in dieser Woche
                if ( (typeof wochenBuchungen['col' + i] != 'undefined'))   {
                    // ist false wenn nur Wunschfilme
                    var myVBID = wochenBuchungen['col' + i]["vBID"];
                    if (! ((myVBID == false) || (myVBID == undefined)  )) {
                        // buchungsinfos zum Film
                        myObject = $rootScope.verleihBuchungen[wochenBuchungen['col' + i]["vBID"]];
                        // hintergrundfarbe
                        if ( ( typeof wochenBuchungen['col' + i]['bc']) == 'undefined') {
                            myObject.bc = "bc-g0";
                        } else {
                            myObject.bc = wochenBuchungen['col' + i]['bc'];

                        }


                        // Spalte
                        myObject.col = 'col' + i;
                        $scope.filmObject.push(myObject);
                    }
                    // Filmwünsche in dieser Woche
                    if (typeof wochenBuchungen['col' + i + 'w'] != 'undefined') {
                        var wb = wochenBuchungen['col' + i + 'w'];
                        console.log(JSON.stringify(wb));
                        // TODO umstellung zur Variablen verleihWunsch aufräumen
                      // myObject = $rootScope.verleihBuchungen["wuensche"][wb["vBID"]];
                        myObject = $rootScope.verleihWunsch[wb["vBID"]];
                        myObject.bc = wb['bc'];
                        myObject.col = 'col' + i;
                        myObject.wfID = wb["vBID"];
                        $scope.wochenWunschFilme[myObject.wfID] = myObject;
                    }
                }
            }
            // $log.debug(" buchbarer Filme: " + JSON.stringify($scope.filmObject));
            // $log.debug(" wochenWunschFilm : " + JSON.stringify($scope.wochenWunschFilme));
        }
        machMenus();

        $scope.getMedienVorOrt = function (sid) {
            $scope.sid = sid;
            console.log(" zeige Abspielmöglichkeiten für " + $scope.sid);
            // medien vor Ort abspielbar
            if ($scope.sid == 'false') {
                console.log("$scope.sid == false -> " + $scope.sid);
                $scope.modus.spielOrtInfo = "noch kein Spielort gewählt";
                $scope.modus.abspielmoeglichkeiten = "";

            } else {
                console.log("$scope.sid != false -> " + $scope.sid )

                $scope.modus.abspielmoeglichkeiten = $rootScope.spielorte[$scope.sid].medien;
                $scope.modus.spielOrtInfo = "In " + $rootScope.spielorte[$scope.sid].ort + " abspielbare Medien:";
            }

            // aktualisere filminfos medienmenge
            if ($scope.modus.status == 'buchbar') {
                $scope.loadBuchbar($scope.modus.col);
            } else if ($scope.modus.status == 'gewunschen') {
                $scope.loadGewunschen($scope.buchung);
            }
        };
        $scope.getMedienVorOrt($scope.sid);


        // wunschfilm anlegen
        $scope.neuerWunsch = function () {
            $scope.modus['text'] = "Neuen Wunschfilm anlegen";
            $scope.modus.hinweis = "";
            $scope.modus.status = "neuerWunsch";
            $scope.filmChanges = {};
            console.log("sammel WunschFilm Infos");
        };

        // buchbarer film angecklickt
        $scope.loadBuchbar = function (col) {
            console.log("loadBuchbar: " + col);
            $scope.modus.col = col; // infos $scope.buchen
            $scope.kwinfos = wochenBuchungen[col];
            $scope.buchung = $rootScope.verleihBuchungen[$scope.kwinfos["vBID"]];
            if ($scope.modus.row == 'tag') {
                $log.debug("suche Medienverfügbarkeit für 'tag'");
                $scope.medienLeihbar = FfkUtils.getLeihbar(filmlaufTag["datum"], $scope.buchung.medien);
                $scope.modus.buchbar = true;
            }
            $scope.fID = $scope.kwinfos.fID;
            //versuche Film zu laden falls noch nicht vorhanden
            FfkUtils.ladeFilm($scope.fID);
            $scope.modus.text = "Infos zum Film";
            $scope.modus.status = "buchbar";
        };

if (colIdx != undefined){ // aufruf mit row und colIdx, zeige nicht alle filme, sondern gleich den der col
    console.log("gehe direkt zum film, da col "+ colIdx + "im Aufruf mitgegeben wurde");
    $scope.loadBuchbar("col"+colIdx);
}


        // lade daten zum ausgewählten Filmwunsch
        $scope.loadGewunschen = function (wunsch) {
            machMenus();
            console.log("loadGewunschen: " + JSON.stringify(wunsch, 0, 0));
            FfkUtils.ladeFilm(wunsch.fID);
            $scope.kwinfos = wunsch.titel;
            $scope.buchung = wunsch;
            $scope.fID = wunsch.fID;
            $scope.wfID = wunsch.wfID;
            $scope.modus.text = "Infos zum Filmvorschlag";
            $scope.modus.status = "gewunschen";
        };

        $scope.bearbeiteFilm = function () {
            $scope.filmChanges = Object.create($rootScope.filme[$scope.fID]);
            if ($scope.modus.status == 'buchbar') {
                $scope.modus.status = "bearbeiteFilm";
            }
            if ($scope.modus.status == 'gewunschen') {
                $scope.modus.status = "bearbeiteWunsch";
            }
            console.log("$scope.buchung.vid" + $scope.buchung.vid);
            $scope.bisherigerVerleih = [$scope.buchung.vid, FfkUtils.getRefName($rootScope.verleiherSortiert, $scope.buchung.vid, 1)];
            console.log("bearbeite " + $scope.fID + " mit Verleih " + $scope.bisherigerVerleih);
        }

        // speicher Änderungen bei bestehenden Filmen
        $scope.speicherFilm = function () {
            if ($scope.modus.status == 'bearbeiteFilm') {
                $rootScope.verleihBuchungen[$scope.kwinfos.vBID].titel = $scope.filmChanges.titel;
                $rootScope.verleihBuchungen[$scope.kwinfos.vBID].vid = $scope.filmChanges.verleih;
                $scope.modus.hinweis = "Film bearbeitet.";
                $scope.modus.status = "buchbar";
            }
            if ($scope.modus.status == 'bearbeiteWunsch') {
                $rootScope.verleihBuchungen.wuensche[$scope.wfID].titel = $scope.filmChanges.titel;
                $rootScope.verleihBuchungen.wuensche[$scope.wfID].vid = $scope.filmChanges.verleih;
                $scope.modus.hinweis = "Wunsch bearbeitet."
                $scope.modus.status = "gewunschen";

            }
            // Verleih wurde eben gesfpeicdhert und gehört nicht in Film
            delete $scope.filmChanges.verleih;
            Object.keys($scope.filmChanges).forEach(function (key) {
                $rootScope.filme[$scope.fID][key] = $scope.filmChanges[key];
                console.log("Änder " + key + " in : " + $rootScope.filme[$scope.fID][key]);
                // wenn der Titel geändert wurde,änder auch Titel in buchung
                if (key == 'titel'){
                  FfkUtils.aenderTitelInBuchung($scope.fID )

                };


            })
            // $scope.modus['status'] = "unbekannt";

            machMenus();
        };

        $scope.verwerfeAenderung = function () {
            $scope.filmChanges = null;
            $scope.modus['status'] = "unbekannt";
        };

        $scope.speicherWunsch = function () {
            console.log("speicherWunsch");

            $scope.modus.status = "unbekannt";
            FfkUtils.setWunsch($scope.filmChanges, programmCtrlScope, wochenBuchungenIDX);
            machMenus();
            $scope.modus.hinweis = "Wunschfilm angelegt."
        };


        // $uibModalInstance.close Varianten
        //
        $scope.machBuchbar = function () {

            var col = $scope.buchung.col;
            var result = {
                "typ": "machBuchbar",
                "kwRow": wochenBuchungenIDX,
                "col": col,
                "wfID": $scope.buchung.wfID,
                'fID': $scope.buchung.fID
            };

            var newVal = [];
            result["val"] = newVal;
            $uibModalInstance.close(result);
        };


        $scope.garantieUebernehmen = function () {
            FfkUtils.mitspielen($scope.buchung.col, $scope.sid, rowIdx, true);
            $scope.machBuchbar();

        };

        // Mitspielinteresse bekunden
        $scope.mitspielen = function (medium) {
            console.log("FfkUtils.mitspielen("+$scope.buchung.col +", "+ $scope.sid +", " +rowIdx+")");
            console.log( $scope.buchung.wfID);
            FfkUtils.mitspielen($scope.buchung.col, $scope.sid, rowIdx);// setze in Tabelle
            // setze in Ringbuchung loste REST aus TODO REst
            FfkUtils.setRingWunsch({"vBID": $scope.buchung.wfID  , "sid": $scope.sid, "datum": $scope.filmlauf[rowIdx].datum});
            $uibModalInstance.close({'msg': 'Mitspielwunsch abgegeben'});
        };

        // Film buchen
        $scope.buchen = function (medium) {
            console.log("buchen "+ medium);
            if ($scope.sid != false) { // nur wenn Spieort angegeben
                FfkUtils.setBuchung(rowIdx, $scope.buchung.col, $scope.sid, medium);
                $uibModalInstance.close({'msg': 'Film gebucht'});
            } else { // Spielort fehlt
                alert("Welcher Spielort soll mitspielen?\nBitte wählen sie einen aus.");

            }
        };

        // $uibModalInstance.dismiss
        $scope.abbrechen = function () {
            $uibModalInstance.dismiss('Filmauswahl geschlossen');
        };
    });