import React from 'react';
import {Link} from 'react-router';
import request from 'superagent';
import AccessDenied from './AccessDenied';
import globalState from '../lib/global-state';

const MENU_ITEMS = [
  {label: 'Deployments', path: '/'},
  {label: 'Settings', path: '/settings'}
];

export default class AppLayout extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    this.loadAppFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // If this is the same app as before, don't reload it.
    if (nextProps.params.appId === this.props.params.appId) {
      return;
    }

    this.loadAppFromProps(nextProps);
  }

  loadAppFromProps(props) {
    this.setState({
      loading: true
    });

    request.get(`/api/apps/${props.params.appId}`)
      .set('X-Access-Token', globalState.user.jwt.token)
      .end((err, resp) => {
        if (err) {
          if (resp.body.code === 'appNotFound') {
            return this.setState({
              accessDenied: true,
              loading: false
            });
          }

          return this.setState({
            error: err,
            loading: false
          });
        }

        // Make sure the user has access to the parent organization of the app.
        const app = resp.body;
        const parentOrg = globalState.orgs.find(org => org.orgId === app.orgId);
        if (!parentOrg) {
          return this.setState({
            accessDenied: true,
            loading: false
          });
        }

        this.setState({
          app: app,
          parentOrg: parentOrg,
          accessDenied: false,
          loading: false
        });
      });
  }

  renderMenuItem(menuItem) {
    return (
      <li key={menuItem.path}>
        <Link to={`/apps/${this.props.params.appId}${menuItem.path}`} activeClassName="active">
          {menuItem.label}
        </Link>
      </li>
    );
  }

  renderChildren() {
    return React.cloneElement(this.props.children, {org: this.state.org});
  }

  render() {
    if (this.state.loading) return <h2>Loading...</h2>;
    if (this.state.accessDenied) return <AccessDenied/>;

    return (
      <div>
        <nav className="navbar primary">
          <div className="row">
            <div className="col-md-6">
              <h1>{this.state.parentOrg.name}</h1> / <h1>{this.state.app.name}</h1>
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

AppLayout.propTypes = {
  route: React.PropTypes.object,
  history: React.PropTypes.object,
  params: React.PropTypes.object,
  children: React.PropTypes.any
};
