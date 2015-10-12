import React from 'react';
import {Link} from 'react-router';
import AccessDenied from './AccessDenied';
import globalState from '../lib/global-state';

const MENU_ITEMS = [
  {label: 'Apps', path: '/'},
  {label: 'Members', path: '/members'}
];

export default class OrgLayout extends React.Component {
  componentWillMount() {
    this.loadContextFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadContextFromProps(nextProps);
  }

  loadContextFromProps(props) {
    const currentOrg = globalState.orgs.find((org) => {
      return org.orgId === props.params.orgId;
    });

    if (!currentOrg) {
      return this.setState({
        accessDenied: true
      });
    }

    this.setState({
      org: currentOrg,
      accessDenied: false
    });
  }

  renderMenuItem(menuItem) {
    return (
      <li key={menuItem.path}>
        <Link to={`/orgs/${this.props.params.orgId}${menuItem.path}`} activeClassName="active">
          {menuItem.label}
        </Link>
      </li>
    );
  }

  renderChildren() {
    return React.cloneElement(this.props.children, {org: this.state.org});
  }

  render() {
    if (this.state.accessDenied) return <AccessDenied/>;

    return (
      <div>
        <nav className="navbar primary">
          <div className="row">
            <div className="col-md-6">
              <h1>{this.state.org.name}</h1>
            </div>
            <div className="col-md-6">
              <div className="pull-right">
                <a href="/portal/logout">Logout</a>
              </div>
            </div>
          </div>
        </nav>
        <nav className="navbar secondary">
          <ul>
            {MENU_ITEMS.map(this.renderMenuItem.bind(this))}
          </ul>
        </nav>
        <section className="main-content">
          {this.renderChildren()}
        </section>
      </div>
    );
  }
}

OrgLayout.propTypes = {
  route: React.PropTypes.object,
  history: React.PropTypes.object,
  params: React.PropTypes.object,
  children: React.PropTypes.any
};
