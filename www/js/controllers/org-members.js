angular.module('controllers').controller('OrgMemberCtrl', function($scope, $rootScope, $location, $log, $modalInstance, member, Resources, GitHub) {
  'use strict';

  $scope.modalInstance = $modalInstance;
  $scope.roles = ['admin', 'contributor', 'readonly'];

  $scope.orgMember = null;
  if (member) {
    $scope.orgMember = _.clone(member);
    $scope.selectedUser = { login: member.username, avatar_url: member.avatar };
  }
  else {
    $scope.orgMember = {
      role: 'contributor',
      orgId: $rootScope.organization.orgId,
      new: true
    };
  }

  $scope.disableModifications = member && member.userId === $rootScope.profile.userId;

  $scope.searchUsers = function(term) {
    delete $scope.error;
    return GitHub.userSearch(term);
  };

  $scope.userSelected = function(item) {
    $log.info("user selected %s", item);
    $scope.selectedUser = item;
  };

  $scope.formatInput = function(user) {
    delete $scope.error;
    // $scope.selectedUser = _.clone(user);
    if (!user)
      return '';

    return user.login;
  };

  $scope.setRole = function(role) {
    $scope.orgMember.role = role;
  };

  $scope.selectedRole = function(role) {
    return role === $scope.orgMember.role;
  };

  $scope.saveMember = function() {
    if (_.isString($scope.selectedUser)) {
      // Lookup the username from GitHub
      GitHub.lookupUser($scope.selectedUser).then(function(user) {
        $scope.selectedUser = user;
        if (member)
          updateMember();
        else
          createUser();
      });
    }
    else {
      if (member)
        updateMember();
      else
        createUser();
    }
  };

  $scope.removeMember = function() {
    Resources.OrgMember.delete({orgId: $rootScope.organization.orgId, userId: member.userId}, function() {
      member.removed = true;
      $modalInstance.close(member);
    }, function(err) {
      $log.error(err);
      $scope.error = "Could not remove member";
    });
  };

  function createUser() {
    if (_.isObject($scope.selectedUser) === false)
      return ($scope.error = 'Please select a user.');

    $scope.memberSaving = true;
    _.extend($scope.orgMember, {
      providerUserId: $scope.selectedUser.id,
      provider: 'github',
      username: $scope.selectedUser.login,
      avatar: $scope.selectedUser.avatar_url
    });

    Resources.OrgMember.save($scope.orgMember, function(member) {
      // Tack the username and avatar back onto the member.
      _.extend(member, {
        username: $scope.orgMember.username,
        avatar: $scope.orgMember.avatar
      });

      delete member.new;
      $modalInstance.close(member);
    }, function(err) {
      $scope.error = "Could not add the member";
    });
  }

  function updateMember() {
    Resources.OrgMember.update($scope.orgMember, function(member) {
      // Return the orgMember, not the member that is passed in the
      // callback. The orgMember has the avatar_url and username attributes.
      $modalInstance.close($scope.orgMember);
    }, function(err) {
      $scope.error = "Could not update member";
    });
  }
});
