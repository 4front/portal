angular.module('services', ['ngResource']);
angular.module('controllers', []);
angular.module('directives', []);
angular.module('filters', []);

angular.module('services').value('Config', __config__);

angular.module('portal', ['ngRoute', 'ngResource', 'ngCookies',
  'ui.bootstrap', 'duScroll', 'services', 'controllers', 'directives', 'filters']);

angular.module('portal').config(function ($routeProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {
  // Use html5 pushState for route navigation
  $locationProvider.html5Mode(true);

  var routeResolve = {
    Context: ['routeInitializer', function(routeInitializer) {
      return routeInitializer();
    }]
  };

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    __config__.apiUrl
  ]);

  $routeProvider.
    when('/', {
      template: '',
      controller: 'IndexCtrl',
      resolve: routeResolve
    }).
    when('/profile', {
      templateUrl: 'views/partials/profile',
      controller: 'ProfileCtrl',
      resolve: routeResolve
    }).
    when('/orgs/create', {
      templateUrl: 'views/partials/create-org',
      controller: 'CreateOrgCtrl',
      resolve: routeResolve
    }).
    when('/orgs/:orgId', {
      templateUrl: 'views/partials/org-home',
      controller: 'OrgHomeCtrl',
      resolve: routeResolve
    }).
    when('/orgs/:orgId/settings', {
      templateUrl: 'views/partials/org-settings',
      controller: 'OrgSettingsCtrl',
      resolve: routeResolve
    }).
    when('/orgs/:orgId/usage', {
      templateUrl: 'views/partials/usage',
      controller: 'OrgUsageCtrl',
      resolve: routeResolve
    }).
    when('/apps/:appId', {
      templateUrl: 'views/partials/app-versions',
      controller: 'AppVersionsCtrl',
      resolve: routeResolve
    }).
    when('/apps/:appId/versions', {
      templateUrl: 'views/partials/app-versions',
      controller: 'AppVersionsCtrl',
      resolve: routeResolve
    }).
    when('/apps/:appId/settings', {
      templateUrl: 'views/partials/app-settings',
      controller: 'AppSettingsCtrl',
      resolve: routeResolve
    }).
    otherwise({
      redirectTo: '/'
    });

  $httpProvider.interceptors.push(function($q, $window) {
    return {
      responseError: function(rejection) {
        var status = rejection.status;
        // If the status is 401 Unauthorized, automatically logout
        if (status == 401) {
          $window.location = '/logout?error=expired';
          return;
        }

        return $q.reject(rejection);
      },
      request: function(config) {
        // Add the JWT http header
        if (config.url.indexOf(__config__.apiUrl) === 0)
          config.headers['X-Access-Token'] = __config__.user.jwt.token;

        return config;
      }
    };
  });
});

angular.module('portal').run(function($rootScope, $location, $log, $cookies, Config) {
  // Store the user's organizations on the rootScope
  $rootScope.organizations = Config.user.orgs;

  if ($rootScope.organizations.length) {
    var defaultOrg = null;
    if ($cookies.selectedOrgId)
      $rootScope.defaultOrg = _.find($rootScope.organizations, {orgId: $cookies.selectedOrgId});

    // If there was no org specified in the cookie, use the first org
    if (!defaultOrg)
      $rootScope.defaultOrg = _.first($rootScope.organizations);

    // Store the orgId in the cookie
    if ($rootScope.defaultOrg)
      $cookies.selectedOrgId = $rootScope.defaultOrg.orgId;
  }

  // $rootScope.$on('$routeChangeError', function(event, current, previous, eventObj) {
  //   $log.error("Route change error", eventObj);
  //
  //   // Store the route the user was trying to get to in rootScope
  //   if (current.$$route)
  //     $rootScope.returnToPath = current.$$route.originalPath;
  // });

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
      url = protocol + '://' + app.name + '.' + __config__.virtualHost;

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
