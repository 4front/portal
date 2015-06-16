angular.module('controllers').controller('OrgMemberCtrl', function(
  $scope, $rootScope, $location, $log, Resources, $modal, Context, Config) {

  'use strict';

  // $scope.modalInstance = $modalInstance;
  $scope.roles = ['admin', 'contributor', 'readonly'];
  $scope.subNav = 'members';

  $rootScope.subNav = 'members';

  $scope.pageLoading = true;
  Resources.Organization.members({orgId: $rootScope.organization.orgId}, function(members) {
    $scope.pageLoading = false;
    $scope.members = members;
  }, function(err) {
    $scope.pageLoading = false;
    $rootScope.pageError = 'Error loading apps';
  });

  // $scope.disableModifications = member && member.userId === $rootScope.profile.userId;

  $scope.saveMember = function() {
    if ($scope.orgMember.new === true)
      createMember();
    else
      updateMember();
  };

  $scope.openMemberModal = function(member) {
    if (!member) {
      member = {
        new: true,
        orgId: $rootScope.organization.orgId,
        role: $scope.roles[1]
      };
    }
    else {
      member.new = false;
      member.self = (member.userId === $rootScope.user.userId);
    }

    $scope.memberSaving = false;
    $scope.modalError = null;
    $scope.orgMember = member;

    $scope.memberModal = $modal.open({
      templateUrl: 'orgMemberModal',
      scope: $scope
    });
  };

  $scope.removeMember = function() {
    Resources.OrgMember.delete({orgId: $rootScope.organization.orgId, userId: member.userId}, function() {
      $scope.members = _.reject($scope.members, {userId: $scope.orgMember.userId});
      $scope.orgMember = null;
      $scope.memberModal.close();
    }, function(err) {
      $log.error(err);
      $scope.error = "Could not remove member";
    });
  };

  function createMember() {
    $scope.memberSaving = true;
    _.extend($scope.orgMember, {
      providerUserId: $scope.orgMember.username,
      provider: 'ldap'
    });

    Resources.OrgMember.save($scope.orgMember, function(member) {
      // Tack the username and avatar back onto the member.
      $scope.members.push(_.extend($scope.orgMember, member));
      $scope.orgMember = null;

      $scope.memberModal.close();
    }, function(err) {
      $scope.modalError = "Could not add the member";
    });
  }

  function updateMember() {
    $scope.memberSaving = true;
    Resources.OrgMember.update($scope.orgMember, function(member) {
      var existingMember = _.find($scope.members, {userId: member.userId});
      if (existingMember)
        _.extend(existingMember, member);
      else
        $scope.members.push(member);

      $scope.memberModal.close();
    }, function(err) {
      $scope.memberSaving = false;
      $scope.modalError = "Could not update member";
    });
  }
});
