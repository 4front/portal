angular.module('controllers').controller('OrgSettingsCtrl', function($scope, $rootScope, $location, $log, $modal, Resources, Context) {
  $scope.allowedToDelete = $rootScope.organization.role === 'admin';

  $scope.confirmTerminate = function() {
    $scope.terminateOrgModal = $modal.open({
      templateUrl: 'terminateOrgModal',
      backdrop: true,
      scope: $scope
    });
  };

  $scope.terminateOrganization = function() {
    $scope.terminating = true;
    $log.info("terminanating org " + $rootScope.organization.name);

    var orgId = $rootScope.organization.orgId;
    Resources.Organization.terminate({orgId: orgId}, function() {
      if (_.isArray($rootScope.organizations))
        $rootScope.organizations = _.reject($rootScope.organizations, {orgId: orgId});

      $rootScope.organization = null;
      $scope.terminanating = false;
      $scope.terminateOrgModal.close();
      $location.path('/');
    }, function(resp) {
      $scope.terminating = false;
      $scope.error = resp.data.error;
      $scope.terminateOrgModal.close();
    });
  };
});
