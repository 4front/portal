angular.module('controllers').controller('CreateOrgCtrl', function($scope, $rootScope, $log, $location, $window, Resources, Config, Context) {
  'use strict';

  $scope.newOrg = new Resources.Organization();

  $scope.submit = function() {
    // Validate the org.
    if (_.isEmpty($scope.newOrg.name)) {
      $window.scrollTo(0, 0);
      return ($scope.createOrgError = "Please provide a name for your organization.");
    }

    $log.info("Saving new organization");
    $scope.orgSaving = true;
    $scope.newOrg.$save(function(org) {
      delete $scope.error;
      $log.info("Org created");

      // Add this org to the list in memory and set it as the current org.
      if (!_.isArray($rootScope.organizations))
        $rootScope.organizations = [];

      $rootScope.organizations.push(org);
      $rootScope.organization = org;

      // Redirect to the org dashboard.
      $location.path("/orgs/" + org.orgId);
    }, function(resp) {
      $scope.orgSaving = false;
      if (resp.data.error === 'userAlreadyUsedTrial')
        $scope.createOrgError = "You have already used up your trial organization. Please select a paid plan.";
      else
        $scope.createOrgError = 'Could not create organization';

      $window.scrollTo(0, 0);
      $log.error(resp.data);
    });
  };
});
