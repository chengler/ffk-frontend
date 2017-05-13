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
		$log.info("\nmodalVenue OpenModalVenueService editVenue mit arg '" + sid+ "' aufgerufen");

		// TODO stack für asyncrone Serverantworten

		// Die Antwort des ModalVenueInstanceCtrl
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
			$log.info("starte ModalVenueInstanceCtrl mit arg " + sid);
			$log.debug("logedInUser " + JSON.stringify($rootScope.logedInUser,0,0));
			$log.debug("öffnet Spielort " + JSON.stringify($rootScope.spielorte[sid],0,0));

			$scope.bearbeiten = false;
			// der admin bearbeitet alles
			// der user bearbeitet nur seine spielstätte (außer ort)
			if ($rootScope.logedInUser.role == "admin" | $rootScope.logedInUser.sid == sid) {
				$scope.bearbeiten = true;
			}

			$scope.sid = sid;
			// enthält die gemachten Änderungen
			$scope.thisVenue = {};
			$scope.header = "Neuen Spielort anlegen";
			
			// Spielort bearbeiten
			if (sid != undefined) {
				$scope.thisVenue = Object.create($rootScope.spielorte[sid]);
				$scope.header = $scope.thisVenue.name + " - Spielort: " + $scope.thisVenue.ort;
			} else {
				console.log("Spielort neu anlegen");
			}

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