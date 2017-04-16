"use strict";

var app = angular
		.module('app', [ 'app.filme', 'app.auth', 'ngRoute', 'app.version', 'app.dashboard',
				'app.users',  'app.distributors', 'app.venue',    'app.programm', 'agGrid', 'ui.bootstrap',  'ffkTableModul',
				'ffkUtils']);

app.config([ '$routeProvider', function($routeProvider) {
	console.log("app.config start");
	$routeProvider.when('/users', {
		title : 'Benutzer | FfK',
		templateUrl : './users/users.html?' + Math.random()
//		controller : 'userCtrl'
			
	}).when('/Dashboard', {
		title : 'Übersicht | FfK',
		templateUrl : './dashboard/dashboard.html?' + Math.random()
//		controller : 'dashboardCtrl'
			
	}).when('/Programm', {
		title : 'Programm | FfK',
		templateUrl : './programm/programm.html?' + Math.random()
//		controller : 'ProgrammCtrl'
			
	}).when('/Distributors', {
		title : 'Filmverleiher | FfK',
		templateUrl : './distributors/distributors.html?' + Math.random()
//		controller : 'distributorsCtrl'
		
	}).when('/Venues', {
		title : 'Spielorte | FfK',
		templateUrl : './venues/venues.html?' + Math.random()
//		controller : 'venueCtrl'
			
	        
		        
	}).otherwise({redirectTo: '/Dashboard'
		     			
	});
	console.log("app.config done");

} ]);

// app.run(['$rootScope', '$injector', function($rootScope,$injector) {
// $injector.get("$http").defaults.transformRequest = function(data,
// headersGetter) {
// if (sessionService.isLogged()) {
// headersGetter()['Authorization'] = "Bearer " +
// sessionService.getAccessToken();
// }
// if (data) {
// return angular.toJson(data);
// }
// };
// }]);

app.run(function(version, author, $rootScope, $http) {
	console.log("app.run");
	console.info("Version:", version);
	console.info("Author:", author);
	
	
	$rootScope.spielorte = []; // Infos zu den Spielorten
	$rootScope.spielorteSortiert = []; // Infos sid und ort
	
	$rootScope.verleiher = []; // Die Verleiher
	$rootScope.verleiherSortiert = []; // Infos vid und kurzbez
	
	$rootScope.users = [];
	// [ "uid", "logName", "role", "vid" | "sid", "name" ]
	$rootScope.usersSortiert = []; 

	$rootScope.filmlauf = []; // die Tabellendaten

    $rootScope.filme = []; // Die Filme
    $rootScope.ringbuchung = []; // Film Buchungen beim Ring fBID
    $rootScope.buchungen = []; // Die Buchungen beim Verleih vBID

	$rootScope.logedInUser = {}; // der angemeldete user
	
	$rootScope.status = {};
	$rootScope.status.filmlaufGeladen = false;
	$rootScope.status.buchungenGeladen = false;
	$rootScope.status.grundTabelleGeladen = false;
	$rootScope.status.aggrid = false;
	
//	$rootScope.gridOptions = {};
	
	$rootScope.loggedIn = false;
	$rootScope.myProvID = {};
	$rootScope.myProvID.counter = 0;
//	$rootScope.role = false; // admin spieler
	$rootScope.spielort = {}; // der aktuelle Spielort 
	$rootScope.username = ""; // der angemeldete Benutzer // ersetzen




	
		

});
