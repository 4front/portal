angular.module('services').factory('Profile', function($log, $http, $location, $q, $timeout, $resource, $rootScope, $cookies, Config) {
  var _current = null;

  var profileResource = $resource(Config.apiUrl + "/profile/:resource", {}, {
    update: {method: 'PUT'},
    orgs: {params: {resource: 'orgs'}, method: 'GET', isArray: true},
    apps: {params: {resource: 'apps'}, method: 'GET', isArray: true}
  });

  var exports = {};

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

  return exports;
});
