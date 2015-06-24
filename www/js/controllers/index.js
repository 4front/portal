angular.module('controllers').controller('IndexCtrl', function($scope, $rootScope, $location, $log, $cookies, Context) {
  'use strict';

  if ($rootScope.organizations.length) {
    var defaultOrg = null;
    if ($cookies.selectedOrgId)
      $rootScope.defaultOrg = _.find($rootScope.organizations, {orgId: $cookies.selectedOrgId});

    // If there was no org specified in the cookie, use the first org
    if (!defaultOrg)
      $rootScope.defaultOrg = _.first($rootScope.organizations);

    // Store the orgId in the cookie
    if ($rootScope.defaultOrg)
      $cookies.selectedOrgId = $rootScope.defaultOrg.orgId;
  }

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
