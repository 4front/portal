angular.module('services').factory('routeInitializer', function($q, $rootScope, $route, $location, $window, Resources, Profile) {
  return function() {
    var deferred = $q.defer();

    Profile.init().then(function() {
      // Need to wait until the Profile has initialized to be assured
      // $rootScope.organizations has loaded.
      if ($route.current.params.orgId) {
        $rootScope.organization = _.find($rootScope.organizations, {orgId: $route.current.params.orgId});

        if (!$rootScope.organization) {
          $location.path('/');
        }
      }
      else
        delete $rootScope.organization;

      if ($route.current.params.appId) {
        // If the app with this appId is already in the rootScope, we can exit out early.
        if ($rootScope.application && $rootScope.application.appId === $route.current.params.appId) {
          $rootScope.organization = _.find($rootScope.organizations, {orgId: $rootScope.application.orgId});
          return deferred.resolve(Profile);
        }

        // If the app isn't loaded yet, load it now
        var appPromise = Resources.App.get({appId: $route.current.params.appId}).$promise;
        appPromise.then(function(app) {
          $rootScope.application = app;
          if (app.orgId) {
            $rootScope.organization = _.find($rootScope.organizations, {orgId: app.orgId});

            // If the organization to which the app belongs is not in the user's list of
            // organizations, return to the home page.
            if (!$rootScope.organization) {
              $location.path('/');
            }
          }
          else {
            // If this is a personal app, make sure there is no organization context.
            delete $rootScope.organization;
          }

          deferred.resolve(Profile);
        }, function(err) {
          deferred.reject(err);
        });
      }
      else {
        delete $rootScope.application;
        deferred.resolve(Profile);
      }
    }, function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };
});
