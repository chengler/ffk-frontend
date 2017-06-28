// sollte in modalringbuchung integriert werden
// buchungschanges schöne lösung!

//angular.module('modalBuchungsBearbeitung', ['ui.bootstrap', 'ffkUtils']).constant('MODULE_VERSION', '0.0.1')
    //
    // SERVICES
    //
    // modal
    // http://angular-ui.github.io/bootstrap/#/modal
// input {rBID: rBID, refreshView: true]
angular.module('modalRingBuchung').service(
    //.service(
        'ModalRingBuchungFilmlaufBearbeitenService',
        function ($uibModal, $log, FfkUtils, $rootScope) {
            this.editBuchung = function (input ) {
                var modalInstance = $uibModal.open({
                    templateUrl: './components/ringBuchungen/modalRingBuchungBearbeiten.html?' + $rootScope.version,
                    controller: 'ModalRingBuchungFilmlaufBearbeitenServiceInstanceCtrl',
                    size: "lg",
                    resolve: {
                        input: function () {
                            return input;
                        }
                    }
                });
                // ModalFilmlRowInstanceCtrl wird auf rowIdx des Filmlaufs
                // gestartet
                console.log("modalBuchungsBearbeitung: ModalRingBuchungFilmlaufBearbeitenService mit input "
                    + JSON.stringify(input) );

                // TODO stack für asyncrone Serverantworten

                // Die Antwort des ModalFilmlRowInstanceCtrl
                modalInstance.result.then(function (buchungsChanges, typ) {
                        $log.debug("modalBuchungsBearbeitung ModalBuchungsBearbeitungService ModalReturn Änderungen: "
                            + JSON.stringify(buchungsChanges, 1, 4));
                        var rBID = input.rBID;

                        //console.log("buchungsChanges.msg: " + buchungsChanges.msg);
                        if (buchungsChanges.msg ==  'delete'){
                            // lösche anweisung msg
                            $rootScope.ringBuchungen[rBID] = null;
                            delete $rootScope.ringBuchungen[rBID];
                            // lösche ein rBID im Filmlauf <= erstelle neu!
                            // lösche ein rBID via REST
                            // TODO REST
                            console.log('RESTfull Set(„rBID'+rBID+'“ : false)');
                            // TODO überprüfe maximale Anzahl der Filme (lines) und reduziere wenn nötig


                            FfkUtils.leereGrundtabelle();
                            $rootScope.status.filmlaufGeladen = false;
                            FfkUtils.erstelleFilmlauf();

                            // zeichne Tabelle neu
                          //  $rootScope.gridOptions.api.setRowData($rootScope.filmlauf);
                        }
// ändere einen filmeintrag
                        if (buchungsChanges.msg ==  'save'){
                            // lösche anweisung msg
                            buchungsChanges.msg = null;
                            delete buchungsChanges.msg;
                            FfkUtils.changeRingBuchung(rBID, buchungsChanges);
                        }

                   //
                   //     console.log('RESTfull Set(„rBID'+rBID+'“ : ' + buchungsChanges + ' )');

                        if (input.refreshView){
                            $rootScope.gridOptions.api.refreshView();
                        }


                    },
                    // Modal wurde abgebrochen
                    function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

            };
        });
