import React from 'react';
import debug from 'react-debug';
import Login from './Login';
import OrgHome from './OrgHome';
import OrgMembers from './OrgMembers';
import MainLayout from './MainLayout';
import OrgLayout from './OrgLayout';
import AppLayout from './AppLayout';
import AppSettings from './AppSettings';
import Deployments from './Deployments';
import AccessDenied from './AccessDenied';
import { Router, Route, IndexRoute } from 'react-router';
import { createHistory, useBasename } from 'history';
import globalState from '../lib/global-state';

Object.assign(globalState, window.__config__);

const HISTORY = useBasename(createHistory)({
  basename: '/portal'
});

class Shell extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

Shell.propTypes = {
  children: React.PropTypes.any
};

const requireAuth = (nextState, replaceState) => {
  if (!globalState.user) {
    debug('user not logged in, redirect to /login');
    replaceState({ nextPathname: nextState.location.pathname }, '/portal/login');
  }
};

const routes = (
  <Route component={Shell}>
    <Route path="/login" component={Login} />
    <Route path="/access-denied" component={AccessDenied}/>
    <Route component={MainLayout} onEnter={requireAuth}>
      <Route path="/"/>
      <Route component={OrgLayout}>
        <Route path="/orgs/:orgId" component={OrgHome}/>
        <Route path="orgs/:orgId/members" component={OrgMembers}/>
      </Route>
      <Route path="/apps/:appId" component={AppLayout} mode="app">
        <IndexRoute component={Deployments}/>
        <Route path="/apps/:appId/settings" component={AppSettings}/>
      </Route>
    </Route>
  </Route>
);


React.render(<Router history={HISTORY}>{routes}</Router>, document.body);
