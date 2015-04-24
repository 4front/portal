angular.module('controllers').controller('IndexCtrl', function($scope, $rootScope, $location, $log, $cookies, Context) {
  'use strict';

  // If the user's profile is not complete, redirect to the profile page
  // if ($rootScope.profile.complete !== true)
  //   return $location.path('/profile');

  if ($rootScope.defaultOrg) {
    // Redirect to the org dashboard
    $log.debug("Redirecting to default org " + $rootScope.defaultOrg.name);
    return $location.path('/orgs/' + $rootScope.defaultOrg.orgId);
  }
  else {
    // If the user does not have any organizations, redirect to the createOrg page
    $location.path('/orgs/create');
  }
});
