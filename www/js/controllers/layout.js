
angular.module('controllers').controller('LayoutCtrl', function($scope, $rootScope, $location, $log, $modal, Profile) {
  'use strict';

  $rootScope.$on('$routeChangeStart', function(event, current, previous, eventObj) {
    // Any route with appId in the routeParams should show the app nav.
    if (current.pathParams.appId)
      $rootScope.navMode = 'app';
    else if (current.pathParams.orgId)
      $rootScope.navMode = 'org';
  });
});
