angular.module('services', ['ngResource']);
angular.module('controllers', []);
angular.module('directives', []);
angular.module('filters', []);

angular.module('aerobaticPortal', ['ngRoute', 'ngResource', 'ngCookies',
  'ui.bootstrap', 'duScroll', 'services', 'controllers', 'directives', 'filters', 'templates']);

angular.module('portal').config(function ($routeProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {
  // Use html5 pushState for route navigation
  $locationProvider.html5Mode(true);

  var routeResolve = {
    Profile: ['routeInitializer', function(routeInitializer) {
      return routeInitializer();
    }]
  };

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self'
  ]);

  function templateUrl(path) {
    if (aerobaticProvider.config.buildType === 'debug')
      return aerobaticProvider.config.cdnUrl + '/partials/' + path;
    else
      return path;
  }

  $routeProvider.
    when('/', {
      template: templateUrl('index.jade'),
      controller: 'IndexCtrl',
      resolve: routeResolve
    }).
    when('/profile', {
      templateUrl: templateUrl('profile.jade'),
      controller: 'ProfileCtrl',
      resolve: routeResolve
    }).
    when('/myapps', {
      templateUrl: templateUrl('myApps.jade'),
      controller: 'MyAppsCtrl',
      resolve: routeResolve
    }).
    when('/orgs/create', {
      templateUrl: templateUrl('createOrg.jade'),
      controller: 'CreateOrgCtrl',
      resolve: routeResolve
    }).
    when('/orgs/:orgId', {
      templateUrl: templateUrl('orgHome.jade'),
      controller: 'OrgHomeCtrl',
      resolve: routeResolve
    }).
    when('/orgs/:orgId/settings', {
      templateUrl: templateUrl('orgSettings.jade'),
      controller: 'OrgSettingsCtrl',
      resolve: routeResolve
    }).
    when('/orgs/:orgId/usage', {
      templateUrl: templateUrl('orgUsage.jade'),
      controller: 'OrgUsageCtrl',
      resolve: routeResolve
    }).
    when('/apps/:appId', {
      templateUrl: templateUrl('appVersions.jade'),
      controller: 'AppVersionsCtrl',
      resolve: routeResolve
    }).
    when('/apps/:appId/versions', {
      templateUrl: templateUrl('appVersions.jade'),
      controller: 'AppVersionsCtrl',
      resolve: routeResolve
    }).
    when('/apps/:appId/settings', {
      templateUrl: templateUrl('appSettings.jade'),
      controller: 'AppSettingsCtrl',
      resolve: routeResolve
    }).
    when('/apps/:appId/members', {
      templateUrl: templateUrl('appMembers.jade'),
      controller: 'AppMembersCtrl',
      resolve: routeResolve
    }).
    otherwise({
      redirectTo: '/'
    });

  $httpProvider.interceptors.push(function($q, $window, aerobatic) {
    return {
      responseError: function(rejection) {
        var status = rejection.status;
        // If the status is 401 Unauthorized, automatically logout
        if (status == 401) {
          $window.location = '/_logout?error=expired';
          return;
        }

        return $q.reject(rejection);
      }
    };
  });

  ngClipProvider.setPath("https://s3-us-west-2.amazonaws.com/aerobatic-media/ZeroClipboard.swf");
});

angular.module('aerobaticPortal').run(function($rootScope, $location, $log, aerobatic) {
  $rootScope.$on('$routeChangeError', function(event, current, previous, eventObj) {
    $log.error("Route change error", eventObj);

    // Store the route the user was trying to get to in rootScope
    if (current.$$route)
      $rootScope.returnToPath = current.$$route.originalPath;
  });

  $rootScope.previewUrl = function(versionId) {
    var url = $rootScope.application.url;
    if (versionId)
      url += "?_version=" + versionId;

    return url;
  };

  $rootScope.appUrl = function(app) {
    if (!app) return '';

    var url;
    var protocol = (app.requireSsl === true) ? 'https' : 'http';

    if (app.domain)
      url = protocol + '://' + app.domain;
    else
      url = protocol + '://' + app.name + '.' + aerobatic.appHost;

    return url;
  };
});

// Extensions to lodash
_.mixin({
  qs: function(obj) {
  	var qs = _.reduce(obj, function(result, value, key) {
  			return (!_.isNull(value) && !_.isUndefined(value)) ? (result += key + '=' + value + '&') : result;
  	}, '').slice(0, -1);
  	return qs;
  },
  // Split a string into an array eliminating all leading/trailing spaces
  splitTrim: function(str) {
    if (_.isString(str) === false)
      str = str.toString();

    return _.compact(_.map(str.split(/\s+/), function(s) {
      return s.trim();
    }));
  },
  isNullOrUndefined: function(obj) {
    return _.isNull(obj) || _.isUndefined(obj);
  }
});
