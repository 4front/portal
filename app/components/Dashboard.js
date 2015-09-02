import React from 'react';
import requireAuth from '../lib/require-auth';

export default requireAuth(class Dashboard extends React.Component {
  constructor() {
    console.debug("Dashboard");
    super();
  }

  render() {
    return <div>Dashboard</div>;
  }
})
