import React from 'react';
import context from './context';

// Function that wraps a component with an auth check
// that redirects to the login screen.
export default (Component) => {
  return class Authenticated extends React.Component {
    static willTransitionTo(transition) {
      console.debug("checking auth state");
      if (!context.loggedIn()) {
        transition.redirect('login', {}, {nextPath: transition.path});
      }
    }

    render() {
      return <Component {...this.props}/>
    }
  };
};
