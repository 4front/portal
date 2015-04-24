var http = require('http');
var express = require('express');
var jwt = require('jwt-simple');
var debug = require('debug')('4front-portal');
var DynamoDb = require('4front-dynamodb');

var app = express();

app.settings.identityProvider = {
  name: 'local',
  authenticate: function(username, password, callback) {
    debug("fake identify provider login");
    callback(null, {
      userId: username,
      username: username
    });
  }
};

app.settings.database = new DynamoDb({
  region: 'us-west-2',
  accessKeyId: '4front',
  secretAccessKey: '4front',
  endpoint: 'http://localhost:8000'
});

app.settings.virtualHost = '4front.dev';

app.settings.logger = require('4front-logger')({
  logger: '4front-logger',
  levels: {
    error: process.stderr,
    warn: process.stderr
  }
});

app.settings.login = require('4front-login')({
  jwtTokenSecret: '4front_jwt_token_secret',
  database: app.settings.database,
  identityProvider: app.settings.identityProvider,
});

app.use(app.settings.logger.request());

app.use(require('./lib/portal')({
  debug: true,
  virtualHost: '4front.dev',
  apiUrl: 'http://4front.dev/api',
  localInstance: true
}));

http.createServer(app).listen(3000, function(err) {
  app.settings.logger.info("portal app listening on port 3000");
});
