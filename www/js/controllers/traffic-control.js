angular.module('controllers').controller('TrafficControlCtrl', function($scope, $rootScope, $log, $q, $routeParams,
  $location, $modal, $filter, Resources) {

  $scope.editTrafficMode = false;
  $scope.trafficControlRules = loadRules();

  $scope.newRule = {
    traffic: 0,
    version: null
  };

  function loadRules() {
    var rules = _.cloneDeep($rootScope.application.trafficControlRules) || [];

    _.each(rules, function(rule) {
      var version = _.find($scope.versions, {versionId: rule.versionId});
      if (version)
        rule.version = version;
    });

    return rules;
  }

  $scope.saveTrafficRules = function() {
    var cumulativeTraffic = 0;

    // Make sure no rules have 0 traffic.
    if (_.any($scope.trafficControlRules, {traffic: 0}))
      return ($scope.saveRulesError = 'ruleWithNoTraffic');

    _.each($scope.trafficControlRules, function(r) {
      cumulativeTraffic += parseFloat(r.traffic);
    });

    if ($scope.trafficControlRules.length > 0 && cumulativeTraffic !== 1)
      return ($scope.saveRulesError = 'trafficTotal');

    $log.info("Saving traffic rules");

    var updatedRules = _.map($scope.trafficControlRules, function(r) {
      return { versionId: r.version.versionId, traffic: r.traffic };
    });

    Resources.TrafficControl.update({appId: $scope.application.appId, rules: updatedRules}, function(resp) {
      $scope.application.trafficControlRules = updatedRules;

      // Update the traffic property on the versions
      _.each($scope.versions, function(version) {
        var rule = _.find(updatedRules, {versionId: version.versionId});
        if (rule) {
          version.active = true;
          version.traffic = rule.traffic;
        }
        else {
          version.active = false;
          version.traffic = 0;
        }
      });

      $scope.resetRuleForm();
      $scope.showTrafficUpdateSuccess = true;
    }, function() {
      $scope.saveRulesError = "saveError";
    });
  };

  $scope.appendRule = function() {
    $scope.editTrafficMode = true;
    $scope.trafficControlRules.push({traffic: 0, version: null});
  };

  $scope.deleteRule = function(rule) {
    // Eliminate the rule from the list
    $scope.trafficControlRules = _.reject($scope.trafficControlRules, function(r) {
      return r == rule;
    });
  };

  $scope.showRuleEditMode = function() {
    $scope.editTrafficMode = true;
  };

  $scope.resetRuleForm = function() {
    $scope.trafficControlRules = loadRules();
    $scope.editTrafficMode = false;
    delete $scope.saveRulesError;
    $log.info("Traffic rule form reset");
  };
});