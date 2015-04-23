var express = require('express');
var session = require('express-session');
var helmet = require('helmet');
var path = require('path');
var _ = require('lodash');
var bodyParser = require('body-parser');
var debug = require('debug')('4front:portal');
var jwt = require('jwt-simple');

module.exports = function(options) {
  options = _.defaults(options || {}, {
    sessionSecret: '4front_session_secret',
    jwtTokenExpireMinutes: 30,
    jwtTokenSecret: '4front_jwt_token_secret',
    customStylesheetUrl: null,
    https: false,
    basePath: '/'
  });

  var portal = express.Router();

  if (process.env.NODE_ENV === 'development') {
    portal.use(require('stylus').middleware({
      src: path.resolve(__dirname, '../stylus'),
      dest: path.resolve(__dirname, '../www/css/')
    }));
  }

  portal.use(express.static('www'));
  portal.use('/node_modules', express.static(path.resolve(__dirname, '../node_modules')));
  portal.use(helmet());

  var sessionOptions = {
    name: '4front-portal',
    proxy: true,
    cookie: {httpOnly: true, path: options.basePath, secure: options.https },
    secret: options.sessionSecret,
    saveUninitialized: false,
    resave: false
  };

  if (options.sessionStore)
    sessionOptions.store = options.sessionStore;

  portal.use(session(sessionOptions));

  portal.post('/login', bodyParser.urlencoded({extended: false}), function(req, res, next) {
    function loginError(errorMessage) {
      return res.render(path.resolve(__dirname, "../views/login.jade"), {
        loginError: errorMessage,
        basePath: options.basePath
      });
    }

    if (_.isEmpty(req.body.username) || _.isEmpty(req.body.password)) {
      debug("missing username or password");
      return loginError("Username and password are required");
    }

    debug("login with user");
    req.app.settings.login(req.body.username, req.body.password, function(err, user) {
      if (err) return next(err);

      if (!user)
        return loginError("Invalid credentials");

      req.session.user = user;
      res.redirect('/');
    });
  });

  portal.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
  });

  portal.use(function(req, res, next) {
    debugger;

    // Verify that the user is logged in with a valid JWT.
    var user = req.session.user;
    var loggedIn = req.session.user &&
      req.session.user.jwt &&
      req.session.user.jwt.expires > Date.now();

    if (loggedIn !== true) {
      debug("user is not logged in, render login view");
      req.session.destroy();
      return res.render(path.resolve(__dirname, "../views/login.jade"), {
        basePath: options.basePath
      });
    }

    next();
  });

  portal.get('/', function(req, res, next) {
    debug("render index view");

    // TODO: Pipe the jade file through htmlprep?
    
    res.render(path.resolve(__dirname, "../views/index.jade"), {
      user: req.session.user,
      basePath: options.basePath
    });
  });

  portal.get('*', function(req, res, next) {
    res.status(404).send("Not Found");
  });

  return portal;
};
