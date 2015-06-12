
angular.module('controllers').controller('OrgHomeCtrl', function($scope, $rootScope, $location, $log,
  $timeout, $q, $modal, $routeParams, $cookies, Resources, Context, Config) {
  'use strict';

  // $rootScope.organization = _.find($rootScope.organizations, {orgId: $routeParams.orgId});
  if (!$rootScope.organization)
    return $location.path('/');

  $scope.localInstance = Config.localInstance;

  // If our applications aren't loaded yet, get them now. Keep them in rootScope
  // so they are accessible to multiple controllers without reloading everytime.
  if ($location.search().activate === '1')
    activateOrg().then(loadOrganization($rootScope.organization));
  else
    loadOrganization($rootScope.organization);

  $scope.showAppSearch = function() {
    return $scope.applications && $scope.applications.length > 5;
  };

  $scope.refreshApps = function() {
    $log.info("Refreshing apps");
    Resources.Profile.apps({refresh: 1}, function(apps) {
      $rootScope.applications = apps;
    }, function(err) {
      $log.error(err);
    });
  };

  $scope.createAppModal = function() {
    $modal.open({templateUrl: 'createAppModal'});
  };

  function loadOrganization(org) {
    $scope.orgLoading = true;
    var promises = [];
    if (org) {
      promises.push(Resources.Organization.apps({orgId: org.orgId}).$promise);
      // promises.push(Resources.Organization.members({orgId: org.orgId}).$promise);
      promises.push(Resource.Organization.events().$promise);
    }
    else
      promises.push(Resources.Profile.apps().$promise);

    $q.all(promises).then(function(results) {
      $scope.applications = results[0];
      // $scope.members = results[1];
      // $scope.events = results[2];
      $scope.orgLoading = false;
      $cookies.selectedOrgId = org.orgId;
    }, function(err) {
      $scope.error = 'Error encountered loading the dashboard';
      $scope.orgLoading = false;
    });
  }

  // function activateOrg() {
  //   var plan = $location.search().plan;
  //
  //   // Invoke convert API call to finalize org creation.
  //   // $scope.orgActivatedMessage = true;
  //   $scope.orgLoading = true;
  //   return Resources.Organization.activate({orgId: $rootScope.organization.orgId, plan: plan}, function(org) {
  //     // Update the org in memory with the activated orgs attributes
  //     _.extend($rootScope.organization, org);
  //     $scope.orgActivated = true;
  //   }, function(resp) {
  //     $scope.orgLoading = false;
  //     if (resp.data.error === 'invalidPlanName') {
  //       $scope.error = "Could not activate the organization. The plan name is not valid.";
  //     }
  //     else {
  //       $scope.error = "Could not activate the organization.";
  //     }
  //   }).$promise;
  // }
});
