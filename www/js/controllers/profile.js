
angular.module('controllers').controller('ProfileCtrl', function($scope, $rootScope, $location, Profile, GitHub) {
  $scope.showWelcome = $rootScope.profile.complete === false;

  
  var maskedKey = new Array(32).join('*');
  $scope.secretKey = maskedKey;

  $scope.editProfile = _.clone($rootScope.profile);
  GitHub.emails().then(function(data) {
    $scope.emails = data;
    $scope.editProfile.email = _.first(data);
  });

  $scope.toggleSecretKey = function() {
    $scope.secretKey  = ($scope.secretKey == maskedKey) ? $rootScope.profile.secretKey : maskedKey;
  };

  $scope.revealTooltip = function() {
    return ($scope.secretKey == maskedKey) ? 'Reveal' : 'Mask';
  };

  $scope.submit = function() {
    // Save the profile
    Profile.update(_.pick($scope.editProfile, ['userId', 'email'])).then(function() {
      $rootScope.profile.email = $scope.editProfile.email;
      $rootScope.profile.complete = true;
      $location.path('/');
    });
  };
});
