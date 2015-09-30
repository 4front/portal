import React from 'react';
import Login from './Login';
import OrgHome from './OrgHome';
import MainLayout from './MainLayout';
import { Router, Route, IndexRoute, Redirect } from 'react-router';
import { createHistory, useBasename } from 'history'
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
    console.warn("user not logged in, redirect to /login");
    replaceState({ nextPathname: nextState.location.pathname }, '/portal/login');
  }
  // else if (nextState.location.pathname === '/') {
  //   replaceState({ nextPathname: nextState.location.pathname }, '/portal/');
  // }
};

// function gotoDefaultView(nextState, replaceState) {
//   replaceState({ nextPathname: nextState.location.pathname }, '/views/preview');
// }

var routes = (
  <Route component={Shell}>
    <Route path="/login" component={Login} />
    <Route component={MainLayout} onEnter={requireAuth}>
      <Route path="/" component={OrgHome} />
      <Route path="orgs/:orgId" component={OrgHome} org={globalState.currentOrg}/>
    </Route>
  </Route>
);

React.render(<Router history={HISTORY}>{routes}</Router>, document.body);
