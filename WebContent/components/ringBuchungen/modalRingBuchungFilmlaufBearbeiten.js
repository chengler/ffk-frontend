// sollte in modalringbuchung integriert werden
// buchungschanges schöne lösung!

//angular.module('modalBuchungsBearbeitung', ['ui.bootstrap', 'ffkUtils']).constant('MODULE_VERSION', '0.0.1')
    //
    // SERVICES
    //
    // modal
    // http://angular-ui.github.io/bootstrap/#/modal
// input {fBID: fBID, refreshView: true]
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
                $log.info("modalBuchungsBearbeitung: ModalRingBuchungFilmlaufBearbeitenService mit input "
                    + JSON.stringify(input) );

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
                  // lösche [null] Werte, 0 ist OK, 0 Besucher 500cent, bzw 4 Besucher 0 cent
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
                            // speicher in RingBuchung und RESt

                        }
                        $log.debug("nach folgenden Änderungen: "
                            + JSON.stringify(buchungsChanges, 2, 4));
                        $log.debug("ist nun am Ende von ModalReturn: "
                            + JSON.stringify($rootScope.filmlauf[rowIdx]['col' + colIdx]['f' + filmNr], 2, 4));
                        // ändere ein fBID via REST
                        // TODO REST VIA utils
                        $log.debug('RESTfull Set(„fBID'+fBID+'“ : '     + JSON.stringify(buchungsChanges, 0, 0));
                        FfkUtils.changeRingBuchung(fBID, buchungsChanges);
                   //     console.log('RESTfull Set(„fBID'+fBID+'“ : ' + buchungsChanges + ' )');




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
