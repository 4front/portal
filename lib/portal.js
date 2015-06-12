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
var resolve = require('resolve');

module.exports = function(settings) {
  _.defaults(settings || {}, {
    customStylesheetUrl: null,
    https: false,
    basePath: '/',
    loginView: path.resolve(__dirname, "../views/login.jade"),
    debug: false,
    apiUrl: null,
    localInstance: false
  });

  var portal = express.Router();

  if (process.env.NODE_ENV === 'development') {
    portal.use(require('stylus').middleware({
      src: path.resolve(__dirname, '../stylus'),
      dest: path.resolve(__dirname, '../www/css/')
    }));
  }

  portal.use(express.static(path.resolve(__dirname, '../www')));

  // Serve client assets that are installed as npm modules. When the portal is npm
  // installed into the parent app, npm merges dependencies so we can't count on
  // the requested module to be physically located in the local node_modules
  // directory. Instead we need to discover where the module resolves to and
  // build the file path accordingly.
  portal.use('/node_modules', function(req, res, next) {
    var pathParts = req.path.split('/');
    var moduleName = pathParts[1];

    resolve(moduleName, { basedir: __dirname }, function (err, resolvePath) {
      // Find the index of the moduleName in the resolvePath
      var resolveParts = resolvePath.split(path.sep);

      var mergedPath = [].concat(
        resolveParts.slice(0, resolveParts.lastIndexOf(moduleName)),
        pathParts.slice(pathParts.lastIndexOf(moduleName)));

      var fullPath = mergedPath.join(path.sep);
      res.sendFile(fullPath);
    });
  });

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

  portal.get('/views/partials/:partial', function(req, res, next) {
    res.render(path.resolve(__dirname, "../views/partials/" + req.params.partial + '.jade'));
  });

  portal.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect(settings.basePath);
  });

  portal.post('/login', bodyParser.urlencoded({extended: false}), function(req, res, next) {
    function loginError(errorMessage) {
      res.locals.loginError = errorMessage;
      res.locals.view = settings.loginView;
      return renderView(req, res, next);
    }

    if (_.isEmpty(req.body.username) || _.isEmpty(req.body.password)) {
      debug("missing username or password");
      return loginError("Username and password are required");
    }

    // TODO: Instead render a dropdown on the login screen with the set of identity providers.
    var identityProvider = _.find(req.app.settings.identityProvider, {default: true});
    if (!identityProvider)
      identityProvider = req.app.settings.identityProviders[0];

    if (!identityProvider)
      return next(new Error("No identityProvider configured"));

    req.app.settings.login(req.body.username, req.body.password, identityProvider.name, function(err, user) {
      debugger;
      if ((err && err.code === 'invalidCredentials') || !user)
        return loginError("Invalid credentials");

      if (err) return next(err);

      req.session.user = user;
      res.redirect(settings.basePath);
    });
  });

  portal.get('/logout', function(req, res, next) {
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
      res.locals.view = settings.loginView;

      return renderView(req, res, next);
    }

    next();
  });

  // Support for HTML5 pushState
  portal.get('*', function(req, res, next) {
    if (req.path.indexOf('.') > 0)
      return next();

    debug("render index view");
    res.locals.view = path.resolve(__dirname, "../views/index2.jade");
    res.locals.user = req.session.user;
    renderView(req, res, next);
  });

  portal.get('*', function(req, res, next) {
    res.status(404).send("Not Found");
  });

  function renderView(req, res, next) {
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

    sbuff(jade.renderFile(res.locals.view, res.locals))
      .pipe(htmlprep({
        cwd: path.resolve(__dirname, "../www"),
        buildType: process.env.NODE_ENV === 'development' ? 'debug' : 'release',
        inject: {
          head: "<script>var __config__ = " + JSON.stringify(clientConfig) + ";</script>"
        }
      }))
      .pipe(res);
  }

  return portal;
};
