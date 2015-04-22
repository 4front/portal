var express = require('express');
var session = require('express-session');
var helmet = require('helmet');
var path = require('path');
var _ = require('lodash');
var bodyParser = require('body-parser');
var debug = require('debug')('4front-portal');
var jwt = require('jwt-simple');

module.exports = function(options) {
  options = _.defaults(options || {}, {
    sessionSecret: '4front_session_secret',
    jwtTokenExpireMinutes: 30,
    jwtTokenSecret: '4front_jwt_token_secret',
    customStylesheetUrl: null,
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
    secret: options.sessionSecret,
    saveUninitialized: false,
    resave: false
  };

  if (options.sessionStore)
    sessionOptions.store = options.sessionStore;

  portal.use(session(sessionOptions));

  portal.post('/login', bodyParser.urlencoded({extended: false}), function(req, res, next) {
    function loginError(error) {
      return res.render(path.resolve(__dirname, "../views/login.jade"), {
        loginError: "Invalid credentials",
        basePath: options.basePath
      });
    }

    if (_.isEmpty(req.body.username) || _.isEmpty(req.body.password)) {
      debug("missing username or password");
      return loginError("Username and password are required");
    }

    // Login just like the API does
    var identityProvider = req.app.settings.identityProvider;

    debug("login with identity provider");
    identityProvider.login(req.body.username, req.body.password, function(err, providerUser) {
      if (err) {
        return loginError("Invalid credentials");
      }

      req.app.settings.database.findUser(providerUser.userId, identityProvider.name, function(err, user) {
        if (err) return next(err);

        debugger;
        if (!user) {
          return loginError("Missing user");
        }

        // Extend the user with additional attributes from the provider. But
        // exclude the userId as that already exists as providerUserId
        _.defaults(user, _.omit(providerUser, 'userId'));

        // Generate a login token that expires in the configured number of minutes
        var expires = Date.now() + (1000 * 60 * options.jwtTokenExpireMinutes);
        var token = jwt.encode({
          iss: user.userId,
          exp: expires
        }, options.jwtTokenSecret);

        // Write the jwt to session store
        res.session.jwt = {
          token : token,
          expires: expires,
          user: user
        };

        res.redirect('/');
      });
    });
  });

  portal.use(function(req, res, next) {
    // Verify that the user is logged in with a valid JWT.
    var jwt = req.session.jwt;
    if (!jwt || jwt.expires < Date.now()) {
      req.session.destroy();
      return res.render(path.resolve(__dirname, "../views/login.jade"), {
        basePath: options.basePath
      });
    }

    req.jwt = jwt;
    next();
  });

  portal.get('/', function(req, res, next) {
    res.render(path.resolve(__dirname, "../views/index.jade"), {
      jwt: req.session.jwt,
      basePath: options.basePath
    });
  });

  portal.get('*', function(req, res, next) {
    res.status(404).send("Not Found");
  });

  return portal;
};
