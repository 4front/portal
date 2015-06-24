angular.module('services').factory('routeInitializer', function(
  $q, $rootScope, $log, $route, $location, $window, $cookies, Resources) {

  return function() {
    var deferred = $q.defer();

    $rootScope.pageError = null;

    function organizationsPromise() {
      var deferred = $q.defer();
      if ($rootScope.organizations) {
        deferred.resolve();
      }
      else {
        Resources.Profile.orgs({}, function(orgs) {
          $rootScope.organizations = orgs;
          deferred.resolve();
        }, function(err) {
          deferred.reject(err);
        });
      }
      return deferred.promise;
    }

    function appPromise() {
      var deferred = $q.defer();
      var appId = $route.current.params.appId;
      if (!appId) {
        delete $rootScope.application;
        deferred.resolve();
      }
      // If the app with this appId is already in the rootScope, we can exit out early.
      else if ($rootScope.application && $rootScope.application.appId === appId) {
        deferred.resolve();
      }
      else {
        // If the app isn't loaded yet, load it now
        Resources.App.get({appId: appId}, function(app) {
          $rootScope.application = app;
          deferred.resolve();
        }, function(err) {
          deferred.reject(err);
        });
      }
      return deferred.promise;
    }

    return $q.all([organizationsPromise(), appPromise()]).then(function() {
      var orgId = $route.current.params.orgId;
      if (orgId) {
        $rootScope.organization = _.find($rootScope.organizations, {orgId: orgId});

        // If the specified organization is not in the list of orgs for this user
        // log them out.
        if (!$rootScope.organization)
          return $window.location.href = "logout";
      }

      if ($rootScope.application) {
        $rootScope.organization = _.find($rootScope.organizations, {orgId: app.orgId});

        // If the user is not a member of the organization to which the app belongs
        // return to the home page.
        if (!$rootScope.organization)
          return $window.location.href = 'logout';
      }
    });
  };
});
