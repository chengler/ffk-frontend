angular.module('modalDistributor', [ 'ui.bootstrap', 'ffkUtils'  ]).constant('MODULE_VERSION', '0.0.1')
//
// SERVICES
//
// modal
// http://angular-ui.github.io/bootstrap/#/modal
.service('OpenModalDistributorService', function($rootScope, $uibModal, $log, FfkUtils) {
	this.editDistributor = function(vid) {
		var modalInstance = $uibModal.open({
			templateUrl : './resources/scripts/distributors/modalDistributor.html?' + Math.random(),
			controller : 'ModalDistributorInstanceCtrl',
			size : "lg",
			resolve : {
				vid : function() {
					return vid;
				}
			}
		});
		// ModalDistributorInstanceCtrl wird mit vid gestartet
		$log.info("modalDistributor OpenModalDistributorService vid: " + vid);

		// TODO stack für asyncrone Serverantworten

		// Die Antwort des ModalDistributorInstanceCtrl
		modalInstance.result.then(function(res) {
			$log.debug("todo OpenModalDistributorService: " + JSON.stringify(res, 1, 4));
			console.log($rootScope.verleiher[vid]);

			// überprüfe, ob neu angelegt wird
			if (vid == undefined) {
				console.log("Lege neuen Verleih an");
				vid = "vid" + FfkUtils.getNewProvID("vid");
				$rootScope.verleiher[vid] = {};
				console.log(vid + " " + JSON.stringify($rootScope.myProvID));
				console.log(JSON.stringify($rootScope.verleiher));

				$rootScope.verleiherSortiert.push([ vid, res.kurz ]);
			} else {
				console.log("änderung an: " + $rootScope.spielorte[vid]);
			}

			// überprüfe, ob Änderungen vorgenommen wurden
			// und änder den rootscope
			for ( var key in res) {
				if (res.hasOwnProperty(key)) {
					console.log("key " + key);
					console.log("val " + res[key]);
					$rootScope.verleiher[vid][key] = res[key];
					// bei Ortänderung, änder auch in verleiherSortiert
					if (key == "kurz") {
						// suche vid
						$rootScope.verleiherSortiert.some(function(ar) {
							// wenn gefunden, ändere kurz in vid
							if (ar[0] == vid) {
								ar[1] = res[key];
								return true;
							}
							return false;
						});
						//sortiere nach kurz
						FfkUtils.sortList($rootScope.verleiherSortiert,1);
					}

				}
			}

			// modal wird gestartet
		}, modalInstance.opened.then(function() {
			console.log('open OpenModalDistributorService');
		}),
		// Modal wurde abgebrochen
		function() {
			$log.info('close OpenModalDistributorService um: ' + new Date());
		});
	};

});
// CONTROLLER
//
// ModalVenueInstanceCtrl
angular.module('modalDistributor').controller(
		'ModalDistributorInstanceCtrl',
		function($rootScope, $scope, $log, $uibModalInstance, vid) {
			console.log("starte ModalDistributorInstanceCtrl mit vid " + vid);
			console.log($rootScope.verleiher[vid]);
			$log.debug("$rootScope.logedInUser " + JSON.stringify($rootScope.logedInUser));

			$scope.bearbeiten = false;
			// der admin bearbeitet alles
			// der user bearbeitet nur seinen Verleih (außer kurz)
			if ($rootScope.logedInUser.role == "admin" | $rootScope.logedInUser.vid == vid) {
				$scope.bearbeiten = true;
			}

			$log.debug("bearbeiten " + $scope.bearbeiten + " für user mit vid " + $rootScope.logedInUser[3]
					+ " für verleiher vid " + vid);

			$scope.vid = vid;
			// enthält die gemachten Änderungen
			$scope.thisDistributor = {};
			$scope.header = "Neuen Verleih anlegen";

			// verleiher bearbeiten
			// Spielort bearbeiten
			if (vid != undefined) {
				$scope.thisDistributor = Object.create($rootScope.verleiher[vid]);
				$scope.header = $scope.thisDistributor.name + " - kurz: " + $scope.thisDistributor.kurz;
			} else {
				console.log("Verleih neu anlegen");
			}

			// Venue speichern
			$scope.speichern = function() {
				$uibModalInstance.close($scope.thisDistributor);
			};
			// $uibModalInstance.dismiss
			$scope.abbrechen = function() {
				$uibModalInstance.dismiss('close ModalVenueInstanceCtrl');
			};
		});