import React from 'react';
import Alert from './Alert';
import {Router} from 'react-router';
import globalState from '../lib/global-state';
import request from 'superagent';

const LOGO_IMAGE = 'https://s3-us-west-2.amazonaws.com/4front-media/4front-logo.png';

export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    // auth.onLoggedIn = this.setStateOnAuth.bind(this);
    // auth.login();
  }

  submit(event) {
    event.preventDefault();

    this.setState({
      loggingIn: true
    });

    const username = this.refs.username.getDOMNode().value;
    const password = this.refs.password.getDOMNode().value;

    const history = this.context.history;

    request.post('/portal/login')
      .send({
        username: username,
        password: password
      })
      .end((err, resp) => {
        if (err) {
          let errorCode;
          if (resp.body) {
            errorCode = resp.body.code;
          } else {
            errorCode = 'unknown';
          }

          return this.setState({
            errorCode: errorCode,
            loggingIn: false
          });
        }

        globalState.user = resp.body;

        // Redirect to whatever URL the user was originally trying to access
        if (this.props.location.state && this.props.location.state.nextPathname) {
          history.replaceState(null, this.props.location.state.nextPathname);
        } else {
          history.replaceState(null, '/');
        }
      });
  }

  renderLoginError() {
    if (!this.state.errorCode) return null;

    let message = null;
    switch (this.state.errorCode) {
    case 'invalidCredentials':
      message = 'Invalid credentials';
      break;
    case 'missingUsernameOrPassword':
      message = 'Please enter your username and password';
      break;
    default:
      message = 'Unknown sign-in error';
      break;
    }

    return <Alert type="danger"><strong>{message}</strong></Alert>;
  }

  render() {
    const loginIcon = `fa ${this.state.loggingIn ? 'fa-circle-o-notch fa-spin' : 'fa-sign-in'}`;

    return (
      <section className="login">
        <div className="logo">
          <img src={LOGO_IMAGE}/>
        </div>
        {this.renderLoginError()}
        <form onSubmit={this.submit.bind(this)} noValidate>
          <div className="form-group">
            <label className="sr-only" htmlFor="username">Username</label>
            <input className="form-control" autoCapitalize={false}
              ref="username" placeholder="Username" autoFocus
              onChange={(event)=> {this.state.username = event.target.value;}}
            />
          </div>

          <div className="form-group">
            <label className="sr-only" htmlFor="password">Password</label>
            <input className="form-control" type="password"
              ref="password" placeholder="Password"
              onChange={(event)=> {this.state.password = event.target.value;}}
            />
          </div>

          <div className="form-group">
            <button className="btn btn-primary btn-block" type="submit">
              <i className={loginIcon} style={{marginRight: 10}}/>
              <span>Sign-In</span>
            </button>
          </div>
        </form>
      </section>
    );
  }
}

Login.contextTypes = {
  history: Router.propTypes.history
};

Login.propTypes = {
  location: React.PropTypes.object
};
