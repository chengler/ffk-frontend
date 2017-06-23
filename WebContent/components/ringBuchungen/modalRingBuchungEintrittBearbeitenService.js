//
// SERVICES
//
// modal
// http://angular-ui.github.io/bootstrap/#/modal

/*// ModalBuchungsBearbeitungService/!*
$scope.openModalBuchung = function (rowIdx, colIdx, filmNr ) {
    ModalBuchungsBearbeitungService.editBuchung(rowIdx, colIdx, filmNr,*!/ $rootScope.gridOptions);*/

/*$scope.openModalBuchung = function (input ) {
    ModalRingBuchungsBearbeitungService.editBuchung(input);*/

angular.module('modalRingBuchung').service(
    'ModalRingBuchungEintrittBearbeitenService',
    function ($uibModal, $log, $rootScope) {
        this.editBesucher = function ( input) {
            var modalInstance = $uibModal.open({
                templateUrl: './components/ringBuchungen/modalRingBuchungBearbeiten.html?' + $rootScope.version,
                controller: 'ModalRingBuchungEintrittBearbeitenInstanceCtrl',
                size: "lg",
                resolve: {
                    input: function () {
                        return input;
                    }
                }
            });
            // ModalRingBuchungsBearbeitungService wird auf input gestartet
            $log.info("ModalRingBuchungsBearbeitungService editBuchung input: "
                + JSON.stringify(input));

            // TODO stack für asyncrone Serverantworten

            // Die Antwort des ModalFilmlRowInstanceCtrl
            modalInstance.result.then(function (inhalt) {
                    console.log(" modalBuchungsBearbeitung ModalBuchungsBearbeitungService ModalReturn: " +
                        "Aufgabe: " + inhalt.aufgabe);
                    //     $log.debug(" Änderungen: " + JSON.stringify(inhalt, 1, 4));

                    // verschiebe aufgabe aus objekt in die var
                    // da nur ein Object vom Controller übergeben wird (speichern, löschen ,,,)
                    var aufgabe = inhalt.aufgabe;
                    inhalt.aufgabe = null;
                    delete  inhalt.aufgabe;
                    var rBID =  inhalt.rBID;

                    console.log("{rBID: "+ JSON.stringify(inhalt)+"}");
                    switch (aufgabe) {

                        case "speichern" :
                            console.log("speicher");
                            //gehe      durch      jeden    geänderten    Wert

                            Object.keys(inhalt).forEach(function (key) {

                                // Besuchereintritt
                                // lösche [null] Werte, 0 ist OK, 0 Besucher 500cen, bzw 4 Besucher 0 cent
                                var berecheWochenergebnissNeu = false;
                          //      if (key == "besucher") {
                                    var arrayLength = inhalt.besucher.length;
                                    console.log("arrayLength :" + arrayLength + " besucher" + JSON.stringify(inhalt.besucher));
                                    for (var i = 0; i < arrayLength; i++) {
                                        var check = inhalt.besucher[i]; // immer das erste Array
                                        //  console.log( i + " diese Array :" + JSON.stringify(check));
                                        if (check[0] == null || check[0] == 0 || check[1] == null) {
                                            inhalt.besucher.splice(i, 1);
                                            // splice verkürzt arry lenghth
                                            i -= 1;
                                            arrayLength -=1;
                                        }
                                        console.log( i + "komplett nach durchlauf :" + JSON.stringify(inhalt.besucher));
                                    }
                            //    }


                                // TODO REST
                                // TODO VERleihbuchung
                                // TODO Filmlauf
                                // füge änderungen zur Ringbuchung
                                //object.create
                                console.log("Änderung " + key + " :" + inhalt[key]);
                                //  $rootScope.ringBuchungen[rBID][key] = inhalt[key];

                            });
                            // angular.copy

/// try and catch !!!!!!
                            Object.keys(inhalt).forEach(function (key) {
                                $rootScope.ringBuchungen[rBID][key] = inhalt[key];

                            });

                            console.log("{rBID: "+ JSON.stringify(inhalt)+"}");
                            $rootScope.infofenster = "{rBID: "+ JSON.stringify(inhalt)+"}";

                            var myring = $rootScope.ringBuchungen[rBID];

                            $rootScope.infofenster = "{rBID:{ rBID: " + rBID + ", besucher:" + myring.besucher
                                + ", gesamt: " + myring.gesamt + " }";


                            break;

                    }

                    if (input.refreshView){
                        $rootScope.gridOptions.api.refreshView();
                    }


                    //progCtrScope.gridOptions.api.setRowData($rootScope.filmlauf);
                    // tabelle.api.refreshView();
                },
                // Modal wurde abgebrochen
                function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

        };
    }
);