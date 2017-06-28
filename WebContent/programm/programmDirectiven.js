"use strict";
(function() {
	var programm = angular.module('app.programm');
	programm.directive('fliponclick', function() {
		return {
			scope : {
				click : '&' // parent
			},
			link : function(scope, element) {
				// again we need the native object
				var el = element[0];

				el.addEventListener('click', function(e) {
					// Key RowIndex clox
					var idParts = this.id.split(" ");
					var flipKey = idParts.splice(0, 1);
					var flipIdx = idParts.splice(0, 1);
					var flipCol = idParts.splice(0, 1);
					var flipFilm = idParts.splice(0, 1);
					console.log("klicked " + flipKey + flipIdx + flipCol + flipFilm);
					scope.$apply(function(scope) {
						var fn = scope.click();
						if ('undefined' !== typeof fn) {
							fn(flipKey, flipIdx, flipCol, flipFilm);
						}
					});
					return false;
				}, false);
			}
		};
	});

	// d&d für filmluaf
	// http: //
	// blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
	programm.directive('draggable', function() {
		return function(scope, element) {
			// this gives us the native JS object
			var el = element[0];

			el.draggable = true;

			// trenne id nach " "
			var idParts = el.id.split(" ");
			// vBID zur überprüfung ob gleicher Film
			var dragvBID = idParts.splice(0, 1);

			el.addEventListener('dragstart', function(e) {
				console.log("dragstart: " + el.id);
               console.log(JSON.stringify(el.id));

                e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData(dragvBID, this.id);
				this.classList.add('drag');
				return false;
			}, false);

			el.addEventListener('dragend', function(e) {
				this.classList.remove('drag');
				return false;
			}, false);
		};
	});
	programm.directive('droppable', function() {
		return {
			scope : {
				drop : '&' // parent
			// bin : '='
			},
			link : function(scope, element) {
				// again we need the native object
				var el = element[0];

				el.addEventListener('dragover', function(e) {
					e.dataTransfer.dropEffect = 'move';
					// allows us to drop
					if (e.preventDefault)
						e.preventDefault();
					this.classList.add('over');
					return false;
				}, false);

				el.addEventListener('dragenter', function(e) {
					this.classList.add('enter');
					return false;
				}, false);

				el.addEventListener('dragleave', function(e) {
					this.classList.remove('over');
					return false;
				}, false);

				el.addEventListener('drop', function(e) {
					console.log("drop: " + el.id);

					// Stops some browsers from redirecting.
					if (e.stopPropagation)
						e.stopPropagation();

					this.classList.remove('over');
					// // trenne id nach " "
					var idParts = this.id.split(" ");
					// vBID zur überprüfung ob gleicher Film
					var binvBID = idParts.splice(0, 1);
					// Der RowIndex
					var binIdx = idParts.splice(0, 1);
					// die Spalte
					var binCol = idParts.splice(0, 1);
					// f1 odre f2 oder ...
					var binFilm = idParts.splice(0, 1);

					// wenn binvBID nicht setData(binvBID) entspricht,
					// wird ein leerer String übergeben
					var item = document.getElementById(e.dataTransfer.getData(binvBID));
					// this.appendChild(item, binId);

					// falscher vBID TODO
					// call the drop passed drop function
					//

					// wenn item nicht leer
					if (item) {
						var idParts = item.id.split(" ");
						// vBID zur überprüfung ob gleicher Film
						// wird nur weggeschnitten splice diff!
						var dragvBID = idParts.splice(0, 1);
						// // Der RowIndex
						var dragIdx = idParts.splice(0, 1);
						// // die Spalte
						var dragCol = idParts.splice(0, 1);
						// f1 odre f2 oder ...
						var dragFilm = idParts.splice(0, 1);

						scope.$apply(function(scope) {
							var fn = scope.drop();
							if ('undefined' !== typeof fn) {
								fn(dragIdx, dragCol, dragFilm, binIdx, binCol, binFilm);
							}
						});
					}
					// TODO falsch getropped, eine else{} Rückmeldung senden?
					;

					return false;
				}, false);
			}
		};
	});

})();