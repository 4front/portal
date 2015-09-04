import React from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import MainLayout from './MainLayout';
import Router from 'react-router';
var { Route, RouteHandler, DefaultRoute } = Router;

class Shell extends React.Component {
  render() {
    return (
      <div>
        <RouteHandler/>
      </div>
    );
  }
}

var routes = (
  <Route path="/portal" handler={Shell}>
    <Route name="login" path="/portal/login" handler={Login} />
    <Route handler={MainLayout}>
      <DefaultRoute name="dashboard" handler={Dashboard} />
    </Route>
  </Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler/>, document.body);
});
