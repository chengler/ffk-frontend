"use strict";

(function () {

    var programm = angular.module('app.programm');

    programm.controller('ProgrammCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$log',
        '$uibModal',
        'ModalFilmWochenService',
       // 'ModalFilmKWService',
        'ModalVerleihBuchungsService',
        'RenderProgrammTableServices',
        'FfkUtils',
        'ModalRingBuchungFilmlaufBearbeitenService',
        'ModalRingBuchungEintrittBearbeitenService',
         function ($rootScope, $scope, $http, $log, $uibModal, ModalFilmWochenService, ModalVerleihBuchungsService,
                  RenderProgrammTableServices, FfkUtils, ModalRingBuchungFilmlaufBearbeitenService,
                  ModalRingBuchungEintrittBearbeitenService) {
            $log.info("init programmCtrl");
            var zeigeWunschFilme = false;
            $rootScope.zeigeWunschFilme = zeigeWunschFilme;
            $scope.wunschFilmTextBtn = "zeige Wunschfilme";


             //http://www.yourangularjstutorial.com/how-to-use-watch/


            // zeichne jedesmal neu
            // if ($rootScope.status.aggrid) sollte damit obsolet sein!
            $rootScope.status.aggrid = false;

            // Damit die aktuelle Woche gleich angezeigt wird
            var setTabellenIndexAufDatum = function() {
                console.log("setTabellenIndexAufDatum");
              var heute = new Date();
                var thisKW = moment(FfkUtils.getKinoWocheFromDate(heute)).isoWeek();
                console.log("Springe in der Tabelle zur KW "+ thisKW); // ofset 5 // 8 pro Woche
                $rootScope.gridOptions.api.ensureIndexVisible( (5 + thisKW)*8 ); //5+
            };

            // Tabelle (field für auto Spaltenbreite)
            // setze 1. Spalte
            // params .data
            // [0] =  [ 0, 1, 2, 3 ] =[background, spieltag  , datum, lines in row]
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
                        return params.data[0][0];
                      //  return params.data.bc;
                    }
                }];



            if ($rootScope.status.aggrid === false) {
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




            // Init TAbelle
            // wenn spielorteGeladen und
            // $rootScope.status.$rootScope.status.filmlaufGeladen
            var initFilmlauf = function(wo) {
                console.log("initTabelle aufgerufen von " + wo);
            //    if ($rootScope.status.filmlaufGeladen & $rootScope.status.verleihBuchungenGeladen) {
                    // definiere Spalten
                console.log("definiere Spalten maxcol "+ $rootScope.filmlaufSpalten );

                    for (var i = 1; i <= $rootScope.filmlaufSpalten;  i++) {
                        var header = {
                            headerName: "film" + i,
                            field: "film" + i,
                            cellRenderer: function (params) {
                                //return buchungsRenderer(params);
                                return RenderProgrammTableServices.buchungsRenderer(params, zeigeWunschFilme);
                            },
                            cellClass: function (params) {
                                return RenderProgrammTableServices.cellClassRenderer(params);
                            },
                            minWidth: 50,
                        };
                        console.log("HEADERS");
                        columnDefs.push(header);
                    }

                    // // baue neu
             //   console.log("setRowData");
                    $rootScope.gridOptions.api.setRowData($rootScope.filmlauf);
              //  console.log("setColumnDefs");
                    $rootScope.gridOptions.api.setColumnDefs(columnDefs);
                    // $rootScope.gridOptions.api.refreshView();

                    // // alle spalten in rahmen
                    $rootScope.gridOptions.api.sizeColumnsToFit();

                    $rootScope.status.aggrid = true;

                console.log("initTabelle done");
                    setTabellenIndexAufDatum();

               /* } else {
                    console.log("initFilmlauf: filmlaufGeladen " + $rootScope.status.filmlaufGeladen
                        + " verleihBuchungenGeladen " + $rootScope.status.verleihBuchungenGeladen + " grundTabelleGeladen "
                        + $rootScope.status.grundTabelleGeladen + " noch nicht alles geladen -> ende");
                }*/
            }




            // SCOPE Methoden
            // neue Spalten
            $scope.neueColum = function (colnr) {
                $log.debug("neue Spalte " + colnr);
                var header = {
                    headerName: "film" + colnr,
                    field: "film" + colnr,
                    cellRenderer: function (params) {
                        //return buchungsRenderer(params);
                        return RenderProgrammTableServices.buchungsRenderer(params, zeigeWunschFilme);
                     },
                    cellClass: function (params) {
                        return RenderProgrammTableServices.cellClassRenderer(params);
                    },
                    minWidth: 50,
                };
                columnDefs.push(header);
                // setze Spalten
                $rootScope.gridOptions.api.setColumnDefs(columnDefs);
                if (colnr > $rootScope.filmlaufSpalten) {
                    $rootScope.filmlaufSpalten = colnr;
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
             //    console.log("handleFlip 1/2 " + flipKey +" idx "+ flipIdx+"  col " + flipCol+" filmnr " + flipFilm);
                var fBID = $rootScope.filmlauf[flipIdx][1][flipCol-1][1][flipFilm-1];
            //    console.log(fBID);

                var bol = $rootScope.ringBuchungen[fBID][flipKey];
                console.log("bol "+bol);
                if (bol === true ? bol = false : bol = true);

                console.log("bol "+bol);
                $rootScope.ringBuchungen[fBID][flipKey] = bol;
                $rootScope.gridOptions.api.refreshView();
                $rootScope.infofenster = "{fBID:{ fBID: " + fBID + ", " + flipKey + " : " + bol + " }";
                console.log("{fBID:{ fBID: " + fBID + ", " + flipKey + " : " + bol + " }");

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

            // die neuen

            // früher openModalKW
            // Zum Bearbeiten der Verleihbuchung im Ordner distributores
            // (rowIdx , 1 | 2, arryCol)
            // rowIdx im filmlauf
            // 1 Buchung, 2 Wunsch (array in filmlauf
            // arrycol, welche position im array, welcher film in der Splate
            $scope.openModalVerleihBuchung = function ( rowIdx, art, arrycol) {
                console.log("openModalVerleihBuchung rowIdx " + rowIdx +" art: "+art +" arrycol "+ arrycol);
                var vBID = $rootScope.filmlauf[rowIdx][art][arrycol][1];
                ModalVerleihBuchungsService.editBuchung( vBID, art );

            };
            // früher openModalFilm
            // offnet Filmwoche um Ringbuchungen in dieswer Woche durzuführen
            // um Wunschfilme anzulegen
            $scope.openModalFilmWoche = function (rowIdx, colIdx) {
                console.log("openModalFilmWoche()");
                ModalFilmWochenService.editFilm(rowIdx, colIdx);

            };
            // fehlende Besucher eintragen
            // Koordinaten im Filmlauf
            // [1]    [ [spalte] .. ]   =  [background, [fBID,fBID]] .. =   [ bc-11, [fBID,fBID..]]
            $scope.besucherEintragen = function (rowIdx, colIdx, filmnr) {
                var fBID = $rootScope.filmlauf[rowIdx][1][colIdx-1][1][filmNr-1];
                // [0] = verarbeitungsart [1] = input
                console.log("besucherEintragen für fBID " + fBID);
                ModalRingBuchungEintrittBearbeitenService.editBesucher( {"fBID":fBID,"refreshView" : true});

            };



            // dei alten
            $scope.openModalKW = function (rowIdx, colIdx, colType) {
                ModalFilmKWService.editKW($scope, rowIdx, colIdx, colType);
               
            };
            // Filmmodal
/*            $scope.openModalFilm = function (rowIdx, colIdx) {
                ModalFilmRowService.editFilm($scope, rowIdx, colIdx);
               
            };*/

            // ModalBuchungsBearbeitungService
            $scope.openModalBuchung = function (rowIdx, colIdx, filmNr) {
             //   console.log($rootScope.filmlauf[rowIdx][colIdx-1][1][1][0]);
             //   console.log(filmNr);
               // console.log(JSON.stringify($rootScope.filmlauf[rowIdx][1][0]));
                var fBID = $rootScope.filmlauf[rowIdx][1][colIdx-1][1][filmNr-1];
                // [0] = verarbeitungsart [1] = input
                console.log("bearbeite fBID " + fBID);
                ModalRingBuchungFilmlaufBearbeitenService.editBuchung({"fBID":fBID,"refreshView" : true});
               


            };

/*
            // Service Buchungsrenderer
            //noch nötig?
            var buchungsRenderer = function (params) {
                return RenderProgrammTableServices.buchungsRenderer(params, zeigeWunschFilme);
            };

            var cellClassRenderer = function (params) {
                // workaround - schneide index aus
                // index aus
                //gehört in tablerenderer
                return "bc-50";
                /!*
                 var idx = params.colDef.headerName.substr(4);
                 // col existiert
                 if (typeof params.data["col" + idx] != 'undefined') {
                 return params.data["col" + idx].bc;
                 } else {
                 return "";
                 }
                 *!/

            };

            */

            // wenn bereits einmal initialisiert
            // setze neue Headers
            if ($rootScope.status.aggrid) {
                console.log("$rootScope.status.aggrid = " + $rootScope.status.aggrid);
                setTabellenIndexAufDatum

                $rootScope.gridOptions.rowData = $rootScope.filmlauf;
                setTabellenIndexAufDatum();



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