angular.module('modalBuchungsBearbeitung', ['ui.bootstrap', 'ffkUtils']).constant('MODULE_VERSION', '0.0.1')
    //
    // SERVICES
    //
    // modal
    // http://angular-ui.github.io/bootstrap/#/modal
    .service(
        'ModalBuchungsBearbeitungService',
        function ($uibModal, $log, FfkUtils, $rootScope) {
            this.editBuchung = function (rowIdx, colIdx, filmNr, tabelle) {
                var modalInstance = $uibModal.open({
                    templateUrl: './components/filme/modalBuchungsBearbeitung.html?' + Math.random(),
                    controller: 'ModalBuchungsBearbeitungInstanceCtrl',
                    size: "lg",
                    resolve: {
                        rowIdx: function () {
                            return rowIdx;
                        },
                        colIdx: function () {
                            return colIdx;
                        },
                        filmNr: function () {
                            return filmNr;
                        }
                    }
                });
                // ModalFilmlRowInstanceCtrl wird auf rowIdx des Filmlaufs
                // gestartet
                $log.info("modalBuchungsBearbeitung: ModalBuchungsBearbeitungService rowIdx: " + rowIdx + " colIdx:"
                    + colIdx + " filmNr " + filmNr);

                // TODO stack für asyncrone Serverantworten

                // Die Antwort des ModalFilmlRowInstanceCtrl
                modalInstance.result.then(function (buchungsChanges, typ) {
                        $log.debug("modalBuchungsBearbeitung ModalBuchungsBearbeitungService ModalReturn Änderungen: "
                            + JSON.stringify(buchungsChanges, 1, 4));
                        console.log("Änderung auf row/col/film " + rowIdx + "/" + colIdx + "/" + filmNr +" was noch wäre:");
                        console.log($rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr]);
                        var fBID = $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr]["fBID"];

                        //console.log("buchungsChanges.msg: " + buchungsChanges.msg);
                        if (buchungsChanges.msg ==  'delete'){
                            // lösche anweisung msg
                            buchungsChanges.msg = null;
                            delete buchungsChanges.msg;
                            // lösche ein fBID im Filmlauf
                            $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr] = null;
                            delete $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr];
                            //  renumeriere alle filme nach dem gelöschten
                            var i = filmNr;
                            while (true){
                                 // gibt es einen Film mit einer höheren nummer
                                if ( $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + (i+1)] ){
                                    // f2 wird f1 wenn i =1
                                    $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + i] = $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + (i+1)];
                                    // nulle und lösche
                                    $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + (i+1)] = null;
                                    delete $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + (i+1)];
                                } else {
                                    break;
                                }
                                i += 1  ; // gibt es einen weiteren film?
                            }

                            // lösche ein fBID via REST
                            // TODO REST
                            console.log('RESTfull Set(„fBID'+fBID+'“ : false)');
                            // TODO überprüfe maximale Anzahl der Filme (lines) und reduziere wenn nötig
                        }
// ändere einen filmeintrag
                        if (buchungsChanges.msg ==  'save'){
                            // lösche anweisung msg
                            buchungsChanges.msg = null;
                            delete buchungsChanges.msg;
                            Object.keys(buchungsChanges).forEach(function (key) {
                                console.log("Änderung " + key + " :" + buchungsChanges[key]);

            // Besuchereintritt
                  // lösche [null] Werte, 0 ist OK, 0 Besucher 500cen, bzw 4 Besucher 0 cent
                                var berecheWochenergebnissNeu = false;
                                if (key == "besucher"){
                                    var arrayLength = buchungsChanges.besucher.length;
                                    for (var i = 0; i < arrayLength; i++) {
                                        var check = buchungsChanges.besucher[i];
                                        if (check[0] == null || check[1] == null){
                                            buchungsChanges.besucher.splice(i, 1);
                                            // splice verkürzt arry lenghth
                                            arrayLength = arrayLength -1;
                                        }
                                    }
                                } else if (key == "gesamt"){
                                    berecheWochenergebnissNeu = true;
                                }
                                // ändere Filmlauf
                                $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr][key] = buchungsChanges[key];
                  // Ergebnisse erst speichern, da grundlage für berechnung!
                                if (berecheWochenergebnissNeu) {
                                    var kwZeile = FfkUtils.getKinoWochenRowIdx(rowIdx);
                                    var we = FfkUtils.summiereWochenergebniss(kwZeile,colIdx);
                                    console.log("ändere Gesamteinnahmender Woche auf "+we);
                                }



                                // zeige Änderungen
                            });
                        }
                        $log.debug("nach folgenden Änderungen: "
                            + JSON.stringify(buchungsChanges, 2, 4));
                        $log.debug("ist nun am Ende von ModalReturn: "
                            + JSON.stringify($rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr], 2, 4));
                        // ändere ein fBID via REST
                        // TODO REST
                        $log.debug('RESTfull Set(„fBID'+fBID+'“ : '     + JSON.stringify(buchungsChanges, 0, 0));
                   //     console.log('RESTfull Set(„fBID'+fBID+'“ : ' + buchungsChanges + ' )');







                        //progCtrScope.gridOptions.api.setRowData($rootScope.filmlauf);
                        tabelle.api.refreshView();
                    },
                    // Modal wurde abgebrochen
                    function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

            };
        });

//
// CONTROLLER
//
// 
// bezieht sich auf eine einzelbuchung aus dem Filmlauf
// speicher Änderungen in der Variablen buchungsChanges
// bei änderung werden diese dann übertragen, sonst verworfen
angular.module('modalBuchungsBearbeitung').controller(
    'ModalBuchungsBearbeitungInstanceCtrl',
    function ($rootScope, $scope, $log, $uibModalInstance, rowIdx, colIdx, filmNr, FfkUtils) {
        console.log("ModalBuchungsBearbeitungInstanceCtrl mit rowIdx " + rowIdx + " colIdx " + colIdx + " filmNr "
            + filmNr);
        var col = "col" + colIdx; // z.B col1
        var film = 'f' + filmNr; // z.B f1
        var datum = $rootScope.filmlauf[rowIdx].datum; // isodate 20160112
        $scope.datum = moment(datum).format('DD.MM.YYYY'); // datum
        // index der KW zeile
        var kwRowIdx = FfkUtils.getKinoWochenRowIdx(rowIdx, datum);
        // infos zum Film aus KW Zeile
        $scope.kwInfos = $rootScope.filmlauf[kwRowIdx][col];
        console.log(" kwInfos " + JSON.stringify($scope.kwInfos, 0, 0));

        var verleihBuchung = $rootScope.buchungen[$scope.kwInfos.vBID];
        console.log(" verleihBuchung " + JSON.stringify(verleihBuchung, 0, 0));

        // die angeklickte zelle
        var ringBuchung = $rootScope.filmlauf[rowIdx][col][film];

        // getätigte Änderungen werden hier gespeichert um nach dem Speichern bearbeitet zu werden
        // 1x lokal und 1x RESTfull
        $scope.buchungsChanges = Object.create(ringBuchung);




        console.log(" ringBuchung " + JSON.stringify(ringBuchung, 0, 0));

         $scope.refOrt = [ringBuchung.ortID,
         FfkUtils.getRefName($rootScope.spielorteSortiert, ringBuchung.ortID, 1)];

        $scope.medium= ringBuchung.medium;
        console.log(" medium " + JSON.stringify($scope.medium, 0, 0));
        // fülle Medien {BD: anzahl, dvd:anzahl..}
        $scope.medien = [];
        //console.log(datum);
        //console.log(verleihBuchung.medien);
        $scope.medien.push(""); // nix für abwahl
        Object.keys(verleihBuchung.medien).forEach(function (medium) {
            // Medium steht zur verfügung
            if (verleihBuchung.medien[medium] >= datum) {
                $scope.medien.push(medium);
            }
        });

        console.log(" medien " + JSON.stringify($scope.medien, 0, 0));
        $scope.medienID = ringBuchung.medienID;

        // hole möglich IDs, wenn medium geändert
        $scope.medienIDs = [];
        // erzeuge mögliche #1, #2 ...
        $scope.getMedienIDs = function () {
            console.log("getMedienIDs");
            $scope.medienIDs.push(""); // nix für abwahl
            var menge = parseInt(verleihBuchung.menge[ringBuchung.medium]);
            if (menge > 0) {
                for (var i = 1; i <= menge; i++) {
                    var id = "#" + i;
                    // füge nur hinzu, wenn nicht false
                   //if (ringBuchung.medienID != id & id != false) {
                        if (ringBuchung.medienID  != false) {
                            $scope.medienIDs.push(id);
                        }

                }
            }
            console.log(" medienIDs für " + ringBuchung.medium + " = "
                + JSON.stringify($scope.medienIDs, 0, 0));
        };
        $scope.getMedienIDs();

        // falls medium geändert wird
        $scope.getNeueMedienIDs = function () {
            console.log("getNeueMedienIDs");
            $scope.medienIDs = [];
            var menge = parseInt(verleihBuchung.menge[$scope.buchungsChanges.medium]);
            if (menge > 0) {
                for (var i = 1; i <= menge; i++) {
                    var id = "#" + i;
                    // füge nur hinzu, wenn nicht false
                    if (ringBuchung.medienID != false) {
                        $scope.medienIDs.push(id);
                    }
                }
            }
            $scope.medienID=""; // neues Medium, leere MedienID
            $scope.buchungsChanges.medienID=false;
            $scope.vonOrt=false;
            $scope.nachOrt=false;
            $scope.buchungsChanges.vonID=false;
            $scope.buchungsChanges.nachID=false;

            if(!$scope.$$phase) { // update die anzeige
                $scope$apply();
            }
            console.log(" medienIDs für " + $scope.buchungsChanges.medium + " = "
                + JSON.stringify($scope.medienIDs, 0, 0));
        };

        // lese Besucherzahlen in die Variable scope.besucher
        // ist in jedem Fall ein Array
        // null ist wichtig, da es gelöscht wird wenn es nicht geändet wird!
        $scope.besucher=[ [null,0], [null,0] ]; // keine eintragung für Besucher
        $scope.getBesucher = function () {
            if ( "besucher" in ringBuchung ) {
                if ( Array.isArray(ringBuchung.besucher)) {
                    // !! ändere nicht das original!! deep copy
                    $scope.besucher=angular.copy(ringBuchung.besucher);
                    $scope.besucher.push([null,0]);

                }
            }
            console.log("getBesucher: " + $scope.besucher);
        }
        $scope.getBesucher();

        // gesamt Besucherzahlen
        $scope.gesamtEintritt = 0;
        if ( "gesamt" in ringBuchung){
            $scope.gesamtBesucher= ringBuchung.gesamt[0];
            $scope.gesamtEintritt= ringBuchung.gesamt[1];

                    };


        // von und nach Ort
        $scope.vonOrt = ["", ""];
        $scope.nachOrt = ["", ""];

        var bv = ringBuchung.vonID;
        if (bv != false) {
            $scope.vonOrt = [bv, FfkUtils.getRefName($rootScope.spielorteSortiert, bv, 1)];
                 }
        var bn = ringBuchung.nachID;
        if (bn != false) {
            $scope.nachOrt = [bn, FfkUtils.getRefName($rootScope.spielorteSortiert, bn, 1)];
        }


        $scope.changeVonOrt = function () {
            $scope.buchungsChanges.vonID = $scope.vonOrt[0];
        };
        $scope.changeNachOrt = function () {
            $scope.buchungsChanges.nachID = $scope.nachOrt[0];

        };
       // $scope.buchungsChanges = angular.copy(ringBuchung);

        console.log(" buchungsChanges " + JSON.stringify($scope.buchungsChanges, 0, 0));

        // Änderungen, wird aus der html Seite aufgerufen
        // änderungen vom typ Besucher [0] oder Eintritt typ[1] (array)
        $scope.changeEintritt = function ( idx, typ ) {
            $scope.buchungsChanges.besucher = $scope.besucher;
            console.log($scope.buchungsChanges.besucher +" idx " + idx + " typ " +typ)
            // wieviele Besucher nun
            $scope.gesamtBesucher = 0;
            $scope.gesamtEintritt = 0;
            for (i=0; i <= $scope.buchungsChanges.besucher.length ;i++){
                if ($scope.besucher[i] != undefined ) {
                    $scope.gesamtBesucher += $scope.besucher[i][0];
                    $scope.gesamtEintritt += $scope.besucher[i][0] * $scope.besucher[i][1];
                }
            }
            $scope.buchungsChanges["gesamt"] = [$scope.gesamtBesucher,$scope.gesamtEintritt];

        };


        // nach schließen des Modalfensters ergeben sich drei Möglichkeiten
        //speichr Datensatz
        $scope.ok = function (was) {
            console.log( "*** info aus html: " + was );
            console.log("buchungsChanges.medienID: " + $scope.buchungsChanges.medienID);
            // medienID ja?
            if ( angular.isString($scope.buchungsChanges.medienID)) {
                console.log("buchungsChanges.vonID: " + $scope.buchungsChanges.vonID);
                if ( !( angular.isString($scope.buchungsChanges.vonID))) { // dann muss ortID, oder
                    if (consoleconfirm("Es gibt zwar eine medienID, aber kein Ort woher das Medium kommt!\n\n" +
                            "abbrechen => zurück zum Eingabefenster.\n"+
                            "OK => medienID wird gelöscht und es geht weiter\n" ) == true) {
                        $scope.buchungsChanges.medienID = undefined;
                        $scope.buchungsChanges.vonID=false;
                        $scope.buchungsChanges.nachID=false;
                    } else {
                        return;
                        }

                }
             }
             // medienID nein? speicher ganz normal
                        //console.log("Besucherzahlen: "+$scope.besucher);
            $scope.buchungsChanges.msg = 'save';
            // übergebe $scope.buchungsChanges an modalInstance.result.then(function (buchungsChanges) {
            $uibModalInstance.close($scope.buchungsChanges);
        };
        //lösche Datensatz
        $scope.delete = function () {
           // $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr] = null;
           // delete $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr];
            $scope.buchungsChanges.msg =  'delete';
            $uibModalInstance.close($scope.buchungsChanges);
        };
        //einfach nur abbrechen
        $scope.cancel = function () {
            $scope.besucher=null;
             console.log("canceling ...");
            $uibModalInstance.dismiss();
        };
    });
