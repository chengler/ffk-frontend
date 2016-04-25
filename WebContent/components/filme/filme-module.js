"use strict";

(function() {
var filme = angular.module('app.filme', []);




filme.controller('filmeCtrl', function ($scope, $http) {
	console.log("init FilmCtrl");
	$scope.filme = [];
	$scope.currentFilm = null;
	
	// ============================================
	// Mit Server interagieren
	// ============================================
	$scope.loadFilme = function() {
		$http.get("api/v1/filme/all?" + Math.random())
			.then(function(data){
				console.log("filme/all:", data);
				console.log("data:", data.data);
				$scope.filme = data.data;
		});
	};
	
	$scope.storeFilm = function() { 
		if($scope.currentFilm.id && $scope.currentFilm.id > 0) {
			console.log("filme/update:", $scope.currentFilm);
			$http.put("api/v1/filme/update", $scope.currentFilm)
				.then(function(){
					$scope.loadFilme();
				});
		} else {
			console.log("filme/create:", $scope.currentFilm);
			$http.post("api/v1/filme/create", $scope.currentFilm)
				.then(function(){
					$scope.loadFilme();
			});
		}
	};
	
	$scope.deleteFilm = function(filmid) {
		console.log("filme/delete:", filmid);
		$http.delete("api/v1/filme/delete/" + filmid + "?" + Math.random())
			.then(function(){
				$scope.loadFilme();
			});
	}
	
	$scope.loadFilme();
	
});
}) ();