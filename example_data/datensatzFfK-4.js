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
            "35mm",
            "DCP"
        ],
            "name": "Kino unterm Dach",
            "ort": "Schwerin",
            "url": "http://www.kino-unterm-dach.de"
    },
    "sid2": {
        "medien": [
            "BD",
            "35mm"
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
            "35mm",
            "DCP"
        ],
            "name": "Kirchengemeinde",
            "ort": "Calau",
            "url": "http://www.filmtippp.de/calau/dir.php"
    },
    "sid6": {
        "medien": [
            "35mm"
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
            "35mm",
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
    "vp2": {
        "fID": "fp1",
            "titel": "Happy Film",
            "verleih": "vid1",
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
            30,
            11000
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
    "vp4": {
        "fID": "fp3",
            "titel": "Sad Film",
            "verleih": "vid2",
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
    "fBIDp11": {
        "fBID": "p11",
            "check1": false,
            "check2": false,
            "sid": "sid5",
            "medium": "BD",
            "medienID": false,
            "vonID": false,
            "nachID": false,
            "garantie": false,
            "datum": "20170624",
            "vBID": "vp2"
    },
    "fBIDp12": {
        "fBID": "p12",
            "check1": false,
            "check2": false,
            "sid": "sid1",
            "medium": "",
            "medienID": false,
            "vonID": false,
            "nachID": false,
            "garantie": false,
            "datum": "20170608",
            "vBID": "vp2"
    },
    "fBIDp13": {
        "fBID": "p13",
            "check1": false,
            "check2": false,
            "sid": "sid5",
            "medium": "",
            "medienID": false,
            "vonID": false,
            "nachID": false,
            "garantie": false,
            "datum": "20170616",
            "vBID": "vp4"
    }
},
    "verleihWunsch": {
    "vp12": {
        "fID": "fp11",
            "titel": "Mein Wunschfilm",
            "start": "20170608",
            "bc": "bc-00",
            "col": "col1",
            "wfID": "vp12"
    }
},
    "ringWunsch": {
    "fBIDp13": {
        "fBID": "p13",
            "vBID": "vp12",
            "sid": "sid5",
            "datum": "20170610"
    }
},
    "filme": {
    "fp1": {
        "titel": "Happy Film",
            "verleih": "vid1"
    },
    "fp3": {
        "titel": "Sad Film",
            "verleih": "vid2"
    },
    "fp11": {
        "titel": "Mein Wunschfilm"
    }
},
    "myProvID": {
    "counter ": 15
}
}