"use strict";

(function() {
	var venue = angular.module('app.venue', [ 'ui.bootstrap', 'modalVenue', 'ffkUtils']);

	venue.controller('venueCtrl', function($log, $scope, $rootScope, OpenModalVenueService, FfkUtils) {
		$log.info("\ninit venueCtrl");
//		$scope.vid = "5";

		$scope.showSpielort = function(sid) {
			OpenModalVenueService.editVenue(sid);
		};

		// TODO sehr ähnlich Distributor VEnue -> mach eins
		$scope.deleteSpielort =  function(sid) {
			$log.debug("delete Venue(vid): " + sid);
			var ort = FfkUtils.getRefName($rootScope.spielorteSortiert, sid, 1);
		    if (confirm(ort + " wirklich löschen?") == true) {
		    	$log.debug("TODO delete");
		    	$rootScope.spielorte[sid] = null;
		    	delete $rootScope.spielorte[sid];
		    	$log.debug("deleted: "+ JSON.stringify($rootScope.spielorte));
		    	FfkUtils.delFromSortedList(sid, $rootScope.spielorteSortiert);
		    } else {
		    	$log.debug("delete abgebrochen");
		    }
		};
		
	});

})();