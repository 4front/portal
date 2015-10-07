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
      <section>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              {MENU_ITEMS.map(this.renderMenuItem.bind(this))}
            </ul>
          </div>
        </nav>
        <section className="main-content">
          {this.renderChildren()}
        </section>
      </section>
    );
  }
}

OrgLayout.propTypes = {
  route: React.PropTypes.object,
  history: React.PropTypes.object,
  params: React.PropTypes.object,
  children: React.PropTypes.any
};
