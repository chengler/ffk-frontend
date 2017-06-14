"use strict";

(function () {

    var programm = angular.module('app.programm');

    programm.controller('ProgrammCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$log',
        '$uibModal',
        'ModalFilmRowService',
        'ModalFilmKWService',
        'RenderProgrammTableServices',
        'FfkUtils',
        'ModalBuchungsBearbeitungService',
        '$q',
        function ($rootScope, $scope, $http, $log, $uibModal, ModalFilmRowService, ModalFilmKWService,
                  RenderProgrammTableServices, FfkUtils, ModalBuchungsBearbeitungService, $q) {
            $log.info("init programmCtrl");
            var zeigeWunschFilme = false;
            $rootScope.zeigeWunschFilme = zeigeWunschFilme;
            $scope.wunschFilmTextBtn = "zeige Wunschfilme";

            // setze env für Zeitumrechnungen
            moment.locale('de');
            // fehlende Serverlogik, dafür provisorische ID

            $scope.server;

            // jetzt in FfkUtils TODO replace
           /* var provID = 0;
            $scope.getNewProvID = function () {
                provID = provID + 1;
                return "p" + provID;
            };*/

            // testvariablen zur ausgabe im view
            $scope.rd3 = "rd3";
            $scope.rd4 = "rd4";

            // zeichne jedesmal neu
            // if ($rootScope.status.aggrid) sollte damit obsolet sein!
            $rootScope.status.aggrid = false;

            // Damit die aktuelle Woche gleich angezeigt wird
            var setTabellenIndexAufDatum = function() {
                console.log("setTabellenIndexAufDatum");
              var heute = new Date();
                var thisKW = moment(FfkUtils.getKinoWocheFromDate(heute)).isoWeek();
                console.log("Springe in der Tabelle zur KW "+ thisKW); // ofset 5 // 8 pro Woche
                $rootScope.gridOptions.api.ensureIndexVisible( (5+thisKW)*8 );
            }



            //
            // Tabelle (field für auto Spaltenbreite)
            // setze 1. Spalte
            var columnDefs = [{
                    headerName: "Datum",
                    field: "datum",
                    pinned: 'left',
                    minWidth: 75,
                    maxWidth: 100,
                    cellRenderer: function (params) {
                        return RenderProgrammTableServices.datumsRenderer(params);
                    },
                    cellClass: function (params) {
                        return "bc-00";
                      //  return params.data.bc;
                    }
                }];


            if ($rootScope.status.aggrid == false) {
                // Tabelle, noch keine rowData
                // funktion, da unterschiedliche linienhöhe
                console.log("! $rootScope.gridOptions werden geladen");
                // wäre es nicht besser sie in den rootscope zu legen?
                $rootScope.gridOptions = {
                    columnDefs: columnDefs,
                    rowData: null,
                    enableColResize: true,
                    getRowHeight: function (params) {
                      //  return 25 * params.data.lines;
                        // [ 0, 1, 2, 3 ] =[background, spieltag  , datum, lines in row]
                        return 25 * params.data[0][3];
                    },
                    // enableColResize : true,
                    angularCompileRows: true
                };

            }
            // START Lade Tabelle asyncron
            // lade Filmlauf in scope und erstelle Tabelle?
            // watch geladen
/*
            if ($rootScope.status.filmlaufGeladen == false) {
                // sete watcher
                var filmlaufGeladen = $scope.$watch(function () {
                    return $rootScope.status.filmlaufGeladen;
                }, function () {
                    if ($rootScope.status.filmlaufGeladen) {
                        filmlaufGeladen(); // clear watcher
                     //   initFilmlauf("filmlaufGeladen");
                    }
                }, true);
                // lade Filmlauf sobald bekannt ist, wer sich angemeldet hat

                // starte asyncron
                // erst wenn user angemeldet
                FfkUtils.loadFilmlauf();
            }*/

            // setz watcher ob alles geladen grundtabelle kann dann weg!
            if ($rootScope.status.aggrid == false) {
                var allesGeladen = $scope.$watch(function () {
                    return ($rootScope.status.filmlaufGeladen && $rootScope.status.verleihBuchungenGeladen);
                }, function () {
                    if ($rootScope.status.filmlaufGeladen && $rootScope.status.verleihBuchungenGeladen) {
                        allesGeladen(); // clear watcher
                        initFilmlauf("allesGeladen");
                    }
                }, true);
            }


            // lade Buchungen vBID Auflösungen in scope -
            // asyncron mit watcher
            /*if ($rootScope.status.verleihBuchungenGeladen == false) {
                var verleihBuchungenGeladen = $scope.$watch(function () {
                    return $rootScope.status.verleihBuchungenGeladen;
                }, function () {
                    if ($rootScope.status.verleihBuchungenGeladen) {
                        verleihBuchungenGeladen();
                        initFilmlauf("verleihBuchungenGeladen");
                    }
                }, true);
                FfkUtils.loadBuchungen();
            }*/

            // lade Filme fID -
            // asyncron
        //   console.log(" FfkUtils.loadFilme")
          // FfkUtils.loadFilme();

            // Init TAbelle
            // wenn spielorteGeladen und
            // $rootScope.status.$rootScope.status.filmlaufGeladen
            function initFilmlauf(wo) {
                console.log("initTabelle aufgerufen von " + wo);
            //    if ($rootScope.status.filmlaufGeladen & $rootScope.status.verleihBuchungenGeladen) {
                    var tstart = Date.now();
                    // definiere Spalten
                console.log("definiere Spalten maxcol "+ $rootScope.filmlaufSpalten );

                    for (var i = 1; i <= $rootScope.filmlaufSpalten;  i++) {
                        var header = {
                            headerName: "film" + i,
                            field: "film" + i,
                            cellRenderer: function (params) {
                                return buchungsRenderer(params);
                            },
                            cellClass: function (params) {
                                return cellClassRenderer(params);
                            },
                            minWidth: 50,
                        };
                        console.log("HEADERS");
                        columnDefs.push(header);
                    }

                    // // baue neu
                console.log("setRowData");
                    $rootScope.gridOptions.api.setRowData($rootScope.filmlauf);
                console.log("setColumnDefs");
                    $rootScope.gridOptions.api.setColumnDefs(columnDefs);
                    // $rootScope.gridOptions.api.refreshView();

                    // // alle spalten in rahmen
                    $rootScope.gridOptions.api.sizeColumnsToFit();
                    var zeit = Date.now() - tstart;
                    console.log("gezeichnet in " + zeit + " ms");
                    $rootScope.status.aggrid = true;

                console.log("initTabelle done");
                    setTabellenIndexAufDatum();

               /* } else {
                    console.log("initFilmlauf: filmlaufGeladen " + $rootScope.status.filmlaufGeladen
                        + " verleihBuchungenGeladen " + $rootScope.status.verleihBuchungenGeladen + " grundTabelleGeladen "
                        + $rootScope.status.grundTabelleGeladen + " noch nicht alles geladen -> ende");
                }*/
            }

            // END Lade TAbelle

           /* if ($rootScope.status.grundTabelleGeladen == false) {
                $log.info("erstelle  grundTabelle");
                // erstelle row data
                // 60 Wochen KW-1 minus 4, KW 52 plus 4
                // buggy iso30 !important
                var ersterDo = moment().isoWeek(30).isoWeekYear(new Date().getFullYear()).isoWeek(1).isoWeekday(4)
                    .hour(12);
                // 4 Wochen zurück
                ersterDo = moment(ersterDo).subtract(4, 'weeks');
                console.log("ersterDo " + ersterDo._d);
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
                console.log("grundTabelleGeladen " + $rootScope.status.grundTabelleGeladen);
                initFilmlauf("grundTabelle");

            }*/


            // SCOPE Methoden
            // neue Spalten
            $scope.neueColum = function (colnr) {
                $log.debug("neue Spalte " + colnr);
                var header = {
                    headerName: "film" + colnr,
                    field: "film" + colnr,
                    cellRenderer: function (params) {
                        return buchungsRenderer(params);
                    },
                    cellClass: function (params) {
                        return cellClassRenderer(params);
                    },
                    minWidth: 50,
                };
                columnDefs.push(header);
                // setze Spalten
                $rootScope.gridOptions.api.setColumnDefs(columnDefs);
                if (colnr > maxCol) {
                    maxCol = colnr;
                }
            };

            // zeige ganze Spalten
            $scope.ganzeSpalte = function () {
                var allColumnIds = [];
                columnDefs.forEach(function (columnDef) {
                    allColumnIds.push(columnDef.field);
                });
                $rootScope.gridOptions.columnApi.autoSizeColumns(allColumnIds);
            };

            // zeige alle Spalten
            $scope.alleSpalten = function () {
                $rootScope.gridOptions.api.sizeColumnsToFit();
            };

            // flip true and false in tabelle
            $scope.handleFlip = function (flipKey, flipIdx, flipCol, flipFilm) {
                // console.log("handleFlip " + flipKey + flipIdx
                // + flipCol);
                // console.log($rootScope.filmlauf[flipIdx][flipCol][flipKey]);

                var bol = $rootScope.filmlauf[flipIdx][flipCol][flipFilm][flipKey];
                if (bol === true ? bol = false : bol = true)
                    ;
                $rootScope.filmlauf[flipIdx][flipCol][flipFilm][flipKey] = bol;
                $rootScope.gridOptions.api.refreshView();
                var fBID = $rootScope.filmlauf[flipIdx][flipCol][flipFilm]["fBID"];
                console.log("TODO RESTfull post ./checkChance { fBID: " + fBID + ", " + flipKey + " : " + bol
                    + " }");
                $scope.server = "http.post('../checkChance') data: { fBID: " + fBID + ", " + flipKey + " : " + bol
                    + " }";

            };


            // 'verschicke Film nach d&d'
            $scope.handleDrop = function (dragIdx, dragCol, dragFilm, binIdx, binCol, binFilm) {
                var von = $rootScope.filmlauf[dragIdx][dragCol][dragFilm];
                var nach = $rootScope.filmlauf[binIdx][binCol][binFilm];
                nach.medienID = von.medienID;
                nach.vonID = von.ortID;
                von.nachID = nach.ortID;
                console.log("von " + JSON.stringify( von ));
                console.log("nach " + JSON.stringify( nach ));
                // erstelle Änderungen
                var wechselInVon = { "nachID": nach.sid }
                var wechselInNach = { "vonID": von.sid, "medium": von.medium, "medienID":von.medienID };
                // speicher Änderungen in rootScope.ringBuchung; später auch via REST
                console.log("TODO beende RESTfull post ./FilmVonNach: in ffkutils.changeRingBuchung");
                FfkUtils.changeRingBuchung(von.fBID , wechselInVon );
                FfkUtils.changeRingBuchung(nach.fBID , wechselInNach);
                // speicher in Filmlauf
                FfkUtils.changeFilmlauf(dragIdx,dragCol,dragFilm, wechselInVon  );
                FfkUtils.changeFilmlauf(binIdx,binCol,binFilm, wechselInNach  );

                $rootScope.gridOptions.api.refreshView();
            };

            // zeige/verberge Wunschfilme
            $scope.toggleWunschfilme = function () {
                $log.info("zeigeWunschFilme = " + zeigeWunschFilme);
                if (zeigeWunschFilme) {
                    $scope.wunschFilmTextBtn = "zeige Wunschfilme";
                    zeigeWunschFilme = false;
                } else {
                    $scope.wunschFilmTextBtn = "verberge Wunschfilme";
                    zeigeWunschFilme = true;
                }
                // render neu
                $rootScope.gridOptions.api.refreshView();
            };

            // locale Methoden



            // modal
            // http://angular-ui.github.io/bootstrap/#/modal
            //
            // Filmlaufmodal
            $scope.openModalKW = function (rowIdx, colIdx, colType) {
                ModalFilmKWService.editKW($scope, rowIdx, colIdx, colType);
               
            };
            // Filmmodal
            $scope.openModalFilm = function (rowIdx, colIdx) {
                ModalFilmRowService.editFilm($scope, rowIdx, colIdx);
               
            };

            // ModalBuchungsBearbeitungService
            $scope.openModalBuchung = function (rowIdx, colIdx, filmNr ) {
                ModalBuchungsBearbeitungService.editBuchung(rowIdx, colIdx, filmNr, $rootScope.gridOptions);
               


            };


            var cellClassRenderer = function (params) {
                // workaround - schneide index aus
                // index aus
                //gehört in tablerenderer
                return "bc=10";
             /*
                var idx = params.colDef.headerName.substr(4);
                // col existiert
                if (typeof params.data["col" + idx] != 'undefined') {
                    return params.data["col" + idx].bc;
                } else {
                    return "";
                }
                */

            };

            // Service Buchungsrenderer
            //noch nötig?
            var buchungsRenderer = function (params) {
                return RenderProgrammTableServices.buchungsRenderer(params, zeigeWunschFilme);
            };

            // wenn bereits einmal initialisiert
            // setze neue Headers
            if ($rootScope.status.aggrid) {
                console.log("$rootScope.status.aggrid = " + $rootScope.status.aggrid);
                setTabellenIndexAufDatum

                $rootScope.gridOptions.rowData = $rootScope.filmlauf;
                setTabellenIndexAufDatum();


         /*       maxCol = FfkUtils.getFilmlaufMaxCol(maxCol);

                // definiere Spalten
                for (var i = 1; i <= maxCol; i++) {
                    var header = {
                        headerName: "film" + i,
                        field: "film" + i,
                        cellRenderer: function (params) {
                            return buchungsRenderer(params);
                        },
                        cellClass: function (params) {
                            return cellClassRenderer(params);
                        },
                        minWidth: 50,
                    };
                    console.log("HEADERS");
                    columnDefs.push(header);
                    // setze Spalten

                }
                $rootScope.gridOptions.columnDefs = columnDefs;
//					$rootScope.gridOptions.api.sizeColumnsToFit();
*/
            }




            // TESTFELD


            // FARBEN

            // http://stackoverflow.com/questions/21503588/angularjs-bind-html-string-with-custom-style
            // http: //
            // odetocode.com/blogs/scott/archive/2014/09/10/a-journey-with-trusted-html-in-angularjs.aspx
            // http://www.w3schools.com/html/html_colornames.asp
            // https://en.wikipedia.org/wiki/Web_colors



        }]);
})();