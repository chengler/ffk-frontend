angular.module('ffkUtils', []).constant('MODULE_VERSION', '0.0.1').service(
    'FfkUtils',
    function ($log, $rootScope, $http) {
        // bekommt Datum -> gibt KW Info Zeile
        // erwartet Datum im Format 20160114
        // return:  row Index der KW Info Zeile
        this.getKinoWochenRowIdx = function (rowIdx, datum) {
            // $log.debug('getKinoWochenRowIdx: rowIdx: ' + rowIdx + ",
            // datum: " +
            // datum);
            if (datum == undefined) {
                datum = $rootScope.filmlauf[rowIdx].datum;
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
            var mySet = {
                "fBID": this.getNewProvID(""),
                "check1": false,
                "check2": false,
                "ortID": sid,
                "medium": medium,
                "medienID": false,
                "vonID": false,
                "nachID": false,
                "garantie": garantie
            };
            console.log("mySet = " + mySet);
            buchungsTag[col]['f' + fnext] = mySet;
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
                    console.log("idx " + idx + " col " + col);
                    console.log("filmlauf[idx][col] " + JSON.stringify(filmlauf[idx][col]));
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
        // gebe bezeichung zu einer id zurück
        // hole namen von id = sid | vid | uid
        // id muss in sortetList[0] stehen
        // der rückgabewert ist sortetList[retpos]
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



        // zum laden von Datensatz wie gespeichert unter "Übersicht"
        // dient zur initialladung der Grundinformationen
        this.loadAllesAusserFilme = function(fileContent){
         console.log("lade alles ausser Filme. ");
         console.log(fileContent);

                fileContent =  JSON.parse(fileContent);
                for ( var key in fileContent ){
                    console.log("lade "+ key);
                    $rootScope[key] = fileContent[key];
                    // console.log($scope[objektname]);
                    switch(key) {
                        case 'users':
                            // wenn Objekt 'users' geladen wurde erstelle und sortiere usersSortiert
                            this.sortiereUsers();
                            break;
                        case 'spielorte':
                            this.sortiereSpielorte();
                            break;
                        case 'verleiher':
                            this.sortiereVerleiher();
                            break;
                        case 'filme':
                            // unklar was zu ändern ist.wird durch PCtrl geändert
                            this.loadFilme();
                            break;
                        case 'buchungen':
                            break;
                        case 'filmlauf':
                            $rootScope.status.filmlaufGeladen = true;
                            break;
                    }
                }

        };

        this.loadDatei = function(dateiname){
            console.log("$http.get("+dateiname+"?");
            var fileContent = {}
            $http.get(dateiname + '?' + Math.random()).then(
                function (data) {
                    console.log("*************************");
                    console.log(data);
                    fileContent=data.data;
                    console.log(fileContent);
                    $rootScope.status.loadDatei=true;
                    return fileContent;
                });
        }



        this.loadBuchungen = function () {
            $log.info("lade buchungen");
            $http.get('../example_data//JSONbuchungen.js?' + Math.random()).success(
                function (data) {
                    $rootScope.buchungen = data[0];
                    $rootScope.status.buchungenGeladen = true;
                    console.log("buchungenGeladen " + $rootScope.status.buchungenGeladen);
                    console.log(Date.now() + " JSONbuchungen: " + Object.keys($rootScope.buchungen).length
                        + " Buchungen geladen");
                    // $log.debug(" buchung : " +
                    // JSON.stringify($rootScope.buchungen, null,
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
            $log.info("getLeihbar datum = " + datum + ", Buchung = " + JSON.stringify(buchung, 0, 0));
            var leihbar = [];
            for (var key in buchung) {
                if (buchung.hasOwnProperty(key)) {
                    // filmmedium ist buchbar an diesem Tag
                    if (buchung[key] <= datum) {
                        leihbar.push(key);
                    }
                }
            }
            $log.info("leihbar ist " + leihbar);
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
            $log.info("* FfkUtils.setInFilmlauf rowIdx: " + rowIdx + "colIdx: " + colIdx + " params: " + JSON.stringify(params, 0, 0));
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
                if (params.colIdx == undefined) {
                    $log.warn(" zum anlegen eines Wunsches in einer Buchung mus param.colIdx definiert sein!");
                }
                if ($rootScope.buchungen.wuensche == undefined) {
                    $rootScope.buchungen['wuensche'] = {};
                }
                if ($rootScope.buchungen.wuensche[params.vBID] == undefined) {
                    $rootScope.buchungen.wuensche[params.vBID] = {};
                }
                mybuchung = $rootScope.buchungen.wuensche[params.vBID];
                mybuchung['bc'] = params.bc;
                mybuchung['col'] = 'col' + params.colIdx;
                mybuchung['wfID'] = params.vBID;
            } else {
                if ($rootScope.buchungen[params.vBID] == undefined) {
                    $rootScope.buchungen[params.vBID] = {};
                }
                mybuchung = $rootScope.buchungen[params.vBID];
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
            var colIdx = this.getFirstFreeCol(programmCtrlScope, $rootScope.filmlauf[wochenBuchungenIDX], "wunsch", 1, wfID);
            this.setWochenBuchungInFilmlauf(wochenBuchungenIDX, colIdx, {"fID": fID, "vBID": wfID, "colSuffix": "w"});
            this.setBuchungInBuchungen({"wunsch": true, "vBID": wfID, "fID": fID, "titel": filmChanges.titel});

            programmCtrlScope.gridOptions.api.setRowData($rootScope.filmlauf);
        }

        // ein spielort will bei einem Filmwunsch mitspielen
        this.mitspielen = function (col, sid, rowIdx, garantie) {
            if (garantie == undefined) {
                garantie = false;
            }
            var buchungsTag = $rootScope.filmlauf[rowIdx];
            // wenn col eintrag nicht  existiert
            if (!(col in buchungsTag)) {
                buchungsTag[col] = {};
            }
            //  weiterer oder erster wunsch dieses tages
            if (buchungsTag[col + 'w']) {
                buchungsTag[col + 'w']['sids'].push([sid]);
            } else {
                var kwRow = this.getKinoWochenRowIdx(rowIdx);
                var bc = $rootScope.filmlauf[kwRow][col + 'w']['bc'];
                // "col1w":{"bc":"bc-40","sids":[["sid2"]]}
                buchungsTag[col + 'w'] = {
                    "bc": bc,
                    "sids": [[sid, garantie]]
                };
            }
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
        console
            .log(Date.now() + " Spielorte sortiert: "
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

        this.aenderTitelInBuchung = function(fID ){
            console.log("this.aenderTitelInBuchung von "+fID);
            for (var key in $rootScope.buchungen) {
                // skip loop if the property is from prototype
                if (!$rootScope.buchungen.hasOwnProperty(key)) continue;
                var obj = $rootScope.buchungen[key];
                for (var prop in obj) {
                    // skip loop if the property is from prototype
                    if(!obj.hasOwnProperty(prop)) continue;
                    if (prop == fID){
                        obj['titel'] = $rootScope.filme[fID]['titel']
                    }

                }
            }


        }


    });

