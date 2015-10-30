'use strict';

//Setting up route
angular.module('carparks').config(['$stateProvider',
	function($stateProvider) {
		// Carparks state routing
		$stateProvider.
		state('listCarparks', {
			url: '/carparks',
			templateUrl: 'modules/carparks/views/list-carparks.client.view.html'
		}).
		state('createCarpark', {
			url: '/carparks/create',
			templateUrl: 'modules/carparks/views/create-carpark.client.view.html'
		}).
		state('viewCarpark', {
			url: '/carparks/:carparkId',
			templateUrl: 'modules/carparks/views/view-carpark.client.view.html'
		}).
		state('editCarpark', {
			url: '/carparks/:carparkId/edit',
			templateUrl: 'modules/carparks/views/edit-carpark.client.view.html'
		});
	}
]);