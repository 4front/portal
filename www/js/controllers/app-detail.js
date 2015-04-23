angular.module('controllers').controller('AppDetailCtrl', function($scope, $rootScope, $log, $q, $routeParams,
  $location, $modal, $sce, $window, Config, Resources) {

  'use strict';

  var appId = $routeParams.appId;

  initialize();

  function initialize() {
    $scope.appLoading = true;

    var promises = {};
    promises.versions = Resources.Version.query({appId: $rootScope.application.appId}).$promise;

    if ($rootScope.application.snapshotsEnabled === true)
      promises.snapshots = Resources.Snapshot.query({appId: $rootScope.application.appId, limit: 25}).$promise;

    $q.all(promises).then(function(results) {
      var trafficControlRules = _.cloneDeep($rootScope.application.trafficControlRules) || [];
      assignVersionToRules(results.versions, trafficControlRules);

      $scope.versions = results.versions;
      $scope.trafficControlRules = trafficControlRules;
      $scope.editTrafficMode = $scope.trafficControlRules.length === 0;

      if (results.snapshots)
        $scope.snapshots = results.snapshots;

      $scope.appLoading = false;
    }, function(err) {
      $scope.error = 'Error encountered loading the dashboard';
      $scope.appLoading = false;
    });

    $scope.accessKeys = {
      appId: $rootScope.application.appId,
      accessKey: $rootScope.organization ? $rootScope.organization.accessKey : $rootScope.application.deployKey,
      userId: $rootScope.profile.userId
    };
  }

  $scope.selectStarterTemplate = function(template) {
    $scope.selectedTemplate = template;
  };

  $scope.getVersionName = function(versionId) {
    if (!versionId)
      return null;

    $log.debug("Getting version name for version " + versionId);
    var version = _.find($scope.versions, {versionId: versionId});
    if (!version)
      return '';

    return version.name;
  };

  $scope.snapshotUrl = function(snapshot) {
    return $rootScope.appUrl($rootScope.application) + snapshot.path + '?_escaped_fragment_=';
  };

  $scope.openQueueSnapshot = function() {
    var modalInstance = $modal.open({
      templateUrl: 'queueSnapshotModal',
      controller: 'QueueSnapshotCtrl',
      backdrop: true
    });

    modalInstance.result.then(function(message) {
      $log.debug("Snapshot success");
      $scope.snapshotMessage = message;
    });
  };
});

angular.module('controllers').controller('QueueSnapshotCtrl', function($scope, $rootScope, $modalInstance, Resources) {
  $scope.snapshot = {
    appId: $rootScope.application.appId
  };
  $scope.modal = $modalInstance;

  $scope.submit = function() {
    if (_.isEmpty($scope.snapshot.mode))
      return ($scope.error = 'Please select either Single URL or Full Crawl mode');
    else if ($scope.snapshot.mode == 'singleUrl' && /^\/[a-z0-9_\/]*/i.test($scope.snapshot.path) === false)
      return ($scope.error = 'Invalid URL path. It must start with a leading forward slash.');

    var message;
    if ($scope.snapshot.mode == 'singleUrl')
      message = 'Request to snapshot URL ' + $scope.snapshot.path + ' placed in the queue. It should be complete in the next 5 minutes.';
    else
      message = 'Request to perform a full crawl of the site has been placed in the queue. It should be complete in the next 10 minutes.';

    $scope.queueing = true;

    if ($scope.snapshot.mode == 'fullCrawl')
      delete $scope.snapshot.path;

    Resources.Snapshot.save($scope.snapshot, function() {
      $scope.queueing = false;
      $modalInstance.close(message);
    }, function(err) {
      $scope.queueing = false;
      $scope.error = 'Unknown error queueing snapshot request';
    });
  };
});
