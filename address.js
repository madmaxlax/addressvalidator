angular
	.module('MyApp')
	.controller('DemoCtrl', function($scope, $q) {
		$scope.user = {
			firstName: '',
			lastName: '',
			address: '',
			city: '',
			state: '',
			postalCode: ''
		};
		$scope.zipcodecheck = {
			cityfromzip: '',
			statefromzip: '',
			lastzipsent: '' //to prevent multple requests of google for the same zip
		};
		$scope.resp = null;
		$scope.geocode = null;
		this.geocoderinit = function() {
			$scope.geocode = new google.maps.Geocoder();
		};
		$scope.geocodezipcheck = function() {
			var deferred = $q.defer();

			//this could be a notify deferred.notify('loading')
			//scope.resp = "loading";
			deferred.notify('loading');

			this.toSend = {
				address: $scope.userForm.postalCode.$viewValue,
				componentRestrictions: {
					country: 'US'
				}
			};
			console.log("sending this");
			console.log(this.toSend);
			$scope.geocode.geocode(this.toSend, function(results, status) {
				$scope.zipcodecheck.lastzipsent = this.toSend.address;
				if (status == google.maps.GeocoderStatus.OK) {
					console.log(results);
					scope.resp = results[0];

					angular.forEach(results[0].address_components, function(comp, key) {
						//grab the city and state, if there, from the address component
						console.log(comp);
						if (comp.types.length === 2 && comp.types[1] === 'political') {
							if (comp.types[0] === 'locality') {
								$scope.zipcodecheck.cityfromzip = comp.long_name;
							}
							if (comp.types[0] === 'administrative_area_level_1') {
								$scope.zipcodecheck.statefromzip = comp.short_name;
							}
						}
						//resolve the deferred
						deferred.resolve('google maps came back successfully');
					});

				} else {
					//reject message
					deferred.reject("Geocode was not successful for the following reason: " + status);
				}
			});

			//don't forget the .promise!
			return deferred.promise;
		};
		this.geocoderinit();
		$scope.matchtozip = function() {
			$scope.user.city = $scope.zipcodecheck.cityfromzip;
			$scope.user.state = $scope.zipcodecheck.statefromzip;
			$scope.$apply();
		};
		$scope.check = function() {

		};

	})
	.config(function($mdThemingProvider) {

		// Configure a dark theme with primary foreground yellow

		$mdThemingProvider.theme('docs-dark', 'default')
			.primaryPalette('yellow')
			.dark();

	})
	.directive('zipcodematches', function() {
		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {
				ctrl.$validators.zipcodematches = function(modelValue, viewValue) {
					if (ctrl.$isEmpty(modelValue)) {
						// consider empty models to be valid
						return true;
					}
					if (viewValue.length > 4) {


						console.log("controller");
						console.log(ctrl);
						console.log("scope");
						console.log(scope);


						//geocode zipcode if needed
						if (scope.zipcodecheck.lastzipsent.toLowerCase() != scope.userForm.postalCode.$viewValue.toLowerCase()) {
							//asynch call
							scope.geocodezipcheck().then(
								//success
								function(message) {
									//if nothing is in city and state yet, just input that for the user
									if (scope.userForm.city.$pristine && scope.userForm.state.$pristine) {
										scope.matchtozip();
									}


									//now check if it matches
									if (scope.userForm.city.toLowerCase === scope.zipcodecheck.cityfromzip.toLowerCase && scope.userForm.state.toLowerCase === scope.zipcodecheck.statefromzip.toLowerCase) {
										return true;
									} else {
										return false;
									}
								},
								//failed call
								function(message) {
									scope.resp = message;
								},
								//notify/update
								function(message){
									scope.resp = message;
								}
							);

						} else { //no need to geocode again

							//if nothing is in city and state yet, just input that for the user
							if (scope.userForm.city.$pristine && scope.userForm.state.$pristine) {
								scope.matchtozip();
							}


							//now check if it matches
							if (scope.userForm.city.toLowerCase === scope.zipcodecheck.cityfromzip.toLowerCase && scope.userForm.state.toLowerCase === scope.zipcodecheck.statefromzip.toLowerCase) {
								return true;
							} else {
								return false;
							}
						}
						// it is valid
						return true;

					}

					// it is invalid
					return false;
				};
			}
		};
	})
	.directive('validzip', function() {
		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {
				ctrl.$validators.validzip = function(modelValue, viewValue) {
					if (ctrl.$isEmpty(modelValue)) {
						// consider empty models to be valid
						return true;
					}

					if (viewValue.length > 4) {
						//maybe do other zuip validation here
						// it is valid
						return true;
					}

					// it is invalid
					return false;
				};
			}
		};
	});