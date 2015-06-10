var _ = require('lodash');
var http = require('http');
var express = require('express');
var jwt = require('jwt-simple');
var debug = require('debug')('4front-portal');
var DynamoDb = require('4front-dynamodb');

var app = express();

_.extend(app.settings, {
  virtualHost: '4front.dev',
  jwtTokenSecret: '4front',
  cryptoSecret: '4front',
  sessionSecret: '4front'
});

app.settings.identityProviders = [{
  name: 'local',
  default: true,
  authenticate: function(username, password, callback) {
    debug("fake identify provider login");
    callback(null, {
      userId: username,
      username: username
    });
  }
}];

app.settings.database = new DynamoDb({
  region: 'us-west-2',
  accessKeyId: '4front',
  secretAccessKey: '4front',
  endpoint: 'http://localhost:8000',
  tablePrefix: '4front_',
  cryptoPassword: '4front'
});

app.settings.logger = require('4front-logger')({
  logger: '4front-logger',
});

app.settings.login = require('4front-login')(app.settings);

app.use(app.settings.logger.middleware.request);

app.use(require('./lib/portal')({
  debug: true,
  virtualHost: '4front.dev',
  apiUrl: 'http://4front.dev/api',
  localInstance: true,
  sessionSecret: '4front'
}));

http.createServer(app).listen(3000, function(err) {
  app.settings.logger.info("portal app listening on port 3000");
});
