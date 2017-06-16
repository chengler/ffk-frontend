// früher modal Filmwoche

angular
    .module('modalFilmWoche', ['ui.bootstrap', 'ffkUtils'])
    .constant('MODULE_VERSION', '0.0.1')
    //
    // SERVICES
    //
    // modal
    // http://angular-ui.github.io/bootstrap/#/modal
    .service(
        'ModalFilmWochenService',
        function ($uibModal, $log, FfkUtils, $rootScope) {
            this.editFilm = function ( rowIdx, colIdx) { //nur row bei ganzer zeile (+ in der KW anzeige)
                var modalInstance = $uibModal.open({            // col zur direkten filminfo (filmlinks in der kw zeile)
                    templateUrl: './components/filme/modalFilmWoche.html?' + Math.random(),
                    controller: 'ModalFilmlWochenInstanceCtrl',
                    size: "lg",
                    resolve: {
                        rowIdx: function () {
                            return rowIdx
                        },
                        colIdx: function () {
                            if (colIdx == undefined){
                                colIdx = false;
                            }
                            return colIdx
                        }
                    }
                });
                // ModalFilmlWochenInstanceCtrl wird auf rowIdx des
                // Filmlaufs
                // gestartet
                $log.info(" ModalFilmWochenService rowIdx: " + rowIdx);

                // TODO stack für asyncrone Serverantworten

                // Die Antwort des ModalFilmlWochenInstanceCtrl
                modalInstance.result
                    .then(
                        function (res) {
                            $log.debug("ModalFilmWochenService ModalReturn: "
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

