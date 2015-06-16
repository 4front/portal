angular.module('controllers').controller('IndexCtrl', function($scope, $rootScope, $location, $log, $cookies, Context) {
  'use strict';

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
