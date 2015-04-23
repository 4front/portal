angular.module('controllers').controller('CreateOrgCtrl', function($scope, $rootScope, $log, $location, $window, Resources, Profile) {
  'use strict';

  $scope.newOrg = new Resources.Organization();
  $scope.newOrg.plan = 'trial';

  // Load the plans
  $scope.plans = [
    {
      name: 'Tier 1',
      code: 'tier1',
      price: 30,
      priceDisplay: '$30 per month',
      operations: '150K'
    },
    {
      name: 'Tier 2',
      code: 'tier2',
      price: 50,
      priceDisplay: '$50 per month',
      operations: '300K'
    },
    {
      name: 'Tier 3',
      code: 'tier3',
      price: 140,
      priceDisplay: '$140 per month',
      operations: '1MM'
    },
    {
      name: 'Trial',
      code: 'trial',
      price:  0,
      priceDisplay: 'Try us free for 45 days',
      operations: '20K'
    }
  ];

  $scope.selectedPlan = $scope.plans[3];

  // Resources.Organization.planlimits(function(data) {
  //   var plans = [];
  //   plans.push(_.extend(data.level1, {name: 'level1', title: 'Level 1'}));
  //   plans.push(_.extend(data.level2, {name: 'level2', title: 'Level 2'}));
  //   plans.push(_.extend(data.level3, {name: 'level3', title: 'Level 3'}));
  //   plans.push(_.extend(data.trial, {name: 'trial', title: 'Trial', price: 'Free for ' + data.trial.duration + ' days'}));
  //   $scope.plans = plans;
  // });

  $scope.choosePlan = function(plan) {
    // $scope.newOrg.monthlyRate = plan.price;
    // $scope.newOrg.plan = plan.code;
    $scope.selectedPlan = plan;
  };

  $scope.submit = function() {
    // Validate the org.
    if (_.isEmpty($scope.newOrg.name)) {
      $window.scrollTo(0, 0);
      return ($scope.createOrgError = "Please provide a name for your organization.");
    }

    $log.info("Saving new organization");
    $scope.orgSaving = true;
    $scope.newOrg.$save(function(org) {
      delete $scope.error;
      $log.info("Org created");

      // Add this org to the list in memory and set it as the current org.
      if (!_.isArray($rootScope.organizations))
        $rootScope.organizations = [];

      $rootScope.organizations.push(org);
      $rootScope.organization = org;

      // Redirect to the org dashboard.
      $location.path("/orgs/" + org.orgId);
    }, function(resp) {
      $scope.orgSaving = false;
      if (resp.data.error === 'userAlreadyUsedTrial')
        $scope.createOrgError = "You have already used up your trial organization. Please select a paid plan.";
      else
        $scope.createOrgError = 'Could not create organization';

      $window.scrollTo(0, 0);
      $log.error(resp.data);
    });
  };
});
