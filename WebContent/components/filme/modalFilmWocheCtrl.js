//
// CONTROLLER
//
// ModalFilmlWochenInstanceCtrl REIHE
// bezieht sich auf die FilmverleihBuchungen in einer Woche (mit Datum)
angular.module('modalFilmWoche').controller('ModalFilmlWochenInstanceCtrl',
    function ($rootScope, $scope, $log, $uibModalInstance, rowIdx, FfkUtils, programmCtrlScope, colIdx) {
        console.log("ModalFilmlWochenInstanceCtrl für rowIdx " + rowIdx +" und colIdx " + colIdx);

        $scope.filmObject = []; // Film der Woche aus Filmlauf
        $scope.wochenWunschFilme = {}; // Wünsche der Woche
        $scope.medienLeihbar = []; // medien für ausgewählten Film
        $scope.fID = false; //die ausgewählte fID
        $scope.wfID = false; // wunschfilmID für verleihBuchungen

        $scope.sid = 'false';
        if ($rootScope.logedInUser.sid){
            $scope.sid = $rootScope.logedInUser.sid // spielort aktuell
        }
        console.log("die sid ist"+$scope.sid);

        $scope.bisherigerVerleih = false;
        $scope.filmChanges = {};

        // Object.create($rootScope.film(fBID
        // Alle Filme dieses Tages

        var filmlaufTag = $rootScope.filmlauf[rowIdx];
        console.log("filmlaufTag " + JSON.stringify(filmlaufTag));


        var datum;
        $scope.verleihAngelegenheiten;
        $scope.myVerleiBuchungen = [];
        $scope.myVerleiWunsche = [];

        var idxVerleihangelegenheiten; // indegs der KW wochung Verleihbuchungen
        var verleihAngelegenheiten;

        // steurinfos für die html anzeige
        $scope.modus = {};
        $scope.modus.abspielmoeglichkeiten = ""; // am Spielort
        $scope.modus['hinweis'] = "← Bitte wählen Sie einen Film.";
        $scope.modus["filmInfos"] = false;
        $scope.modus['text'] = "Infos zum Film";
        $scope.modus['status'] = "unbekannt" // Wunschfilm
        $scope.modus['col']; // welche Spalte

        $scope.datum;
        $scope.modus['row'];
        // KW Zeile oder Tageszeile =>
        // $scope.wahl.row = 'kw' || 'tag'
        // $scope.datum = KW || datum
        //idx 0 =   [ [ "bc-g0", false,  "2016-W49",  1          ]
        if (filmlaufTag[0][1] == false) { // wenn Verleihbuchung, else ringbuchung
            $log.debug("Kalenderwochenübersicht gewählt");
            idxVerleihangelegenheiten = rowIdx;
            datum = moment(filmlaufTag[0][1]).isoWeekday(4).hour(12);; // nehme Donnerstag, start filmwocdhe
            $scope.datum = "KinoWoche " + moment(datum).format('w');
            $scope.modus.row = 'kw';
            rowIdx = rowIdx + 1; //zum Filme einlesen  //unklar!
        } else {
            // 0 = [ [ "bc-g2", 1-7,
            idxVerleihangelegenheiten = rowIdx - filmlaufTag[0][1];
            $log.debug("Tagesübersicht gewählt");
            datum = moment(datum).hour(12);
            $scope.datum = moment(datum).format('dd. DD.MM.YYYY');
            $scope.modus.row = 'tag';
        }
        var verleihAngelegenheiten = $rootScope.filmlauf[idxVerleihangelegenheiten]

        console.log("verleihAngelegenheiten " + JSON.stringify(verleihAngelegenheiten));




        if ($scope.modus.row == 'kw') {
            $scope.header = "Filme dieser Woche";
        } else {
            $scope.header = "Film auswählen für ";
        }

        var machMenus = function () {
        // lade die Verleihbuchungen der Woche in myVerleih ...
        // 1 | 2 =  [ ["bc-10", "vp2", 1], ["bc-20"..        ]
        for (i=0; i < verleihAngelegenheiten[1].length; i++ ){
            $scope.myVerleiBuchungen.push($rootScope.verleihBuchungen[verleihAngelegenheiten[1][i][1]]);
        }
        console.log("$scope.myVerleiBuchungen " + JSON.stringify($scope.myVerleiBuchungen));
            // lade die VerleihWünsche der Woche in myVerleih ...
            for (i=0; i < verleihAngelegenheiten[2].length; i++ ){
            $scope.myVerleiWunsche.push($rootScope.verleihWunsch[verleihAngelegenheiten[2][i][1]]);
        }
        console.log("$scope.myVerleiWunsche " + JSON.stringify($scope.myVerleiWunsche));
        };
        machMenus();


        ///////////// hier gehts weiter



        $scope.getMedienVorOrt = function (sid) {
            $scope.sid = sid;
            console.log(" zeige Abspielmöglichkeiten für " + $scope.sid);
            // medien vor Ort abspielbar
            if ($scope.sid == 'false') {
                console.log("$scope.sid == false -> " + $scope.sid);
                $scope.modus.spielOrtInfo = "noch kein Spielort gewählt";
                $scope.modus.abspielmoeglichkeiten = "";

            } else {
                console.log("$scope.sid != false -> " + $scope.sid )

                $scope.modus.abspielmoeglichkeiten = $rootScope.spielorte[$scope.sid].medien;
                $scope.modus.spielOrtInfo = "In " + $rootScope.spielorte[$scope.sid].ort + " abspielbare Medien:";
            }

            // aktualisere filminfos medienmenge
            if ($scope.modus.status == 'buchbar') {
                $scope.loadBuchbar($scope.modus.col);
            } else if ($scope.modus.status == 'gewunschen') {
                $scope.loadGewunschen($scope.buchung);
            }
        };
        $scope.getMedienVorOrt($scope.sid);


        // wunschfilm anlegen
        $scope.neuerWunsch = function () {
            $scope.modus['text'] = "Neuen Wunschfilm anlegen";
            $scope.modus.hinweis = "";
            $scope.modus.status = "neuerWunsch";
            $scope.filmChanges = {};
            console.log("sammel WunschFilm Infos");
        };

        // buchbarer film angecklickt
        $scope.loadBuchbar = function (col) {
            console.log("loadBuchbar: " + col);
            $scope.modus.col = col; // infos $scope.buchen
            $scope.kwinfos = wochenBuchungen[col];
            $scope.buchung = $rootScope.verleihBuchungen[$scope.kwinfos["vBID"]];
            if ($scope.modus.row == 'tag') {
                $log.debug("suche Medienverfügbarkeit für 'tag'");
                $scope.medienLeihbar = FfkUtils.getLeihbar(filmlaufTag["datum"], $scope.buchung.medien);
                $scope.modus.buchbar = true;
            }
            $scope.fID = $scope.kwinfos.fID;
            //versuche Film zu laden falls noch nicht vorhanden
            FfkUtils.ladeFilm($scope.fID);
            $scope.modus.text = "Infos zum Film";
            $scope.modus.status = "buchbar";
        };

        if (colIdx != undefined){ // aufruf mit row und colIdx, zeige nicht alle filme, sondern gleich den der col
            console.log("gehe direkt zum film, da col "+ colIdx + "im Aufruf mitgegeben wurde");
            $scope.loadBuchbar("col"+colIdx);
        }


        // lade daten zum ausgewählten Filmwunsch
        $scope.loadGewunschen = function (wunsch) {
            machMenus();
            console.log("loadGewunschen: " + JSON.stringify(wunsch, 0, 0));
            FfkUtils.ladeFilm(wunsch.fID);
            $scope.kwinfos = wunsch.titel;
            $scope.buchung = wunsch;
            $scope.fID = wunsch.fID;
            $scope.wfID = wunsch.wfID;
            $scope.modus.text = "Infos zum Filmvorschlag";
            $scope.modus.status = "gewunschen";
        };

        $scope.bearbeiteFilm = function () {
            $scope.filmChanges = Object.create($rootScope.filme[$scope.fID]);
            if ($scope.modus.status == 'buchbar') {
                $scope.modus.status = "bearbeiteFilm";
            }
            if ($scope.modus.status == 'gewunschen') {
                $scope.modus.status = "bearbeiteWunsch";
            }
            console.log("$scope.buchung.vid" + $scope.buchung.vid);
            $scope.bisherigerVerleih = [$scope.buchung.vid, FfkUtils.getRefName($rootScope.verleiherSortiert, $scope.buchung.vid, 1)];
            console.log("bearbeite " + $scope.fID + " mit Verleih " + $scope.bisherigerVerleih);
        }

        // speicher Änderungen bei bestehenden Filmen
        $scope.speicherFilm = function () {
            if ($scope.modus.status == 'bearbeiteFilm') {
                $rootScope.verleihBuchungen[$scope.kwinfos.vBID].titel = $scope.filmChanges.titel;
                $rootScope.verleihBuchungen[$scope.kwinfos.vBID].vid = $scope.filmChanges.verleih;
                $scope.modus.hinweis = "Film bearbeitet.";
                $scope.modus.status = "buchbar";
            }
            if ($scope.modus.status == 'bearbeiteWunsch') {
                $rootScope.verleihBuchungen.wuensche[$scope.wfID].titel = $scope.filmChanges.titel;
                $rootScope.verleihBuchungen.wuensche[$scope.wfID].vid = $scope.filmChanges.verleih;
                $scope.modus.hinweis = "Wunsch bearbeitet."
                $scope.modus.status = "gewunschen";

            }
            // Verleih wurde eben gesfpeicdhert und gehört nicht in Film
            delete $scope.filmChanges.verleih;
            Object.keys($scope.filmChanges).forEach(function (key) {
                $rootScope.filme[$scope.fID][key] = $scope.filmChanges[key];
                console.log("Änder " + key + " in : " + $rootScope.filme[$scope.fID][key]);
                // wenn der Titel geändert wurde,änder auch Titel in buchung
                if (key == 'titel'){
                    FfkUtils.aenderTitelInBuchung($scope.fID )

                };


            })
            // $scope.modus['status'] = "unbekannt";

            machMenus();
        };

        $scope.verwerfeAenderung = function () {
            $scope.filmChanges = null;
            $scope.modus['status'] = "unbekannt";
        };

        $scope.speicherWunsch = function () {
            console.log("speicherWunsch");

            $scope.modus.status = "unbekannt";
            FfkUtils.setWunsch($scope.filmChanges, programmCtrlScope, wochenBuchungenIDX);
            machMenus();
            $scope.modus.hinweis = "Wunschfilm angelegt."
        };


        // $uibModalInstance.close Varianten
        //
        $scope.machBuchbar = function () {

            var col = $scope.buchung.col;
            var result = {
                "typ": "machBuchbar",
                "kwRow": wochenBuchungenIDX,
                "col": col,
                "wfID": $scope.buchung.wfID,
                'fID': $scope.buchung.fID
            };

            var newVal = [];
            result["val"] = newVal;
            $uibModalInstance.close(result);
        };


        $scope.garantieUebernehmen = function () {
            FfkUtils.mitspielen($scope.buchung.col, $scope.sid, rowIdx, true);
            $scope.machBuchbar();

        };

        // Mitspielinteresse bekunden
        $scope.mitspielen = function (medium) {
            console.log("FfkUtils.mitspielen("+$scope.buchung.col +", "+ $scope.sid +", " +rowIdx+")");
            console.log( $scope.buchung.wfID);
            FfkUtils.mitspielen($scope.buchung.col, $scope.sid, rowIdx);// setze in Tabelle
            // setze in Ringbuchung loste REST aus TODO REst
            FfkUtils.setRingWunsch({"vBID": $scope.buchung.wfID  , "sid": $scope.sid, "datum": $scope.filmlauf[rowIdx].datum});
            $uibModalInstance.close({'msg': 'Mitspielwunsch abgegeben'});
        };

        // Film buchen
        $scope.buchen = function (medium) {
            console.log("buchen "+ medium);
            if ($scope.sid != false) { // nur wenn Spieort angegeben
                FfkUtils.setBuchung(rowIdx, $scope.buchung.col, $scope.sid, medium);
                $uibModalInstance.close({'msg': 'Film gebucht'});
            } else { // Spielort fehlt
                alert("Welcher Spielort soll mitspielen?\nBitte wählen sie einen aus.");

            }
        };

        // $uibModalInstance.dismiss
        $scope.abbrechen = function () {
            $uibModalInstance.dismiss('Filmauswahl geschlossen');
        };
    });