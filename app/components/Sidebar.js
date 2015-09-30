import React from 'react';
import {Link} from 'react-router';

export default class Sidebar extends React.Component {
  componentWillMount() {
  }

  renderOrgLink(org) {
    return (
      <li key={org.orgId}>
        <Link to={`/orgs/${org.orgId}`}
          className={org === this.props.currentOrg ? 'active' : ''}>
          {org.name}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <section>
        <h3>Organizations</h3>
        <ul className="nav nav-sidebar">
          {this.props.orgs.map(this.renderOrgLink.bind(this))}
        </ul>
      </section>
    );
  }
}

Sidebar.propTypes = {
  currentOrg: React.PropTypes.object,
  orgs: React.PropTypes.array.isRequired
};
