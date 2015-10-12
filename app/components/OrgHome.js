/* eslint no-unused-vars: [2, {"varsIgnorePattern": "debug"}] */

import React from 'react';
import debug from 'react-debug';
import request from 'superagent';
import {Link} from 'react-router';
import globalState from '../lib/global-state';
// import dispatcher from '../lib/dispatcher';

export default class OrgHome extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    this.loadOrgFromParams(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      apps: null,
      org: null
    }, () => {
      this.loadOrgFromParams(nextProps);
    });
  }

  loadOrgFromParams(props) {
    this.setState({
      loading: true
    });

    // Load the apps for this org
    request.get(`/api/orgs/${props.org.orgId}/apps`)
      .set('X-Access-Token', globalState.user.jwt.token)
      .end((err, resp) => {
        if (err) {
          return this.setState({
            error: err,
            loading: false
          });
        }

        this.setState({
          apps: resp.body,
          loading: false
        });
      });
  }

  renderLoading() {
    if (this.state.loading === true) return <h3>Loading...</h3>;

    return null;
  }

  renderApps() {
    if (this.state.error || !this.state.apps) return null;

    return (
      <table className="table table-bordered">
        <thead>
          <th>Name</th>
          <th>URL</th>
        </thead>
        <tbody>
          {this.state.apps.map(this.renderAppRow.bind(this))}
        </tbody>
      </table>
    );
  }

  renderAppRow(app) {
    return (
      <tr key={app.appId}>
        <td><Link to={`/apps/${app.appId}/`}>{app.name}</Link></td>
        <td>{app.url}</td>
      </tr>
    );
  }

  render() {
    return (
      <div>
        <h2>{this.props.org.name} Home</h2>
        {this.renderLoading()}
        {this.renderApps()}
      </div>
    );
  }
}

OrgHome.displayName = 'OrgHome';
OrgHome.propTypes = {
  params: React.PropTypes.object,
  org: React.PropTypes.object
};

OrgHome.contextTypes = {
  history: React.PropTypes.object
};
