"use strict";

var app = angular
		.module('app', [  'app.auth', 'ngRoute', 'app.version', 'app.dashboard',
				'app.users',  'app.distributors', 'app.venue',    'app.programm', 'agGrid', 'ui.bootstrap',  'programmTabellenRenderer',
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

app.run(function(version, author, $rootScope, $http, $locale) {
	console.log("app.run");
	console.info("Version:", version);
	console.info("Author:", author);
    $locale.id="de-de";
    $locale.localeID="de-DE";
    console.info($locale);
	
	
	$rootScope.spielorte = []; // Infos zu den Spielorten
	$rootScope.spielorteSortiert = []; // Infos sid und ort
	
	$rootScope.verleiher = []; // Die Verleiher
	$rootScope.verleiherSortiert = []; // Infos vid und kurzbez
	
	$rootScope.users = [];
	// [ "uid", "logName", "role", "vid" | "sid", "name" ]
	$rootScope.usersSortiert = []; 

	$rootScope.filmlauf = []; // die Tabellendaten
    $rootScope.filmlaufSpalten = 0; // maximale anzahlder Spalten

    $rootScope.filme = {}; // Die Filme
    $rootScope.ringBuchungen = {}; // Film Buchungen beim Ring fBID
    $rootScope.ringWunsch = {}; // Wunsch der Buchungen eines Films beim Ring fBID
// TODO array weg
    $rootScope.verleihBuchungen = [{}]; // Die Buchungen beim Verleih vBID
    $rootScope.verleihWunsch = {}; // der Wunsch einer Buchungen beim Verleih vBID


    $rootScope.logedInUser = {}; // der angemeldete user
    $rootScope.fehlendeRueckmeldungen = [];
	
	$rootScope.status = {};
	$rootScope.status.filmlaufGeladen = false;
	$rootScope.status.buchungenGeladen = false;
    $rootScope.status.datensatzGeladen = false; // soll buchungen geladen etc ersetzen.

    $rootScope.status.fehlendeRueckmeldungenGeladen = false;
	//$rootScope.status.grundTabelleGeladen = false;
	$rootScope.status.aggrid = false;
	
//	$rootScope.gridOptions = {};
	
	$rootScope.loggedIn = false;
	$rootScope.myProvID = {};
	$rootScope.myProvID.counter = 10;
//	$rootScope.role = false; // admin spieler
	$rootScope.spielort = {}; // der aktuelle Spielort 
	$rootScope.username = ""; // der angemeldete Benutzer // ersetzen
    $rootScope.ersterDo = ""; // Tag an dem die Programmtabelle beginnt idx0 KW; idx1 ersterDo

    $rootScope.version = Math.random(); // damit templates nachgeladen werden, nach fertigstellung des Progs bsésser progversion

    $rootScope.infofenster = 'FfK Filmverwaltung für Kinoabspielringe';





});
