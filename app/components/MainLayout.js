import React from 'react';
import debug from 'react-debug';
import {Link} from 'react-router';
import Sidebar from './Sidebar';
import NewOrganization from './NewOrganization';
import request from 'superagent';
// import request from '../lib/request';
import globalState from '../lib/global-state';
import dispatcher from '../lib/dispatcher';

export default class MainLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true,
      orgs: globalState.orgs || []
    };
  }

  componentWillMount() {
    dispatcher.on('orgChanged', (org) => {
      this.setState({
        currentOrg: org
      });
    });

    debug(MainLayout, 'loading orgs');
    request.get('/api/profile/orgs')
      .set('X-Access-Token', globalState.user.jwt.token)
      .end((err, resp) => {
        if (err) {
          return this.setState({
            loading: false,
            error: err
          });
        }

        globalState.orgs = resp.body;

        if (globalState.orgs.length === 0) {
          return this.context.history.replaceState(null, '/create-org');
        }

        if (this.props.location.pathname === '/') {
          const redirectPath = `/orgs/${globalState.orgs[0].orgId}`;
          debug(MainLayout, `redirecting to ${redirectPath}`);

          // Don't use a return statement here so the setState below still fires
          this.context.history.replaceState(null, redirectPath);
        }

        this.setState({
          loading: false,
          orgs: globalState.orgs
        });
      });
  }

  renderChildren() {
    // If there are no organizations, render the new org screen
    if (this.state.orgs.length === 0) {
      return <NewOrganization/>;
    }

    return this.props.children;
  }

  render() {
    // debugger;
    if (this.state.loading === true) {
      return <h2>Loading..</h2>;
    }

    if (this.state.error) {
      return <div>{this.state.error.toString()}</div>;
    }

    return (
      <div>
        <nav className="nav navbar navbar-inverse navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link to="/" className="navbar-brand">
                <img src="//s3-us-west-2.amazonaws.com/4front-media/4front-logo.png" alt="4front"/>
              </Link>
            </div>
            <div className="navbar-collapse collapse">
              <ul className="nav navbar-nav navbar-right" style={{marginRight: 0}}>
                <li><Link to="/">Dashboard</Link></li>
                <li><a href="/portal/logout">Logout</a></li>
              </ul>
            </div>
          </div>
        </nav>
        <section className="container-fluid">
          <div className="row">
            <div className="col-sm-3 col-md-2 sidebar">
              <Sidebar {...this.state}/>
            </div>
            <div className="col-sm-9 col-ms-offset-3 col-md-10 col-md-offset-2 main">
              {this.renderChildren()}
            </div>
          </div>
        </section>
      </div>
    );
  }
}

MainLayout.displayName = 'MainLayout';

MainLayout.propTypes = {
  children: React.PropTypes.any,
  params: React.PropTypes.object,
  location: React.PropTypes.object
};

MainLayout.contextTypes = {
  history: React.PropTypes.object
};
