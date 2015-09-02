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

require('simple-errors');

module.exports = function(settings) {
  _.defaults(settings || {}, {
    customStylesheetUrl: null,
    https: false,
    basePath: '/',
    debug: false,
    apiUrl: null,
    localInstance: false
  });

  var portal = express.Router();

  portal.use('/dist', express.static(path.join(__dirname, '../dist')));
  portal.use(helmet());

  var sessionOptions = {
    name: '4front-portal',
    proxy: true,
    // Deliberately not setting the path option of the cookie as
    // it seems to be interfering with other session providers.
    cookie: {httpOnly: true, secure: settings.https },
    secret: settings.sessionSecret,
    saveUninitialized: false,
    resave: false
  };

  if (settings.sessionStore)
    sessionOptions.store = settings.sessionStore;

  portal.use(session(sessionOptions));

  portal.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect(settings.basePath);
  });

  portal.post('/login', bodyParser.json(), function(req, res, next) {
    if (_.isEmpty(req.body.username) || _.isEmpty(req.body.password)) {
      debug("missing username or password");
      return next(Error.http(400, "Username and password are required", {
        code: "missingUsernamePassword"
      }));
    }

    req.app.settings.membership.login(req.body.username, req.body.password, function(err, user) {
      if (err) {
        return next(err);
      }

      req.session.user = user;
      res.json(user);
    });
  });

  portal.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect(settings.basePath);
  });

  portal.use(function(req, res, next) {
    // Verify that the user is logged in with a valid JWT.
    var loggedIn = req.session.user &&
      req.session.user.jwt &&
      req.session.user.jwt.expires > Date.now();

    if (loggedIn !== true) {
      debug("user is not logged in, render login view");
      req.session.destroy();

      if (req.path !== '/') {
        req.cookies.returnUrl = req.originalPath;
        return res.redirect('/portal');
      }

      // res.locals.view = settings.loginView;
      return renderView(req, res, next);
    }

    next();
  });

  // Support for HTML5 pushState
  portal.get('*', function(req, res, next) {
    if (req.path.indexOf('.') > 0)
      return next();

    debug("render index view");
    renderView(req, res, next);
  });

  function renderView(req, res) {
    res.set('Content-Type', 'text/html');

    var clientConfig = {
      virtualHost: settings.virtualHost,
      apiUrl: settings.apiUrl
    };

    if (settings.localInstance === true)
      clientConfig.localInstance = true;

    if (req.session && req.session.user)
      clientConfig.user = req.session.user;

    res.locals.basePath = settings.basePath;

    // Ensure the <base> element has a trailing slash
    // so that relative URLs resolve correctly.
    if (res.locals.basePath.slice(-1) !== '/')
      res.locals.basePath += '/';

    var indexPage = path.resolve(__dirname, "../app/index.jade");

    sbuff(jade.renderFile(indexPage, res.locals))
      .pipe(htmlprep({
        cwd: path.resolve(__dirname, "../app"),
        buildType: process.env.NODE_ENV === 'development' ? 'debug' : 'release',
        inject: {
          head: "<script>var __config__ = " + JSON.stringify(clientConfig) + ";</script>"
        }
      }))
      .pipe(res);
  }

  return portal;
};
