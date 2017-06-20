/*
Bezieht sich auf die FilmverleihBuchungen in einer Woche (mit Datum)
zeigt alle Filme und Wünsche der Woche
Filme Infos ansehen, ändern und buchen
Wunschfilme anlegen, buchbar setzen, mindestgarantie übernehmen


 */
angular.module('modalFilmWoche').controller('ModalFilmlWochenInstanceCtrl',
    function ($rootScope, $scope, $log, $uibModalInstance, rowIdx, FfkUtils) {
        console.log("    ModalFilmlWochenInstanceCtrl rowIdx: " + rowIdx);

        // kann colidx weg?
// Variablen
        $scope.vid = false;
        $scope.sid = false;
        $scope.spielortName = ""
        $scope.fid = false;
        $scope.vbid = false;
        //$scope.istBuchung;              // true Buchung; false Wunsch
        var filmlaufRing;                //$rootScope.filmlauf
        var filmlaufVerleih;                   //$rootScope.filmlauf
        $scope.myVerleiBuchungen = []; // vBIDs fürs repeat
        $scope.myVerleiWunsche = [];   // vBIDs fürs repeat
        $scope.filmChanges = {}; // änderungen oder neurungen am film
        $scope.myVersion =  $rootScope.version; // zum nachladen von temlateänderungen
        var verleihIdx;
        $scope.spielOrtAuswahl; // für den admen
        var datumSpieltag;   // der Tag von dem aus aufgerufen wurde
        $scope.medienLeihbar = {};      // zum Datum vorhanden und abspielbar
        var abspielOptionenVorOrt=[];

        // steurinfos für die html anzeige
        $scope.modus = {};
        $scope.modus['info'] = "← Bitte wählen Sie einen Film.";
        $scope.modus['status'] == 'unbekannt'; //buchbar, "gewunschen", neuerWunsch
         // kein buchbarer Film ausgewählt

/*
INIT 1
 */
        $scope.spielOrtAuswahl = JSON.parse(JSON.stringify($rootScope.spielorteSortiert));
        filmlaufTag = $rootScope.filmlauf[rowIdx];
        console.log("    filmlaufTag: " + JSON.stringify(filmlaufTag));
        filmlaufVerleih = $rootScope.filmlauf[rowIdx - filmlaufTag[0][1]];
        console.log("    filmlaufVerleih: " + JSON.stringify(filmlaufVerleih));
        $scope.myVerleiBuchungen = filmlaufVerleih[1];
        console.log("    myVerleiBuchungen: " + JSON.stringify($scope.myVerleiBuchungen));
        $scope.myVerleiWunsche = filmlaufVerleih[2];
        console.log("    myVerleiWunsche: " + JSON.stringify($scope.myVerleiWunsche));
        datumSpieltag = filmlaufTag[0][2];
        console.log("    datumSpieltag: " + JSON.stringify(datumSpieltag));
        verleihIdx = rowIdx - filmlaufTag[0][1];
        console.log("    verleihIdx: " + JSON.stringify(verleihIdx));

        /*
        FUNKTIONEN
         */
        $scope.getMedienVorOrt = function (sid) {
                console.log("getMedienVorOrt sid:" + sid);
            if( sid != "false"  ) { // false wenn kein Spielort gewählt
                // medien vor Ort abspielbar
                $scope.sid = JSON.parse(JSON.stringify(sid));
                FfkUtils.ladeSpielort(sid);
                abspielOptionenVorOrt = $rootScope.spielorte[$scope.sid].medien;
                console.log("    Abspielmöglichkeiten für " + $scope.sid + ": " + abspielOptionenVorOrt);
                // aktualisere filminfos medienmenge
            } else {
                    console.log("    kein Spielort gewählt, suche daher auch keine Abspielmöglichkeiten des Spielortes");
            }
        };

        // buchbarer film angecklickt
        $scope.loadBuchbar = function (vBID) {
            console.log("    loadBuchbar("+vBID+")");
            $scope.vbid = JSON.parse(JSON.stringify(vBID));
            $scope.medienLeihbar = FfkUtils.getLeihbar(datumSpieltag, $rootScope.verleihBuchungen[vBID].medien);
            console.log("    Leihbare Medien: "+ $scope.medienLeihbar);
            $scope.fid =  $rootScope.verleihBuchungen[vBID].fID;
            FfkUtils.ladeFilm($scope.fid);
            $scope.modus.status = "buchbar";
            $scope.modus.info = "Infos zum Film";


        };

        // lade daten zum ausgewählten Filmwunsch
        $scope.loadGewunschen = function (vBID) {
            console.log("loadGewunschen: " + JSON.stringify(vBID));
            $scope.vbid = JSON.parse(JSON.stringify(vBID));
            $scope.fid =  $rootScope.verleihWunsch[vBID].fID;
            FfkUtils.ladeFilm($scope.fid);
            $scope.modus.info = "Infos zum Filmvorschlag";
            $scope.modus.status = "gewunschen";
        };

        // wunschfilm anlegen
        $scope.neuerWunsch = function () {
            $scope.modus['info'] = "Neuen Wunschfilm anlegen";
            $scope.modus.status = "neuerWunsch";
            $scope.filmChanges = {};
            console.log("    sammel WunschFilm Infos");
        };

        // neuen Wunsch speichern
        $scope.speicherWunsch = function () {
            console.log("    speicherWunsch(): " + JSON.stringify($scope.filmChanges));
            console.log($scope.sid);
            $scope.modus.status = "unbekannt";
            var startdatum = $rootScope.filmlauf[verleihIdx +1 ][0][2];
            console.log("    startdatum(): " + JSON.stringify(startdatum));
            FfkUtils.setVerleihWunschFilmRing($scope.filmChanges, startdatum, datumSpieltag, $scope.sid);
            // FfkUtils.setWunsch($scope.filmChanges);
            $scope.abbrechen();
        };

        // Film buchen
        $scope.verleihBuchungBuchen = function (medium, garantie) {
            console.log("buchen "+ medium);
            console.log("$scope.vbid "+ $scope.vbid);
            if (garantie == undefined){
                    garantie = false;
            }
            if ($scope.sid != false) { // nur wenn Spieort angegeben
                // vBID, sid, datum, medium, grantie
                var jahr = moment().hours(12).format("YYYY"); // damit auch um Silvester alles läuft
                var profID = FfkUtils.getNewProvID('r'+jahr);
                console.log("profID "+profID);
               FfkUtils.setRingBuchung(profID, $scope.vbid, $scope.sid, datumSpieltag, medium, garantie);
               FfkUtils.setInFilmlaufRingAngelegenheiten( [ $rootScope.ringBuchungen[profID] ] , 1);

                $uibModalInstance.close({'msg': 'Film gebucht'});
            } else { // Spielort fehlt
                alert("Welcher Spielort soll mitspielen?\nBitte wählen sie einen aus.");

            }
        };

        $scope.machBuchbar = function () {
            console.log("    machBuchbar");
            console.log("    vBID" + $scope.vbid);
            FfkUtils.setWunsch2Buchung($scope.vbid);
            $uibModalInstance.close({"msg": "machNix"});
        };

        // Mitspielinteresse bekunden
        $scope.mitspielen = function () {
            console.log("    mitspielen (Ringwunsch)für sid " + $scope.sid );
                FfkUtils.setRingWunsch($scope.vbid, $scope.sid, datumSpieltag);// setze in Tabelle
                $uibModalInstance.close({'msg': 'nix'});
        };

        $scope.garantieUebernehmen = function () {
            console.log("    garantieUebernehmen");
            FfkUtils.setRingWunsch($scope.vbid, $scope.sid, datumSpieltag, true);// setze in Tabelle
            $scope.machBuchbar();
        };

        /*
        INIT 2
         */
        //sid
        if ($rootScope.logedInUser.sid){
            $scope.sid = JSON.parse(JSON.stringify($rootScope.logedInUser.sid));
            // spielort aktuell
            $scope.spielortName = ffkUtils.getNamezurId( $rootScope.spielorteSortiert , sid);
            $scope.getMedienVorOrt(sid);
        }
        console.log("    sid: " + $scope.sid);







        $scope.abbrechen = function () {
            $uibModalInstance.dismiss('Filmauswahl geschlossen');
        };
       });