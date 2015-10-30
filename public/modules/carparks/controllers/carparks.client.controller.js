'use strict';

// Carparks controller
angular.module('carparks').controller('CarparksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Carparks',
	function($scope, $stateParams, $location, Authentication, Carparks) {
		$scope.authentication = Authentication;

		var markers = [];

		//DELETE ALL MARKERS
		$scope.DeleteMarkers = function() {
			//Loop through all the markers and remove
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
		}

		function CenterControl(controlDiv, map) {
			var centerControlDiv = document.createElement('div');
			var centerControl = new CenterControl(centerControlDiv, $scope.map);

			centerControlDiv.index = 1;
			$scope.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
			//clear map controls
			$scope.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].clear();

			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = '#fff';
			controlUI.style.border = '2px solid #fff';
			controlUI.style.borderRadius = '3px';
			controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
			controlUI.style.cursor = 'pointer';
			controlUI.style.marginBottom = '22px';
			controlUI.style.textAlign = 'center';
			controlUI.title = 'Click to recenter the map';
			controlDiv.appendChild(controlUI);

			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.color = 'rgb(25,25,25)';
			controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
			controlText.style.fontSize = '16px';
			controlText.style.lineHeight = '38px';
			controlText.style.paddingLeft = '5px';
			controlText.style.paddingRight = '5px';
			controlText.innerHTML = 'Center Map';
			controlUI.appendChild(controlText);

			// Setup the click event listeners: simply set the map to Chicago.
			controlUI.addEventListener('click', function() {
				map.setCenter(chicago);
			});

		}

		//SEARCH FOR LOCATION
		var geocoder = new google.maps.Geocoder();
		$scope.searchLocation = function (location) {
			$scope.DeleteMarkers();
			geocoder.geocode({'address':location}, function(results, status)
			{
				if (status === google.maps.GeocoderStatus.OK)
				{
					$scope.map.setCenter(results[0].geometry.location);
					var marker = new google.maps.Marker(
						{
							map: $scope.map,
							position: results[0].geometry.location
						});
					markers.push(marker);
					//$('#map_canvas').css({'width':'700','height':'405'});
					//google.maps.event.trigger($scope.map, 'resize');
				}
				else
				{
					$('#errorModal').modal('show');
				}
			});
		};

		//REVERSE GEOCODE (COORDINATE TO ADDRESS)
		$scope.currentLocationAddress = function(){
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				geocoder.geocode({'location': pos},function(results,status){
					if (results[1]){
						alert(results[1].formatted_address);
						document.getElementById('originInput').value = results[1].formatted_address;
					}
				});
			});
		};

		//GO TO CURRENT LOCATION
		$scope.currentLocation = function(position){
			$scope.DeleteMarkers();
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				$scope.map.setCenter(pos);
				var marker = new google.maps.Marker(
					{
						map: $scope.map,
						position: pos
					});
				markers.push(marker);
			});
		};
		$scope.currentLocation();

		//ROUTE TO LOCATION AND DISPLAY MULTIPLE ROUTES
		var directionsService = new google.maps.DirectionsService;
		var directionsDisplay = new google.maps.DirectionsRenderer();

		$scope.routesDistDurObjArr = [];
		$scope.routeList = [];
		$scope.route = function(origin,destination){
			if(directionsDisplay)
			{
				directionsDisplay.setMap(null);
			}
			directionsDisplay.setMap($scope.map);
			var originCoord,destinationCoord;

			/*
			var table = document.getElementById("routeListTable");
			while(table.rows.length > 1) {
				table.deleteRow(1);
			}
			*/
			//GET COORD OF ORIGIN
			geocoder.geocode({'address':origin}, function(results, status)
			{
				if (status === google.maps.GeocoderStatus.OK)
				{
					originCoord = results[0].geometry.location;
					//GET COORD OF DESTINATION
					geocoder.geocode({'address':destination}, function(results, status)
					{
						if (status === google.maps.GeocoderStatus.OK)
						{
							destinationCoord = results[0].geometry.location;
							var request = {
								origin: originCoord,
								destination: destinationCoord,
								travelMode: google.maps.TravelMode.DRIVING,
								provideRouteAlternatives: true
							};

							directionsService.route(request, function(response, status) {
								if (status === google.maps.DirectionsStatus.OK) {
									if($scope.routesDistDurObjArr.length > 0)
									{
										$scope.routesDistDurObjArr.length = 0;
										$scope.routeList.length = 0;
									}

									//SETTING MULTIPLE ROUTES
									for (var i = 0, len = response.routes.length; i < len; i++) {
										//CALCULATING DISTANCE AND DURATION OF EACH ROUTE
										var totalDistance = 0;
										var totalDuration = 0;
										var legs = response.routes[i].legs;
										for(var x=0; x<legs.length; ++x) {
											totalDistance += legs[x].distance.value/1000;
											totalDuration += legs[x].duration.value/60;
										}
										var routeInfoObj = {routeDistance:totalDistance.toFixed(2),routeDuration:totalDuration.toFixed(2)};
										$scope.routesDistDurObjArr.push(routeInfoObj);
										$scope.routeList.push(response);

										/*
										var rowCount = table.rows.length;
										var row = table.insertRow(rowCount);
										row.setAttribute("data-dismiss","modal");
										row.addEventListener("click",function(){
											$scope.showChosenRoute(i);
										});

										row.insertCell(0).innerHTML= '<b>Route '+(i+1)+'</b>';
										row.insertCell(1).innerHTML= 'Distance: '+totalDistance.toFixed(2)+'km';
										row.insertCell(2).innerHTML= 'Duration: '+totalDuration.toFixed(2)+'minutes';
										*/
									}
								}
							});
							$('#routeListModal').modal('show');
						}
						else
						{
							$('#errorRouteModal').modal('show');
						}
					});
				}
				else
				{
					$('#errorRouteModal').modal('show');
				}
			});

		};

		//DISPLAY CHOSEN ROUTE ON MAP
		$scope.showChosenRoute = function(routeIndex){
			directionsDisplay.setMap($scope.map);
			directionsDisplay.setDirections($scope.routeList[routeIndex]);
			directionsDisplay.setRouteIndex(routeIndex);
		};

		// Create new Carpark
		$scope.create = function() {
			// Create new Carpark object
			var carpark = new Carparks ({
				name: this.name
			});

			// Redirect after save
			carpark.$save(function(response) {
				$location.path('carparks/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Carpark
		$scope.remove = function(carpark) {
			if ( carpark ) { 
				carpark.$remove();

				for (var i in $scope.carparks) {
					if ($scope.carparks [i] === carpark) {
						$scope.carparks.splice(i, 1);
					}
				}
			} else {
				$scope.carpark.$remove(function() {
					$location.path('carparks');
				});
			}
		};

		// Update existing Carpark
		$scope.update = function() {
			var carpark = $scope.carpark;

			carpark.$update(function() {
				$location.path('carparks/' + carpark._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Carparks
		$scope.find = function() {
			$scope.carparks = Carparks.query();
		};

		// Find existing Carpark
		$scope.findOne = function() {
			$scope.carpark = Carparks.get({ 
				carparkId: $stateParams.carparkId
			});
		};

		$scope.removeMarkers = function() {
			for (var w = 0; w < markers.length; w++) {
				markers[w].setMap(null);

			}
		};
	}
]);
