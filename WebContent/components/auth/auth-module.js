"use strict";

(function() {
	var auth = angular.module('app.auth', [ 'modalVenue', 'modalUser', 'ffkUtils' ]);

	auth.controller('loginCtrl', function($log, $scope, $rootScope, $http, FfkUtils, OpenModalVenueService, OpenModalUserService, OpenModalDistributorService) {
		console.log("auth.controller called");
		// $rootScope.username = "";
		// $rootScope.loggedIn = false;

		// fülle Loginfenster
		$scope.auth = {
			"username" : "jh",
			// "username" : "username2",
			"password" : "passwordForUser2"
		};

		// lade users
		// usersSortiert
		// [ "uid", "logName", "role", "id", "name" ] id is sid oder vid
		$http.get('../example_data//JSONusers.js?' + Math.random()).success(
				function(data) {

					$rootScope.users = data[0];
					console.log(Date.now() + " JSONusers: " + Object.keys($rootScope.users).length
							+ " user in $rootScope geladen");

					// sortiere user nach Name (Alphabetisch)
					//
					// packe [ "uid", "logName", "role", "ref", "name" ]
					$rootScope.usersSortiert = [];
					var keys = Object.keys($rootScope.users);
					keys.forEach(function(uid) {
						$rootScope.usersSortiert.push([ uid, $rootScope.users[uid]['logName'],
								$rootScope.users[uid]['role'], $rootScope.users[uid]['ref'],
								$rootScope.users[uid]['name'] ]);
					});
					// sortiere nach name in Array
					// a[0] is uid (userID)
					// a[4] ist der name (sortiert nach name)
					$rootScope.usersSortiert = $rootScope.usersSortiert.sort(function(a, b) {
						if (a[4] > b[4]) {
							return 1;
						}
						if (a[4] < b[4]) {
							return -1;
						}
						return 0;
					});
					// users ist nun vorbereitet
					console.log(Date.now() + " usersSortiert: nach Name "
							+ Object.keys($rootScope.usersSortiert).length);
					console.log(JSON.stringify($rootScope.usersSortiert, 0, 4));

				});

		// lade Spieorte in den rootscopee - asyncron
		// [ [{sid : Ort}],[ ...]]
		$http.get('../example_data//JSONspielorte.js?' + Math.random()).success(
				function(data) {
					$rootScope.spielorte = data[0];
					console.log(Date.now() + " JSONspielorte: " + Object.keys($rootScope.spielorte).length
							+ " Spielorte in $rootScope geladen");

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
					console.log(JSON.stringify($rootScope.spielorteSortiert, 0, 4));

				});

		// lade Verleiher in den rootscopee - asyncron
		// [ [{sid : Ort}],[ ...]]
		$http.get('../example_data//JSONverleiher.js?' + Math.random()).success(
				function(data) {
					$rootScope.verleiher = data[0];
					console.log(Date.now() + " JSONverleiher: " + Object.keys($rootScope.verleiher).length
							+ " verleiher in $rootScope geladen");

					// sortiere verleiher nach kurzbezeichnung (Alphabetisch)
					//
					// packe key und Ort in Array
					$rootScope.verleiherSortiert = [];
					var keys = Object.keys($rootScope.verleiher);
					keys.forEach(function(vid) {
						$rootScope.verleiherSortiert.push([ vid, $rootScope.verleiher[vid]['kurz'] ]);
					});
					// sortiere nach Ort in Array
					// a[0] is sid (spielOrtID)
					// a[1] ist der Ort (sortiert nach Ort)
					$rootScope.verleiherSortiert = $rootScope.verleiherSortiert.sort(function(a, b) {
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
							.log(Date.now() + " verleiher sortiert: "
									+ Object.keys($rootScope.verleiherSortiert).length);
					console.log(JSON.stringify($rootScope.verleiherSortiert, 0, 4));

				});

		$scope.login = function() {
			console.log("demo/login mit:", $scope.auth);
			// $http.post("api/v1/user/login", $scope.auth)
			// .then(
			// function(response) {
			// console.log("login/user response.data:",
			// response.data);
			// $rootScope.username = $scope.auth.username;
			// $http.defaults.headers.common = response.data;
			// console.log("loged in as ",$rootScope.username);
			// $rootScope.loggedIn = true;
			//
			// }, function() {
			// $rootScope.username = "";
			// console.log("login error!");
			// });
			console.log("passwort ist hier egal");

			FfkUtils.loginIfTrue($scope.auth.username);
//			// suche passenden benutzer
//			$rootScope.usersSortiert.some(function(ar) {
//				// wenn gefunden, [ "uid", "logName", "role", "vid" | "sid",
//				// "name" ]
//				if (ar[1] == $scope.auth.username) {
//					console.log("Anmeldename gefunden " + ar);
//					$rootScope.loggedIn = true; // 
//					
//					// set logedInUser
//					$rootScope.logedInUser.uid = ar[0];
//					$rootScope.logedInUser.logName = ar[1];
//					$rootScope.logedInUser.role = ar[2];
//					var id = ar[3].substr(0, 3);
//					// set login user vid | sid name
//					// setze name von Spielort oder verleih
//					if (id == "vid") {
//						$rootScope.logedInUser.vid = ar[3];
//						$rootScope.verleiherSortiert.some(function(vid) {
//							if (vid[0] == ar[3]) {
//								$rootScope.logedInUser.idName = vid[1];
//								return true;
//							}
//							return false;
//						});
//					} else if (id == "sid") {
//						$rootScope.spielorteSortiert.some(function(sid) {
//							$rootScope.logedInUser.sid = ar[3];
//							if (sid[0] == ar[3]) {
//								$rootScope.logedInUser.idName = sid[1];
//								return true;
//							}
//							return false;
//						});
//
//					}
//					$rootScope.logedInUser.name = ar[4];
//					// gefunden
//					return true;
//				}
//				// weitersuchen
//				return false;
//			});
			// anmeldung erfolgreich | gescheitert
			if ($rootScope.loggedIn) {
				console.log("angemeldet ist nun " + JSON.stringify($rootScope.logedInUser));
			} else {
				console.log("anmeldung gescheitert");
				$scope.auth.username = "versuch max oder jh!";

			}

		};

		$scope.logout = function() {
			$rootScope.username = "";
			$rootScope.spielort = [];
			$rootScope.loggedIn = false;
			// console.log("demo/logout ",
			// $http.defaults.headers.common.auth_token);
			// console.log("demo/logout ", $http.defaults.headers.common);
			//
			// $http.post("api/v1/user/logout", $http.defaults.headers.common)
			// .then(
			// function(response) {
			// console.log("logout/user response.data:",
			// response.data);
			// $rootScope.username = "";
			// $rootScope.loggedIn = false;
			// }, function() {
			//
			// console.log("logout error!");
			// });
		};

		$scope.demoPost = function() {
			$http.post("api/v1/demo/demo-post-method").then(function(data) {
				console.log("demo-post-method", data);

			});
		};

		$scope.showUser = function() {
			OpenModalUserService.editUser($rootScope.logedInUser.uid);
		};
		
		$scope.showReferenz = function() {
			$log.debug("zeige Ref für "+JSON.stringify($rootScope.logedInUser,0,0));
			if ($rootScope.logedInUser.sid != undefined) {
					OpenModalVenueService.editVenue($rootScope.logedInUser.sid);
				} else if ($rootScope.logedInUser.vid != undefined) {
					OpenModalDistributorService.editDistributor($rootScope.logedInUser.vid);
					
				} else {
					console.log("Keine Referenz definiert");
				}
			};
		
	});
})();