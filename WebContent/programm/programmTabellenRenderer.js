/*
Das Modul dient dem Rendern der ag-grid Tabelle auf Grundlage der $rootScope.filmlauf Variablen.
Aufgerufen werden die 3funktionen vom programmCtrl.js

 this.cellClassRenderer = function cellClassRenderer(params){ Hintergrundfarbe
 this.datumsRenderer    = function datumsRenderer(params) { Inhalt Spalte 1
 this.buchungsRenderer  = function buchungsRenderer(params, zeigeWunschFilme) { Inhalt Splate >1

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
             Holt aus demm Array[1] des $rootScopefilmlauf
             aus der jeweiligen Spalte
             array[0], die bc (backgroundcolor)
             [1] = [["bc-10", "vp2", 1], ["bc-20"..        ]

             */
             this.cellClassRenderer = function cellClassRenderer(params){
             var result = "";
             var arryIdx = params.colDef.headerName.substr(4) -1 ;
             // params.data[1] = [["bc-10", "vp2", 1], ["bc-20" oder []
             // console.log("-- arryIdx " + arryIdx + " params.data  " + JSON.stringify(params.data));
             // console.log(params.data[1][arryIdx]);

                if ( params.data[1][arryIdx] != undefined) { //es gibt eintrag
                     result = params.data[1][arryIdx][0]; // hole bc
                    }
                return result;
            };

           /*
             render Datum
             Rendert die Spalte 1 der Tabelle
             */
            this.datumsRenderer = function datumsRenderer(params) {

                // $log.debug("ffkTableModul <- RenderTableServices <-
                // datumsRenderer");
               // console.log(params);
                var datumsClass = " class='ok glyphicon glyphicon-edit pointer' ";
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
                       // sign = "<strong>&oplus; </strong>";
                        directive = " ng-click='openModalFilmWoche(" + rowIdx + ")' ";
                      //  myReturn = "<span " + titel + datumsClass + directive + ">" + "" + tag + "</span>";
                        myReturn = "<span "  + titel + directive + ">"
                                       + "<span "  +datumsClass + ">" +" " +"</span>"
                                       + "<span>" + tag  +"</span>"
                                 +"</span>";


                        // kw verleiÜbersicht
                    } else  {
                        tag = tag.substr(6, 2) + " KW " + tag.substr(2, 2);
                       // titel = " title='Filmlauf oder Wunschfilm hinzufügen.'";
                       // sign = '<strong>&plus;  </strong>';
                       // directive = " ng-click='openModalFilmWoche(" + rowIdx + ")' ";
                       // myReturn = "<span " + titel + datumsClass + directive + ">" + sign + "</span>" + tag;
                        myReturn = "<span>" + tag + "</span>";
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
             buchungsRenderer(params, zeigeWunschFilme)
             Enthählt folgende Funktionen, welche die FilmSpalten der Programmtabelle  rendern.
             params beinhaltet die Informationen des aktuellen aufrufes, wobei
             params.data der jeweiligen Reihe aus dem Array (params.rowIndex)  der $rootScope.filmlauf Variablen .
             zeigeWunschFilme true/false
             var filmlaufBuchung = params.data[colIdx][1];
             var filmlaufWunsch    enthalten immer den aktuellenEintrag aus dem filmlauf

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
                var datum = params.data[0][2]; // datum des eintrags film oder KW
                var heute = new Date().setHours(12); // zeitverschiebungen ausschließen
                var colIdx = params.colDef.headerName.substr(4);
                var arryCol = colIdx-1; // um auf das richtige array [2] oder [3] der Spalte zuzugreifen
                var rowIdx = params.rowIndex;
                // ehemals nur Buchung
                //  [1]    [ [0] .. ]   =  [background, vBID, filmwoche]  =   [ bc-10, vInt, int ]
                //  [1]    [ [0] .. ]   =  [background, [fBID,fBID]] =   [ bc-11, [fBID,fBID..]]
                // var buchung = params.data[col]; // {einzelBuchungObject aus filmlauf}
                var filmlaufBuchung = params.data[1][arryCol];
                if (filmlaufBuchung == undefined ) { // keinerlei Buchungen
                    filmlaufBuchung =  false;
                }else if (filmlaufBuchung[0] == false){// eine leerspalte, weil in späterer spalte noch was folgt
                    filmlaufBuchung =  false;
                }
                var filmlaufWunsch =  params.data[2][arryCol];
                if (filmlaufWunsch == undefined) {
                    filmlaufWunsch =  false;
                }

                //[0] =  [ 0, 1, 2, 3 ] =[background, spieltag  , datum, lines in row]
                var spieltag = params.data[0][1]; //false oder 1-7
                var link = ""; // wenn links gelegt werden
                var endresult; // der returnwert des renderes an den aufrufer

                // Infos zur Verleihbuchung in der KW Zeile
                // Lange Standard Anzeige
                // filmlaufBuchung =  [["bc-10", "vp2", 1]
                function verleihBuchungLang() {
                   /*
                    console.log("verleihBuchungLang() ");
                    console.log("rowidx " + rowIdx + " arryCol " + arryCol + " params.data  " + JSON.stringify(params.data));
                    console.log("filmlaufBuchung " + JSON.stringify(filmlaufBuchung));
                    console.log("filmlaufWunsch " + JSON.stringify(filmlaufWunsch) );
*/
                    if (  filmlaufBuchung ) { // true = Eintrag
                        var vBID = filmlaufBuchung[1];
                        var verleiBuchung = $rootScope.verleihBuchungen[vBID];
                        //console.log("** verleiBuchung " +JSON.stringify(verleiBuchung));
                        var medien = "";
                        // wann startet diese KinoW in ms
                        var datumInMs = moment(datum).isoWeekday(4);
                        for ( var key in verleiBuchung.medien) {
                            if (verleiBuchung.medien.hasOwnProperty(key)) {
                                // ab wann ist dieses medium verfügbar
                                // console.log("moment : " +verleiBuchung.medien[key])
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
                           // console.log("** medien" +JSON.stringify(medien));
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
                        link = ""; // bearbeitungslink für filmwoche
                        if ( $rootScope.logedInUser.role == "admin"){
                            link = "<span title='Diesen Filmlauf bearbeiten' "
                                + "class='glyphicon glyphicon-edit crosshair' ng-click='openModalVerleihBuchung(" + rowIdx + ",1," + arryCol +")' >" + "</span> ";
                        }
                        var filmLink = ""; // der link um den film anzuzeigen
                        filmLink = "<span title='Filminfos anzeigen' "
                            + "class='pointer' ng-click='openModalFilmWoche(" + rowIdx + "," + colIdx + ")' >" + verleiBuchung.titel + "</span> ";

                        return  link + filmLink + " ( " + medien + ")" + wochenBesucher;
                    } else {
                        return "verleihBuchungLang";
                    }

                }


                /*
                verleihBuchungKurz() Infos zur Verleihbuchung in der KW Zeile: kurze Wunschfilm Anzeige
                 filmlaufWunsch =  [["bc-10", "vp2", 1]
                */
                function verleihBuchungKurz() {
                    var result
              //      console.log("verleihBuchungKurz() ");
                    // nur wenn vorhanden
                    if (filmlaufBuchung == false) {
                        result =  "";
                    } else {
                       // console.log(filmlaufBuchung);
                       // console.log($rootScope.verleihBuchungen[filmlaufBuchung[1]]);
                        result = $rootScope.verleihBuchungen[filmlaufBuchung[1]].titel;
                    }
                    return result;
                }



                /*
                 verleihWunschStandard() Infos zur Verleihbuchung in der KW Zeile:kurze Wunschfilm Anzeige
                 filmlaufWunsch :  [background, vBID, filmwoche]
                */
                function verleihWunschStandard() {
             //       console.log("+ verleihWunschStandard ");
                   // console.log(filmlaufWunsch);
                   // console.log($rootScope.verleihWunsch[filmlaufBuchung[1]]);
                    var result;
                    if (filmlaufWunsch == false) {
                        result = "";
                    } else {

                    var verleihWunsch = $rootScope.verleihWunsch[filmlaufWunsch[1]];
                    var vBID = verleihWunsch.vBID;
                    var titel = verleihWunsch['titel'];
                    var bc = verleihWunsch['bc'];
                    // wrapper für Wunschfilme
                    if ($rootScope.logedInUser.role == "admin") {
                        // result = "<span ng-click=ng-click='openModalVerleihBuchung(" + vBID + ")' title='Diesen Wunsch bearbeiten' class=' " + bc + " label glyphicon glyphicon-edit pointer' style = ' opacity:1; z-index: 2; float: right; color: black;'> "  + titel + "</span>";
                        result = "<span title='Diesen Wunsch bearbeiten' class=' " + bc + " label' style = ' opacity:1; z-index: 2; float: right; color: black;'> "
                            + titel + "</span>";
                    } else {
                        result = "<span title='Diesen Wunsch bearbeiten' class=' " + bc + " label' style = ' opacity:1; z-index: 2; float: right; color: black;'> " + titel + "</span>";
                    }

                }
                    return result;
                }
                /*
                 tagesBuchungLang
                 ringBuchungLang() Infos zur Ringbuchung in der Datumszeile: lange Film Anzeige
                 Die übliche Anzeige in der Programmtabelle
                 filmlaufBuchung:   [background, [fBID,fBID]]
                 */
                function ringBuchungLang() {
              //      console.log("ringBuchungLang()");
              //      console.log("aktuelle filmlaufBuchung: "+ JSON.stringify(filmlaufBuchung));
                    var myReturn = ""; // rückgabewert
                    var fBID;
                    var ringBuchung;
                    var verleihBuchung;

                    if ( filmlaufBuchung[0]) { // es gibt einen eintrag
                        var filmNr;
                        for (var i = 0; i < filmlaufBuchung[1].length; i++) {
                            filmNr = i+1;
                            fBID = filmlaufBuchung[1][i];
                           // console.log("fBID " +fBID);
                           // console.log("i "+i+" filmlaufBuchung[1].length "+filmlaufBuchung[1].length);
                            ringBuchung = $rootScope.ringBuchungen[fBID];
                            var filmOrt = $rootScope.spielorte[ringBuchung.sid]["ort"]; // sid
                            verleihBuchung = $rootScope.verleihBuchungen[ringBuchung.vBID];
                            // für links - zeile - spalte - flmnr
                            var sourceIndex = " " + rowIdx + " " + colIdx + " " + i + 1;
                            // die zwei Checks
                            // belege check1 und check2
                            var check = [""];
                            for (var j = 1; j <= 2; j++) {
                                if (ringBuchung["check" + j]) { check.push("<span title='schalte bei Klick um.' " +
                                    "class='ok pointer'  flipOnClick click='handleFlip' id='check"
                                    + j + sourceIndex + "' > &#10003; </span>");
                                } else {
                                    check.push("<span title='schalte bei Klick um.'" +
                                        " class='notOK pointer' flipOnClick click='handleFlip' id='check"
                                        + j + sourceIndex + "' > &#10008; </span>");
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

                            if ( $rootScope.logedInUser.sid == ringBuchung.sid || $rootScope.logedInUser.role == "admin" ){
                                myReturn +=  "<span class=' pointer' ng-click='openModalBuchung(" + rowIdx
                                    + ","+ colIdx + ","+ filmNr + ")' >" + "<small>" + fBID + "</small> "
                                    + filmOrt + "</span>" + check[1] + check[2] + von + medium + nach ;


                            } else {
                                myReturn +=  "<small>" + fBID + "</small> " + filmOrt + check[1] + check[2] +
                                    von + medium + nach ;
                            }
                            if (ringBuchung.garantie) { // übernimmt mindestgarantie
                                myReturn += "<span class='glyphicon glyphicon-star'></span>";
                            }
                            // Bei false zeige fehlende Besucherzahlen, ansonsten zeige Besucherzahlen
                            if ( !(moment(datum).isAfter(heute, 'day')) ) { //heute oder früher
                                var info;
                                if ( ringBuchung.besucher == false || ringBuchung.besucher == undefined){
                                    info = " Besucherzahlen fehlen!";
                                } else {
                                    var arrayLength = ringBuchung.besucher.length;
                                    for (var i = 0; i < arrayLength; i++) {
                                        var besucher  = ringBuchung.besucher[i][0];
                                        // formatiere cent zu euro
                                        var eur = (ringBuchung.besucher[i][1] / 100).toFixed(2);
                                        info = " //" + besucher +"a"+ eur +"€";
                                    }
                                }
                                myReturn = myReturn +  "<span class=' pointer' ng-click='besucherEintragen(" + rowIdx
                                    + ","+ colIdx + ","+ filmNr + ")' >" + info + "</span>";
                            }
                          //  console.log("ringBuchungLang return " + myReturn);
                            myReturn = myReturn + "<br />";
                        }
                    }   else { //falls bedarf bei  filmlaufBuchung == false
                    }



                    // end for filme
                    return myReturn;
                } // end tagesBuchunglang


                /*
                 ringBuchungKurz() Infos zur Ringbuchung in der Datumszeile: kurze Wunschfilm Anzeige
                 filmlaufBuchung:   [background, [fBID,fBID]]
                 */
                function ringBuchungKurz() {
                  //  console.log("ringBuchungKurz ");
                    var myReturn = ""; // alle EinzelverleihBuchungen
                    var ringBuchung;
                    var fBID;
                    var filmOrt;

                    var fmax = 1;
                    var filmnr = 'f' + fmax;
                    var aktuelleBuchung;
                    // loop durch alle Filme
                    if ( filmlaufWunsch == false) {
                        myReturn = "";
                    }else {


                    for ( i = 0; i < filmlaufBuchung[1].length; i++) {
                        fBID = filmlaufBuchung[1][i];
                        ringBuchung = $rootScope.ringBuchungen[fBID];
                        //console.log("ringBuchung "+JSON.stringify(aktuelleBuchung));
                        filmOrt =  $rootScope.spielorte[ringBuchung.sid]["ort"];
                        myReturn = myReturn + "<small>" + fBID + "</small> " + filmOrt + "<br />";
                    }}
                   // myReturn = myReturn + "tagesBuchungenKurz";
                    return myReturn;
                } // end tagesBuchungenKurz

                /*
                 tagesBuchungVerleih
                 ringBuchungVerleih() Infos zur Ringbuchung in der Datumszeile: Verleih Anzeige
                 filmlaufBuchung:   [background, [fBID,fBID]]
                 */
                function ringBuchungVerleih() {
                    console.log(" ringBuchungVerleih ");

                    var myReturn = ""; // alle EinzelverleihBuchungen
                    var fBID;
                    var ringBuchung;
                    var filmOrt;
                    if ( !(filmlaufBuchung == false) ) {


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
                    }   }
                    // end while
                    return myReturn;
                }
                /*
                 ringWunschStandard() Infos zu Ringwünschen in der Datumszeile: Standard Anzeige
                 filmlaufWunsch:   [background, [fBID,fBID]]
                 */
                function ringWunschStandard() {
                //    console.log("ringWunschStandard ");

                    var result = ""; // return "" wenn kein
                    var fBID;
                    var ringWunsch;
                    var bc;
                    // Anzahl Wunschfilme für tag und

                    if ( !(filmlaufWunsch == false) ) {
                    for ( i = 0; i < filmlaufWunsch[1].length; i++) {
                        bc = filmlaufWunsch[0];
                        fBID = filmlaufWunsch[1][i];
                        console.log(fBID);
                        ringWunsch = $rootScope.ringWunsch[fBID];
                            result = result + "<span class=' " + bc + " label' style =  'color: black;'>"
                                + $rootScope.spielorte[ringWunsch.sid].ort + "</span> ";
                       // wrapper für Wunschfilme
                        result = "<span style = ' opacity:1; z-index: 2; float: right;'>" + result + "</span>";
                    }}
                    return result;
                } // end wunschfilme

/*

                verleihBuchungLang() Infos zur Verleihbuchung in der KW Zeile: Lange Standard Anzeige
                // filmlaufBuchung =  ["bc-10", "vp2", 1]


                verleihBuchungKurz() Infos zur Verleihbuchung in der KW Zeile: kurze Wunschfilm Anzeige
                filmlaufWunsch =  ["bc-10", "vp2", 1]


                verleihWunschStandard() Infos zur Verleihbuchung in der KW Zeile:kurze Wunschfilm Anzeige
                filmlaufWunsch :  [background, vBID, filmwoche]


                ringBuchungLang() Infos zur Ringbuchung in der Datumszeile: lange Film Anzeige
                Die übliche Anzeige in der Programmtabelle
                filmlaufBuchung:   [background, [fBID,fBID]]


                ringBuchungKurz() Infos zur Ringbuchung in der Datumszeile: kurze Wunschfilm Anzeige
                filmlaufBuchung:   [background, [fBID,fBID]]


                ringBuchungVerleih() Infos zur Ringbuchung in der Datumszeile: Verleih Anzeige
                filmlaufBuchung:   [background, [fBID,fBID]]


                ringWunschStandard() Infos zu Ringwünschen in der Datumszeile: Standard Anzeige
                filmlaufBuchung:   [background, [fBID,fBID]]

  */

                /*
                 START RENDER
                 filmlaufBuchung:   [background, [fBID,fBID]]
                 */

                if(zeigeWunschFilme) {  //wenn true
                // wunschfilme und Spieltag (datumszeile)
                    if ( spieltag ) {
            //            console.log("************* wunschfilme und Spieltag  rowIdx "+ rowIdx);
                        endresult = "<span style = 'position:absolute; z-index: 1; opacity:0.3;'> "
                            + ringBuchungKurz() + "</span>"
                            + "<span style = ' opacity:1; z-index: 2; float: right;'>" + ringWunschStandard()
                            + "</span>";
                // wunschfilme aber KEIN Spieltag (KW ZEile)
                    } else {
            //            console.log("************* wunschfilme KEIN Spieltag  rowIdx "+ rowIdx);

                        endresult = "<span style = 'position:absolute; z-index: 1; opacity:0.3;'> "
                            + verleihBuchungKurz() + "</span>"
                            + "<span style = ' opacity:1; z-index: 2; float: right;'>"
                            + verleihWunschStandard() + "</span>";
                                            }
                   } else {
                // KEIN wunschfilme ABER Spieltag (datumszeile)
                    if ( spieltag ) {
             //           console.log("************* KEIN wunschfilme ABER Spieltag rowIdx "+rowIdx);
                        // und Kein Verleih
                        if ( $rootScope.logedInUser.role != "verleih") {
                            endresult = ringBuchungLang();
                    // und Verleih
                        } else {
                            endresult = ringBuchungVerleih();
                        }
                        ;
                // KEIN wunschfilme, KEIN Spieltag (KW ZEile)
                    } else {
            //            console.log("************* KEIN wunschfilme KEIN Spieltag rowIdx "+rowIdx);
                        endresult = verleihBuchungLang();
                    }
                }

          //  console.log("**endresult**** "+JSON.stringify(endresult))    ;
            return endresult;


            }; // END buchungsRenderer
        }); // End Service
