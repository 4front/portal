// import superagent from 'superagent';
var contextData = window.__config__;

let _exports = {
  setUser(user) {
    contextData.user = user;
  },

  setOrgs(orgs) {
    contextData.orgs = orgs;
  },

  loggedIn() {
    return contextData.user || false;
  },

  user() {
    return contextData.user;
  },

  getOrgs() {
    return contextData.orgs;
  }
};

export default _exports;
