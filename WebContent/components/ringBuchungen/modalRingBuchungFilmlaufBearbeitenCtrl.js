angular.module('modalRingBuchung').controller(
    'ModalRingBuchungFilmlaufBearbeitenServiceInstanceCtrl',
    function ($scope, $rootScope, $log, $uibModalInstance, input, FfkUtils) {
        console.log("ModalRingBuchungFilmlaufBearbeitenServiceInstanceCtrl mit input " + JSON.stringify(input)  );



        // schalter für ng-if ladet templates usw
        var rBID = input.rBID;
        var myRingB = $rootScope.ringBuchungen[rBID];
        var myVerleihB = $rootScope.verleihBuchungen[myRingB.vBID];
        var datum = myRingB.datum; // isodate 20160112
        $scope.buchungsChanges = Object.create(myRingB);

        $scope.schalter = {};
        $scope.schalter = {};
        $scope.schalter['delete'] = true;
        $scope.schalter['besucher'] = false;
        $scope.schalter['filmlauf'] = true;

        $scope.spielort = FfkUtils.getNamezurId( $rootScope.spielorteSortiert, myRingB.sid );
        $scope.filmtitel = myVerleihB.titel;
        $scope.datum = moment(datum).format('DD.MM.YYYY'); // datum
        $scope.bcolor = myVerleihB.bc;
        $scope.myVersion =  $rootScope.version;
        //console.log("datum "+ datum);


        // getätigte Änderungen werden hier gespeichert um nach dem Speichern bearbeitet zu werden
        // 1x lokal und 1x RESTfull


        $scope.medium = myRingB.medium;
        console.log("aktuelles medium " + JSON.stringify(myRingB.medium, 0, 0));
        // fülle Medien {BD: anzahl, dvd:anzahl..}
        $scope.medien = [];
        //console.log(datum);
        //console.log(verleihBuchung.medien);
        $scope.medien.push(""); // nix für abwahl
        Object.keys(myVerleihB.medien).forEach(function (medium) {
            // Medium steht zur verfügung
            console.log(" Medium steht zur verfügung " + myVerleihB.medien[medium] +" <= " + datum);
            if (myVerleihB.medien[medium] <= datum) {
                $scope.medien.push(medium);
                //  console.log(JSON.stringify($scope.medien));
            }
        });

        console.log(" medien " + JSON.stringify($scope.medien, 0, 0));
        if (myRingB.medienID != false){
            $scope.medienID = myRingB.medienID;
        } else {
            $scope.medienID = "";
        }

        // hole möglich IDs, wenn medium geändert
        $scope.medienIDs = null;
        // erzeuge mögliche #1, #2 ...
        $scope.getMedienIDs = function () {
            console.log("getMedienIDs");
            $scope.medienIDs = [""];    // nix für abwahl

            console.log( "verleihBuchung.menge " + JSON.stringify(myVerleihB.menge));
            console.log( "$scope.buchungsChanges.medium " + JSON.stringify($scope.buchungsChanges.medium));
            var menge = parseInt(myVerleihB.menge[$scope.buchungsChanges.medium]);
            if (menge > 0) {
                for (var i = 1; i <= menge; i++) {
                    var id = "#" + i;
                    $scope.medienIDs.push(id);

                }
            }
            console.log(" medienIDs für " + myRingB.medium + " = "
                + JSON.stringify($scope.medienIDs, 0, 0));
        };
        $scope.getMedienIDs();

        // falls medium geändert wird
        $scope.getNeueMedienIDs = function () {
            console.log("getNeueMedienIDs");
            console.log( "verleihBuchung.menge " + JSON.stringify(myVerleihB.menge));
            console.log( "$scope.buchungsChanges.medium " + JSON.stringify($scope.buchungsChanges.medium));
            $scope.medienIDs = [];
            var menge = parseInt(myVerleihB.menge[$scope.buchungsChanges.medium]);
            console.log("menge "+menge);
            if (menge > 0) {
                for (var i = 1; i <= menge; i++) {
                    var id = "#" + i;
                    $scope.medienIDs.push(id);
                }
            }
            $scope.medienID=""; // neues Medium, leere MedienID
            $scope.buchungsChanges.medienID=false;



            console.log(" medienIDs für " + $scope.buchungsChanges.medium + " = "
                + JSON.stringify($scope.medienIDs, 0, 0));
            $scope.setNeueMedienID();
        };

        // änderung der medienID
        $scope.setNeueMedienID = function(){
            console.log("setNeueMedienID " + JSON.stringify($scope.buchungsChanges.medienID) );
            $scope.vonOrt = ["", ""];
            $scope.nachOrt= ["", ""];
            $scope.buchungsChanges.vonID="";
            $scope.buchungsChanges.nachID="";
            if(!$scope.$$phase) { // update die anzeige
                $scope$apply();
            }
        }


        // von und nach Ort
        $scope.vonOrt = ["", ""];
        $scope.nachOrt = ["", ""];

        //buchung von
        var bv = myRingB.vonID;
        if (bv != false) {
            $scope.vonOrt = [bv, FfkUtils.getRefName($rootScope.spielorteSortiert, bv, 1)];
        }
        //buchung nach
        var bn = myRingB.nachID;
        if (bn != false) {
            $scope.nachOrt = [bn, FfkUtils.getRefName($rootScope.spielorteSortiert, bn, 1)];
        }


        $scope.changeVonOrt = function () {
            console.log('changeVonOrt '+ JSON.stringify($scope.vonOrt[0]));
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
