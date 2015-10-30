'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Carpark = mongoose.model('Carpark'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, carpark;

/**
 * Carpark routes tests
 */
describe('Carpark CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Carpark
		user.save(function() {
			carpark = {
				name: 'Carpark Name'
			};

			done();
		});
	});

	it('should be able to save Carpark instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Carpark
				agent.post('/carparks')
					.send(carpark)
					.expect(200)
					.end(function(carparkSaveErr, carparkSaveRes) {
						// Handle Carpark save error
						if (carparkSaveErr) done(carparkSaveErr);

						// Get a list of Carparks
						agent.get('/carparks')
							.end(function(carparksGetErr, carparksGetRes) {
								// Handle Carpark save error
								if (carparksGetErr) done(carparksGetErr);

								// Get Carparks list
								var carparks = carparksGetRes.body;

								// Set assertions
								(carparks[0].user._id).should.equal(userId);
								(carparks[0].name).should.match('Carpark Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Carpark instance if not logged in', function(done) {
		agent.post('/carparks')
			.send(carpark)
			.expect(401)
			.end(function(carparkSaveErr, carparkSaveRes) {
				// Call the assertion callback
				done(carparkSaveErr);
			});
	});

	it('should not be able to save Carpark instance if no name is provided', function(done) {
		// Invalidate name field
		carpark.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Carpark
				agent.post('/carparks')
					.send(carpark)
					.expect(400)
					.end(function(carparkSaveErr, carparkSaveRes) {
						// Set message assertion
						(carparkSaveRes.body.message).should.match('Please fill Carpark name');
						
						// Handle Carpark save error
						done(carparkSaveErr);
					});
			});
	});

	it('should be able to update Carpark instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Carpark
				agent.post('/carparks')
					.send(carpark)
					.expect(200)
					.end(function(carparkSaveErr, carparkSaveRes) {
						// Handle Carpark save error
						if (carparkSaveErr) done(carparkSaveErr);

						// Update Carpark name
						carpark.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Carpark
						agent.put('/carparks/' + carparkSaveRes.body._id)
							.send(carpark)
							.expect(200)
							.end(function(carparkUpdateErr, carparkUpdateRes) {
								// Handle Carpark update error
								if (carparkUpdateErr) done(carparkUpdateErr);

								// Set assertions
								(carparkUpdateRes.body._id).should.equal(carparkSaveRes.body._id);
								(carparkUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Carparks if not signed in', function(done) {
		// Create new Carpark model instance
		var carparkObj = new Carpark(carpark);

		// Save the Carpark
		carparkObj.save(function() {
			// Request Carparks
			request(app).get('/carparks')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Carpark if not signed in', function(done) {
		// Create new Carpark model instance
		var carparkObj = new Carpark(carpark);

		// Save the Carpark
		carparkObj.save(function() {
			request(app).get('/carparks/' + carparkObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', carpark.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Carpark instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Carpark
				agent.post('/carparks')
					.send(carpark)
					.expect(200)
					.end(function(carparkSaveErr, carparkSaveRes) {
						// Handle Carpark save error
						if (carparkSaveErr) done(carparkSaveErr);

						// Delete existing Carpark
						agent.delete('/carparks/' + carparkSaveRes.body._id)
							.send(carpark)
							.expect(200)
							.end(function(carparkDeleteErr, carparkDeleteRes) {
								// Handle Carpark error error
								if (carparkDeleteErr) done(carparkDeleteErr);

								// Set assertions
								(carparkDeleteRes.body._id).should.equal(carparkSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Carpark instance if not signed in', function(done) {
		// Set Carpark user 
		carpark.user = user;

		// Create new Carpark model instance
		var carparkObj = new Carpark(carpark);

		// Save the Carpark
		carparkObj.save(function() {
			// Try deleting Carpark
			request(app).delete('/carparks/' + carparkObj._id)
			.expect(401)
			.end(function(carparkDeleteErr, carparkDeleteRes) {
				// Set message assertion
				(carparkDeleteRes.body.message).should.match('User is not logged in');

				// Handle Carpark error error
				done(carparkDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Carpark.remove().exec();
		done();
	});
});