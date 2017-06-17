//
// CONTROLLER
//
// ModalFilmlWochenInstanceCtrl REIHE
// bezieht sich auf die FilmverleihBuchungen in einer Woche (mit Datum)
angular.module('modalFilmWoche').controller('ModalFilmlWochenInstanceCtrl',
    function ($rootScope, $scope, $log, $uibModalInstance, rowIdx, FfkUtils, colIdx) {
        console.log("    ModalFilmlWochenInstanceCtrl rowIdx: " + rowIdx +" colIdx: " + colIdx);

/*

        var myRingB = $rootScope.ringBuchungen[fBID];
        var myVerleihB = $rootScope.verleihBuchungen[myRingB.vBID];
        var datum = myRingB.datum; // isodate 20160112
        $scope.mybuchungsChanges = Object.create(myRingB);
*/
        var idxVerleihangelegenheiten; // index der KW wochung Verleihbuchungen
        var verleihAngelegenheiten; // das FilmlaufArray mit den Verleihinfos - KW ZEile
        var filmlaufTag = $rootScope.filmlauf[rowIdx];
        console.log("    Array filmlauf " + JSON.stringify(filmlaufTag));
        $scope.myVerleiBuchungen = []; //
        $scope.myVerleiWunsche = [];   //


        $scope.filmObject = []; // Film der Woche aus Filmlauf
        $scope.wochenWunschFilme = {}; // Wünsche der Woche
        $scope.medienLeihbar = []; // medien für ausgewählten Film
        $scope.fID = false; //die ausgewählte fID
        $scope.wfID = false; // wunschfilmID für verleihBuchungen

        $scope.sid = false;
        if ($rootScope.logedInUser.sid){
            $scope.sid = $rootScope.logedInUser.sid // spielort aktuell
        }
        console.log("    falls gebucht würde, für sid: "+$scope.sid);

        $scope.bisherigerVerleih = false;
        $scope.filmChanges = {};

        // Object.create($rootScope.film(fBID
        // Alle Filme dieses Tages

        var datum; //des index der Tabelle von wo aufgerufen wurde
        var startDatum; //ab wann würde der Film starten



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

        //idx 0 =   [ [ "bc-g0", false,  "2016-W49",  1          ]
        if (filmlaufTag[0][1] == false) { // wenn Verleihbuchung, else ringbuchung
            console.log("    kein Datum, sondern Kalenderwoche: "+filmlaufTag[0][2]);
            idxVerleihangelegenheiten = rowIdx;
            datum = moment(filmlaufTag[0][2]).isoWeekday(4).hour(12); // nehme Donnerstag, start filmwocdhe
            $scope.datum = "KinoWoche " + moment(datum).format('w');
            $scope.modus.row = 'kw';
            startDatum = datum;
        } else {
            // 0 = [ [ "bc-g2", 1-7,
            idxVerleihangelegenheiten = rowIdx - filmlaufTag[0][1];
            console.log("    mit Datum, keine Kalenderwoche: "+filmlaufTag[0][2]);
            datum = moment(datum).hour(12);
            $scope.datum = moment(datum).format('dd. DD.MM.YYYY');
            $scope.modus.row = 'tag';
            // donnerstag startet ein mögliche neue Buchung
            startDatum = moment($rootScope.filmlauf[ idxVerleihangelegenheiten+1][0][2]).hour(12);
        }
        startDatum = moment(startDatum).format('YYYYMMDD');
        verleihAngelegenheiten = $rootScope.filmlauf[idxVerleihangelegenheiten];
        console.log("    Array verleihAngelegenheiten " + JSON.stringify(verleihAngelegenheiten));
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

    //    console.log("    $scope.myVerleiBuchungen vBID: " + JSON.stringify($scope.myVerleiBuchungen));
            // lade die VerleihWünsche der Woche in myVerleih ...
            for (i=0; i < verleihAngelegenheiten[2].length; i++ ){
            $scope.myVerleiWunsche.push($rootScope.verleihWunsch[verleihAngelegenheiten[2][i][1]]);
        }
    //    console.log("    $scope.myVerleiWunsche vBID: " + JSON.stringify($scope.myVerleiWunsche));
        };
        machMenus();


        $scope.getMedienVorOrt = function (sid) {
            if( sid ) { // false wenn kein Spielort gewählt
            // medien vor Ort abspielbar
            $scope.sid = sid;
            FfkUtils.ladeSpielort(sid);
            $scope.modus.abspielmoeglichkeiten = $rootScope.spielorte[$scope.sid].medien;
            $scope.modus.spielOrtInfo = "In " + $rootScope.spielorte[$scope.sid].ort + " abspielbare Medien:";
            console.log("    Abspielmöglichkeiten für " + $scope.sid + ": "+$scope.modus.abspielmoeglichkeiten);
            // aktualisere filminfos medienmenge
            if ($scope.modus.status == 'buchbar') {
                $scope.loadBuchbar($scope.modus.col);
            } else if ($scope.modus.status == 'gewunschen') {
                $scope.loadGewunschen($scope.mybuchung);
            }
        }else{
                $scope.modus.spielOrtInfo = "noch kein Spielort gewählt";
                $scope.modus.abspielmoeglichkeiten = "";
                console.log("    kein Spielort gewählt, suche daher auch keine Abspielmöglichkeiten des Spielortes");
            }
        };
        $scope.getMedienVorOrt($scope.sid);


        // wunschfilm anlegen
        $scope.neuerWunsch = function () {
            $scope.modus['text'] = "Neuen Wunschfilm anlegen";
            $scope.modus.hinweis = "";
            $scope.modus.status = "neuerWunsch";
            $scope.filmChanges = {};
            console.log("    sammel WunschFilm Infos");
        };

        // buchbarer film angecklickt
        $scope.loadBuchbar = function (vBID) {
            console.log("    loadBuchbar("+vBID+")");
            if ($scope.modus.row == 'tag') {
                $scope.medienLeihbar = FfkUtils.getLeihbar(datum, $rootScope.verleihBuchungen[vBID].medien);
                $scope.modus.buchbar = true;
                console.log("    Verfügbare Medien: "+ $scope.medienLeihbar);
            }
            var fID =  $rootScope.verleihBuchungen[vBID].fID;
            FfkUtils.ladeFilm(fID);
            $scope.fID = fID;
            //versuche Film zu laden falls noch nicht vorhanden
            $scope.modus.text = "Infos zum Film";
            $scope.modus.status = "buchbar";
        };

        if (colIdx != false){ // aufruf mit row und colIdx, zeige nicht alle filme, sondern gleich den der col
            console.log("gehe direkt zum film, da col "+ colIdx + "im Aufruf mitgegeben wurde");
            $scope.loadBuchbar($scope.myVerleiBuchungen[colIdx-1].vBID);
        }


        // lade daten zum ausgewählten Filmwunsch
        $scope.loadGewunschen = function (wunsch) {
            machMenus();
            console.log("loadGewunschen: " + JSON.stringify(wunsch, 0, 0));
            FfkUtils.ladeFilm(wunsch.fID);
            $scope.kwinfos = wunsch.titel;
            $scope.mybuchung = wunsch;
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
            console.log("$scope.mybuchung.vid" + $scope.mybuchung.vid);
            $scope.bisherigerVerleih = [$scope.mybuchung.vid, FfkUtils.getRefName($rootScope.verleiherSortiert, $scope.mybuchung.vid, 1)];
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
            console.log("    speicherWunsch(): " + JSON.stringify($scope.filmChanges));
            $scope.modus.status = "unbekannt";
            FfkUtils.setVerleihBuchungsWunsch($scope.filmChanges, startDatum);
           // FfkUtils.setWunsch($scope.filmChanges);

//                machMenus();
            $scope.modus.hinweis = "Wunschfilm angelegt."
        };


        // $uibModalInstance.close Varianten
        //
        $scope.machBuchbar = function () {

            var col = $scope.mybuchung.col;
            var result = {
                "typ": "machBuchbar",
                "kwRow": wochenBuchungenIDX,
                "col": col,
                "wfID": $scope.mybuchung.wfID,
                'fID': $scope.mybuchung.fID
            };

            var newVal = [];
            result["val"] = newVal;
            $uibModalInstance.close(result);
        };


        $scope.garantieUebernehmen = function () {
            FfkUtils.mitspielen($scope.mybuchung.col, $scope.sid, rowIdx, true);
            $scope.machBuchbar();

        };

        // Mitspielinteresse bekunden
        $scope.mitspielen = function (medium) {
            console.log("FfkUtils.mitspielen("+$scope.mybuchung.col +", "+ $scope.sid +", " +rowIdx+")");
            console.log( $scope.mybuchung.wfID);
            FfkUtils.mitspielen($scope.mybuchung.col, $scope.sid, rowIdx);// setze in Tabelle
            // setze in Ringbuchung loste REST aus TODO REst
            FfkUtils.setRingWunsch({"vBID": $scope.mybuchung.wfID  , "sid": $scope.sid, "datum": $scope.filmlauf[rowIdx].datum});
            $uibModalInstance.close({'msg': 'Mitspielwunsch abgegeben'});
        };

        // Film buchen
        $scope.buchen = function (medium) {
            console.log("buchen "+ medium);
            if ($scope.sid != false) { // nur wenn Spieort angegeben
                FfkUtils.setBuchung(rowIdx, $scope.mybuchung.col, $scope.sid, medium);
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