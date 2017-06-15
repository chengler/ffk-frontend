/*
Das Modul dient dem Rendern der ag-grid Tabelle auf Grundlage der $rootScope.filmlauf Variablen.
Aufgerufen werden die 2 funktionen vom programmCtrl.js
 this.datumsRenderer = function datumsRenderer(params) {
 this.buchungsRenderer = function buchungsRenderer(params, zeigeWunschFilme) {

params beinhaltet die Informationen des aktuellen aufrufes, wobei
params.data der jeweiligen Reihe aus dem Array (params.rowIndex) aus der $rootScope.filmlauf Variablen entspricht.

der Header muss "Film"+int lauten, da über params.colDef.headerName.substr(4); die jeweilige Filmspalte abgefragt wird.
 */
angular
    .module('programmTabellenRenderer', [ 'ui.bootstrap', 'ffkUtils' ])
    .constant('MODULE_VERSION', '0.0.1')
    .service(
        'RenderProgrammTableServices',
        function($rootScope, $log, FfkUtils) {
           /*
             render Datum
             Rendert die Spalte 1 der Tabelle
             */
            this.datumsRenderer = function datumsRenderer(params) {

                // $log.debug("ffkTableModul <- RenderTableServices <-
                // datumsRenderer");
               // console.log(params);
                var datumsClass = " class='ok pointer' ";
                var rowIdx = params.rowIndex;
                // [ 0, 1, 2, 3 ] =[background, spieltag  , datum, lines in row]
                var tag = params.data[0][2]; // Render aus ISO
                var titel; // der link Title mouseover
                var sign; // clickbares zeichen
                var directive; // bei click
                var myReturn = "";

                //  Spalte 1 für spieler und admin
                if ( $rootScope.logedInUser.role != "verleih") {
                    // Tag ringÜbersicht
                    if ( params.data[0][1] ) { //SPIELTAG 1-7
                        tag = moment(tag).format('DD.MM. dd');
                        titel = " title='Filminfos anzeigen, Film buchen oder Wunschfilm hinzufügen.' ";
                        sign = "<strong>&oplus; </strong>";
                        directive = " ng-click='openModalFilm(" + rowIdx + ")' ";
                        myReturn = "<span " + titel + datumsClass + directive + ">" + sign + "</span>" + tag;

                        // kw verleiÜbersicht
                    } else  {
                        tag = tag.substr(6, 2) + " KW " + tag.substr(2, 2);
                        titel = " title='Filmlauf oder Wunschfilm hinzufügen.'";
                        sign = '<strong>&plus;  </strong>';
                        directive = " ng-click='openModalFilm(" + rowIdx + ")' ";
                        myReturn = "<span " + titel + datumsClass + directive + ">" + sign + "</span>" + tag;
                    }
                    // if != verleih
                    // Rückgabe wenn verleih
                } else if (params.data[0][1]) { //SPIELTAG 1-7
                    tag = moment(tag).format('DD.MM. dd');
                    myReturn = "<span " + datumsClass + "></span>" + tag;


                } else {
                    tag = tag.substr(6, 2) + " KW " + tag.substr(2, 2);
                    myReturn = "<span " + datumsClass + "></span>" + tag;
                }
                // $log.debug("return datumsRenderer " + myReturn);
                return myReturn;

            }; // end render Datum
            /*
             buchungsRenderer
             Enthählt folgende Funktionen, welche die FilmSpalten der Programmtabelle  rendern.
             START RENDER, nach den Funktionen nutzt diese und gibt die formatierte Zelle zurück

             wochenBuchung
             verleihBuchungLang() Infos zur Verleihbuchung in der KW Zeile: Lange Standard Anzeige

             wochenBuchungKurz
             verleihBuchungKurz() Infos zur Verleihbuchung in der KW Zeile: kurze Wunschfilm Anzeige

             wochenBuchungWunsch
             verleihWunschStandard() Infos zur Verleihbuchung in der KW Zeile:kurze Wunschfilm Anzeige

             tagesBuchungLang
             ringBuchungLang() Infos zur Ringbuchung in der Datumszeile: lange Film Anzeige
             Die übliche Anzeige in der Programmtabelle

             tagesBuchungenKurz
             ringBuchungKurz() Infos zur Ringbuchung in der Datumszeile: kurze Wunschfilm Anzeige
             filmlaufBuchung:   [background, [fBID,fBID]]

             tagesBuchungVerleih
             ringBuchungVerleih() Infos zur Ringbuchung in der Datumszeile: Verleih Anzeige
             filmlaufBuchung:   [background, [fBID,fBID]]

             wunschFilme
             ringWunschStandard() Infos zu Ringwünschen in der Datumszeile: Standard Anzeige
             filmlaufBuchung:   [background, [fBID,fBID]]

             */
            this.buchungsRenderer = function buchungsRenderer(params, zeigeWunschFilme) {
                console.log("buchungsRenderer");

                //   [0] =  [ 0, 1, 2, 3 ] =[background, spieltag  , datum, lines in row]
                var datum = params.data[0][2];
                var colIdx = params.colDef.headerName.substr(4);
                var arryCol = colIdx-1; // um auf das richtige array [2] oder [3] der Spalte zuzugreifen
                var rowIdx = params.rowIndex;
                // ehemals nur Buchung
                //  [1]    [ [0] .. ]   =  [background, vBID, filmwoche]  =   [ bc-10, vInt, int ]
                //  [1]    [ [0] .. ]   =  [background, [fBID,fBID]] =   [ bc-11, [fBID,fBID..]]
                // var buchung = params.data[col]; // {einzelBuchungObject aus filmlauf}
                var filmlaufBuchung = params.data[arryCol][1];
                var filmlaufWunsch =  params.data[arryCol][2];
                var link = ""; // wenn links gelegt werden

                // Infos zur Verleihbuchung in der KW Zeile
                // Lange Standard Anzeige
                // filmlaufBuchung =  [["bc-10", "vp2", 1]
                function wochenBuchung() {
                    console.log("wochenBuchung verleihBuchungLang() ");

                    console.log("** filmlaufBuchung.length" +JSON.stringify(ilmlaufBuchung.length));
                    if (  filmlaufBuchung.length = 0) { //kein Eintrag
                        return "";
                    }
                    var verleiBuchung = $rootScope.verleihBuchungen[filmlaufBuchung[1]];
                    console.log("** verleiBuchung" +JSON.stringify(verleiBuchung));
                    var medien = "";
                    // wann startet diese KinoW in ms
                    var datumInMs = moment(datum).isoWeekday(4);
                    for ( var key in verleiBuchung.medien) {
                        if (verleiBuchung.medien.hasOwnProperty(key)) {
                            // ab wann ist dieses medium verfügbar
                            console.log("moment : " +verleiBuchung.medien[key])
                            var medienStart = moment(verleiBuchung.medien[key]);
                            // console.log("datumInMs "+ datumInMs);
                            // console.log("ab "+
                            // moment(wochenBuchung.medien[key]));
                            if (medien.length > 0) {
                                medien = medien + "// ";
                            }
                            if (medienStart > datumInMs) {
                                medien = medien + key + " ab " + moment(medienStart).format('DD.MM. ');
                            } else {
                                medien = medien + key + " ";
                            }

                        }
                    }
                    var wochenBesucher 	= "";
                    // Besucherzahlen in der Filmwoche
                    // filmlaufBuchung
                    // [background, vBID, filmwoche]
                     var myfw = "fw"+filmlaufBuchung[2];
                        if (myfw in verleiBuchung) {
                            var besucher = " <span class='glyphicon glyphicon-user'>"
                                + verleiBuchung[myfw][0] + " </span>"
                            var eintritt = "<span class='glyphicon glyphicon-euro'>"
                                + (verleiBuchung[myfw][1] / 100).toFixed(2) + "</span>"
                            wochenBesucher = " (Filmwoche"+ filmlaufBuchung[2]+": " + besucher + eintritt+")";
                        }


                    // wochenBuchung.medien.forEach(function(medium) {
                    // medien = medien + medium + " ";
                    // });
                    var link = ""; // bearbeitungslink für filmwoche
                    if ( $rootScope.logedInUser.role == "admin"){
                        link = "<span title='Diesen Filmlauf bearbeiten' "
                            + "class='glyphicon glyphicon-edit pointer' ng-click='openModalKW(" + rowIdx + ","
                            + colIdx + ")' >" + "</span> ";
                    }
                    var filmLink = ""; // der link um den film anzuzeigen
                    filmLink = "<span title='Filminfos anzeigen' "
                        + "class='pointer' ng-click='openModalFilm(" + rowIdx + "," + colIdx + ")' >" + verleiBuchung.titel + "</span> ";

                    return  link + filmLink + " ( " + medien + ")" + wochenBesucher;
                }

                // Infos zur Verleihbuchung in der KW Zeile
                // kurze Wunschfilm Anzeige
                // filmlaufWunsch =  [["bc-10", "vp2", 1]
                function wochenBuchungKurz() {
                    console.log("wochenBuchungKurz verleihBuchungKurz() ");
                    // nur wenn vorhanden
                    if (filmlaufWunsch.length = 0) {
                        return "";
                    }
                    var verleiWunsch = $rootScope.verleihWunsch[filmlaufWunsch[1]];
                    return wochenBuchung.titel;
                }



                /*
                 verleihWunschStandard() Infos zur Verleihbuchung in der KW Zeile:kurze Wunschfilm Anzeige
                filmlaufWunsch :  [background, vBID, filmwoche]
                */
                function wochenBuchungWunsch() {
                    console.log("wochenBuchungWunsch verleihWunschStandard ");
                    var result;
                    if (filmlaufWunsch.length = 0) {
                        return "";
                    }
                    var verleihWunsch = $rootScope.verleihWunsch[filmlaufWunsch[1]];
                    result = verleihWunsch['titel'];
                    var bc = verleihWunsch['bc'];
                    // wrapper für Wunschfilme
                    if ( $rootScope.logedInUser.role == "admin"){
                        result = "<span ng-click='openModalKW("+ rowIdx	+ "," + colIdx + ", 1 )' title='Diesen Wunsch bearbeiten' class=' "
                                + bc + " label glyphicon glyphicon-edit pointer' style = ' opacity:1; z-index: 2; float: right; color: black;'> "
                                + result + "</span>";
                        } else {
                        result = "<span title='Diesen Wunsch bearbeiten' class=' "	+ bc + " label' style = ' opacity:1; z-index: 2; float: right; color: black;'> "
                                + result + "</span>";
                        }
                    return result;
                }
                /*
                 tagesBuchungLang
                 ringBuchungLang() Infos zur Ringbuchung in der Datumszeile: lange Film Anzeige
                 Die übliche Anzeige in der Programmtabelle
                */
                function tagesBuchungLang() {
                    console.log("tagesBuchungLang ringBuchungLang ");

                    var myReturn = ""; // alle EinzelverleihBuchungen
                    var fBID;
                    var ringBuchung;
                    var verleihBuchung;
                    for (var i = 0; i < filmlaufBuchung[1].length; i++) {
                        fBID = filmlaufBuchung[1][i];
                        ringBuchung = $rootScope.ringBuchungen[fBID];
                        console.log("aktuelle ringBuchung: "+ JSON.stringify(ringBuchung));
                        var filmOrt = $rootScope.spielorte[ringBuchung.sid]["ort"]; // sid
                        verleihBuchung = $rootScope.verleihBuchungen[ringBuchung.vBID];
                        // für links
                        var sourceIndex = " " + rowIdx + " " + col + " " + i + 1;
                        // die zwei Checks
                        // belege check1 und check2
                        var check = [ "" ];
                        for (var i = 1; i <= 2; i++) {
                            if (ringBuchung["check" + i]) { check.push("<span title='schalte bei Klick um.' " +
                                "class='ok pointer'  flipOnClick click='handleFlip' id='check"
                                        + i + sourceIndex + "' > &#10003; </span>");
                            } else {
                                check.push("<span title='schalte bei Klick um.'" +
                                    " class='notOK pointer' flipOnClick click='handleFlip' id='check"
                                        + i + sourceIndex + "' > &#10008; </span>");
                            }
                        }
                        // Medium, von und nach
                        var medium;
                        var von = " ";
                        var nach = "";
                        // wenn Medium vorhandenauch filmVon vorhanden?
                        if (ringBuchung.medienID) {
                            medium = "<span  class = ' ok' >" + ringBuchung.medium
                                + ringBuchung.medienID + " </span>";
                            var filmVon = $rootScope.spielorte[ringBuchung.vonID]["ort"];
                            von = "<span class='ok'> " + filmVon + "↝ </span>";
                            // wenn NACH bereits vergeben
                            if (ringBuchung.nachID) {
                                var filmNach = $rootScope.spielorte[ringBuchung.nachID]["ort"];
                                nach = "<span class='ok '>↝" + filmNach + " </span>";
                                // sonst draggable NACH (von wo wirdgezogen
                            } else {
                                medium = ringBuchung.medium + ringBuchung.medienID + " ";
                                nach = "<span title='Film weiterleiten: ziehe den Filme auf ein rotes Filmsymbol' " +
                                    "class='grabbing draggable glyphicon glyphicon-film' id='"
                                    + verleihBuchung + sourceIndex + "'  draggable>↴ </span>";
                            }
                                                      // kein Medium vorhanden:
                            // droppable aufs Medium
                        } else {
                            medium = ringBuchung.medium
                                + " <span title='Filmmedium benötigt!  Auf dieses Feld kann ein passendes gelbes " +
                                "Filmsymbol gezogen werden' class='notOK glyphicon glyphicon-film' id='"+
                                verleihBuchung + sourceIndex + "' droppable drop='handleDrop'> ← ↵ </span>";
                        }
                        if ( $rootScope.logedInUser.sid == ringBuchung.ortID || $rootScope.logedInUser.role == "admin" ){
                            myReturn = myReturn + "<span class=' pointer' ng-click='openModalBuchung(" + rowIdx + ","
                                + colIdx + ","+ fmax + ")' >" + "<small>" + filmBID + "</small> " + filmOrt + "</span>"
                                + check[1] + check[2] + von + medium + nach ;
                        } else {
                            myReturn = myReturn + "<small>" + filmBID + "</small> " + filmOrt + check[1] + check[2] +
                                von + medium + nach ;
                        }
                        if (ringBuchung.garantie) { // übernimmt mindestgarantie
                            myReturn += "<span class='glyphicon glyphicon-star'></span>";
                        }
                        // Bei false zeige fehlende Besucherzahlen, ansonsten zeige Besucherzahlen
                        if ( "besucher" in ringBuchung ) {
                            if ( ringBuchung.besucher == false || ringBuchung.besucher == undefined){
                                myReturn = myReturn + " Besucherzahlen fehlen!";
                            } else {
                                var arrayLength = ringBuchung.besucher.length;
                                for (var i = 0; i < arrayLength; i++) {
                                    var besucher  = ringBuchung.besucher[i][0];
                                    // formatiere cent zu euro
                                    var eur = (ringBuchung.besucher[i][1] / 100).toFixed(2);
                                    myReturn = myReturn + " //" + besucher +"a"+ eur +"€";
                                }
                            }
                        }
                        myReturn = myReturn + "<br />";
                    }
                    // end for filme
                    return myReturn;
                } // end tagesBuchunglang


                /*
                 tagesBuchungenKurz
                 ringBuchungKurz() Infos zur Ringbuchung in der Datumszeile: kurze Wunschfilm Anzeige
                 filmlaufBuchung:   [background, [fBID,fBID]]
                 */
                function tagesBuchungenKurz() {
                    console.log("tagesBuchungenKurz ringBuchungKurz ");

                    var myReturn = ""; // alle EinzelverleihBuchungen
                    var ringBuchung;
                    var fBID;
                    var filmOrt;

                    var fmax = 1;
                    var filmnr = 'f' + fmax;
                    var aktuelleBuchung;
                    // loop durch alle Filme
                    for ( i = 0; i < filmlaufBuchung[1].length; i++) {
                        fBID = filmlaufBuchung[1][i];
                        ringBuchung = $rootScope.ringBuchungen[fBID];
                        //console.log("ringBuchung "+JSON.stringify(aktuelleBuchung));
                        filmOrt =  $rootScope.spielorte[ringBuchung.sid]["ort"];
                        myReturn = myReturn + "<small>" + filmBID + "</small> " + filmOrt + "<br />";
                    }
                   // myReturn = myReturn + "tagesBuchungenKurz";
                    return myReturn;
                } // end tagesBuchungenKurz

                /*
                 tagesBuchungVerleih
                 ringBuchungVerleih() Infos zur Ringbuchung in der Datumszeile: Verleih Anzeige
                 filmlaufBuchung:   [background, [fBID,fBID]]
                 */
                function tagesBuchungVerleih() {
                    console.log("tagesBuchungenKurz ringBuchungVerleih ");

                    var myReturn = ""; // alle EinzelverleihBuchungen
                    var fBID;
                    var ringBuchung;
                    var filmOrt;
                    // ein film mit "f1" "f2" ...
                    for ( i = 0; i < filmlaufBuchung[1].length; i++) {
                        fBID = filmlaufBuchung[1][i];
                        ringBuchung = $rootScope.ringBuchungen[fBID];
                        filmOrt = $rootScope.spielorte[ringBuchung.sid]["ort"]; // sid
                        myReturn = myReturn + filmOrt;
                        // Ort gesetzt und nun zu den Zahlen
                        // ZAhlen
                        if ( "besucher" in ringBuchung ) {
                            if ( ringBuchung.besucher == false || ringBuchung.besucher == undefined){
                                myReturn = myReturn + "<small> Besucherzahlen fehlen!</small>";
                            } else {
                                var arrayLength = ringBuchung.besucher.length;
                                for (var i = 0; i < arrayLength; i++) {
                                    var besucher  = ringBuchung.besucher[i][0];
                                    // formatiere cent zu euro
                                    var eur = (ringBuchung.besucher[i][1] / 100).toFixed(2);
                                    myReturn = myReturn + " //" + besucher +"a"+ eur +"€";
                                }
                            }
                        }
                        // beende diesen Ort
                        myReturn = myReturn + "<br />";
                    }
                    // end while
                    return myReturn;
                }
                /*
                 wunschFilme
                 ringWunschStandard() Infos zu Ringwünschen in der Datumszeile: Standard Anzeige
                 filmlaufBuchung:   [background, [fBID,fBID]]
                 */
                function wunschFilme() {
                    console.log("wunschFilme ringWunschStandard ");

                    var result = ""; // return "" wenn kein
                    var fBID;
                    var ringWunsch;
                    var bc;
                    // Anzahl Wunschfilme für tag und
                    for ( i = 0; i < filmlaufBuchung[1].length; i++) {
                        bc = filmlaufBuchung.bc;
                        fBID = filmlaufBuchung[1][i];
                        ringWunsch = $rootScope.ringWunsch[fBID];
                            result = result + "<span class='label " + bc + "' style =  'color: black;'>"
                                + $rootScope.spielorte[ringWunsch.sid].ort + "</span> ";
                       // wrapper für Wunschfilme
                        result = "<span style = ' opacity:1; z-index: 2; float: right;'>" + result + "</span>";
                    }
                    return result;
                } // end wunschfilme

/*
                wochenBuchung
                verleihBuchungLang() Infos zur Verleihbuchung in der KW Zeile: Lange Standard Anzeige

                wochenBuchungKurz
                verleihBuchungKurz() Infos zur Verleihbuchung in der KW Zeile: kurze Wunschfilm Anzeige

                wochenBuchungWunsch
                verleihWunschStandard() Infos zur Verleihbuchung in der KW Zeile:kurze Wunschfilm Anzeige

                tagesBuchungLang
                ringBuchungLang() Infos zur Ringbuchung in der Datumszeile: lange Film Anzeige
                Die übliche Anzeige in der Programmtabelle

                tagesBuchungenKurz
                ringBuchungKurz() Infos zur Ringbuchung in der Datumszeile: kurze Wunschfilm Anzeige
                filmlaufBuchung:   [background, [fBID,fBID]]

                tagesBuchungVerleih
                ringBuchungVerleih() Infos zur Ringbuchung in der Datumszeile: Verleih Anzeige
                filmlaufBuchung:   [background, [fBID,fBID]]

                wunschFilme
                ringWunschStandard() Infos zu Ringwünschen in der Datumszeile: Standard Anzeige
                filmlaufBuchung:   [background, [fBID,fBID]]

  */

                /*
                 START RENDER
                 */
                // gibt es einen Eintrag für diese Spalte in Reihe
                if (typeof buchung != 'undefined') {
                    //
                    // WOCHENbuchung (KW Zeilen)
                    if ('vBID' in buchung) {
                        if (zeigeWunschFilme) {
                            return "<span style = 'position:absolute; z-index: 1; opacity:0.3;'> "
                                + wochenBuchungKurz() + "</span>"
                                + "<span style = ' opacity:1; z-index: 2; float: right;'>"
                                + wochenBuchungWunsch() + "</span>";

                        } else {
                            return wochenBuchung();
                        }
                        ;
                        //
                        // Tagesbuchung (die Zeilen mit Datum)
                    } else if ( $rootScope.logedInUser.role != "verleih") {
                        // mit Wunschfilmen
                        if (zeigeWunschFilme) {
                            return "<span style = 'position:absolute; z-index: 1; opacity:0.3;'> "
                                + tagesBuchungenKurz() + "</span>"
                                + "<span style = ' opacity:1; z-index: 2; float: right;'>" + wunschFilme()
                                + "</span>";
                        } else {
                            // ohne Wunschfilme
                            return tagesBuchungLang();
                        }
                        // Tagesbuchungsanzeige für Verleih, Buchung und Geld
                    } else {
                        return tagesBuchungVerleih();

                    }
                } else { // kein eintrag in Spalte dieser Reihe
                    // $log.debug("Kein Eintrag für Reihe - Spalte " +
                    // rowIdx + " - " + col);
                    return "";
                } // END Render

            }; // END buchungsRenderer
        }); // End Service
