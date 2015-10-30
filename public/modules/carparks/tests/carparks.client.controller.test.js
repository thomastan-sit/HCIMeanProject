'use strict';

(function() {
	// Carparks Controller Spec
	describe('Carparks Controller Tests', function() {
		// Initialize global variables
		var CarparksController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Carparks controller.
			CarparksController = $controller('CarparksController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Carpark object fetched from XHR', inject(function(Carparks) {
			// Create sample Carpark using the Carparks service
			var sampleCarpark = new Carparks({
				name: 'New Carpark'
			});

			// Create a sample Carparks array that includes the new Carpark
			var sampleCarparks = [sampleCarpark];

			// Set GET response
			$httpBackend.expectGET('carparks').respond(sampleCarparks);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.carparks).toEqualData(sampleCarparks);
		}));

		it('$scope.findOne() should create an array with one Carpark object fetched from XHR using a carparkId URL parameter', inject(function(Carparks) {
			// Define a sample Carpark object
			var sampleCarpark = new Carparks({
				name: 'New Carpark'
			});

			// Set the URL parameter
			$stateParams.carparkId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/carparks\/([0-9a-fA-F]{24})$/).respond(sampleCarpark);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.carpark).toEqualData(sampleCarpark);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Carparks) {
			// Create a sample Carpark object
			var sampleCarparkPostData = new Carparks({
				name: 'New Carpark'
			});

			// Create a sample Carpark response
			var sampleCarparkResponse = new Carparks({
				_id: '525cf20451979dea2c000001',
				name: 'New Carpark'
			});

			// Fixture mock form input values
			scope.name = 'New Carpark';

			// Set POST response
			$httpBackend.expectPOST('carparks', sampleCarparkPostData).respond(sampleCarparkResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Carpark was created
			expect($location.path()).toBe('/carparks/' + sampleCarparkResponse._id);
		}));

		it('$scope.update() should update a valid Carpark', inject(function(Carparks) {
			// Define a sample Carpark put data
			var sampleCarparkPutData = new Carparks({
				_id: '525cf20451979dea2c000001',
				name: 'New Carpark'
			});

			// Mock Carpark in scope
			scope.carpark = sampleCarparkPutData;

			// Set PUT response
			$httpBackend.expectPUT(/carparks\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/carparks/' + sampleCarparkPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid carparkId and remove the Carpark from the scope', inject(function(Carparks) {
			// Create new Carpark object
			var sampleCarpark = new Carparks({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Carparks array and include the Carpark
			scope.carparks = [sampleCarpark];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/carparks\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCarpark);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.carparks.length).toBe(0);
		}));
	});
}());