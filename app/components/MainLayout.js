import React from 'react';
import {RouteHandler, Link} from 'react-router';
import Sidebar from './Sidebar';
import request from '../lib/request';
import context from '../lib/context';

export default class MainLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    request.get('/api/profile/orgs')
      .set('X-Access-Token', context.user.jwt.token)
      .then((res) => {
        context.setOrgs(res.body);
        this.setState({
          loading: false
        });
      })
      .catch((err) => {
        this.setState({
          loading: false,
          error: err
        });
      });
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
              <Link to="dashboard" className="navbar-brand">
                <img src="//s3-us-west-2.amazonaws.com/4front-media/4front-logo.png" alt='4front'/>
              </Link>
            </div>
            <div className="navbar-collapse collapse">
              <ul className="nav navbar-nav navbar-right" style={{marginRight: 0}}>
                <li><Link to="dashboard">Dashboard</Link></li>
                <li><a href="/portal/logout">Logout</a></li>
              </ul>
            </div>
          </div>
        </nav>
        <section className="container-fluid">
          <div className="row">
            <div className="col-sm-3 col-md-2 sidebar">
              <Sidebar/>
            </div>
            <div className="col-sm-9 col-ms-offset-3 col-md-10 col-md-offset-2 main">
              <RouteHandler/>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
