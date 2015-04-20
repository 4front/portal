var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var helmet = require('helmet');
var _ = require('lodash');

module.exports = function(req, res, next) {

  var portal = express.Router();

  portal.set('view engine', 'jade');

  portal.use(helmet());

  portal.use(session({
    name: '4front-portal',
    proxy: true,
    secret: process.env.FF_SESSION_SECRET || '4front',
    store: new RedisStore({
      client: req.app.settings.cache
      ttl: req.app.settings.portalSessionTimeout || (30 * 60)
    })
  }));

  portal.use(function(req, res, next) {
    // Verify that the user is logged in with a valid JWT.
    var jwt = req.session.jwt;
    if (!jwt) {
      req.session.destroy();
      return res.render('login');
    }

    if (jwt.expires < Date.now()) {
      req.session.destroy();
      return res.render('login');
    }

    req.jwt = jwt;
    next();
  });

  portal.post('/login', function(req, res, next) {
    // Login just like the API does
    var identityProvider = req.app.settings.identityProvider;

    debug("login with identity provider");
    identityProvider.login(req.body.username, req.body.password, function(err, providerUser) {
      if (err) {
        return next(Error.http(401, "Identity provider could not log user in", {}, err));
      }

      req.app.settings.database.findUser(providerUser.userId, identityProvider.name, function(err, user) {
        if (err) return next(err);

        // Extend the user with additional attributes from the provider. But
        // exclude the userId as that already exists as providerUserId
        _.defaults(user, _.omit(providerUser, 'userId'));

        // Generate a login token that expires in the configured number of minutes
        var expires = Date.now() + (1000 * 60 * req.app.settings.jwtTokenExpireMinutes);
        var token = jwt.encode({
          iss: user.id,
          exp: expires
        }, req.app.get('jwtTokenSecret'));

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

  portal.get('/', function(req, res, next) {
    res.render('index', {
      jwt: req.session.jwt
    });
  });

  portal.use(express.static('js'));
  portal.use(express.static('css'));
  portal.use(express.static('node_modules'));
}
