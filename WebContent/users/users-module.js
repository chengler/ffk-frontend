"use strict";

(function() {
	var users = angular.module('app.users', [ 'modalUser', 'ffkUtils' ]);

	users.controller('userCtrl', function($log, $scope, $rootScope, OpenModalUserService, FfkUtils) {
		console.log("init UserCtrl");

		$scope.showUser = function(uid) {
			$log.debug("OpenModalUserService.editUser(uid): " + uid);
			OpenModalUserService.editUser(uid);
		};
		
		$scope.deleteBenutzer =  function(uid) {
			$log.debug("delete User(uid): " + uid);
			var benutzer = FfkUtils.getRefName($rootScope.usersSortiert, uid, 4);
		    if (confirm("Benutzer " + benutzer + " wirklich löschen?") == true) {
		    	$log.debug("TODO delete");
		    	$rootScope.users[uid] = null;
		    	delete $rootScope.users[uid];
		    	$log.debug("deleted: "+ JSON.stringify($rootScope.users));
		    	FfkUtils.delFromSortedList(uid, $rootScope.usersSortiert);
		    } else {
		    	$log.debug("delete abgebrochen");
		    }
		};
		
		// hole Zuordnung für Tabelle
		$scope.getRefName = function(id) {
			if (id.substr(0, 3) == "sid"){
				return FfkUtils.getRefName($rootScope.spielorteSortiert, id, 1);
			} else {
				return FfkUtils.getRefName($rootScope.verleiherSortiert, id, 1);
			}
		};

		// $scope.users = [];
		// $scope.currentUser = null;
		// $scope.colors = {Blue: true, Orange: false};
		//	
		// // ============================================
		// // Mit Server interagieren
		// // ============================================
		// $scope.loadUsers = function() {
		// $http.get("api/v1/users/all?" + Math.random())
		// .then(function(data){
		// console.log("users/all:", data);
		// $scope.users = data.data;
		// });
		// };
		//	
		// $scope.storeUser = function() {
		// if($scope.currentUser.id && $scope.currentUser.id > 0) {
		// console.log("users/update:", $scope.currentUser);
		// $http.put("api/v1/users/update", $scope.currentUser)
		// .then(function(){
		// $scope.loadUsers();
		// });
		// } else {
		// console.log("users/create:", $scope.currentUser);
		// $http.post("api/v1/users/create", $scope.currentUser)
		// .then(function(){
		// $scope.loadUsers();
		// });
		// }
		// };
		//	
		// $scope.deleteUser = function(userid) {
		// console.log("users/delete:", userid);
		// $http.delete("api/v1/users/delete/" + userid + "?" + Math.random())
		// .then(function(){
		// $scope.loadUsers();
		// });
		// }
		//	
		// $scope.loadUsers();

	});
})();
