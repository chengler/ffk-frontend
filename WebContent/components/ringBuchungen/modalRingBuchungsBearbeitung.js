angular.module('modalRingBuchungsBearbeitung', ['ui.bootstrap' ]).constant('MODULE_VERSION', '0.0.1')
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

    .service(
        'ModalRingBuchungsBearbeitungService',
        function ($uibModal, $log, $rootScope) {
            this.editBuchung = function ( input) {
                var modalInstance = $uibModal.open({
                    templateUrl: './components/ringBuchungen/modalRingBuchungsBearbeitung.html?' + Math.random(),
                    controller: 'ModalRingBuchungsBearbeitungInstanceCtrl',
                    size: "lg",
                    resolve: {
                        input: function () {
                            return input;
                        }
                    }
                });
                // ModalRingBuchungsBearbeitungService wird auf input gestartet
                $log.info("ModalRingBuchungsBearbeitungService input: "
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
                    var fBID = "fBID"+ inhalt.fBID;


                    switch (aufgabe) {

                        case "speichern" :
                            //gehe      durch      jeden    geänderten    Wert

                          Object.keys(inhalt).forEach(function (key) {

                            // Besuchereintritt
                            // lösche [null] Werte, 0 ist OK, 0 Besucher 500cen, bzw 4 Besucher 0 cent
                            var berecheWochenergebnissNeu = false;
                            if (key == "besucher") {
                                var arrayLength = inhalt.besucher.length;
                                //console.log("arrayLength :" + arrayLength + " besucher" + JSON.stringify(inhalt.besucher));
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
                            }

                            // TODO REST
                            // TODO VERleihbuchung
                            // TODO Filmlauf
                              // füge änderungen zur Ringbuchung
                              //object.create
                              console.log("Änderung " + key + " :" + inhalt[key]);
                            //  $rootScope.ringBuchungen[fBID][key] = inhalt[key];

                    });
                        // angular.copy

/// try and catch !!!!!!

                            $rootScope.ringBuchungen[fBID] = inhalt;
                            break;

                    }




                        //progCtrScope.gridOptions.api.setRowData($rootScope.filmlauf);
                       // tabelle.api.refreshView();
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
// bezieht sich auf eine Ringbuchung
angular.module('modalRingBuchungsBearbeitung').controller(
    'ModalRingBuchungsBearbeitungInstanceCtrl',
    function ($scope,$rootScope,  $log, $uibModalInstance, input) {
        console.log("ModalRingBuchungsBearbeitungInstanceCtrl mit input " + JSON.stringify(input)  );

        // schalter für ng-if ladet templates usw
        $scope.schalter = {};
        var fBID = false;
        // input =[ 'fBID' , fBID ]
        // aufruf vom dashboard
        if (input[0] == 'fBID'){
            fBID = input[1];
            $scope.schalter['delete'] = false;
            $scope.schalter['besucher'] = true;

        }


         // aufruf über tabelle wäre fbid anderweitig zu klären

        //fBID geklärt, setze Variablen
        // getätigte Änderungen werden hier gespeichert um nach dem Speichern bearbeitet zu werden
        // 1x lokal und 1x RESTfull
      $scope.myRingB = angular.copy($rootScope.ringBuchungen[fBID]);
//        $scope.myRingB = Object.create($rootScope.ringBuchungen[fBID]);

        $scope.myRingB["fBID"] = $rootScope.ringBuchungen[fBID].fBID; // zur späteren identifizierung

        $scope.myVerleihB = $rootScope.verleihBuchungen[$scope.myRingB.vBID];
     /*   console.log('myRingB '+JSON.stringify($scope.myRingB));
        console.log('myVerleihB '+JSON.stringify($scope.myVerleihB));*/

        $scope.datum = moment($scope.myRingB.datum).hour(12).format('DD.MM.YYYY');

// Besucherzahlen
        // Besucherzahlen, setze Variablen
        // dürfen nicht undefiniert sein
        // null ist wichtig, da es gelöscht wird wenn es nicht geändet wird!
        // dh. null ist keine änderung 0 schon;
        if ($scope.myRingB.gesamt == undefined){
            $scope.myRingB.gesamt = [null,0];
        }
        if ( $scope.myRingB.besucher == undefined){
            $scope.myRingB.besucher = [[null,0]  ];
        }
        // füge immer noch mindestens  eine leere ZEile an
             $scope.myRingB.besucher.push([null,0], [null,0] );

        //  Änderungen, wird aus der html Seite aufgerufen
        // änderungen vom typ Besucher [0] oder Eintritt typ[1] (array)
        $scope.changeEintritt = function () {
            // wieviele Besucher nun
            // [ Besucher , Eintritt in cen ]
            $scope.myRingB.gesamt[0] = 0;
            $scope.myRingB.gesamt[1] = 0;
            for (i=0; i < $scope.myRingB.besucher.length ;i++){
             //   console.log(" Eintritt, aktuelle Änderungen "+JSON.stringify($scope.myRingB.besucher)+" i " + i);
                if ($scope.myRingB.besucher[i] != undefined ) { // besucherzahlen für dieses Array exisiteren
                    $scope.myRingB.gesamt[0] += $scope.myRingB.besucher[i][0];
                    $scope.myRingB.gesamt[1] += $scope.myRingB.besucher[i][0] * $scope.myRingB.besucher[i][1];
                }
            }
            $scope.myRingB.gesamt = [ $scope.myRingB.gesamt[0] , $scope.myRingB.gesamt[1] ];
            //console.log(" Eintritt, gesamte Änderungen "+JSON.stringify($scope.myRingB));
        };

// End Besucherzahlen





        // nach schließen des Modalfensters ergeben sich drei Möglichkeiten
        //1. speicher Datensatz
        $scope.ok = function ( aufgabe ) { //"speichern"
            $scope.myRingB['aufgabe'] = aufgabe;

            console.log( "OK " + aufgabe + " inhalt: " +  JSON.stringify($scope.myRingB));
            // übergebe  an modalInstance.result.then(function (buchungsChanges) {
            $uibModalInstance.close( $scope.myRingB);
        };
        //2. lösche Datensatz
        // TODO wenn aus der Tabelle aufgerufen
/*        $scope.delete = function () {
            $scope.buchungsChanges.msg =  'delete';
            $uibModalInstance.close($scope.buchungsChanges);
        };
        */

        //3. einfach nur abbrechen
        $scope.cancel = function () {
            $scope.besucher=null;
            console.log("canceling ...");
            $uibModalInstance.dismiss();
        };
    });
