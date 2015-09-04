import React from 'react';
import context from '../lib/context';
import {Link} from 'react-router';

export default class Sidebar extends React.Component {
  componentWillMount() {
  }

  render() {
    let orgs = context.getOrgs();

    let orgLinks = orgs.map((org) => {
      return (
        <li>
          <Link to="dashboard" params={{orgId: org.orgId}}
            activeClassName="active">
            {org.name}
          </Link>
        </li>
      )
    })

    return (
      <section>
        <h3>Organizations</h3>
        <ul className="nav nav-sidebar">
          {orgLinks}
        </ul>
      </section>
    );
  }
}
