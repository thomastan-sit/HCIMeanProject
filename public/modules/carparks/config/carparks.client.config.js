'use strict';

// Configuring the Articles module
angular.module('carparks').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Carparks', 'carparks', 'dropdown', '/carparks(/create)?');
		Menus.addSubMenuItem('topbar', 'carparks', 'List Carparks', 'carparks');
		Menus.addSubMenuItem('topbar', 'carparks', 'New Carpark', 'carparks/create');
	}
]);