
angular.module('controllers').controller('LayoutCtrl', function($scope, $rootScope, $location, $log, $modal, Profile) {
  'use strict';

  var FULL_SCREEN_VIEWS = ['/apps/create', '/orgs/create', '/myapps'];

  $rootScope.$on('$routeChangeStart', function(event, current, previous, eventObj) {
    // Any route with appId in the routeParams should show the app nav.
    if (current.pathParams.appId)
      $rootScope.navMode = 'app';
    else if (current.pathParams.orgId)
      $rootScope.navMode = 'org';

    // TODO: This goes away eventually
    else if (current.$$route && current.$$route.originalPath == '/myapps')
      $rootScope.navMode = 'myapps';
    // else if (current.$$route && current.$$route.originalPath == '/orgs/create')
    //   $rootScope.navMode = 'createOrg';
    else
      delete $rootScope.navMode;

    if (current.$$route)
      $scope.fullScreen = _.contains(FULL_SCREEN_VIEWS, current.$$route.originalPath);
    else
      $scope.fullScreen = false;
  });
});
