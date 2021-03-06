{
    "users": {
    "uid0": {
        "logName": "jh",
            "role": "admin",
            "ref": "",
            "name": "Jens-Hagen Schwadt"
    },
    "uid1": {
        "logName": "max",
            "role": "spieler",
            "ref": "sid8",
            "name": "Christian Engler"
    },
    "uid2": {
        "logName": "em",
            "name": "Erika Doe-Gabler",
            "role": "verleih",
            "ref": "vid1"
    }
},
    "spielorte": {
    "sid1": {
        "medien": [
            "BD",
            "DVD",
            "DCP"
        ],
            "name": "Kino unterm Dach",
            "ort": "Schwerin",
            "url": "http://www.kino-unterm-dach.de"
    },
    "sid2": {
        "medien": [
            "BD",
            "DVD"
        ],
            "name": "Filmclub Blendwerk",
            "ort": "Stralsund",
            "url": "http://www.filmclub-blendwerk.de"
    },
    "sid3": {
        "medien": [
            "BD",
            "DCP"
        ],
            "name": "Kulturkino im Cliff",
            "ort": "Sellin",
            "url": "http://www.kino-lichtspiele-sassnitz.de/kino_cliffhotel_sellin.html"
    },
    "sid4": {
        "medien": [
            "BD"
        ],
            "name": "Gutshaus",
            "ort": "Garvensdorf",
            "url": "http://www.guteshaus.de"
    },
    "sid5": {
        "medien": [
            "DVD",
            "DCP"
        ],
            "name": "Kirchengemeinde",
            "ort": "Calau",
            "url": "http://www.filmtippp.de/calau/dir.php"
    },
    "sid6": {
        "medien": [
            "DVD"
        ],
            "name": "Lindenkino",
            "ort": "Alt Rehse",
            "url": "http://www.filmtippp.de/altrehse/dir.php"
    },
    "sid7": {
        "medien": [
            "DCP"
        ],
            "name": "Filmklub",
            "ort": "Güstrow",
            "url": "http://www.filmtippp.de/guestrow/dir.php"
    },
    "sid8": {
        "medien": [
            "BD",
            "DVD",
            "DCP"
        ],
            "name": "Kino35",
            "ort": "Fulda",
            "url": "http://www.35kino.de"
    }
},
    "verleiher": {
    "vid1": {
        "kurz": "X-Verleih",
            "name": "X Filme Creative Pool GmbH",
            "url": "http://www.x-filme.de/",
            "trailer": "https://www.youtube.com/user/xverleih/videos"
    },
    "vid2": {
        "kurz": "Almamode",
            "name": "Almamode Filmdistribution oHG",
            "url": "http://www.alamodefilm.de",
            "trailer": "https://www.youtube.com/user/alamode35/videos"
    }
},
    "verleihBuchungen": {
    "v2017p2": {
        "vBID": "v2017p2",
        "fID": "fp1",
        "titel": "Happy Film",
        "vid": "vid1",
        "medien": {
        "BD": "20170526"
        },
        "menge": {
            "BD": 1,
                "DCP": 0,
                "DVD": 0,
                "analog": 0
        },
        "start": "20170608",
            "laufzeit": 3,
            "bc": "bc-10",
            "fw1": [
            0,
            0
        ],
            "fw2": [
            0,
            0
        ],
            "fw3": [
            0,
            0
        ],
            "col": "col1"
    },
    "v2017p4": {
        "fID": "fp3",
            "vBID": "v2017p4",
            "titel": "Sad Film",
            "vid": "vid2",
            "medien": {
            "BD": "20170323"
        },
        "menge": {
            "BD": 1,
                "DCP": 0,
                "DVD": 0,
                "analog": 0
        },
        "start": "20170615",
            "laufzeit": 3,
            "bc": "bc-50",
            "fw1": [
            0,
            0
        ],
            "fw2": [
            0,
            0
        ],
            "fw3": [
            0,
            0
        ],
            "col": "col2"
    }
},
    "ringBuchungen": {
    "r2017p11": {
        "rBID": "r2017p11",
            "check1": false,
            "check2": false,
            "sid": "sid5",
            "medium": "BD",
            "medienID": false,
            "vonID": false,
            "nachID": false,
            "garantie": false,
            "datum": "20170624",
            "vBID": "v2017p2"
    },
    "r2017p12": {
        "rBID": "r2017p12",
            "check1": false,
            "check2": false,
            "sid": "sid1",
            "medium": "",
            "medienID": false,
            "vonID": false,
            "nachID": false,
            "garantie": false,
            "datum": "20170608",
            "vBID": "v2017p2"
    },
    "r2017p13": {
        "rBID": "r2017p13",
            "check1": false,
            "check2": false,
            "sid": "sid5",
            "medium": "",
            "medienID": false,
            "vonID": false,
            "nachID": false,
            "garantie": false,
            "datum": "20170616",
            "vBID": "v2017p4"
    },
    "r2017p22": {"rBID":"r2017p22","check1":false,"check2":false,"sid":"sid5","medium":"BD","medienID":false,"vonID":false,"nachID":false,"garantie":false,
        "datum":"20170620",
        "vBID":"v2017p2"
    }
},
    "verleihWunsch": {
    "v2017p12": {
        "fID": "fp11",
            "titel": "Mein Wunschfilm",
            "start": "20170608",
            "bc": "bc-00",
            "vBID": "v2017p12",
            "laufzeit": 1
    }
},
    "ringWunsch": {
    "r2017p23": {
        "rBID": "r2017p23",
            "vBID": "v2017p12",
            "sid": "sid5",
            "datum": "20170610"
    }
},
    "filme": {
    "fp1": {
        "titel": "Happy Film"
    },
    "fp3": {
        "titel": "Sad Film"
    },
    "fp11": {
        "titel": "Mein Wunschfilm"
    }
},
    "myProvID":  24

}