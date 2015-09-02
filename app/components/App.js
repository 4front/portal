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
  <Route path="/" handler={Shell}>
    <Route path="/login" handler={Login} />
    <Route handler={MainLayout}>
      <DefaultRoute handler={Dashboard} />
      <Route path="/dashboard" handler={Dashboard}/>
    </Route>
  </Route>
);

Router.run(routes, function(Handler) {
  React.render(<Handler/>, document.body);
});
