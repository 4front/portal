var express = require('express');
var session = require('express-session');
var helmet = require('helmet');
var path = require('path');
var _ = require('lodash');
var jade = require('jade');
var sbuff = require('simple-bufferstream');
var bodyParser = require('body-parser');
var htmlprep = require('htmlprep');
var debug = require('debug')('4front:portal');
var jwt = require('jwt-simple');

module.exports = function(options) {
  options = _.defaults(options || {}, {
    sessionSecret: '4front_session_secret',
    jwtTokenExpireMinutes: 30,
    jwtTokenSecret: '4front_jwt_token_secret',
    customStylesheetUrl: null,
    virtualHost: '4front.dev',
    https: false,
    basePath: '/',
    debug: false,
    apiUrl: null
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

  portal.get('/views/partials/:partial', function(req, res, next) {
    res.render(path.resolve(__dirname, "../views/partials/" + req.params.partial));
  });

  portal.post('/login', bodyParser.urlencoded({extended: false}), function(req, res, next) {
    function loginError(errorMessage) {
      res.locals.loginError = errorMessage;
      res.locals.view = 'login.jade';
      return renderView(req, res, next);
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
    var loggedIn = req.session.user &&
      req.session.user.jwt &&
      req.session.user.jwt.expires > Date.now();

    if (loggedIn !== true) {
      debug("user is not logged in, render login view");
      req.session.destroy();
      res.locals.view = 'login.jade';
      return renderView(req, res, next);
    }

    next();
  });

  portal.get('/', function(req, res, next) {
    debug("render index view");
    res.locals.view = 'index.jade';
    res.locals.user = req.session.user;
    renderView(req, res, next);
  });

  portal.get('*', function(req, res, next) {
    res.status(404).send("Not Found");
  });

  function renderView(req, res, next) {
    res.set('Content-Type', 'text/html');

    var clientConfig = {
      virtualHost: options.virtualHost,
      apiUrl: options.apiUrl
    };

    if (req.session && req.session.user)
      clientConfig.user = req.session.user;

    res.locals.basePath = options.basePath;
    sbuff(jade.renderFile(path.resolve(__dirname, "../views/" + res.locals.view), res.locals))
      .pipe(htmlprep({
        cwd: path.resolve(__dirname, "../www"),
        buildType: options.debug ? 'debug' : 'release',
        inject: {
          head: "<script>var __config__ = " + JSON.stringify(clientConfig) + ";</script>"
        }
      }))
      .pipe(res);
  }

  return portal;
};
