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
                modalInstance.result.then(function (buchungsChanges) {
                        $log.debug("modalBuchungsBearbeitung ModalBuchungsBearbeitungService ModalReturn: "
                            + JSON.stringify(buchungsChanges, 1, 4));

                        if (buchungsChanges.msg != undefined) {
                            console.log("zeige nur noch Meldung: " + buchungsChanges.msg);
                        } else {


                            console.log("Änderung auf r/c/f " + rowIdx + "/" + colIdx + "/" + filmNr);

                            Object.keys(buchungsChanges).forEach(function (key) {
                                console.log("Änderung" + key + " :" + buchungsChanges[key]);
//						buchung[key] = buchungsChanges[key];
                                $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr][key] = buchungsChanges[key];

                            });
                        }
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
        $scope.buchung = $rootScope.filmlauf[rowIdx][col][film];
        console.log(" buchung " + JSON.stringify($scope.buchung, 0, 0));
        $scope.refOrt = [$scope.buchung.ortID,
            FfkUtils.getRefName($rootScope.spielorteSortiert, $scope.buchung.ortID, 1)];
        // die Änderungen
        $scope.buchungsChanges = Object.create($scope.buchung);

        // fülle Medien {BD: anzahl, dvd:anzahl..}
        $scope.medien = [];
        Object.keys(verleihBuchung.medien).forEach(function (medium) {
            // Medium steht zur verfügung
            if (verleihBuchung.medien[medium] <= datum) {
                // füge nur hinzu, wenn nicht default
                if ($scope.buchung.medium != medium) {
                    $scope.medien.push(medium);
                }
            }
        });
        console.log(" medien " + JSON.stringify($scope.medien, 0, 0));

        // hole möglich IDs, wenn medium geändert
        $scope.medienIDs = [];
        // erzeuge mögliche #1, #2 ...
        $scope.getMedienIDs = function () {
            $scope.medienIDs = [];
            var menge = parseInt(verleihBuchung.menge[$scope.buchungsChanges.medium]);
            if (menge > 0) {
                for (var i = 1; i <= menge; i++) {
                    var id = "#" + i;
                    // füge nur hinzu, wenn nicht default
                    if ($scope.buchung.medienID != id & id != false) {
                        $scope.medienIDs.push(id);
                    }
                }
            }
            console.log(" medienIDs für " + $scope.buchungsChanges.medium + " = "
                + JSON.stringify($scope.medienIDs, 0, 0));
        };
        $scope.getMedienIDs();

        // von und nach Ort
        $scope.vonOrt = ["", ""];
        $scope.nachOrt = ["", ""];
        var bv = $scope.buchung.vonID;
        if (bv != false) {
            $scope.vonOrt = [bv, FfkUtils.getRefName($rootScope.spielorteSortiert, bv, 1)];
        }
        var bn = $scope.buchung.nachID;
        if (bn != false) {
            $scope.nachOrt = [bn, FfkUtils.getRefName($rootScope.spielorteSortiert, bn, 1)];
        }
        $scope.changeVonOrt = function () {
            $scope.buchungsChanges.vonID = $scope.vonOrt[0];
        };
        $scope.changeNachOrt = function () {
            $scope.buchungsChanges.nachID = $scope.nachOrt[0];
        };

        $scope.ok = function (was) {
            console.log(was);
            $uibModalInstance.close($scope.buchungsChanges);
        };

        $scope.delete = function () {
            $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr] = null;
            delete $rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr];
            $uibModalInstance.close({'msg': 'deleted'});
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
