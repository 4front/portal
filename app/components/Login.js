import React from 'react';
import ErrorMessage from './ErrorMessage';
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
    this.setState({
      loggingIn: true
    });

    var username = this.refs.username.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    var { router } = this.context;

    event.preventDefault();

    request
      .post('/portal/login')
      .send({
        username: username,
        password: password
      })
      .end((err, res) => {
        if (err) {
          return this.setState({
            loggingIn: false,
            loginError: err
          });
        }

        // TODO: Change some global state by assigning the user

        var nextPath = router.getCurrentQuery().nextPath;
        if (nextPath) {
          router.replaceWith(nextPath);
        } else {
          router.replaceWith('/');
        }

        console.log(res.user);
        this.setState({
          loggingIn: false
        });
      });
  }

  render() {
    return (
      <div className="login">
        <div className="container">
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-6">
              <img className="logo" src={LOGO_IMAGE}/>
              <ErrorMessage message={this.state.loginError}/>
              <form onSubmit={this.submit.bind(this)} noValidate={true}>
                <div className="form-group">
                  <label className="sr-only" htmlFor="username">Username</label>
                  <input className="form-control" autoCapitalize={false}
                    ref="username" placeholder="Username" autoFocus
                    onChange={(event)=> {this.state.username = event.target.value}}
                  />
                </div>

                <div className="form-group">
                  <label className="sr-only" htmlFor="password">Password</label>
                  <input className="form-control" type="password"
                    ref="password" placeholder="Password"
                    onChange={(event)=> {this.state.password = event.target.value}}
                  />
                </div>

                <div className="form-group">
                  <button className="btn btn-primary btn-block" type="submit">{"Sign-In"}</button>
                </div>
              </form>
            </div>
            <div className="col-md-3"></div>
          </div>
        </div>
      </div>
    );
  }
}

Login.contextTypes = {
  router: React.PropTypes.func
};
