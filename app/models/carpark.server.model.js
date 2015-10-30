'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Carpark Schema
 */
var CarparkSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Carpark name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	infoWindow: {
		type: String,
		default: ''
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Carpark', CarparkSchema);
