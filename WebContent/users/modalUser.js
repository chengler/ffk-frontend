angular.module('modalUser', [ 'ui.bootstrap', , 'ffkUtils' ]).constant('MODULE_VERSION', '0.0.1')
//
// SERVICES
//
// modal
// http://angular-ui.github.io/bootstrap/#/modal
.service('OpenModalUserService', function($rootScope, $uibModal, $log, FfkUtils) {
	this.editUser = function(uid) {
		var modalInstance = $uibModal.open({
			templateUrl : './users/modalUser.html?' + Math.random(),
			controller : 'ModalUserInstanceCtrl',
			size : "lg",
			resolve : {
				uid : function() {
					return uid;
				}
			}
		});
		// ModalUserInstanceCtrl wird mit uid gestartet
		$log.info("modalUser OpenModalUserService uid: " + uid);

		// TODO stack für asyncrone Serverantworten

		// Die Antwort des ModalUserInstanceCtrl
		modalInstance.result.then(function(res) {
			$log.debug("todo OpenModalUserService: " + JSON.stringify(res, 1, 4));
			console.log($rootScope.users[uid]);

			// überprüfe, ob neu angelegt wird
			if (uid == undefined) {
				console.log("Lege neuen Benutzer an");
				uid = "uid" + FfkUtils.getNewProvID("uid");
				$rootScope.users[uid] = {};
				console.log(uid + " " + JSON.stringify($rootScope.myProvID));
				console.log(JSON.stringify($rootScope.users));
				// [ "uid", "logName", "role", "vid" | "sid", "name" ]
				$rootScope.usersSortiert.push([ uid, res.logName, res.role, res.ref, res.name ]);
			} else {
				console.log("änderung an: " + $rootScope.users[uid]);
			}

			// und änder den rootscope
			for ( var key in res) {
				if (res.hasOwnProperty(key)) {
					console.log("key " + key);
					console.log("val " + res[key]);
					// muss nicht überprüft werden
					// res enthält nur änderungen
					// if ($rootScope.users[uid][key] != res[key]) {
					$rootScope.users[uid][key] = res[key];
					// }
				}
			}
			// änder immer auch in usersSortiert
			// suche uid
			$rootScope.usersSortiert.some(function(ar) {
				$log.debug("änder usersSortiert");
				// wenn gefunden, ändere
				// [ "uid", "logName", "role", "id", "name" ]
				if (ar[0] == uid) {
					ar[1] = res.logName;
					ar[2] = res.role;
					ar[3] = res.ref;
					ar[4] = res.name;
					return true;
				}
				return false;
				
			});
			// sortiere nach name
			console.log("$rootScope.usersSortiert, 4");
			FfkUtils.sortList($rootScope.usersSortiert, 4);
			
			// änder logedInUser, logge nie aus
			// wenn dieser verändert wurde
			if ($rootScope.logedInUser.uid == uid ){
				console.log("änder lodedIn "+$rootScope.usersSortiert );
				FfkUtils.loginIfTrue(res.logName);

			}
			
			
			// modal wird gestartet
		}, modalInstance.opened.then(function() {
			console.log('open OpenModalUserService');
		}),
		// Modal wurde abgebrochen
		function() {
			$log.info('close OpenModalUserService um: ' + new Date());
		});
	};

});
// CONTROLLER
//
// ModalUserInstanceCtrl
angular.module('modalUser').controller(
		'ModalUserInstanceCtrl',
		function($rootScope, $scope, $log, $uibModalInstance, FfkUtils, uid) {
			console.log("starte ModalUserInstanceCtrl mit uid " + uid);
			console.log("bearbeite $rootScope.users[uid] " + JSON.stringify($rootScope.users[uid]));
			console.log("$rootScope.logedInUser " + JSON.stringify($rootScope.logedInUser));

			$scope.vid = "";
			$scope.sid = "";
			$scope.role = "";
			$scope.bearbeiten = false;
			// der admin bearbeitet alles
			// der user bearbeitet nur seine spielstätte (außer ort)

			// bearbeiten true | false
			if ($rootScope.logedInUser.role == "admin" | $rootScope.logedInUser.uid == uid) {
				console.log("bearbeiten = true");
				$scope.bearbeiten = true;
			}
			$log.debug("bearbeiten " + $scope.bearbeiten + " für user mit uid " + $rootScope.logedInUser.uid
					+ " für user uid " + uid);

			// zum adressieren im scope
			$scope.uid = uid;
			// rolle des users

			// enthält die gemachten Änderungen
			$scope.thisUser = {};
			$scope.header = "Neuen Benutzer anlegen";

			// Benutzer bearbeiten
			// Object.creat speichert nur änderungen
			$scope.vid = "";
			$scope.sid = "";
			if (uid != undefined) {
				console.log("uid " + uid);
				$scope.thisUser = Object.create($rootScope.users[uid]);
				$scope.header = $scope.thisUser.name + " - Anmeldename: " + $scope.thisUser.logName;
				// die ref als sid | vid für Auswahl zuständigkeit
				var id = $scope.thisUser.ref.substr(0, 3);
				console.log("id " + id);
				$scope[id] = $scope.thisUser.ref;

			} else {
				console.log("Benutzer neu anlegen");
			}
			// frei Wahl für den admin
			$scope.delVid = function(){
				$scope.vid = "";
				if ($scope.thisUser.role != "admin"){
					$scope.thisUser.role = "spieler";
				}
			};
			$scope.delSid = function(){
				$scope.sid = "";
				if ($scope.thisUser.role != "admin"){
					$scope.thisUser.role = "verleih";
				}
			};

			// hole Zuordnung zur ref id
			$scope.getRefName = function(ref) {
				if (ref != undefined) {
					if (ref.substr(0, 3) == "sid") {
						return FfkUtils.getRefName($rootScope.spielorteSortiert, ref, 1);
					} else {
						return FfkUtils.getRefName($rootScope.verleiherSortiert, ref, 1);
					}
				}
			};

			// benu speichern
			$scope.speichern = function() {
				console.log("$scope.thisUser.role " + $scope.thisUser.role);
				console.log("$scope.vid " + $scope.vid);
				console.log("$scope.sid " + $scope.sid);
				// suche die Referenz zur Rolle. Bei Rollenwechsel wird alte ref
				// immer gelöscht
				if ( $scope.vid == "" ? $scope.thisUser.ref = $scope.sid : $scope.thisUser.ref = $scope.vid);

				console.log("$scope.thisUser.id " + $scope.thisUser.id);
				$uibModalInstance.close($scope.thisUser);
			};
			// $uibModalInstance.dismiss
			$scope.abbrechen = function() {
				$uibModalInstance.dismiss('close ModalUserInstanceCtrl');
			};

		});