"use strict";
(function() {
	var distributors = angular.module('app.distributors', [ 'agGrid','ui.bootstrap', 'modalDistributor', 'ffkUtils' ]);

	distributors.controller('distributorsCtrl', function($log, $scope, $rootScope, OpenModalDistributorService, FfkUtils) {
		console.log("init distributorsCtrl");

	
		
		
		$scope.showVerleih = function(vid) {
			$log.debug("OpenModalDistributorService.editDistributor(vid): " + vid);
			// $scope.vid = vid;
			OpenModalDistributorService.editDistributor(vid);

		};
		// TODO sehr ähnlich Distributor VEnue -> mach eins
		$scope.deleteVerleih =  function(vid) {
			$log.debug("delete Distributor(vid): " + vid);
			var ort = FfkUtils.getRefName($rootScope.verleiherSortiert, vid, 1);
		    if (confirm(ort + " wirklich löschen?") == true) {
		    	$log.debug("TODO delete");
		    	// erst unterobjecte löschen
		    	$rootScope.verleiher[vid] = null;
		    	delete $rootScope.verleiher[vid];
		    	$log.debug("deleted: "+ JSON.stringify($rootScope.verleiher));
		    	FfkUtils.delFromSortedList(vid, $rootScope.verleiherSortiert);
		    } else {
		    	$log.debug("delete abgebrochen");
		    };
		};

        $scope.werdeVerleiher =  function( vid ){
            FfkUtils.masqueradeLoggedIn(vid);
        }

	});

})();