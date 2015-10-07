import React from 'react';

export default class AccessDenied extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div style={{width: 500, margin: '100px auto'}}>
        <div className="panel panel-danger">
          <div className="panel-heading">
            <h3 className="panel-title">Access Denied</h3>
          </div>
          <div className="panel-body">
            You tried to access a page that you do not have access to.
          </div>
        </div>
      </div>
    );
  }
}
