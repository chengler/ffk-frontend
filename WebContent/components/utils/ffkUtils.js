angular.module('ffkUtils', []).constant('MODULE_VERSION', '0.0.1').service(
    'FfkUtils',
    function ($log, $rootScope, $http) {

        // passiert z.B. wenn das Verleihbuchungsfenster verkleinert wird und Ringbuchungen im Wal stünden
        // TODO email an Spielort
        // TODO REST




        this.changeVerleih = function(myid, myObject){
            Object.keys(myObject).forEach(function(key) {
                $rootScope.verleihBuchungen[myid][key] = myObject[key];
                console.log("Änder " + key + " in : " + myObject[key]);
                })

            //TODO REST
        };



        this.changeFilm = function(myid, myObject){
            for (var key in myObject) {
                if (myObject.hasOwnProperty(key)) {
                    $rootScope.filme[myid][key] = myObject[key];
                    console.log("Änder " + key + " in : " + myObject[key]);
                }
            }
            //TODO REST
        };


        this.deleteRingBuchung = function(idx, col){
            console.log("deleteRingBuchungen auf " +idx+ " col " + col);
            i = 1;
            while(true){
                if ($rootScope.filmlauf[idx][col]['f'+ i] ){
                    var fBID = "fBID" + $rootScope.filmlauf[idx][col]['f'+ i].fBID;
                    console.log("lösche " + fBID);
                    $rootScope.ringBuchungen[fBID] = null;
                    delete $rootScope.ringBuchungen[fBID];
                    //Sende Rest delete
                } else {
                    break; //kein weiterer Film mehr
                }

                i += 1;// suche f2 ...
            };


        };



        // hole name aus sortiertem array
        // format : [ id , name ]
        // für sid und vid für spielorteSortiert und verleiherSortiert
        // gebe id zurück, fals nichts gefunden wird
        this.getNamezurId= function(array , id){
        //    console.log ("getNamezurId ");
            var gefunden = false;
            array.every( function( idname) {
                if (idname[0] == id ) {
                    id = idname[1];
                    return false;
                } else {
                    return true;
                }

            });

            // wird der name zur id nicht gefunden, wird die id zurückgegeben!
           // console.log (" id: "+id);
            return id;
        };
        // gebe bezeichung zu einer id zurück
        // hole namen von id = sid | vid | uid
        // id muss in sortetList[0] stehen
        // der rückgabewert ist in sortetList[retpos]
        // retpos ist die returnpossition bei sid oder Vid listen die [1] (2. Position)
        this.getRefName = function (sortetList, id, retpos) {
            // console.log("getRefName id = " + id);
            var refName = "";
            var typ = "";
            if (typeof id == "undefined") {
                return refName;
            } else {
                // vid sid oder uid
                typ = id.substr(0, 3);
            }
            sortetList.some(function (listId) {
                if (listId[0] == id) {
                    refName = listId[retpos];
                    return true;
                }
                return false;
            });
            return refName;
        };



        // fehlende Rückmeldungen für logdinuser
        this.getFehlendeRuekmeldungen = function(){
            console.log(" ************************** ");
            var fuerWen ="";
            switch ($rootScope.logedInUser.role) {
                // hole fehölende fBIDs alle
                case "admin":
                    fuerWen = "admin";
                    break;
                case "spieler":
                    fuerWen = $rootScope.logedInUser.sid; //spielortID
                    break;
                case "verleih":
                    fuerWen = $rootScope.logedInUser.vid; //verleihID
                    break;
            }
            var fehlende; // Rückmeldungen Eintritt und Besucher
            $http.get('../example_data/fehlendeRueckmeldungen.js?' + Math.random()).success(function (data) {
                fehlende = data[fuerWen];
                 $rootScope.fehlendeRueckmeldungen = fehlende;
                $rootScope.status.fehlendeRueckmeldungenGeladen = true;

                console.log("Rückmeldung fehlt für fBID: " + JSON.stringify(fehlende));
                console.log("fuerWen: " + fuerWen);
            });

        };

        // nicht mehr benötigt, da spieltag
        // rowindx ist index - spieltag $rootScope.filmlauf[rowIdx][0][1]
        // bekommt Datum -> gibt KW Info Zeile
        // erwartet Datum im Format 20160114
        // return:  row Index der KW Info Zeile
        this.getKinoWochenRowIdx = function (rowIdx, datum) {
            // $log.debug('getKinoWochenRowIdx: rowIdx: ' + rowIdx + ",
            // datum: " +
            // datum);
            if (datum == undefined) {
                //[ 0, 1, 2, 3 ] =[background, spieltag  , datum, lines in row]
                datum = $rootScope.filmlauf[rowIdx][0][2];
            } else {
                $log.info("getKinoWochenRowIdx(rowIdx, datum) <- datum als Parameter nicht mehr benötigt");
            }
            var isoIdx = moment(datum).format('E');
            var idxDif = isoIdx - 3; // (Do-So)
            if (isoIdx < 4) { // (Mo-Mi)
                idxDif = parseInt(isoIdx) + 4;
            }
            rowIdx = rowIdx - idxDif;
            // $log.debug(' return rowIdx: ' + rowIdx);
            return rowIdx;
        };

// erwarte kw index und vBid
// suche in programmlauf nach der passenden col
        this.getColFromVbid = function (kwidx, vbid) {
            var myZeile = $rootScope.filmlauf[kwidx];
            var colidx;
            for (var colidx = 1; colidx <= myZeile.col; colidx += 1){
                if (myZeile["col"+colidx].vBID == vbid) {
                    break; // breche ab, colidx in variable
                }
            }
            return "col"+colidx
        }
        this.getColWfromVbid = function (kwidx, vbid) {
            var myZeile = $rootScope.filmlauf[kwidx];
            var colidx;
            for (var colidx = 1; colidx <= myZeile.col; colidx += 1){
                if (myZeile["col"+colidx+"w"].vBID == vbid) {
                    break; // breche ab, colidx in variable
                }
            }
            return "col"+colidx+'w';
        }

        // werden Filme gelöscht, könnte es zuviele linien geben.
        this.wenigerLinien = function(rowIdx){

        }

        //erwarte Zeile der Kalenderwoche und der Splate
        //gebe das Wocheneinspielergebniss dieser Woche zurück
        this.summiereWochenergebniss =  function(kwZeile,colIdx) {
            $log.debug('summiereWochenergebniss für Zeile/Spalte '+ kwZeile+"/"+colIdx);
            // loope durch die Woche
            var summe = [0,0];


            // gesamt in Buchung

            var filmtag ;
            // iteriere durch Filmwocher
            for (var i = 1; i<= 7; i ++){
                filmtag = $rootScope.filmlauf[(kwZeile+i)]['col'+colIdx]['f1'];
                console.log(filmtag);
                if (filmtag != undefined) { // an diesem Tag keine Buchung
                    console.log("++defined, also Buchung  idx=" + (kwZeile + i) + " tagessumme: " + filmtag);
                    // Film f1 existiert, aber vielleicht auch mehr => iteriere
                    //
                    var f =1;
                    while (true){

                        if (filmtag.gesamt != undefined) { // es gibt eine Buchung mit einem gesamteintrag
                            console.log("da gesamt, summiere "+ JSON.stringify( filmtag.gesamt) + " zu " +   JSON.stringify(summe) );
                            summe[0] += filmtag.gesamt[0]; // addiere besucher
                            summe[1] += filmtag.gesamt[1]; // addiere cent
                            console.log("********** summe " + JSON.stringify(summe));
                        }
                        //endlosschleife bis film (f2) nicht mehr existiert
                        f += 1; //eins mehr
                        filmtag = $rootScope.filmlauf[(kwZeile+i)]['col'+colIdx]['f'+f]; //f2,f3 usw
                        if (filmtag == undefined) {
                            break;
                        }
                    }
                } else {
                    console.log("++undefined, also keine Buchung an idx=" + (kwZeile + i) + " tagessumme: " + filmtag);
                }
            }
            //setze summe in buchnungszeile Format fw(int):[besucher,cent]
            var myFilm = $rootScope.filmlauf[kwZeile]['col'+colIdx];
            $rootScope.verleihBuchungen[myFilm.vBID]['fw'+myFilm.fw] = summe;
            console.log("end summiere :" + JSON.stringify($rootScope.verleihBuchungen[myFilm.vBID]));
            return summe;


        };

        //nehme Datum, gebe den Donnerstag zurück, in dessen Kinowoche der Tag liegt
        // art ist die formatierung, kein wert =>  gebe den Donnerstag zurück, an dem die Kinowoche beginnt
        this.getKinoWocheFromDate = function (datum) {
            datum = moment(datum).hour(12); // Timzone? geh auf Mittag 12h
            $log.debug('\ngetKinoWocheFromDate: '+ moment(datum).format("DD.MM.YYYY"));
            // bekommt Datum -> gibt KW Info Zeile
            // erwartet Datum im Format 20160114
            // return:  row Index der KW Info Zeile
            var isoIdx = moment(datum).format('E');
            /*       $log.debug('starte mit Tag: '+ moment(datum).format("DD-MM-YYYY"));
             $log.debug('Wert des Tages Mo 1-So 7: '+ moment(datum).format('E'));*/

            var idxDif = parseInt(isoIdx) - 4  ; // (Do-So) So 7-4 = 3 Tage zu Do
            if (isoIdx < 4) { // (Mo-Mi) (Mo  1+3=4 Tage zu Do
                idxDif = parseInt(isoIdx) + 3;
            }

            var donnerstag = moment(datum).subtract(idxDif, 'days');
            $log.debug(' return ist Donnerstag, der ' + moment(donnerstag).format("DD-MM-YYYY")+ " KW "+ moment(donnerstag).isoWeek());

            return donnerstag; // gebe den Donnerstag zurück, an dem die Kinowoche beginnt
        };

        // DOKU
        // nehme datum und berechne den idx des Filmlaufes
        this.getFilmlaufIdxVonDatum = function (datum){
            datum = moment(datum).hours(12); // kein Datumssprung wegen zeitverschiebung
            var tage = datum.diff($rootScope.ersterDo, 'days');
            var idx = tage + Math.floor(tage / 7); // ausgleich da alle 7 Tage ein extra idx
        //    console.log("datum  "+moment(datum).format('YYYYMMDD HH:mm:ss'));
        //    console.log("der Do " + $rootScope.ersterDo.format('YYYYMMDD HH:mm:ss'));
        //    console.log(tage + " tage !!!!! ziel idx = "+idx);
            return idx;
        }



        // gibt este freie Wunschcol zurück
        // legt neue col an, wenn es keine freie gibt
        // typ bestimmt welche col gesucht wird
        // 'w' wunschfilm leer, nixx
        this.getFirstFreeCol = function ($scope, buchungsWoche, typ, startAtcol, vBID) {

            console.log("getFirstFreeCol startAtcol " + startAtcol + " typ " + typ + " vBID " + vBID);
            var colnr = 1;
            if (startAtcol > 1) { // suche ab Spltle
                colnr = startAtcol;
            }
            var suche; // was wird gesucht
            // gehe durch cols

            // nach was wird gesucht?
            if (typ == 'wunsch') {

                while ('col' + colnr + 'w' in buchungsWoche) {
                    suche = 'col' + colnr + 'w';
                    console.log("suche freie Wunschspalte " + suche);
                    // bleibt gleich?
                    if (buchungsWoche[suche]['vBID'] == vBID) {
                        console.log("getFirstFreeCol nehme alte Col da vBID für Wunschfilm" + vBID);
                        break;
                    }
                    // schaue ob bereits ein Eintrag
                    if (buchungsWoche[suche]['vBID']) {
                        console.log("erhöhe auf " + colnr);
                        colnr = parseInt(colnr) + 1; // nächste reihe
                        console.log("erhöhe auf " + colnr);

                    } else {
                        // frei gefunden
                        console.log("getFirstFreeCol 'wunsch' frei gefunden " + colnr);
                        console.log("suche" + suche);
                        console.log(buchungsWoche[suche]);
                        break;
                    }
                }
            }
            if (typ == 'film') {
                while ('col' + colnr in buchungsWoche) {
                    console.log("film col " + colnr);
                    console.log(buchungsWoche['col' + colnr]['vBID']);
                    suche = 'col' + colnr;
                    if (buchungsWoche['col' + colnr]['vBID'] == vBID) {
                        console.log("getFirstFreeCol nehme alte Col da vBID" + vBID);
                        break;
                    }
                    // schaue ob bereits ein Eintrag
                    if (buchungsWoche[suche]['vBID']) {
                        colnr = parseInt(colnr) + 1; // nächste reihe
                    } else {
                        // frei gefunden
                        console.log("getFirstFreeCol 'Film' gefunden " + colnr);
                        console.log(suche);
                        console.log(buchungsWoche[suche]);

                        break;
                    }
                }
            }
            // es gibt keinen Eintrag in col -> lege neue col an
            if (buchungsWoche['col' + colnr] == undefined) {
                // console.log(buchungsWoche);
                console.log("getFirstFreeCol col erstellt für #" + colnr);
                buchungsWoche['col' + colnr] = {
                    "vBID": false
                };
                // aktualisiere max col falls am ende angefügt

                if (colnr > this.getFilmlaufMaxCol(0)) {
                    console.log("getFirstFreeCol am Ende hinzugefügt: " + colnr);
                    buchungsWoche.col = colnr;
                    $scope.neueColum(colnr);
                }
            }
            console.log("return " + colnr);
            return colnr;
        };



        this.setLogedInUser = function () {
            if (ar[1] == $scope.auth.username) {
                console.log("Anmeldename gefunden " + ar);
                $rootScope.loggedIn = true; //

                // set logedInUser
                $rootScope.logedInUser.uid = ar[0];
                $rootScope.logedInUser.logName = ar[1];
                $rootScope.logedInUser.role = ar[2];
                var id = ar[3].substr(0, 3);
                // set login user vid | sid name
                // setze name von Spielort oder verleih
                if (id == "vid") {
                    $rootScope.logedInUser.vid = ar[3];
                    $rootScope.verleiherSortiert.some(function (vid) {
                        if (vid[0] == ar[3]) {
                            $rootScope.logedInUser.idName = vid[1];
                            return true;
                        }
                        return false;
                    });
                } else if (id == "sid") {
                    $rootScope.spielorteSortiert.some(function (sid) {
                        $rootScope.logedInUser.sid = ar[3];
                        if (sid[0] == ar[3]) {
                            $rootScope.logedInUser.idName = sid[1];
                            return true;
                        }
                        return false;
                    });
                }
                $rootScope.logedInUser.name = ar[4];
                // gefunden
                return true;
            } else {
                $rootScope.loggedIn = false; //
                $rootScope.logedInUser = null;

            }
        };

        // ($scope.filmlauf, neustart, col, neuend, res.vBID);
        this.checkPlatzInCol = function (rowIdx, col, lastRow, vBID) {
            if (vBID == undefined) {
                vBID = false;
            }
            var platz = true;
            console.log("checkPlatzInCol  rowIdx " + rowIdx + " col " + col + " lastRow " + lastRow + " vBID "
                + vBID + " noch ist platz " + platz);
            var platz = true;
            for (var index = rowIdx; index < lastRow; index = index + 8) {
                console.log("index " + index + " col " + col + " lastRow " + lastRow + " vBID " + vBID);
                // es gibt einen Eintrag
                console.log("filmlauf[" + index + "][" + col + "] = "
                    + JSON.stringify($rootScope.filmlauf[index][col]));

                if (($rootScope.filmlauf[index][col] != undefined)) {
                    var check = $rootScope.filmlauf[index][col]["vBID"];
                    $log.debug("check vBID " + check);
                    // und die buchungsnummer ist anders
                    if ((vBID != check) & (check != false) & (check != undefined)) {
                        platz = false;

                        break;
                    }
                }

            }

            $log.debug("Platz in  " + col + "  = " + platz);
            return platz;
        };

        this.getFilmstart = function (filmlauf, checkIDX, colIdx, vBID) {
            console.log("getFilmstart für checkIDX " + checkIDX + " colIdx " + colIdx);
            // suche Start des Filmblocks
            var lz = 1; // laufzeit des Blocks
            checkIDX = checkIDX - 8;

            while (0 <= checkIDX) {
                // vBID in der Vorwoche?
                $log.debug("checkIDX " + checkIDX + ", Datum " + filmlauf[checkIDX].datum);
                this.setLogedInUser = function () {
                    if (ar[1] == $scope.auth.username) {
                        console.log("Anmeldename gefunden " + ar);
                        $rootScope.loggedIn = true; //

                        // set logedInUser
                        $rootScope.logedInUser.uid = ar[0];
                        $rootScope.logedInUser.logName = ar[1];
                        $rootScope.logedInUser.role = ar[2];
                        var id = ar[3].substr(0, 3);
                        // set login user vid | sid name
                        // setze name von Spielort oder verleih
                        if (id == "vid") {
                            $rootScope.logedInUser.vid = ar[3];
                            $rootScope.verleiherSortiert.some(function (vid) {
                                if (vid[0] == ar[3]) {
                                    $rootScope.logedInUser.idName = vid[1];
                                    return true;
                                }
                                return false;
                            });
                        } else if (id == "sid") {
                            $rootScope.spielorteSortiert.some(function (sid) {
                                $rootScope.logedInUser.sid = ar[3];
                                if (sid[0] == ar[3]) {
                                    $rootScope.logedInUser.idName = sid[1];
                                    return true;
                                }
                                return false;
                            });
                        }
                        $rootScope.logedInUser.name = ar[4];
                        // gefunden
                        return true;
                    } else {
                        $rootScope.loggedIn = false; //
                        $rootScope.logedInUser = null;

                    }
                };// gibt es überhaupt einen Eintrag?
                if (typeof filmlauf[checkIDX]['col' + colIdx] == 'undefined') {
                    console.log("break no col" + colIdx);
                    break;
                    // hat der Eintrag eine vBID
                } else if (typeof filmlauf[checkIDX]['col' + colIdx]['vBID'] == 'undefined') {
                    console.log("break no vbid");
                    break;
                }
                // vergleichevBID
                $log.debug("vergleiche gegeben vBID " + vBID + "mit gefunden "
                    + filmlauf[checkIDX]['col' + colIdx]['vBID']);
                if (filmlauf[checkIDX]['col' + colIdx]['vBID'] == vBID) {
                    // gefunden, erhöhe Laufzeit
                    lz = lz + 1;
                } else {
                    break;
                }
                // suche früher
                checkIDX = checkIDX - 8;
            }
            // korrigiere checkIDX - 8;
            checkIDX = checkIDX + 8;
            $log.debug("startet in row " + checkIDX + " und geht bis Suchstart Woche(n): " + lz);
            var result = {};
            result.checkIDX = checkIDX;
            result.laufzeit = lz;
            return result;
        };

        this.getLaufzeit = function (filmlauf, rowIdx, colIdx, vBID) {
            console.log("getLaufzeit ab Index " + rowIdx + " in Spalte " + colIdx + " für vBID " + vBID);
            // suche Laufzeit ab rowIdx
            var lz = 0; // laufzeit des Blocks AB IDX
            checkIDX = rowIdx + 8;
            while (480 >= checkIDX) {
                console.log("checkIDX " + checkIDX + ", Datum " + filmlauf[checkIDX].datum);
                // vBID in der Folgewoche?
                if (typeof filmlauf[checkIDX]['col' + colIdx] == 'undefined') {
                    console.log("break no col" + colIdx);
                    break;
                } else if (typeof filmlauf[checkIDX]['col' + colIdx]['vBID'] == 'undefined') {
                    console.log("break no vbid");
                    break;
                }
                console.log("suche " + filmlauf[checkIDX]['col' + colIdx]['vBID']);
                console.log("finde " + vBID);
                if (filmlauf[checkIDX]['col' + colIdx]['vBID'] == vBID) {
                    lz = lz + 1;
                } else {
                    break;
                }
                checkIDX = checkIDX + 8;

            }
            $log.debug("Laufzeit ab Suchstart in Woche(n)" + lz);
            return lz;
        };

        //// wievielte Buchung dieses Films an diesem TAg
        // "f1" oder "f2" ...
        // erwarte aus dem Filmlauf zum Tag und die col wie zB. col1
        this.getBuchungenProTag = function ( buchungsTag, col){
            var fnext = 1;
            while ('f' + fnext in buchungsTag[col]) {
                fnext = fnext + 1; // schaue, ob weiterer Film in col
            }
            // erhöhe Zähler der Buchungen pro Tag falls nötig

            if (buchungsTag['lines'] < fnext) {
                buchungsTag['lines'] = fnext;
            }
            return fnext;
        }

// bitte nicht mehr verwenden
        // besser changeRingBuchung nehmen
        // änderungen im filmlauf entweder auch in fu
        // this.setBuchung = function($scope, rowIdx, col, sid, medium, garantie) {
        this.setBuchung = function (rowIdx, col, sid, medium, garantie) {
            console.log("setBuchung für rowIdx " + rowIdx + " in Spalte " + col + " für sid " + sid
                + " und Medium " + medium);
            // setze Medium
            if (medium == undefined) {
                medium = "";
            }

            if (garantie == undefined) {
                garantie = false;
            }

            var buchungsTag = $rootScope.filmlauf[rowIdx];
            var fnext = this.getBuchungenProTag(buchungsTag, col);
/*

            // wievielte Buchung dieses Films an diesem TAg
            // "f1" oder "f2" ...
            var fnext = 1;
            while ('f' + fnext in buchungsTag[col]) {
                fnext = fnext + 1; // schaue, ob weiterer Film in col
            }
            // erhöhe Zähler der Buchungen pro Tag falls nötig
            if (buchungsTag['lines'] < fnext) {
                buchungsTag['lines'] = fnext;
            }
*/

            var mySet = {
                "fBID": this.getNewProvID(""),
                "check1": false,
                "check2": false,
                "sid": sid,
                "medium": medium,
                "medienID": false,
                "vonID": false,
                "nachID": false,
                "garantie": garantie
            };
            console.log("mySet = " + JSON.stringify(mySet));
            buchungsTag[col]['f' + fnext] = mySet;
            // erstelle rootScope.ringBuchung
            var rbKey= "fBID"+ mySet.fBID; //ringBuchungskey
            // müsste sonst in rootscoop fest kopiert sein
            //    mySet.fBID = null;
            //    delete mySet.fBID;

            $rootScope.ringBuchungen[rbKey] = mySet;
            $rootScope.ringBuchungen[rbKey]['datum'] = buchungsTag.datum;
            var bIdx = this.getKinoWochenRowIdx(rowIdx)
            console.log("bIdx "+bIdx+ " col "+col);
            $rootScope.ringBuchungen[rbKey]['vBID'] = $rootScope.filmlauf[bIdx][col].vBID;
           // TODO
           // $rootScope.ringBuchungen[rbKey]['vid'] = $rootScope.filmlauf[bIdx][col].vBID;

            console.log("setze in $rootScope.ringBuchungen "+ JSON.stringify($rootScope.ringBuchungen[rbKey]));
            console.log("+++++++++ sende REST an SERVER");
        };

        this.newBackgroundFilmlauf = function (startIdx, laufzeit, col, bc, typ) {

            console.log("newBackgroundFilmlauf von rowIdx " + startIdx + " um Woche(n) " + laufzeit + " Spalte "
                + col + " farbcode " + bc + " für " + typ);
            var filmlauf = $rootScope.filmlauf;
            console.log(filmlauf[startIdx]);
            // berechne Endindex
            var endIdx = laufzeit * 8 + startIdx - 8;
            // farbwert ist z.B. bc-5 von bc-50
            var farbwert = bc.substr(0, bc.length - 1);
            for (var woche = startIdx; woche <= endIdx; woche = woche + 8) {
                console.log("woche " + woche);
                console.log("die col " + JSON.stringify(filmlauf[woche][col], 0, 0));

                // WochenÜberschrift
                filmlauf[woche][col]['bc'] = bc;
                console.log("neue col " + JSON.stringify(filmlauf[woche][col], 0, 0));
                // iteriere durch Wochentage
                for (var t = 1; t < 8; t++) {

                    var idx = woche + t;
                    //      console.log("idx " + idx + " col " + col);
                    //       console.log("filmlauf[idx][col] " + JSON.stringify(filmlauf[idx][col]));
                    if (filmlauf[idx][col] != undefined) {
                        if (t % 2 == 0) { // Do, Sa ..
                            filmlauf[idx][col]['bc'] = farbwert + 2;
                        } else { // Fr, So ..
                            filmlauf[idx][col]['bc'] = farbwert + 1;
                        }
                    }
                }
            }
        };

        // vergbe provisorische ID und erlaub einen ident zu speichern
        this.getNewProvID = function (identCounter) {
            if (identCounter == undefined) {
                identCounter = null;
            }
            $rootScope.myProvID.counter = $rootScope.myProvID.counter + 1;
            var provID = 'p' + $rootScope.myProvID.counter;
            $rootScope.myProvID[provID] = identCounter;
            console.log("Prov ID " + identCounter + provID + " vergeben");
            return identCounter + provID;
        };

        // del array in sortet list
        // erwarte als key a[0]
        this.delFromSortedList = function (key, sortedList) {
            // $log.debug("delet " + key + " in " + sortedList);
            for (var idx = 0; idx < sortedList.length; idx++) {
                if (sortedList[idx][0] == key) {
                    sortedList.splice(idx, 1);
                    idx = sortedList.length;
                    $log.debug("deleted " + key + " @ idx " + idx);
                }
            }
        };

        // DOKU
        // ad to List and sort
        this.sortList = function (listTosort, sortAtIdx) {
            // sortiere nach key in Array
            // a[0] is sid (spielOrtID)
            // a[1] ist der Ort bei sid | kurz bei vid
            listTosort = listTosort.sort(function (a, b) {
                if (a[sortAtIdx] > b[sortAtIdx]) {
                    return 1;
                }
                if (a[sortAtIdx] < b[sortAtIdx]) {
                    return -1;
                }
                return 0;
            });
            return listTosort;
        };

        // gebe dem looggedin user eine tempöräre rolle mit sid oder vid
        this.masqueradeLoggedIn = function ( vidOdersidID) {
            // gibt es eine feste Rolle
            // lege default fest für remasquerade
            if ($rootScope.logedInUser.vid != undefined ){
                $rootScope.logedInUser["maskedID"] = $rootScope.logedInUser.vid;
            } else {
                $rootScope.logedInUser["maskedID"] = false; // default falls noch nicht vorhanden
            }
            if ($rootScope.logedInUser.sid != undefined ){
                $rootScope.logedInUser["maskedID"] = $rootScope.logedInUser.sid;
            }
            if ($rootScope.logedInUser.idName != undefined ){
                $rootScope.logedInUser["maskedIdName"] = $rootScope.logedInUser.idName;
            } else {
                $rootScope.logedInUser["maskedIdName"] = ""; // default falls noch nicht vorhanden
            }
// fole den namen
            var type = vidOdersidID.substr(0, 3);
            if (type == "vid") {
                $rootScope.logedInUser["vid"]=vidOdersidID;
                $rootScope.logedInUser["idName"]=
                    this.getRefName($rootScope.verleiherSortiert, vidOdersidID, 1);
            }
            if (type == "sid") {
                $rootScope.logedInUser["sid"]=vidOdersidID;
                $rootScope.logedInUser["idName"]=
                    this.getRefName($rootScope.spielorteSortiert, vidOdersidID, 1);

            }
            // setze masked flag
            $rootScope.logedInUser["masked"] = true;

        };



        // set logedInUser
        // suche passenden benutzer
        this.loginIfTrue = function (username) {
            $rootScope.usersSortiert.some(function (ar) {
                // wenn gefunden, [ "uid", "logName", "role", "vid" | "sid",
                // "name" ]
                if (ar[1] == username) {
                    console.log("Anmeldename gefunden " + ar);
                    $rootScope.loggedIn = true; //

                    // set logedInUser
                    $rootScope.logedInUser = {};
                    $rootScope.logedInUser.uid = ar[0];
                    $rootScope.logedInUser.logName = ar[1];
                    $rootScope.logedInUser.role = ar[2];
                    // hole sid oder vid aus usersSotiert
                    var id = ar[3].substr(0, 3);
                    // set login user vid | sid name
                    // setze name von Spielort oder verleih
                    if (id == "vid") {
                        $rootScope.logedInUser.vid = ar[3]; // setze 'vid'+int
                        $rootScope.verleiherSortiert.some(function (vid) {
                            if (vid[0] == ar[3]) {
                                $rootScope.logedInUser.idName = vid[1];
                                return true;
                            }
                            return false;
                        });
                    } else if (id == "sid") {
                        $rootScope.spielorteSortiert.some(function (sid) {
                            $rootScope.logedInUser.sid = ar[3];
                            if (sid[0] == ar[3]) {
                                $rootScope.logedInUser.idName = sid[1];
                                return true;
                            }
                            return false;
                        });

                    }
                    $rootScope.logedInUser.name = ar[4];
                    // gefunden
                    return true;
                }
                // weitersuchen
                return false;
            });
        };
// lade alle Filme
        this.loadFilme = function () {
            $http.get('../example_data//JSONfilme.js?' + Math.random()).success(function (data) {
                $rootScope.filme = data[0];
                console.log(Date.now() + " JSONfilme: " + Object.keys($rootScope.filme).length + " Filme geladen");
            });
        };



// checkt ob film vorhanden. wenn nein wird einzelner Film geladen
        this.ladeFilm = function (fID){
            // lade nur wenn film noch nicht vorhanden
            if ( !(fID in $rootScope.filme)){
                $http.get('../example_data//JSONfilme.js?' + Math.random()).success(function (data) {
                    // schaue ob es den Film nun gibt
                    if ( fID in data[0]) {
                        var value = data[0][fID];
                        $rootScope.filme[fID] =  value; // und lade nur diesen Film
                        console.log(JSON.stringify($rootScope.filme));
                        console.log(" JSONfilme: fID " + fID + " geladen");
                        console.log(JSON.stringify($rootScope.filme[fID]));
                    }else {
                        console.log("Film mit fid "+fID+" ist nicht ladbar in ../example_data//JSONfilme.js");
                    }
                });
            } else {
                console.log("Film mit fid "+fID+" war schon geladen");
            }
        };
        //lade Spielort
        // checkt ob film vorhanden. wenn nein wird einzelner Film geladen
        this.ladeSpielort = function (sid){
            // lade nur wenn film noch nicht vorhanden
            if ( !(sid in $rootScope.spielorte)){
                $http.get('../example_data/JSONspielorte.js?' + Math.random()).success(function (data) {
                    // schaue ob es den Film nun gibt
                    if ( sid in data[0]) {
                        var value = data[0][sid];
                        $rootScope.spielorte[sid] =  value; // und lade nur diesen Film
                        console.log(" JSONspielorte: sid " + sid + " geladen");
                        console.log(JSON.stringify($rootScope.spielorte[sid]));
                    }else {
                        console.log("Spieort mit sid "+sid+" ist nicht ladbar in ../example_data/JSONspielorte.js");
                    }
                });
            } else {
                console.log("Spieort mit sid "+sid+" war schon geladen");
            }
        };



        // zum laden von Datensatz wie gespeichert unter "Übersicht"
        // dient zur initialladung der Grundinformationen
        this.ladeDatensatz = function(fileContent){
            console.log("lade alles ausser Filme... ");
            console.log(fileContent);
            //console.log(JSON.stringify(fileContent));

            // fileContent =  JSON.parse(fileContent);
            for ( var key in fileContent ){
                console.log("finde "+ key);
                // console.log($scope[objektname]);
                switch(key) {
                    case 'users':
                        $rootScope[key] = fileContent[key];
                        // wenn Objekt 'users' geladen wurde erstelle und sortiere usersSortiert
                        this.sortiereUsers();
                        console.log(key + " geladen");
                        break;
                    case 'spielorte':
                        $rootScope[key] = fileContent[key];
                        this.sortiereSpielorte();
                        console.log(key + " geladen");
                        break;
                    case 'verleiher':
                        $rootScope[key] = fileContent[key];
                        this.sortiereVerleiher();
                        console.log(key + " geladen");
                        break;
                    case 'filme':
                        $rootScope[key] = fileContent[key];
                        // unklar was zu ändern ist.wird durch PCtrl geändert
                        console.log(Object.keys($rootScope.filme).length + " Filme geladen");
                        console.log(key + " geladen");
                        break;
                    case 'verleihBuchungen':
                        $rootScope[key] = fileContent[key];
                        $rootScope.status.verleihBuchungenGeladen = true;
                        console.log(key + " geladen");
                        break;
                    case 'filmlauf':
                        if ($rootScope.status.erstelleFilmlauf == true){
                            console.log("************** Filmlauf wird bereits aus den anderen Daten berechnet. Der Filmlauf des Datensatzes wird ignoriert");
                        }else {
                        console.log("************** Filmlauf sollte nicht geladen werden, da er aus den anderen Daten nun selbst berechnet wird. " +
                            "Aber er war im Datensatz enthalten und so lade ich ihn. Das kann zu Fehlern führen");
                        $rootScope[key] = fileContent[key];
                        $rootScope.status.filmlaufGeladen = true;
                        console.log(key + " geladen");}
                        break;
                    case 'ringBuchungen':
                        $rootScope[key] = fileContent[key];
                        $rootScope.status.ringBuchungenGeladen = true;
                        console.log(key + " geladen");
                        break;
                    case 'ringWunsch':
                        $rootScope[key] = fileContent[key];
                        console.log(key + " geladen");
                        break;
                    case 'verleihWunsch':
                        $rootScope[key] = fileContent[key];
                        console.log(key + " geladen");
                        break;
                    case 'myProvID':
                        $rootScope.myProvID.counter = fileContent[key];
                        console.log(key + " geladen "+fileContent[key] );
                        break;
                }
                $rootScope.status.datensatzGeladen = true;
            }

        };





        this.loadBuchungen = function () {
            $log.info("lade verleihBuchungen");
            $http.get('../example_data//JSONverleihBuchungen.js?' + Math.random()).success(
                function (data) {
                    $rootScope.verleihBuchungen = data[0];
                    $rootScope.status.verleihBuchungenGeladen = true;
                    console.log("verleihBuchungenGeladen " + $rootScope.status.verleihBuchungenGeladen);
                    console.log(Date.now() + " JSONverleihBuchungen: " + Object.keys($rootScope.verleihBuchungen).length
                        + " Buchungen geladen");
                    // $log.debug(" buchung : " +
                    // JSON.stringify($rootScope.verleihBuchungen, null,
                    // 8));
                });
        };

        // lade filmlauf mit idx Nummern
        // also zuim einzelnen nachladen
        //akteptiert auch komplette s Array ohne idx
        this.loadFilmlauf = function () {
            $log.info("ffkUtils.loadFilmlauf: lade Filmlauf");
            // welcher filmlauf wird geladen
            // standard ist 2
            // wenn verleiher vid 1 wird 3 geladen
            var filmlaufnr = "../example_data/JSONfilmlauf2.js";
            if ($rootScope.logedInUser.role == "verleih") {
                switch ($rootScope.logedInUser.vid) {
                    case "vid1":
                        filmlaufnr = "../example_data/JSONfilmlauf3.js";
                        break;
                }
            }
            $log.info("ffkUtils.loadFilmlauf: " + filmlaufnr + '?');
            // $http.get('../example_data//JSONfilmlauf3.js?' + Math.random()).success(
            $http.get(filmlaufnr + '?' + Math.random()).success(
                function (data) {
                    // tabelle mit idx
//checke ob filmlauf mit idx, also einzelne Einträge
// oder ohne, kompletter Filmlauf wie beim export
                    var typ = (Object.keys(data[0])[0]).substring(0,3);
                    console.log("filmlaufdatei von typ "+typ);
                    if (typ == "idx"){
                        for (var obj in data) {
                            Object.keys(data[obj]).forEach(function (key) {
                                // console.log("obj " + obj);
                                // console.log("key " + key);
                                var idx = key.substr(3);
                                // console.log("idx " + idx);
                                // console.log(data[obj][key]);
                                // console.log($rootScope.filmlauf[idx]);
                                // ES6/ES2015
                                Object.assign($rootScope.filmlauf[idx], data[obj][key]);
                                // console.log($rootScope.filmlauf[idx]);
                                // $rootScope.filmlauf[idx] =
                                // data[obj][key];
                            });
                        }
                    }else {
                        $rootScope.filmlauf = data;
                    }


                    // Filmlauf ist nun vorbereitet
                    $rootScope.status.filmlaufGeladen = true;
                    console.log("filmlaufGeladen " + $rootScope.status.filmlaufGeladen);
                    console.log(Date.now() + " JSONfilmlauf: " + Object.keys($rootScope.filmlauf).length / 8
                        + " Spielwochen geladen");
                    return true;
                });

        };


        // unnötig, da $rootScope.filmlaufSpalten
        this.getFilmlaufMaxCol = function (maxCol) {
            $log.info("getFilmlaufMaxCol");

            // wieviele Spalten max in der Tabelle?
            // suche den größten $rootScope.filmlauf.col
            // var keys = Object.keys($rootScope.filmlauf);
            $rootScope.filmlauf.forEach(function (obj) {
                if (maxCol < obj.col) {
                    maxCol = obj.col;
                }
            });
            $log.debug("maximal " + maxCol + " Spalten ");
            return maxCol;

        };
        // datum iso (aus Filmlauf.datum), Buchung.medien
        this.getLeihbar = function (datum, buchung) {
            console.log("getLeihbar() ");
            // fehlertolerantz erhöhen
            // akzeptiere 2017-12 201712 ...
            datum = moment(datum).hours(12);
            var leihbar = [];
            for (var key in buchung) {
                if (buchung.hasOwnProperty(key)) {
                    // filmmedium ist buchbar an diesem Tag
                    if ( moment(buchung[key]).hours(12)  <= datum) {
                        leihbar.push(key);
                    }
                }
            }
           // console.log("leihbar ist " + leihbar);
            return leihbar;

        };

        // setze einen Film in  $rootScope.filme
        // this.setFilm( filminfos [, fID] )
        // filminfos = {}
        this.setFilminFilme = function (filminfos, fID) {
            if (fID == undefined) {
                fID = this.getNewProvID('f');
            }
            $log.info("* FfkUtils.setFilm fID" + fID + " " + JSON.stringify(filminfos, 0, 0));
            $rootScope.filme[fID] = {};
            Object.keys(filminfos).forEach(function (key) {
                $rootScope.filme[fID][key] = filminfos[key];
            });
            return fID;

        }


        // this.setWochenBuchungInFilmlauf(rowIdx, colIdx [, params]);   params = { "bc": , "vBID": , "fID": , "colSuffix": });
        this.setWochenBuchungInFilmlauf = function (rowIdx, colIdx, params) {
            $log.info("* FfkUtils.setInFilmlauf rowIdx: " + rowIdx + " colIdx: " + colIdx + " params: " + JSON.stringify(params, 0, 0));
            if (params == undefined) {
                params = {};
            }
            if (params.fID == undefined) {
                params.fID = this.getNewProvID('f');
            }
            if (params.vBID == undefined) {
                params.vBID = this.getNewProvID('v');
            }
            if (params.colSuffix == undefined) {
                params.colSuffix = "";
            }
            if (params.bc == undefined) {
                params.bc = "bc-00";
            }
            $rootScope.filmlauf[rowIdx]['col' + colIdx + params.colSuffix] = {
                "bc": params.bc,
                "vBID": params.vBID,
                "fID": params.fID
            };
            if (colIdx > $rootScope.filmlauf[rowIdx].col) {
                $rootScope.filmlauf[rowIdx].col = colIdx;
            }
            return params;
        };


        // aktuell nur für wünsche getestet
        // this.setBuchungInBuchungen( [params]);   params = { "wunsch": , "vBID": , "fID": , "titel": , "bc": });
        this.setBuchungInBuchungen = function (params) {
            $log.info("* FfkUtils.setBuchungInBuchungen params: " + JSON.stringify(params, 0, 0)
            )
            ;
            if (params == undefined) {
                params = {};
            }
            if (params.wunsch == undefined) {
                params.wunsch = false;
            }
            if (params.vBID == undefined) {
                params.vBID = this.getNewProvID('v');
            }
            if (params.fID == undefined) {
                params.fID = this.getNewProvID('f');
            }
            if (params.titel == undefined) {
                params.titel = "Noch kein Titel vergeben";
            }
            var mybuchung;
            if (params.wunsch) {
                if (params.bc == undefined) {
                    params.bc = "bc-00";
                }
                // TODO schöner wäre wenn nicht, also komplett analog verleihbuchung
                if (params.colIdx == undefined) {
                    $log.warn(" zum anlegen eines Wunsches in einer Buchung mus param.colIdx definiert sein!");
                }
                if ($rootScope.verleihBuchungen.wuensche == undefined) {
                    $rootScope.verleihBuchungen['wuensche'] = {};
                }
                if ($rootScope.verleihBuchungen.wuensche[params.vBID] == undefined) {
                    $rootScope.verleihBuchungen.wuensche[params.vBID] = {};
                }
                mybuchung = $rootScope.verleihBuchungen.wuensche[params.vBID];
                mybuchung['bc'] = params.bc;
                mybuchung['col'] = 'col' + params.colIdx;
                // bugsmashers
                //mybuchung['col'] = params.colIdx;

                mybuchung['wfID'] = params.vBID;
                // Neu; zukunft lösche wfid und col wenn möglich

            } else {
                if ($rootScope.verleihBuchungen[params.vBID] == undefined) {
                    $rootScope.verleihBuchungen[params.vBID] = {};
                }
                mybuchung = $rootScope.verleihBuchungen[params.vBID];
            }
            mybuchung['fID'] = params.fID;
            mybuchung['titel'] = params.titel;
            return params;
        }

        // setze einen neuen Wunschfilm in den benötigten Objecten
        this.setWunsch = function (filmChanges, programmCtrlScope, wochenBuchungenIDX) {
            $log.info("* FfkUtils.setWunsch " + JSON.stringify(filmChanges, 0, 0));
            var fID = this.setFilminFilme(filmChanges);
            var wfID = this.getNewProvID('v');
            // Speicher Wunsch in erster freien Spalte der Tabelle
            var colIdx = this.getFirstFreeCol(programmCtrlScope, $rootScope.filmlauf[wochenBuchungenIDX], "wunsch", 1, wfID);
            //
            this.setWochenBuchungInFilmlauf(wochenBuchungenIDX, colIdx, {"fID": fID, "vBID": wfID, "colSuffix": "w"});
            console.log("this.setWunsch got col idx "+colIdx);
           // TODO lösche veraltete Lösung und BuchunginBuchung
           // this.setBuchungInBuchungen({"wunsch": true, "vBID": wfID, "fID": fID, "titel": filmChanges.titel, "colIdx":colIdx});
            $rootScope.verleihWunsch[wfID] = JSON.parse(JSON.stringify(
                {"fID": fID, "titel": filmChanges.titel, "start": $rootScope.filmlauf[wochenBuchungenIDX +1].datum,
                    "bc" : "bc-00" }));
            programmCtrlScope.gridOptions.api.setRowData($rootScope.filmlauf);
        };

        //r2017p13 : {"rBID":"r2017p13","vBID":"v2017p12","sid":"sid5","datum":"20170610"},
        // neu und praktisch
        this.setRingWunsch = function (vbid, sid, datumSpieltag, garantie) {
            console.log("setRingWunsch");

            var jahr = moment().hours(12).format("YYYY"); // damit auch um Silvester alles läuft
            var rBID = this.getNewProvID('r'+jahr);
            if (garantie == undefined){
                garantie = false;
            }
            console.log("%%%%%%%%%%%%%%%%%% "+garantie);
            var rBidWunsch2server = {"rBID":rBID, "vBID":vbid,"sid":sid,"datum": datumSpieltag, "garantie" : garantie };
            $rootScope.ringWunsch[rBID] = rBidWunsch2server;
            this.setInFilmlaufRingAngelegenheiten( [rBidWunsch2server], 2);

            // TODO REST
            console.log("rBidWunsch2server " + JSON.stringify(rBidWunsch2server) );
            //
        };



        // neu und praktisch
        // die rBID muss vorher geholt werden (getNewProvID), damit die function vielfältiger einsetzbar ist
        // bucht ringBuchungen aus verleihBuchungen (braucht provID)
        // bucht RingBuchungen aus RingWünschen
        this.setRingBuchung = function (rBID, vBID, sid, datum, medium, grantie) {
            console.log("setRingBuchung vBID "+vBID+" sid "+sid+" datum "+ datum + " medium "
                + medium + " grantie " + grantie );
            datum = moment(datum).format("YYYYMMDD");
            var rBID2server = {};
            rBID2server['rBID'] = {"rBID": rBID, "check1":false,"check2":false,"sid":sid,"medium":medium,
                "medienID":false,"vonID":false,"nachID":false,"garantie":grantie,"datum": datum,"vBID":vBID};
            // speicher in Buchungen
            $rootScope.ringBuchungen[rBID] = JSON.parse(JSON.stringify(rBID2server.rBID));
            // TODO REST
            console.log("rBidBuchung2server " + JSON.stringify(rBID2server) );
            // speicher in filmlauf
            // [1,2,3,4].indexOf(3); // produces 2

            // darf nicht gesetzt werden, da sonst doppelt
            //this.setInFilmlaufRingAngelegenheiten( [ rBID2server.rBID] , 1);
        };


        // mache einen Wunsch buchbar
        // anschließend muss die Tabelle neu erstellt werden
        // verleih und Ringwünsche werden buchbar
        this.setWunsch2Buchung = function(vbid) {
            console.log("setWunsch2Buchung mit vBID " + vbid);
            vbid = JSON.parse(JSON.stringify(vbid));// deepcopy
            // die Verleihbuchung
            // erstelle prototyp
            $rootScope.verleihBuchungen[vbid] = {
                "vBID": false, "fID": "false", "titel": false, "vid": false,
                "medien": false, menge: false, start: false, "laufzeit": 1, "bc": "bc-00", "fw1": [0, 0]
            };

            // kopiere die daten aus VerleihWunsch in VerleihBuchung
            for ( key in $rootScope.verleihWunsch[vbid] ){
                $rootScope.verleihBuchungen[vbid][key] = JSON.parse(JSON.stringify($rootScope.verleihWunsch[vbid][key]));
            }
            // lösche Wunsch
           console.log(JSON.stringify($rootScope.verleihWunsch));
          console.log(JSON.stringify(vbid));
            $rootScope.verleihWunsch[vbid] = null;
            delete $rootScope.verleihWunsch[vbid];
            // TODO REST
            console.log("REST Wunsch2Buchung " + vbid);
            // erstelle Tabelle neu
            this.leereGrundtabelle();
            this.setInFilmlaufVerleihAngelegenheiten($rootScope.verleihBuchungen, 1);
            this.setInFilmlaufVerleihAngelegenheiten($rootScope.verleihWunsch, 2);

            // die Ringbuchungen
            for (key in $rootScope.ringWunsch) {
                if ($rootScope.ringWunsch[key].vBID == vbid) {
                    console.log("ringWunsch2Buchung für " + [key]);
                    var myRB = JSON.parse(JSON.stringify($rootScope.ringWunsch[key]));
                    // setze Ringbuchung und führe mit REST aus
                    // this.setInFilmlaufRingAngelegenheiten($rootScope.ringBuchungen, 1);
                    this.setRingBuchung( myRB.rBID   ,vbid, myRB.sid, myRB.datum, "", myRB.garantie);
                    $rootScope.ringWunsch[key] = null;
                    delete $rootScope.ringWunsch[key];
                }
            }
            this.setInFilmlaufRingAngelegenheiten($rootScope.ringBuchungen, 1);
            this.setInFilmlaufRingAngelegenheiten($rootScope.ringWunsch, 2);

        };

        // neu und praktisch
        // erstelle film und verleihwunsch
        // wenn datumSpieltag, sid, dann auch ringwunsch
        // und baue neue Tabelle auf
        this.setVerleihWunschFilmRing = function(buchungsinfos, startDatum, datumSpieltag, sid){
            console.log("setVerleihWunsch. lege Film an und setze Wunsch");
            var jahr = moment().hours(12).format("YYYY"); // damit auch um Silvester alles läuft
            var verleih = false;
            // die Infos des Verleihs gehören zum Verleihwunsch, nicht zum Film
            if (buchungsinfos.hasOwnProperty("verleih")){
                verleih = buchungsinfos.verleih;
                buchungsinfos.verleih = null;
                delete buchungsinfos.verleih;
            }
            // lege Film an falls es ihn noch nicht gibt.
            var fid = this.getNewProvID('f');
            $rootScope.filme[fid] = buchungsinfos;
            var fid2server ={};
            fid2server.fid  =  JSON.parse(JSON.stringify(buchungsinfos))
            fid2server.fid["fid"] =  fid;
            console.log("fid2server " + JSON.stringify(fid2server) );
            // setze Wunsch
            var vBID = this.getNewProvID('v'+jahr);
            var vBID2server ={};
            vBID2server['vBID'] = {"fID": fid, "titel": buchungsinfos.titel,
                "start": moment(startDatum).format("YYYYMMDD"), "laufzeit": 1, "bc":"bc-00" };
            $rootScope.verleihWunsch[vBID] = vBID2server.vBID;
            vBID2server.vBID['vBID']  =  vBID;
            console.log("vBID2server " + JSON.stringify(vBID2server) );
            // Ringwunsch
            //rBIDp13 : {"rBID":"r2017p13","vBID":"v2017p12","sid":"sid5","datum":"20170610"},
            if ( sid == undefined | sid  == false ) {
                console.log("rBID2server nein, da sid = " + sid);
            } else {

                var rBID = this.getNewProvID('r'+jahr);
                var rBID2server = {};
                rBID2server['rBID'] = {"rBID": rBID,"vBID": vBID,"sid":sid,
                    "datum":moment(datumSpieltag).format("YYYYMMDD")} ;
                $rootScope.ringWunsch[rBID] = rBID2server.rBID;
                console.log("rBID2server " + JSON.stringify(rBID2server) );

            }


            // zeichne einfach neu
            this.leereGrundtabelle();
            $rootScope.status.filmlaufGeladen = false;
            this.erstelleFilmlauf();
            //$rootScope.infofenster ";




/*
            "vp12": {
                "fID": "fp11",
                    "titel": "Mein Wunschfilm",
                    "start": "20170608",
                    "bc": "bc-00",
                    "col": "col1",
                    "wfID": "vp12",
                    "laufzeit": 1
            }
            */

            $rootScope.infofenster = 'FfK ';
        };




        // die neue und chicke :-) diese nehmen!
        // ändert ringBuchungen nach {}
        // fbid als appendix wie 1 {buchungsChanges} die änderungen
        // TODO REST anbindung
        this.changeRingBuchung = function( fBID, buchungsChanges ) {
            console.log("changeRingBuchung " + fBID );
            fBID = "fBID"+fBID;
            Object.keys(buchungsChanges).forEach(function (key) {
                $rootScope.ringBuchungen[fBID][key] = buchungsChanges[key];
            });
        }

        // die neue und chicke :-) diese nehmen!
        //    row(int) col wie col1 film wie f1; {filmlaufChanges}, die Änderungen
        this.changeFilmlauf = function( rowIdx, col, film, filmlaufChanges ) {
            console.log("changeFilmlauf in row " + rowIdx + " " + col +" auf Film "+ film );
            var ziel = $rootScope.filmlauf[rowIdx][col][film];
            Object.keys(filmlaufChanges).forEach(function (key) {
                ziel[key] = filmlaufChanges[key];
            });
        }






        // speicher objekt unter name
        // nicht verwendet wäre zum internen speichern

        this.speicherLokal = function (name, objekt) {
            console.log("* FfkUtils.speicherLokal '" + name + "' was da ist" +JSON.stringify(objekt));
            localStorage.setItem(name, JSON.stringify( objekt));


        };

        // lade ein Objekt
        this.ladeLokal = function (name) {
            console.log("* FfkUtils.ladeLokal '" + name + "'");
            var ret = JSON.parse(localStorage.getItem(name));
            $log.info(JSON.stringify(ret, 0, 0))
            return ret;
        }


        this.sortiereUsers = function () {
            // sortiere user nach Name (Alphabetisch)
            //
            // packe [ "uid", "logName", "role", "ref", "name" ]
            $rootScope.usersSortiert = [];
            var keys = Object.keys($rootScope.users);
            keys.forEach(function (uid) {
                $rootScope.usersSortiert.push([uid, $rootScope.users[uid]['logName'],
                    $rootScope.users[uid]['role'], $rootScope.users[uid]['ref'],
                    $rootScope.users[uid]['name']]);
            });
            // sortiere nach name in Array
            // a[0] is uid (userID)
            // a[4] ist der name (sortiert nach name)
            $rootScope.usersSortiert = $rootScope.usersSortiert.sort(function (a, b) {
                if (a[4] > b[4]) {
                    return 1;
                }
                if (a[4] < b[4]) {
                    return -1;
                }
                return 0;
            });
        }

        this.sortiereSpielorte = function (){
            // sortiere Spieorte nach Ort (Alphabetisch)
            //
            // packe key und Ort in Array
            $rootScope.spielorteSortiert = [];
            var keys = Object.keys($rootScope.spielorte);
            keys.forEach(function(sid) {
                $rootScope.spielorteSortiert.push([ sid, $rootScope.spielorte[sid]['ort'] ]);
            });
            // sortiere nach Ort in Array
            // a[0] is sid (spielOrtID)
            // a[1] ist der Ort (sortiert nach Ort)
            $rootScope.spielorteSortiert = $rootScope.spielorteSortiert.sort(function(a, b) {
                if (a[1] > b[1]) {
                    return 1;
                }
                if (a[1] < b[1]) {
                    return -1;
                }
                return 0;
            });
            // Spieorte ist nun vorbereitet
            console.log( " Spielorte sortiert: "
                + Object.keys($rootScope.spielorteSortiert).length);
            // console.log(JSON.stringify($rootScope.spielorteSortiert, 0, 4));
        }

        this.sortiereVerleiher = function() {
            // sortiere verleiher nach kurzbezeichnung (Alphabetisch)
            //
            // packe key und Ort in Array
            $rootScope.verleiherSortiert = [];
            var keys = Object.keys($rootScope.verleiher);
            keys.forEach(function (vid) {
                $rootScope.verleiherSortiert.push([vid, $rootScope.verleiher[vid]['kurz']]);
            });
            // sortiere nach Ort in Array
            // a[0] is sid (spielOrtID)
            // a[1] ist der Ort (sortiert nach Ort)
            $rootScope.verleiherSortiert = $rootScope.verleiherSortiert.sort(function (a, b) {
                if (a[1] > b[1]) {
                    return 1;
                }
                if (a[1] < b[1]) {
                    return -1;
                }
                return 0;
            });
        };



        // änder  in usersSortiert
        // suche uid
        this.changeUsersSortiert = function(uid, logName, role, ref, name  ) {

            $rootScope.usersSortiert.some(function (ar) {
                $log.debug("änder usersSortiert");
                // wenn gefunden, ändere
                // [ "uid", "logName", "role", "id", "name" ]
                if (ar[0] == uid) {
                    ar[1] = logName;
                    ar[2] = role;
                    ar[3] = ref;
                    ar[4] = name;
                    return true;
                }
                return false;

            });
        };

        // für buchungen und Wünsche
        // checke in Filmlauf wieviele cols für col oder col?w existieren
        // apendix "" für VerleihBuchung oder w VerleihWunsch
        this.getNextColInFilmRowBuchung = function( row ){
            var colint = 1;
            while (true) {
                if (row["col" + colint  ] ){
                    colint +=1;
                } else {
                    break;
                }
            }
        return colint;
        };

        // wird vermutlich nicht mehr benötigt da col nun idx.length
        this.getNextColInFilmRowWunsch = function( row ){
            var colint = 1;
            while (true) {
                if (row["col" + colint +'w' ] ){
                    colint +=1;
                } else {
                    break;
                }
            }
            return colint;
        };
      // DOKU
      // setze Verleihbuchungen in den Filmlauf
      // buchungsart: für buchung 1; für wunsch 2,
      // [  0  ,       [1],       [2] ]
      // [Spalte 1],[Buchungen][Wünsche]
        this.setInFilmlaufVerleihAngelegenheiten = function (buchungen, buchungsart){
            //  erstelle array mit datum und vbid
            var buchungSortiert = [];
            var vBID;
            var spalten; // wieviel Filmspalten sind besetzt
            var idx; // zielindex der Buchung im Filmlauf
            // erstelle array
            for (  vBID in buchungen ){
                buchungSortiert.push( [buchungen[vBID].start, vBID]);
            }
            // sortiere
            buchungSortiert = this.sortList(buchungSortiert , 0);
            // console.log("sortierte buchungen " + JSON.stringify(buchungSortiert));
// START schleife durch Buchungen
            console.log("************** buchungSortiert "+JSON.stringify(buchungSortiert));
            console.log("************** buchungen "+JSON.stringify(buchungen));

            for (var anzahlB = 0; anzahlB < buchungSortiert.length; anzahlB++){ // alle Buchungen einzeln
                console.log("anzahlB "+anzahlB+" buchungSortiert.length "+ buchungSortiert.length);
                idx = this.getFilmlaufIdxVonDatum(buchungSortiert[anzahlB][0]); // Datum der Buchung
                vBID = buchungSortiert[anzahlB][1];
                // in welche spalte soll geschrieben werden
                // wird nur einmalig gesetzt, da nach datum sortiert und nach "hinten" alles frei
                // 1 eintrag im array => array[0] exists => length=1; spalten = 1
                spalten = $rootScope.filmlauf[idx][buchungsart].length ;
                // maximale Spaltenzahl +1 wegend datumsspalte
                if ( $rootScope.filmlaufSpalten < spalten +1 ){
                    $rootScope.filmlaufSpalten = spalten +1 ;
                }
                console.log("$rootScope.filmlaufSpalten "+$rootScope.filmlaufSpalten);

                //einzelne verleihBuchungen oder Wünsche
                // Filmwochen
//console.log("Arbeite auf vBID "+vBID);
                for (var fw = 1; fw <= buchungen[vBID].laufzeit; fw++ ){
//console.log("FW "+fw+" buchungen[vBID].laufzeit "+buchungen[vBID].laufzeit);
                    var spaltenHier = $rootScope.filmlauf[idx][buchungsart].length;
                    // fehlende Spalten ([false] arrays) vor dem eintrag
                    // [ [0] .. ]
                    for (var s = spaltenHier; s < spalten; s++){
                           // fülle mit  [false], falls noch kein array vorhanden
                        $rootScope.filmlauf[idx][buchungsart].push([false ]);
                    }
                    // TODO fw stringfy immer noch nötig? setze var fw eins höher
                    // erstelle wocheneintrag
                    // [background, vBID, filmwoche]  =   [ bc-10, vInt, int ]
                    console.log("+++push "+ vBID)
                    $rootScope.filmlauf[idx][buchungsart].push( [ buchungen[vBID].bc, vBID, fw]) ;


                  //  console.log("datum "+buchungSortiert[i] + " auf idx "+ idx + " in spalte " + spalten);

//tageseintragungen
                    var basis = buchungen[vBID].bc.substring( 0, buchungen[vBID].bc.length -1); // schneide letze zahl ab
                    var endung ;
                    for (var tage = 1 ; tage < 8; tage += 1){ //Farbschema für die Wochentage
                        if ( tage % 2 == 0){ // gerade
                            endung = "2";        //hänge 1 oder 2 ran
                        } else { //ungerade
                            endung = "1";
                        }
                        // fehlende Spalten ([false] arrays) vor dem eintrag
                        for (var i = spaltenHier; i < spalten; i++){
                            // fülle mit  [false], falls noch kein array vorhanden
                            $rootScope.filmlauf[idx+tage][buchungsart].push([false]);
                        }
                        //[background, [fBID,fBID]]
                        //["bc-11"]
                        $rootScope.filmlauf[idx+tage][buchungsart].push([basis+endung,[]]);
                   }
                    // mehr als eine Filmwoche
                    idx += 8; // erhöhe idx um 8
                }
            }
        };

        // DOKO
        // buchungen = $rootScope.ringBuchungen | $rootScope.ringWunsch
        // buchungsart <=  1 = ringBuchung; 2= ringWunsch !
        this.setInFilmlaufRingAngelegenheiten = function( buchungen , buchungsart) {
            console.log("setInFilmlaufRingAngelegenheiten auf array " + buchungsart + " (1=Buchungen/2=Wünsche");
            //console.log("*********** " +JSON.stringify(buchungen))
            //START
            // ringBuchung oder ringWunsch
            var rBID; // key
            var buchung; // value
            var idx; // zielindex der Buchung
            var kwidx;// $rootScope.filmlauf[rowIdx][0][1];
            var vBID;
            var pos; // pos in array des films nach verleiBuchung/Wunsch um die richtige Spalte zu bestimmen
            var spaltenHier; // spalten hier nach ringBuchung Wunsch
            var eintraege;
            // [ [0] .. ]   =  [background, [rBID,rBID]] =   [ bc-11, [rBID,rBID..]]
            // iteriere durch alle buchungen
            for (rBID in buchungen) {
                if (buchungen.hasOwnProperty(rBID)) {
                    buchung = buchungen[rBID];
                    rBID = buchungen[rBID].rBID;
                    console.log("#+ buchung " +JSON.stringify(buchung))
                    console.log("getFilmlaufIdxVonDatum " + buchung.datum);
                    idx = this.getFilmlaufIdxVonDatum(buchung.datum) + 1;//+1 für letzte KW Zeile
                    eintraege = 1;
                    console.log("### idx" +idx);
                    // um die buchungen zu finden idx - spieltag
                    kwidx = idx - $rootScope.filmlauf[idx][0][1];
                    console.log("### kwidx" +kwidx);
                    vBID = buchung.vBID;
                    // [background, [rBID,rBID]]

                    for ( var j = 0; j < $rootScope.filmlauf[kwidx][buchungsart].length; j ++){
                        if ( vBID == $rootScope.filmlauf[kwidx][buchungsart][j][1] ){
                            pos = j;
                            break;
                        }
                    }
                    //   [ ["bc-11", [rBID]]    , [ "bc-22", [rBID]] .. ]
                    spaltenHier = $rootScope.filmlauf[idx][buchungsart].length;
                    // fehlende Spalten ([false] arrays) vor dem eintrag
                    for (var i = spaltenHier; i <= pos  ; i++) {
                        $rootScope.filmlauf[idx][buchungsart].push(["RingAngelegenheit"]);
                    }

                    // speicher ring... im array der Spalte
                    // console.log(pos + " pos " + JSON.stringify( $rootScope.filmlauf[idx][buchungsart]))
                    // pos[0: bc-11, 1:[rBID,rBID..]]
                    console.log("rBID " +rBID );
                    console.log("ring "+JSON.stringify( $rootScope.filmlauf[idx] ))
                    console.log("ring [idx][buchungsart][pos]"+idx+" "+buchungsart+" "+pos);
                    $rootScope.filmlauf[idx][buchungsart][pos][1].push(rBID);
                    // update linien
                    //gibts einen eintrag
                        eintraege = $rootScope.filmlauf[idx][buchungsart][pos][1].length;
                        console.log(JSON.stringify($rootScope.filmlauf[idx][buchungsart]));
                        console.log(" eintraege " + eintraege);

                    if ( $rootScope.filmlauf[idx][0][3] < eintraege ){
                        $rootScope.filmlauf[idx][0][3] = eintraege;
                    }
                    console.log("ring "+JSON.stringify( $rootScope.filmlauf[idx] ))
                }
            }
        }


        //erstelle  Grundtabelle filmlauf
        this.erstelleGrundtabelle = function () {
            $log.info("***** erstelle  grundTabelle");
            // 60 Wochen KW 1 minus 4 Wochen, KW 52 plus 4 Wochen
            // buggy daher 1.Do im Jahr wie folgt rechnen!important
            var ersterDo = moment().isoWeek(30).isoWeekYear(new Date().getFullYear()).isoWeek(1).isoWeekday(4)
                .hour(12);
            // 4 Wochen zurück
            ersterDo = moment(ersterDo).subtract(4, 'weeks');
            console.log("ersterDo in Tabelle" + ersterDo._d);
            // erstelle grundwert für die Programmtabelle
            // dies ist der Zeit Grundwert für idx0(KW) und idx1(Tag)
            $rootScope.ersterDo = moment(ersterDo).hours(12).minutes(0).seconds(0).millisecond(0);
            // erstelle 60 Wochen a 8 einträge
            var datum = ersterDo;
            for (var w = 0; w < 60; w++) {
                var kw = moment(datum).format('YYYY');
                kw = kw + '-W'+ moment(datum).format('ww');
                // [background, kw  , datum, lines in row]
                $rootScope.filmlauf.push([ [ "bc-g0", false, kw,  1], [] , []  ]);
                var tag;
                for (var t = 1; t < 8; t++) {
                    //  [background, kw  , datum, lines in row]
                    // [ "bc-g2", false,  "2016-12-18", 1
                    $rootScope.filmlauf.push([[ "bc-g2", t,  moment(datum).format('YYYY-MM-DD'), 1], [], []  ] );
                    datum = moment(datum).add(1, 'day');
                }
            }

            $rootScope.status.grundTabelleGeladen = true;
            // $rootScope.status.filmlaufGeladen = true;
            console.log("grundTabelleGeladen " + $rootScope.status.grundTabelleGeladen);
        };

        // wie erstelleGrundtabelle, aber keine neuen Berechungen nur array 1 und 2
        this.leereGrundtabelle = function () {
            console.log("leereGrundtabelle");
            for (i=0; i < 480; i++){
                $rootScope.filmlauf[i][1]= [];
                $rootScope.filmlauf[i][2]= [];

            }
        }

        this.erstelleFilmlauf = function(){
            console.log("erstelle Filmlauf");
            if ($rootScope.status.filmlaufGeladen == true) {
                console.log("************** Filmlauf wurde bereits geladen, also wird er nun auch nicht mehr berechnet");
            } else {
                $rootScope.status.erstelleFilmlauf = true; // verhinder, das jetzt noch ein Filmlauf aus einem Datensatz geladen wird.
                // array 1 buchung, 2 wünsche
                console.log("verleihBuchungen");
                this.setInFilmlaufVerleihAngelegenheiten($rootScope.verleihBuchungen, 1);
                console.log("verleihWunsch");
                this.setInFilmlaufVerleihAngelegenheiten($rootScope.verleihWunsch, 2);
                console.log("ringBuchungen");
                this.setInFilmlaufRingAngelegenheiten($rootScope.ringBuchungen, 1);
                console.log("ringWünsche ");
               // console.log(JSON.stringify($rootScope.ringWunsch));
                this.setInFilmlaufRingAngelegenheiten($rootScope.ringWunsch, 2);


                $rootScope.status.filmlaufGeladen = true;
            }
        };



    });

