'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var carparks = require('../../app/controllers/carparks.server.controller');

	// Carparks Routes
	app.route('/carparks')
		.get(carparks.list)
		.post(users.requiresLogin, carparks.create);

	app.route('/carparks/:carparkId')
		.get(carparks.read)
		.put(users.requiresLogin, carparks.hasAuthorization, carparks.update)
		.delete(users.requiresLogin, carparks.hasAuthorization, carparks.delete);

	// Finish by binding the Carpark middleware
	app.param('carparkId', carparks.carparkByID);
};
