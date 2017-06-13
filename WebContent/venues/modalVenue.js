angular.module('modalVenue', [ 'ui.bootstrap', 'ffkUtils' ]).constant('MODULE_VERSION', '0.0.1')
//
// SERVICES
//
// modal
// http://angular-ui.github.io/bootstrap/#/modal
.service('OpenModalVenueService', function($rootScope, $uibModal, $log, FfkUtils) {
	this.editVenue = function(sid) {
		var modalInstance = $uibModal.open({
			templateUrl : './venues/modalVenue.html?' + Math.random(),
			controller : 'ModalVenueInstanceCtrl',
			size : "lg",
			resolve : {
				sid : function() {
					return sid;
				}
			}
		});
		// ModalVenueInstanceCtrl wird mit sid gestartet
		$log.info("\nmodalVenue OpenModalVenueService editVenue mit arg " + sid+ " aufgerufen");

		// TODO stack für asyncrone Serverantworten

		// Die Antwort des ModalVenueInstanceCtrl
		// speicher Änderungen
		modalInstance.result.then(function(res) {
			$log.debug("todo OpenModalVenueService: " + JSON.stringify(res, 1, 4));
			
			// überprüfe, ob neu angelegt wird
			if (sid == undefined) {
				console.log("Lege neuen Spielort an");
				sid =  FfkUtils.getNewProvID("sid");
				$rootScope.spielorte[sid] = {};
				console.log(sid + " " + JSON.stringify($rootScope.myProvID));
				console.log(JSON.stringify($rootScope.spielorte));
				
				$rootScope.spielorteSortiert.push( [sid, res.ort] );
			} else {
				console.log("änderung an: " + $rootScope.spielorte[sid]);
			}

			// überprüfe, ob Änderungen vorgenommen wurden
			// und änder den rootscope
			// TODO lege mit Distributor in ffkUtils
			for ( var key in res) {
				if (res.hasOwnProperty(key)) {
					console.log("key " + key);
					console.log("val " + res[key]);
					$rootScope.spielorte[sid][key] = res[key];
					// bei Ortänderung, änder auch in spielorteSortiert
					if (key == "ort") {
						// suche sid
						$rootScope.spielorteSortiert.some(function(ar) {
							// wenn gefunden, ändere Ort in sid
							if (ar[0] == sid) {
								ar[1] = res[key];
								return true;
							}
							return false;
						});
						//sortiere nach kurz
						FfkUtils.sortList($rootScope.spielorteSortiert,1);
						
					}
				}
			}
			console.log(JSON.stringify($rootScope.spielorte[sid]));

		
			// modal wurde gestartet
		}, modalInstance.opened.then(function() {
			$log.debug('opened OpenModalVenueService');
		}),
		// Modal wurde abgebrochen
		function() {
			$log.info('close OpenModalVenueService um: ' + new Date());
		});
	};

});
// CONTROLLER
//
// ModalVenueInstanceCtrl
angular.module('modalVenue').controller('ModalVenueInstanceCtrl',
		function($rootScope, $scope, $log, $uibModalInstance, sid) {
    // sid == undefined => neu anlegen
			$log.info("starte ModalVenueInstanceCtrl mit arg " + sid);
			$log.info("logedInUser " + JSON.stringify($rootScope.logedInUser,0,0));
			$log.info("öffnet Spielort " + JSON.stringify($rootScope.spielorte[sid],0,0));

			$scope.bearbeiten = false;  // soll bearbeitet werden (nur wenn rechte vorhanden)
            $scope.bearbeitbar = false; // darf bearbeitet werden (rechte)
			// der admin bearbeitet alles
			// der user bearbeitet nur seine spielstätte (außer ort)
			if ($rootScope.logedInUser.role == "admin" | $rootScope.logedInUser.sid == sid) {
			//	$scope.bearbeiten = true;
                $scope.bearbeitbar = true;
            }

            $scope.bearbeitungsmodus =  function (){
                $scope.bearbeiten = true;  // soll bearbeitet werden (nur wenn rechte vorhanden)
                $scope.bearbeitbar = false;
            };

			$scope.sid = sid;
			// enthält die gemachten Änderungen
			$scope.thisVenue = {};
			$scope.header = "Neuen Spielort anlegen";
			
			// Spielort bearbeiten
			if (sid != undefined) {
				$scope.thisVenue = Object.create($rootScope.spielorte[sid]);
				$scope.header = $scope.thisVenue.name + " - Spielort: " + $scope.thisVenue.ort;
			} else {
                $scope.thisVenue = {};
                $scope.thisVenue['medien'] = [];
                    console.log("Spielort neu anlegen");
			}

            // setze Medienvariblen zur Verfügbarkeit
			// alle Medientypen
            $scope.medienTypen = ["BD","35mm","DCP","analog"];
			// die abspielbaren Medientypen des Spielortes
            var sidMedien;
            if (sid == undefined){
                sidMedien = ["BD"]; //neuer Spielort
                $scope.bearbeitungsmodus();
            }else {
                sidMedien = $rootScope.spielorte[sid].medien;
            }
			// alle Medien und ob sie vor Ort abspielbar sind
			$scope.medium = {};

            $scope.medienTypen.forEach(function(typ) {
                console.log(typ);
				$scope.medium[typ] = {};
                $scope.medium[typ].typ = typ;
                $scope.medium[typ].btn = "btn-danger";
                $scope.medium[typ].set = false;
                if(sidMedien.indexOf(typ) > -1){
                    $scope.medium[typ].set = true;
                    $scope.medium[typ].btn = "btn-success";
                }
                console.log($scope.medium[typ]);
            });

            $scope.toggleMedium = function(typ) {
            	if ($scope.bearbeiten){

                console.log("toogle "+typ);
                if ($scope['medium'][typ].set) { // if true set false
                    $scope['medium'][typ].set = false;
                    $scope['medium'][typ].btn = "btn-danger";
                    // lösche String aus array
                    var index = $scope.thisVenue.medien.indexOf(typ);    // <-- Not supported in <IE9
                    if (index !== -1) {
                        $scope.thisVenue.medien.splice(index, 1);
                    }
                } else { // if false set true
                    $scope['medium'][typ].set = true;
                    $scope['medium'][typ].btn = "btn-success";
                    $scope.thisVenue.medien.push(typ);
                }
                }else {
                    console.log("nicht im bearbeitungsmodus für toogle "+typ);
				}
            };

			// gehe in bearbeitungsmodus



			// Venue speichern
			$scope.speichern = function() {
				$uibModalInstance.close($scope.thisVenue);
			};
			// $uibModalInstance.dismiss
			$scope.abbrechen = function() {
				$log.info("ModalVenueInstanceCtrl abgebrochen");
				$uibModalInstance.dismiss('cancel');
			};

		});