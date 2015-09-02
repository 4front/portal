import React from 'react';
import Router from 'react-router';

export default class MainLayout extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <div>Top Nav</div>
        <div className="main-content">
          <Router.RouteHandler/>
        </div>
      </div>
    );
  }
}
