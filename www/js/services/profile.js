angular.module('services').factory('Profile', function($log, $http, $location, $q, $timeout, $resource, $rootScope, $cookies, Config) {
  var _current = null;

  var profileResource = $resource(Config.apiUrl + "/profile/:resource", {}, {
    update: {method: 'PUT'},
    orgs: {params: {resource: 'orgs'}, method: 'GET', isArray: true},
    apps: {params: {resource: 'apps'}, method: 'GET', isArray: true}
  });

  var exports = {};

  // Get the current user profile.
  exports.init = function() {
    // If we've already retrieved the user, resolve the promise immedietely.
    var deferred = $q.defer();

    if ($rootScope.profile) {
      $timeout(function() {
        deferred.resolve($rootScope.profile);
      }, 0);
    }
    else {
      profileResource.get().$promise
        .then(function(profile) {
          profile.complete = _.isEmpty(profile.email) === false;
          $rootScope.profile = _.omit(profile, 'orgs');
          config.user.userId = profile.userId;

          $rootScope.organizations = profile.orgs;
          $rootScope.defaultOrganization = defaultOrganization();

          return profileResource.apps().$promise;
        })
        .then(function(personalApps) {
          $rootScope.personalApps = personalApps;
          deferred.resolve($rootScope.profile);
        })
        .catch(function(err) {
          deferred.reject(err);
        });
    }
    return deferred.promise;
  };

  // Update the profile
  exports.update = function(profile) {
    if (profile.userId !== $rootScope.profile.userId) {
      return $timeout(function() {
        return new Error("Illegal profile update");
      }, 0);
    }

    var deferred = $q.defer();

    profileResource.update(profile, function() {
      _.extend($rootScope.profile, profile);
      deferred.resolve();
    }, function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  function defaultOrganization() {
    var defaultOrg = null;
    if ($cookies.selectedOrgId)
      defaultOrg = _.find($rootScope.organizations, {orgId: $cookies.selectedOrgId});

    // If there was no org specified in the cookie, use the first org
    if (!defaultOrg)
      defaultOrg = _.first($rootScope.organizations);

    // Store the orgId in the cookie
    if (defaultOrg)
      $cookies.selectedOrgId = defaultOrg.orgId;

    return defaultOrg;
  }

  return exports;
});
