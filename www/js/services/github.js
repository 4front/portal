
angular.module('services').factory('GitHub', function($http, $q, Config) {
  var httpOptions = {
    method: 'GET',
    headers: {
      'Authorization': 'token ' + Config.user.accessToken
    }
  };

  return {
    emails: function() {
      var deferred = $q.defer();
      $http(_.extend({}, httpOptions, {
        url: 'https://api.github.com/user/emails'
      })).success(function(data) {
        deferred.resolve(_.map(data, 'email'));
      }).error(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },

    userSearch: function(term) {
      var deferred = $q.defer();
      $http(_.extend(httpOptions, {
        url: 'https://api.github.com/search/users?q=' + encodeURIComponent(term) + '+type:User'
      })).success(function(data) {
        deferred.resolve(_.map(_.take(data.items, 10), function(user) {
          return _.pick(user, 'id', 'login', 'avatar_url');
        }));
      }).error(function(data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    lookupUser: function(username) {
      var deferred = $q.defer();
      $http(_.extend(httpOptions, {
        url: 'https://api.github.com/users/' + encodeURIComponent(username)
      })).success(function(data) {
        deferred.resolve(data);
      }).error(function(data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }
  };
});
