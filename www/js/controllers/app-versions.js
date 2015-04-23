angular.module('controllers').controller('AppVersionsCtrl', function($scope, $rootScope, $log, $q, $routeParams,
  $location, $filter, $modal, Resources) {

  // 'use strict';

  var appId = $routeParams.appId;
  var versions;

  Resources.Version.query({appId: $rootScope.application.appId, limit: 25}, function(data) {
    $scope.versions = data;
    groupVersionsByDate();
  });

  $scope.confirmDeleteVersion = function(version) {
    $scope.versionToDelete = version;

    $scope.deleteVersionModal = $modal.open({
      templateUrl: 'deleteVersionModal',
      backdrop: false,
      scope: $scope
    });
  };

  $scope.deleteVersion = function(version) {
    if (!$scope.versionToDelete) return;

    Resources.Version.delete({appId: $scope.application.appId, versionId: $scope.versionToDelete.versionId}, function(resp) {
      $log.info("Deleted version " + $scope.versionToDelete.versionId);
      $scope.versions = _.reject($scope.versions, {versionId: $scope.versionToDelete.versionId});
      $scope.deleteVersionModal.close();
      delete $scope.versionToDelete;
      groupVersionsByDate();
    }, function(err) {
      $log.error("Error deleting version", err);
    });
  };

  $scope.openTrafficRules = function() {
    $scope.trafficControlModal = $modal.open({
      templateUrl: 'trafficRulesModal',
      controller: 'TrafficControlCtrl',
      scope: $scope,
      backdrop: 'static'
    });
  };

  function groupVersionsByDate() {
    // Organize the versions by date.
    var groupByDate = [];
    _.each($scope.versions, function(version, i) {
      version.date = $filter('date')(version.created, 'MMMM d, yyyy');

      if (version.name === '0.0.1')
        version.displayName = 'v' + version.versionNum;
      else
        version.displayName = version.name;

      var trafficRule = _.find($rootScope.application.trafficControlRules, {versionId: version.versionId});
      if (trafficRule) {
        version.active = true;
        version.traffic = trafficRule.traffic;
      }
      else
        version.traffic = 0;

      if (i===0 || version.date !== _.last(groupByDate).date) {
        groupByDate.push({
          date: version.date,
          versions: [version]
        });
      }
      else {
        _.last(groupByDate).versions.push(version);
      }
    });

    $scope.versionsByDate = groupByDate;
  }
});