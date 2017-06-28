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
                    console.log("ModalReturn: " + JSON.stringify(res, 1, 4));
                    var myBuchung;

                    var laufzeitAlt = false;

                    if (art == 1 ){
                        myBuchung = $rootScope.verleihBuchungen[vBID];
                        if(res.laufzeit){ // Laufzeitänderung?
                            // betrachte nur verlängerungen
                            var fw = myBuchung.laufzeit +1;
                            console.log('fw '+fw+' res.laufzeit '+res.laufzeit);
                            for ( fw ; fw <= res.laufzeit; fw ++ ){
                                //"fw2":[0,0]
                                myBuchung['fw'+fw] = [0,0];
                            }
                        }
                      //  laufzeitAlt = JSON.parse(JSON.stringify($rootScope.verleihBuchungen[vBID].laufzeit));
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
                    // TODO REST Verleihbuchung

                // lösche Ringbuchungen die nicht mehr im Zeitraum sind
                // überprüfe immer alle, nicht zeitrelevant aber einfacher
                if ($rootScope.verleihBuchungen[vBID] != undefined )
                    {
                        var start = $rootScope.verleihBuchungen[vBID].start;
                        var ende = moment(start).add($rootScope.verleihBuchungen[vBID].laufzeit * 7 - 1, 'days').format('YYYYMMDD');
                        var buchTag;
                        for (var rbid in $rootScope.ringBuchungen) {
                            buchTag = $rootScope.ringBuchungen[rbid].datum;
                            console.log("start " + start + " buchTag " + buchTag + " ende " + ende);
                            if (buchTag < start | buchTag > ende) {
                                console.log("Ringbuchung nicht mehr im Buchbaren Bereich. Lösche " + rbid);
                                $rootScope.ringBuchungen[rbid] = null;
                                delete $rootScope.ringBuchungen[rbid];
                                //TODO REst
                            }


                        }
                    } else {
                        console.log("Verleihbuchung nicht existent; vermutlich wurde sie eben gelöscht");
                    }
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

