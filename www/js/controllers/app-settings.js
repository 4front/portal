
angular.module('controllers').controller('AppSettingsCtrl', function($scope, $rootScope, $log, $routeParams,
  $location, $document, $window, $modal, $sce, Resources) {
  'use strict';

  $scope.oAuthProviders = [
    {label: 'Yammer', value:'yammer', registerUrl: 'https://www.yammer.com/client_applications'},
    {label: 'GitHub', value: 'github', registerUrl: 'https://github.com/settings/applications'},
    {label: 'Facebook', value:'facebook', registerUrl: 'https://developers.facebook.com/'},
    {label: 'Google', value:'google', registerUrl: 'https://console.developers.google.com/project'},
    {label: 'Instagram', value:'instagram', registerUrl: 'http://instagram.com/developer/register/'},
    {label: 'Twitter', value:'twitter', registerUrl: 'https://apps.twitter.com/app/new'},
    {label: 'Salesforce', value:'salesforce', registerUrl: 'https://na17.salesforce.com/app/mgmt/forceconnectedapps/forceAppEdit.apexp'}
  ];

  var appId = $routeParams.appId;
  $scope.newSetting = {serverOnly:false};
  $scope.tempApplication = _.cloneDeep($rootScope.application);
  $scope.selectedOAuthEnv = 'prod';

  $scope.isAdministrator = ($rootScope.organization) ? 
      $rootScope.organization.role === 'admin' : 
      $rootScope.application.ownerId === $rootScope.profile.userId;

  // Determine if the button to transfer the app should be displayed.
  $scope.allowTransfers = (function() {
    if (!$scope.isAdministrator) return false;
    if (_.isArray($rootScope.organizations) === false) return false;
    if ($rootScope.organizations.length === 0) return false;
    if (_.isNullOrUndefined($rootScope.organization)) return true;

    // Ensure the user is a member of other organizations besides this one.
    return _.any($rootScope.organizations, function(org) {
      return org.orgId != $rootScope.organization.orgId;
    });
  })();

  if (!$scope.tempApplication || $scope.tempApplication.appId !== appId) {
    Resources.App.get({appId: appId}, function(app) {
      $rootScope.application = app;
      $scope.tempApplication = _.cloneDeep(app);
      flattenAuthConfig($scope.tempApplication);
    }, function(error) {
      $log.error(error);
    });
  } else {
    flattenAuthConfig($scope.tempApplication);
  }

  $scope.openNewDomainModal = function() {
    $scope.newDomain = null;
    $scope.newDomainModal = $modal.open({
      templateUrl: 'newDomainModal',
      backdrop: true,
      scope: $scope
    });
  };

  $scope.addDomain = function() {
    if (!_.isArray($scope.tempApplication.domains))
      $scope.tempApplication.domains = [];

    $scope.tempApplication.domains.push($scope.newDomain);
    $scope.newDomain = null;
    $scope.newDomainModal.close();
  };

  $scope.removeDomain = function(domain) {
    $scope.tempApplication.domains = _.without($scope.tempApplication.domains, domain);
  };

  $scope.saveApplication = function() {
    var error, authError;
    var authConfig = $scope.tempApplication.authConfig;

    if (!/^[a-z\-0-9_]{3,50}$/.test($scope.tempApplication.name))
      error = "invalidAppName";
    else if (!$scope.tempApplication.authConfig.type)
      authError = 'noAuthTypeSelected';
    else if (authConfig.type == 'oauth') {
      if (!authConfig.oAuthProvider)
        authError = 'noAuthProviderSelected';
      else if (_.isEmpty(authConfig.oAuthClientId) === true)
        authError = "invalidOAuthClientId";
      else if (_.isEmpty(authConfig.oAuthClientSecret) === true)
        authError = "invalidOAuthClientSecret";
      else if (authConfig.oAuthProvider.value == 'google') {
        if (_.isEmpty(authConfig.googleScopes))
          authError = "missingGoogleScopes";
        if (_.isEmpty(authConfig.googleHostedDomain) === false && /^[a-z_-]+\.[a-z]+/.test(authConfig.googleHostedDomain) === false)
          authError = "invalidGoogleHostedDomain";
      }
    }

    if (error) {
      $scope.error = error;
      //TODO: Make the scroll more precise.
      $window.scrollTo(0, 0);
      return;
    }

    if (authError) {
      $scope.authError = authError;
      $document.scrollToElementAnimated(angular.element(document.getElementById('securitySection'), 100));
      return;
    }

    delete $scope.error;
    delete $scope.authError;

    var appData = _.cloneDeep(_.omit($scope.tempApplication, '$promise', '$resolved'));
    if ($scope.tempApplication.authConfig.type.toLowerCase() === 'oauth') {
      appData.authConfig = {
        type: 'oauth',
        providers: [{
          name: appData.authConfig.oAuthProvider.value,
          clientId: appData.authConfig.oAuthClientId,
          clientSecret: appData.authConfig.oAuthClientSecret,
          devClientId: appData.authConfig.oAuthDevClientId,
          devClientSecret: appData.authConfig.oAuthDevClientSecret
        }]
      };

      if (authConfig.oAuthProvider.value === 'google') {
        appData.authConfig.providers[0].scopes = _.splitTrim(authConfig.googleScopes);
        if (authConfig.googleHostedDomain)
          appData.authConfig.providers[0].hostedDomain = authConfig.googleHostedDomain;
      }
    }

    $scope.saving = true;
    Resources.App.update(appData, function(app) {
      $log.info("Application update successful");
      $scope.saving = false;
      delete $scope.tempApplication;
      $rootScope.application = app;
      $window.scrollTo(0, 0);
      $location.path("/apps/" + app.appId);
    }, function(resp, body) {
      if (resp.data.error)
        $scope.error = resp.data.error;
      else
        $scope.error = 'unknownError';

      $window.scrollTo(0, 0);
      $scope.saving = false;
    });
  };

  $scope.confirmDelete = function() {
    $scope.deleteAppModal = $modal.open({
      templateUrl: 'deleteAppModal',
      backdrop: true,
      scope: $scope,
      windowClass: 'delete-app-modal'
    });
  };

  $scope.confirmTransfer = function() {
    $scope.transferring = false;
    $scope.transferAppModal = $modal.open({
      templateUrl: 'transferAppModal',
      backdrop: true,
      scope: $scope
    });
  };

  $scope.deleteApplication = function() {
    $scope.deleting = true;
    $log.info("Deleting app " + $rootScope.application.name);
    Resources.App.delete({appId: $rootScope.application.appId}, function() {
      $scope.deleting = false;
      $rootScope.applications = _.reject($rootScope.applications, {appId: $rootScope.application.appId});
      $scope.deleteAppModal.close();

      var returnUrl;
      if ($rootScope.application.orgId)
        returnUrl = '/orgs/' + $rootScope.application.orgId;
      else
        returnUrl = '/';

      delete $rootScope.application;
      $location.path(returnUrl);
    }, function(err) {
      $scope.deleting = false;
      $scope.deleteAppModal.close();
      $log.error(err);
    });
  };

  $scope.transferApp = function(org) {
    $scope.transferring = true;
    Resources.App.transfer({appId: $rootScope.application.appId, orgId: org.orgId}, function() {
      $scope.transferring = false;
      $scope.transferAppModal.close();
      $location.path('/orgs/' + org.orgId);
    }, function(resp) {
      $scope.transferring = false;
      $scope.transferAppModal.close();
      $log.error(resp.data);
    });
  };

  $scope.addSetting = function() {
    if ($scope.newSetting && !_.isEmpty($scope.newSetting.key) && $scope.newSetting.value.length > 0) {
      // Make sure there isn't already a setting with this key
      if (_.any($scope.tempApplication.configSettings, {key:$scope.newSetting.key}))
        return;

      $scope.tempApplication.configSettings.push(_.cloneDeep($scope.newSetting));
      $scope.newSetting = {key: '', value:'', serverOnly:false};
    }
  };

  $scope.addSettingDisabled = function() {
    return _.isEmpty($scope.newSetting.key) || _.isEmpty($scope.newSetting.value);
  };

  $scope.deleteSetting = function(setting) {
    $scope.tempApplication.configSettings = _.reject($scope.tempApplication.configSettings, {key:setting.key});
  };

  function flattenAuthConfig(app) {
    if (app.authConfig.type === 'parse')
      return;
    
    var authConfig = {
      type: app.authConfig.type.toLowerCase()
    };

    if (_.isArray(app.authConfig.providers) && app.authConfig.providers.length > 0) {
      if (authConfig.type == 'oauth') {
        _.extend(authConfig, {
          oAuthProvider: _.find($scope.oAuthProviders, {value: app.authConfig.providers[0].name}),
          oAuthClientId: app.authConfig.providers[0].clientId,
          oAuthClientSecret: app.authConfig.providers[0].clientSecret,
          oAuthDevClientId: app.authConfig.providers[0].devClientId,
          oAuthDevClientSecret: app.authConfig.providers[0].devClientSecret
        });

        if (app.authConfig.providers[0].name === 'google') {
          if (_.isArray(app.authConfig.providers[0].scopes))
            authConfig.googleScopes = app.authConfig.providers[0].scopes.join('\n');

          authConfig.googleHostedDomain = app.authConfig.providers[0].hostedDomain;
        }
      }
    }

    // Default google scopes to 'profile'
    if (!authConfig.googleScopes)
      authConfig.googleScopes = 'profile';

    app.authConfig = authConfig;
  }
});
