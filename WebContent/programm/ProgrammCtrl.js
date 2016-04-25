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
            $scope.maxCol = 0; // maximale Spaltenanzahl in Tabelle
            // setze env für Zeitumrechnungen
            moment.locale('de');
            // fehlende Serverlogik, dafür provisorische ID

            $scope.server;

            // jetzt in FfkUtils TODO replace
            var provID = 0;
            $scope.getNewProvID = function () {
                provID = provID + 1;
                return "p" + provID;
            };

            // testvariablen zur ausgabe im view
            $scope.rd3 = "rd3";
            $scope.rd4 = "rd4";


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
                    return params.data.bc;
                }
            }];

            // Tabelle, noch keine rowData
            // funktion, da unterschiedliche linienhöhe
            console.log("!!! $scope.gridOptions");
            $scope.gridOptions = {
                columnDefs: columnDefs,
                rowData: null,
                enableColResize: true,
                getRowHeight: function (params) {
                    return 25 * params.data.lines;
                },
                // enableColResize : true,
                angularCompileRows: true
            };

            // START Lade Tabelle asyncron
            // lade Filmlauf in scope und erstelle Tabelle?
            // watch geladen

            if ($rootScope.status.filmlaufGeladen == false) {
                // sete watcher
                var filmlaufGeladen = $scope.$watch(function () {
                    return $rootScope.status.filmlaufGeladen;
                }, function () {
                    if ($rootScope.status.filmlaufGeladen) {
                        filmlaufGeladen(); // clear watcher
                        initFilmlauf("filmlaufGeladen");
                    }
                }, true);
                // starte asyncron
                FfkUtils.loadFilmlauf();
            }

            // lade Buchungen vBID Auflösungen in scope -
            // asyncron mit watcher
            if ($rootScope.status.buchungenGeladen == false) {
                var buchungenGeladen = $scope.$watch(function () {
                    return $rootScope.status.buchungenGeladen;
                }, function () {
                    if ($rootScope.status.buchungenGeladen) {
                        buchungenGeladen();
                        initFilmlauf("buchungenGeladen");
                    }
                }, true);
                FfkUtils.loadBuchungen();
            }

            // lade Filme fID -
            // asyncron
            FfkUtils.loadFilme();

            // Init TAbelle
            // wenn spielorteGeladen und
            // $rootScope.status.$rootScope.status.filmlaufGeladen
            function initFilmlauf(wo) {
                console.log("initTabelle aufgerufen von " + wo);
                if ($rootScope.status.filmlaufGeladen & $rootScope.status.buchungenGeladen
                    & $rootScope.status.grundTabelleGeladen) {
                    var tstart = Date.now();
                    $scope.maxCol = FfkUtils.getFilmlaufMaxCol($scope.maxCol);
                    // definiere Spalten
                    for (var i = 1; i <= $scope.maxCol; i++) {
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
                        // $scope.gridOptions.api.setColumnDefs(columnDefs);
                    }

                    // // baue neu
                    // $scope.gridOptions.rowData = $rootScope.filmlauf;
                    // $scope.gridOptions.columnDefs= columnDefs;
                    $scope.gridOptions.api.setRowData($rootScope.filmlauf);
                    $scope.gridOptions.api.setColumnDefs(columnDefs);
                    // $scope.gridOptions.api.refreshView();
                    // // alle spalten in rahmen
                    $scope.gridOptions.api.sizeColumnsToFit();
                    var zeit = Date.now() - tstart;
                    console.log("gezeichnet in " + zeit + " ms");
                    $rootScope.status.aggrid = true;
                } else {
                    console.log("initFilmlauf: filmlaufGeladen " + $rootScope.status.filmlaufGeladen
                        + " buchungenGeladen " + $rootScope.status.buchungenGeladen + " grundTabelleGeladen "
                        + $rootScope.status.grundTabelleGeladen + " noch nicht alles geladen -> ende");
                }
            }

            // END Lade TAbelle

            if ($rootScope.status.grundTabelleGeladen == false) {
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

            }

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
                $scope.gridOptions.api.setColumnDefs(columnDefs);
                if (colnr > $scope.maxCol) {
                    $scope.maxCol = colnr;
                }
            };

            // zeige ganze Spalten
            $scope.ganzeSpalte = function () {
                var allColumnIds = [];
                columnDefs.forEach(function (columnDef) {
                    allColumnIds.push(columnDef.field);
                });
                $scope.gridOptions.columnApi.autoSizeColumns(allColumnIds);
            };

            // zeige alle Spalten
            $scope.alleSpalten = function () {
                $scope.gridOptions.api.sizeColumnsToFit();
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
                $scope.gridOptions.api.refreshView();
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
                var vBID = getBuchungswoche(dragIdx, dragCol);
                vBID = vBID["vBID"];
                console.log("TODO RESTfull post ./FilmVonNach: { vBID: " + vBID + ", fBID: " + von.fBID
                    + ", fBID: " + nach.fBID + " }");
                $scope.server = "http.post('../FilmVonNach') data: { vBID: " + vBID + ", fBID: " + von.fBID
                    + ", fBID: " + nach.fBID + " }";
                $scope.gridOptions.api.refreshView();
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
                $scope.gridOptions.api.refreshView();
            };

            // locale Methoden

            // lade Object der KW (vBID-Verleih Buchungs ID,
            // Filmname etc) erwarte index und col des Filmtages
            function getBuchungswoche(index, col) {
                $scope.rd3 = "index: " + index + " col: " + col;
                var datum = $rootScope.filmlauf[index]["datum"];
                // ISO day of week 1-7
                // var idx = index - moment(datum).format('E');
//					var idx = FfkUtils.getKinoWochenRowIdx(rowIdx, datum);
                console.log("UNNÖTIGER AUFRUFE, wandel direkt! in rootScope");
                return $rootScope.filmlauf[index][col];
            }

            // modal
            // http://angular-ui.github.io/bootstrap/#/modal
            //
            // Filmlaufmodal
            $scope.openModalKW = function (rowIdx, colIdx, colType) {
                ModalFilmKWService.editKW($scope, rowIdx, colIdx, colType);
               
            };
            // Filmmodal
            $scope.openModalFilm = function (rowIdx) {
                ModalFilmRowService.editFilm($scope, rowIdx);
               
            };

            // ModalBuchungsBearbeitungService
            $scope.openModalBuchung = function (rowIdx, colIdx, filmNr ) {
                ModalBuchungsBearbeitungService.editBuchung(rowIdx, colIdx, filmNr, $scope.gridOptions);
               


            };


            var cellClassRenderer = function (params) {
                // workaround - schneide index aus
                // index aus
                var idx = params.colDef.headerName.substr(4);
                // col existiert
                if (typeof params.data["col" + idx] != 'undefined') {
                    return params.data["col" + idx].bc;
                } else {
                    return "";
                }
            };

            // Service Buchungsrenderer
            var buchungsRenderer = function (params) {
                return RenderProgrammTableServices.buchungsRenderer(params, zeigeWunschFilme);
            };

            // wenn bereits einmal ionitialisiert
            if ($rootScope.status.aggrid) {
                console.log("$rootScope.status.aggrid = " + $rootScope.status.aggrid);
                $scope.gridOptions.rowData = $rootScope.filmlauf;

                $scope.maxCol = FfkUtils.getFilmlaufMaxCol($scope.maxCol);

                // definiere Spalten
                for (var i = 1; i <= $scope.maxCol; i++) {
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
                $scope.gridOptions.columnDefs = columnDefs;
//					$scope.gridOptions.api.sizeColumnsToFit();

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