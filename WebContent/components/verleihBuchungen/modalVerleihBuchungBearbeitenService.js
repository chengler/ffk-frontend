/*
 SERVICES // ehemals modalFilmKW

 editBuchung( vBID, art)
 vBID BuchungsID
 1 Buchung
 2 Wunsch
 Bearbeite VerleihBuchung
 */
// http://angular-ui.github.io/bootstrap/#/modal
modul.service('ModalVerleihBuchungsService', function($rootScope, $uibModal, $log, FfkUtils) {
        this.editBuchung = function(vBID, art) {
            var modalInstance = $uibModal.open({
                templateUrl : './components/verleihBuchungen/modalVerleihBuchung.html?' + Math.random(),
                controller : 'ModalVerleihBuchungsInstanceCtrl',
                size : "lg",
                resolve : {
                    vBID : function() {
                        return vBID;
                    },
                    //scope : function() {
                    //	return $scope;
                    //},
                    // 1 Buchung 2 Wunsch wie pos in array!
                    art : function() {
                        if ( art == undefined){
                            art = 1;
                        }
                        return art;
                    }
                }
            });
            console.log("    Modal startet. Pfad: ./components/verleihBuchungen/modalVerleihBuchungBearbeitenCtrl.js");
            // die Rückgabe
            modalInstance.result.then(function(res) {
                console.log("vBID "+vBID);
                    $log.debug("ModalReturn: " + JSON.stringify(res, 1, 4));
                    var myBuchung;
                    if (art == 1 ){
                        myBuchung = $rootScope.verleihBuchungen[vBID];
                    } else {
                        myBuchung = $rootScope.verleihWunsch[vBID];
                    };

                    // wenn medienänderungen leer sind, lösche
                    if (res.medien == {}){
                        res.medien = null;
                        delete res.medien;
                    }
                    if (res.menge == {}){
                        res.menge = null;
                        delete res.menge;
                    }
                    // gehe durch Änderungen
                    for (toDo in res){
                        console.log("todo "+ toDo);

                    if (toDo == "menge" ){
                            for ( var typ in res.menge ){
                                console.log("typ "+typ+" menge "+ res.menge[typ]);
                                myBuchung.menge[typ] = res.menge[typ];
                            }
                        } else if (toDo == "medien" ){
                        for ( var typ in res.medien ){
                            console.log("typ "+typ+" medien "+ res.medien[typ]);
                            myBuchung.medien[typ] = res.medien[typ];
                             }
                        } else {
                        myBuchung[toDo] = res[toDo];
                     }
                    }
                    // TODO REST
                    FfkUtils.leereGrundtabelle();
                    $rootScope.status.filmlaufGeladen = false;
                    FfkUtils.erstelleFilmlauf();

                    // zeichne Tabelle neu
                    $rootScope.gridOptions.api.setRowData($rootScope.filmlauf);






                }, modalInstance.opened.then(function() {
                    console.log('    modalVerleihBuchung geöffnet!');
                }),

                function() {
                    console.log('Modal dismissed at: ' + new Date());
                });



        };
    });

