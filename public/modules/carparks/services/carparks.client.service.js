'use strict';

//Carparks service used to communicate Carparks REST endpoints
angular.module('carparks').factory('Carparks', ['$resource',
	function($resource) {
		return $resource('carparks/:carparkId', { carparkId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);