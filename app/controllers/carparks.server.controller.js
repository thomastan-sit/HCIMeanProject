'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Carpark = mongoose.model('Carpark'),
	_ = require('lodash');

/**
 * Create a Carpark
 */
exports.create = function(req, res) {
	var carpark = new Carpark(req.body);
	carpark.user = req.user;

	carpark.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carpark);
		}
	});
};

/**
 * Show the current Carpark
 */
exports.read = function(req, res) {
	res.jsonp(req.carpark);
};

/**
 * Update a Carpark
 */
exports.update = function(req, res) {
	var carpark = req.carpark ;

	carpark = _.extend(carpark , req.body);

	carpark.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carpark);
		}
	});
};

/**
 * Delete an Carpark
 */
exports.delete = function(req, res) {
	var carpark = req.carpark ;

	carpark.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carpark);
		}
	});
};

/**
 * List of Carparks
 */
exports.list = function(req, res) { 
	Carpark.find().sort('-created').populate('user', 'displayName').exec(function(err, carparks) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carparks);
		}
	});
};

/**
 * Carpark middleware
 */
exports.carparkByID = function(req, res, next, id) { 
	Carpark.findById(id).populate('user', 'displayName').exec(function(err, carpark) {
		if (err) return next(err);
		if (! carpark) return next(new Error('Failed to load Carpark ' + id));
		req.carpark = carpark ;
		next();
	});
};

/**
 * Carpark authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.carpark.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
