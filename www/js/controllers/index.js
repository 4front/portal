angular.module('controllers').controller('IndexCtrl', function($scope, $rootScope, $location, $log, $cookies, Profile) {
  'use strict';

  // If the user's profile is not complete, redirect to the profile page
  if ($rootScope.profile.complete !== true)
    return $location.path('/profile');

  // Make sure that defaultOrganization is valid.
  if (_.isArray($rootScope.organizations) && $rootScope.organizations.length > 0) {
    if ($rootScope.defaultOrganization) {
      if (!_.any($rootScope.organizations, {orgId: $rootScope.defaultOrganization.orgId}))
        $rootScope.defaultOrganization = $rootScope.organizations[0];
    }
    
    // Redirect to the org dashboard
    $log.debug("Redirecting to org " + $rootScope.defaultOrganization.orgId);
    return $location.path('/orgs/' + $rootScope.defaultOrganization.orgId);
  }

  // If the user does not have any organizations, redirect to the createOrg page
  if ($rootScope.personalApps.length > 0) {
    $log.debug('redirecting to myapps');
    $location.path('/myapps');
  }
  else
    $location.path('/orgs/create');

  // TODO: Once personal accounts are turned off, redirect to the /orgs/create page
  // For now force all existing users to the temporary myapps page.
  // return $location.path('/myapps');
});
