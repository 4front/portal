import React from 'react';
import globalState from '../lib/global-state';
// import dispatcher from '../lib/dispatcher';

export default class OrgHome extends React.Component {
  constructor() {
    console.debug("OrgHome");
    super();
  }

  componentWillMount() {
    this.load(this.props.params.orgId);
  }

  componentWillReceiveProps(nextProps) {
    this.load(nextProps.params.orgId);
  }

  load(orgId) {
    var org = this.getOrganization(orgId);
    this.setState({
      organization: org,
      loading: true
    });

    setTimeout(() => {
      this.setState({
        loading: false
      })
    }, 1000);
  }

  getOrganization(orgId) {
    var organization = globalState.orgs.find((org) => {
      return org.orgId === orgId;
    });

    // If an invalid orgId was specified, redirect to the root
    if (!organization) {
      return this.context.history.replaceState(null, "/");
    }

    return organization;
  }

  renderLoading() {
    if (this.state.loading === true)
      return <h3>Loading...</h3>;

    return null;
  }

  render() {
    return (
      <div>
        <h2>{this.state.organization.name} Home</h2>
        {this.renderLoading()}
      </div>
    )
  }
}

OrgHome.propTypes = {
  params: React.PropTypes.object
}

OrgHome.contextTypes = {
  location: React.PropTypes.object
}
