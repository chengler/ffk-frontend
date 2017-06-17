// sollte in modalringbuchung integriert werden
// buchungschanges schöne lösung!

//angular.module('modalBuchungsBearbeitung', ['ui.bootstrap', 'ffkUtils']).constant('MODULE_VERSION', '0.0.1')
    //
    // SERVICES
    //
    // modal
    // http://angular-ui.github.io/bootstrap/#/modal
angular.module('modalRingBuchung').service(
    //.service(
        'ModalRingBuchungFilmlaufBearbeitenService',
        function ($uibModal, $log, FfkUtils, $rootScope) {
            this.editBuchung = function (rowIdx, colIdx, filmNr, tabelle) {
                var modalInstance = $uibModal.open({
                    templateUrl: './components/ringBuchungen/modalRingBuchungBearbeiten.html?' + $rootScope.version,
                    controller: 'ModalRingBuchungFilmlaufBearbeitenServiceInstanceCtrl',
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
                console.log("version " +$rootScope.version);
                // ModalFilmlRowInstanceCtrl wird auf rowIdx des Filmlaufs
                // gestartet
                $log.info("modalBuchungsBearbeitung: ModalRingBuchungFilmlaufBearbeitenService rowIdx: " + rowIdx + " colIdx:"
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
angular.module('modalRingBuchung').controller(
    'ModalRingBuchungFilmlaufBearbeitenServiceInstanceCtrl',
    function ($rootScope, $scope, $log, $uibModalInstance, rowIdx, colIdx, filmNr, FfkUtils) {
        console.log("ModalRingBuchungFilmlaufBearbeitenServiceInstanceCtrl mit rowIdx "
            + rowIdx + " colIdx " + colIdx + " filmNr " + filmNr);
        $scope.schalter = {};
        $scope.schalter['delete'] = true;
        $scope.schalter['besucher'] = false;
        $scope.schalter['filmlauf'] = true;
/*

       // var fBID = input[1];
        var fBID = input[1];

        $scope.myRingB = Object.create($rootScope.ringBuchungen[fBID]);
        $scope.spielort = FfkUtils.getNamezurId( $rootScope.spielorteSortiert,$rootScope.ringBuchungen[fBID].sid );
        $scope.myRingB["fBID"] = $rootScope.ringBuchungen[fBID].fBID; // zur späteren identifizierung
        $scope.myVerleihB = $rootScope.verleihBuchungen[$scope.myRingB.vBID];
*/


        var myFilmlauf = $rootScope.filmlauf[rowIdx];
        console.log("myFilmlauf " + JSON.stringify(myFilmlauf));

        // [1] = ["bc-11", [fBID, ..]] , ["bc-22", [fBID] ], get fBID
        $scope.myRingbuchung = $rootScope.ringBuchungen[ myFilmlauf[1][colIdx-1][filmNr] ];
        console.log("myRingbuchung " + JSON.stringify($scope.myRingbuchung));

        $scope.myVerleihbuchung = $rootScope.verleihBuchungen [ $scope.myRingbuchung.vBID  ];
        console.log("myVerleihbuchung " + JSON.stringify($scope.myVerleihbuchung));

        var datum = myFilmlauf[0][2]; // isodate 20160112
        $scope.datum = moment(datum).format('DD.MM.YYYY'); // datum
        console.log("datum "+datum);

        // getätigte Änderungen werden hier gespeichert um nach dem Speichern bearbeitet zu werden
        // 1x lokal und 1x RESTfull
        $scope.buchungsChanges = Object.create($scope.myRingbuchung);


         $scope.refOrt = [$scope.myRingbuchung.sid,
         FfkUtils.getRefName($rootScope.spielorteSortiert, $scope.myRingbuchung.sid, 1)];

        $scope.medium = $scope.myRingbuchung.medium;
        console.log("aktuelles medium " + JSON.stringify($scope.myRingbuchung.medium, 0, 0));
        // fülle Medien {BD: anzahl, dvd:anzahl..}
        $scope.medien = [];
        //console.log(datum);
        //console.log(verleihBuchung.medien);
        $scope.medien.push(""); // nix für abwahl
        Object.keys($scope.myVerleihbuchung.medien).forEach(function (medium) {
            // Medium steht zur verfügung
        console.log(" Medium steht zur verfügung " + $scope.myVerleihbuchung.medien[medium] +" <= " + datum);
            if ($scope.myVerleihbuchung.medien[medium] <= datum) {
                $scope.medien.push(medium);
              //  console.log(JSON.stringify($scope.medien));
            }
        });

            console.log(" medien " + JSON.stringify($scope.medien, 0, 0));
        if ($scope.myRingbuchung.medienID != false){
            $scope.medienID = $scope.myRingbuchung.medienID;
        } else {
            $scope.medienID = "";
        }

        // hole möglich IDs, wenn medium geändert
        $scope.medienIDs = null;
        // erzeuge mögliche #1, #2 ...
        $scope.getMedienIDs = function () {
            console.log("getMedienIDs");
            $scope.medienIDs = [""];    // nix für abwahl

            console.log( "verleihBuchung.menge " + JSON.stringify($scope.myVerleihbuchung.menge));
            console.log( "$scope.buchungsChanges.medium " + JSON.stringify($scope.buchungsChanges.medium));
            var menge = parseInt($scope.myVerleihbuchung.menge[$scope.buchungsChanges.medium]);
            if (menge > 0) {
                for (var i = 1; i <= menge; i++) {
                    var id = "#" + i;
                        $scope.medienIDs.push(id);

                }
            }
            console.log(" medienIDs für " + $scope.myRingbuchung.medium + " = "
                + JSON.stringify($scope.medienIDs, 0, 0));
        };
        $scope.getMedienIDs();

        // falls medium geändert wird
        $scope.getNeueMedienIDs = function () {
            console.log("getNeueMedienIDs");
            console.log( "verleihBuchung.menge " + JSON.stringify(verleihBuchung.menge));
            console.log( "$scope.buchungsChanges.medium " + JSON.stringify($scope.buchungsChanges.medium));
            $scope.medienIDs = [];
            var menge = parseInt($scope.myVerleihbuchung.menge[$scope.buchungsChanges.medium]);
            console.log("menge "+menge);
            if (menge > 0) {
                for (var i = 1; i <= menge; i++) {
                    var id = "#" + i;
                        $scope.medienIDs.push(id);
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

        // änderung der medienID
        $scope.setNeueMedienID = function(){
            console.log("setNeueMedienID " + JSON.stringify($scope.buchungsChanges.medienID) );
        }


        // von und nach Ort
        $scope.vonOrt = ["", ""];
        $scope.nachOrt = ["", ""];

        var bv = $scope.myRingbuchung.vonID;
        if (bv != false) {
            $scope.vonOrt = [bv, FfkUtils.getRefName($rootScope.spielorteSortiert, bv, 1)];
                 }
        var bn = $scope.myRingbuchung.nachID;
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
            if ( angular.isString($scope.buchungsChanges.medienID) && $scope.buchungsChanges.medienID != "" ) {
                console.log("buchungsChanges.vonID: " + $scope.buchungsChanges.vonID);
                if ( !( angular.isString($scope.buchungsChanges.vonID))) { // dann muss ortID, oder
                    console.log("confirm box, da medium mit medienID aber keine VON");
                    if (confirm("Es gibt zwar eine medienID, aber kein Ort woher das Medium kommt!\n\n" +
                        "abbrechen => zurück zum Eingabefenster.\n"+
                        "OK => medienID wird gelöscht und es geht weiter\n") == true) {
                        $scope.buchungsChanges.medienID = undefined;
                        $scope.buchungsChanges.vonID=false;
                        $scope.buchungsChanges.nachID=false;
                        console.log("akzeptiert");
                    } else {
                        console.log("abgebrochen");
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
