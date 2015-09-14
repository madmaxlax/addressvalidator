angular
	.module('MyApp')
	.controller('DemoCtrl', function($scope) {
		$scope.user = {
			firstName: '',
			lastName: '',
			address: '',
			city: '',
			state: '',
			postalCode: ''
		};
		$scope.resp = null;
		$scope.geocode = null;
		this.geocoderinit = function() {
			$scope.geocode = new google.maps.Geocoder();
		};
		this.geocoderinit();
		$scope.check = function() {
			$scope.resp = "loading";
			this.toSend = {
				address: $scope.user.postalCode,
				componentRestrictions: {
					country: 'USA'
				}
			};
			console.log(this.toSend);
			$scope.geocode.geocode(this.toSend, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					console.log(results);
					$scope.user.city = results[0].address_components[1].long_name;
					$scope.user.state = results[0].address_components[2].short_name;
					$scope.resp = results[0];
					$scope.$apply();
					//$scope.resp += "\nLoading address";
/* 					$scope.geocode.geocode({
							lat: results[0].geometry.location.G,
							lng: results[0].geometry.location.k
						},
						function(results, status) {
							console.log(results);
						}
					); */
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
		};
	})
	.config(function($mdThemingProvider) {

		// Configure a dark theme with primary foreground yellow

		$mdThemingProvider.theme('docs-dark', 'default')
			.primaryPalette('yellow')
			.dark();

	});