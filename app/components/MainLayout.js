import React from 'react';
import {Link} from 'react-router';
import Sidebar from './Sidebar';
import NewOrganization from './NewOrganization';
import request from '../lib/request';
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

    request.get('/api/profile/orgs')
      .set('X-Access-Token', globalState.user.jwt.token)
      .then((res) => {
        console.debug('retrieved orgs');
        globalState.orgs = res.body;

        this.setState({
          orgs: globalState.orgs,
          loading: false
        });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          loading: false,
          error: err
        });
      });
  }

  renderChildren() {
    // If there are no organizations, render the new org screen
    if (this.state.orgs.length === 0)
      return <NewOrganization/>;

    return this.props.children;
  }

  render() {
    if (this.state.loading === true)
      return <h2>Loading..</h2>;

    if (this.error)
      return <div>{this.state.error.toString()}</div>;

    return (
      <div>
        <nav className="nav navbar navbar-inverse navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link to="/" className="navbar-brand">
                <img src="//s3-us-west-2.amazonaws.com/4front-media/4front-logo.png" alt='4front'/>
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

MainLayout.propTypes = {
  children: React.PropTypes.any
};
