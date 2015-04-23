angular.module('services').factory('Resources', function($resource, $location, $window, Config) {
  
  var resources = {
    App: $resource(Config.apiUrl + "/apps/:appId/:subAction", { appId: '@appId'}, {
      update: {method: 'PUT'},
      transfer: {method: 'POST', params: {subAction: 'transfer'}}
    }),
    Version: $resource(Config.apiUrl + "/apps/:appId/versions/:versionId", {
      appId: '@appId',
      versionId: '@versionId'
    }, {
      update: {method: 'PUT'}
    }),
    Member: $resource(Config.apiUrl + "/apps/:appId/members/:memberId", {
      appId: '@appId',
      memberId: '@memberId'
    }, {
      update: {method: 'PUT'}
    }),
    TrafficControl: $resource(Config.apiUrl + "/apps/:appId/traffic-control", { appId: '@appId' }, {
      update: {method:'PUT'}
    }),
    User: $resource(Config.apiUrl + "/users", {}, {
      find: {method: 'GET', isArray: false}
    }),
    Profile: $resource(Config.apiUrl + "/profile/:resource", {}, {
      apps: {params: {resource: 'apps'}, method: 'GET', isArray: true}
    }),
    Organization: $resource(Config.apiUrl + '/orgs/:orgId/:resource', {orgId: '@orgId'}, {
      update: {method:'PUT'},
      terminate: {method: 'PUT', params: {resource: 'terminate'}},
      activate: {method: 'POST', params: {resource:'activate'}},
      planlimits: { params: {resource: 'planlimits'}, method: 'GET'},
      apps: {method: 'GET', params: {resource: 'apps'}, isArray: true},
      members: {method: 'GET', params: {resource: 'members'}, isArray: true}
    }),
    OrgMember: $resource(Config.apiUrl + '/orgs/:orgId/:resource/:userId', {orgId: '@orgId', userId: '@userId', resource: 'members'}, {
      update: {method:'PUT'},
      get: { method: 'GET', params: {resource: 'member'}}
    }),
    Snapshot: $resource(Config.apiUrl + '/apps/:appId/snapshots', {appId: '@appId'}, {
    })
  };

  return resources;
});
