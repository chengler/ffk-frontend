angular.module('modalRingBuchung').controller(
    'ModalRingBuchungEintrittBearbeitenInstanceCtrl',
    function ($scope, $rootScope, $log, $uibModalInstance, input, FfkUtils) {
        console.log("ModalRingBuchungEintrittBearbeitenInstanceCtrl mit input " + JSON.stringify(input)  );



        // schalter für ng-if ladet templates usw
        $scope.schalter = {};
        var rBID = input.rBID;
     //   console.log("rBID "+rBID);
        // input =[ 'rBID' , rBID ]
        // aufruf vom dashboard

        // welche html teile werden angezeigt
            $scope.schalter['delete'] = false;
            $scope.schalter['besucher'] = true;
            $scope.schalter['filmlauf'] = false;




        // aufruf über tabelle wäre rBID anderweitig zu klären

        //rBID geklärt, setze Variablen
        // getätigte Änderungen werden hier gespeichert um nach dem Speichern bearbeitet zu werden
        // 1x lokal und 1x RESTfull
//        $scope.myRingB = angular.copy($rootScope.ringBuchungen[rBID]);
        $scope.myRingB = Object.create($rootScope.ringBuchungen[rBID]);
        $scope.spielort = FfkUtils.getNamezurId( $rootScope.spielorteSortiert,$rootScope.ringBuchungen[rBID].sid );
        $scope.myRingB["rBID"] = $rootScope.ringBuchungen[rBID].rBID; // zur späteren identifizierung
        $scope.myVerleihB = $rootScope.verleihBuchungen[$scope.myRingB.vBID];
        /*   console.log('myRingB '+JSON.stringify($scope.myRingB));
         console.log('myVerleihB '+JSON.stringify($scope.myVerleihB));*/

        $scope.datum = moment($scope.myRingB.datum).hour(12).format('DD.MM.YYYY');
        $scope.bcolor = $scope.myVerleihB.bc;

        $scope.filmtitel = $scope.myVerleihB.titel;

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
        $scope.myRingB.besucher.push([null,0],[null,0] );

        //  Änderungen, wird aus der html Seite aufgerufen
        // änderungen vom typ Besucher [0] oder Eintritt typ[1] (array)
        $scope.changeEintritt = function () {
            // wieviele Besucher nun
            // [ Besucher , Eintritt in cen ]
            $scope.myRingB.gesamt[0] = 0;
            $scope.myRingB.gesamt[1] = 0;
            for (i=0; i < $scope.myRingB.besucher.length ;i++){
                //   console.log(" Eintritt, aktuelle Änderungen "+JSON.stringify($scope.myRingB.besucher)+" i " + i);
                if ($scope.myRingB.besucher[i] != undefined | $scope.myRingB.besucher[i] != null ) { // besucherzahlen für dieses Array exisiteren
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
