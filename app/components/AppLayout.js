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
            this.setState({
              accessDenied: true,
              loading: false
            });
          } else {
            return this.setState({
              error: err,
              loading: false
            });
          }
        }

        this.setState({
          app: resp.body,
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

AppLayout.propTypes = {
  route: React.PropTypes.object,
  history: React.PropTypes.object,
  params: React.PropTypes.object,
  children: React.PropTypes.any
};
