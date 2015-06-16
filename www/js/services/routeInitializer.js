angular.module('services').factory('routeInitializer', function(
  $q, $rootScope, $log, $route, $location, $window, $cookies, Resources) {

  return function() {
    var deferred = $q.defer();

    $rootScope.pageError = null;

    if ($route.current.params.orgId) {
      $rootScope.organization = _.find($rootScope.organizations, {orgId: $route.current.params.orgId});

      // If there are no organizations, redirect to create-org
      if (!$rootScope.organization)
        return $location.path('/');
    }
    else
      delete $rootScope.organization;

    var appId = $route.current.params.appId;
    if (!appId) {
      delete $rootScope.application;
      deferred.resolve();
    }
    // If the app with this appId is already in the rootScope, we can exit out early.
    else if ($rootScope.application && $rootScope.application.appId === appId) {
      $rootScope.organization = _.find($rootScope.organizations, {
        orgId: $rootScope.application.orgId
      });
      deferred.resolve();
    }
    else {
      // If the app isn't loaded yet, load it now
      Resources.App.get({appId: appId}, function(app) {
        $rootScope.organization = _.find($rootScope.organizations, {orgId: app.orgId});

        // If the organization to which the app belongs
        // return to the home page.
        if (!$rootScope.organization)
          return $location.path('/');

        deferred.resolve();
      });

      return deferred.promise;
    }
  };
});
