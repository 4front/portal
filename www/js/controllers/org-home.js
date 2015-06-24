
angular.module('controllers').controller('OrgHomeCtrl', function($scope, $rootScope, $location, $log,
  $timeout, $q, $modal, $routeParams, $cookies, Resources, Context, Config) {
  'use strict';

  // $rootScope.organization = _.find($rootScope.organizations, {orgId: $routeParams.orgId});
  // if (!$rootScope.organization)
  //   return $location.path('/');

  $scope.localInstance = Config.localInstance;
  $rootScope.subNav = 'apps';

  $scope.pageLoading = true;
  Resources.Organization.apps({orgId: $rootScope.organization.orgId}, function(apps) {
    $scope.pageLoading = false;
    $scope.applications = apps;
  }, function(err) {
    $scope.pageLoading = false;
    $rootScope.pageError = 'Error loading apps';
  });


  $scope.showAppSearch = function() {
    return $scope.applications && $scope.applications.length > 5;
  };

  // $scope.refreshApps = function() {
  //   $log.info("Refreshing apps");
  //   Resources.Profile.apps({refresh: 1}, function(apps) {
  //     $rootScope.applications = apps;
  //   }, function(err) {
  //     $log.error(err);
  //   });
  // };

  $scope.createAppModal = function() {
    $modal.open({templateUrl: 'createAppModal'});
  };
});
