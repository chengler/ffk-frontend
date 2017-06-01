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
        function ($uibModal, $log) {
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
                modalInstance.result.then(function (was) {
                        $log.debug("modalBuchungsBearbeitung ModalBuchungsBearbeitungService ModalReturn Änderungen: "
                            + JSON.stringify(was, 1, 4));



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




        //fBID geklärt, setze Variablen
        $scope.myRingB = $rootScope.ringBuchungen[fBID];
        $scope.myVerleihB = $rootScope.verleihBuchungen[$scope.myRingB.vBID];
     /*   console.log('myRingB '+JSON.stringify($scope.myRingB));
        console.log('myVerleihB '+JSON.stringify($scope.myVerleihB));*/

     // Besucherzahlen
        // dürfen nicht undefiniert sein
        if ($scope.myRingB.gesamt == undefined){
            $scope.myRingB.gesamt = [0,0];
        }
        if ($scope.myRingB.besucher == undefined){
            $scope.myRingB.besucher = [[0,0] , [0,0] , [0,0] ];
        }

        $scope.datum = moment($scope.myRingB.datum).hour(12).format('DD.MM.YYYY');






        // nach schließen des Modalfensters ergeben sich drei Möglichkeiten
        //1. speicher Datensatz
        $scope.ok = function (was) {
            console.log( "OK " + was );



            // übergebe  an modalInstance.result.then(function (buchungsChanges) {
            $uibModalInstance.close( was);
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
