var http = require('http');
var express = require('express');
var jwt = require('jwt-simple');
var debug = require('debug')('4front-portal');
var DynamoDb = require('4front-dynamodb');

var app = express();

// app.settings.identityProvider = {
//   name: 'local',
//   authenticate: function(username, password, callback) {
//     debug("fake identify provider login");
//     callback(null, {
//       userId: username,
//       username: username
//     });
//   }
// };

app.settings.logger = require('4front-logger')({
  logger: '4front-logger',
  levels: {
    error: process.stderr,
    warn: process.stderr
  }
});

app.settings.login = function(username, password, callback) {
  var expires = Date.now() + (1000 * 60 * 60);
  var token = jwt.encode({
    iss: '123',
    exp: expires
  }, 'abc');

  callback(null, {
    userId: '123',
    username: username,
    provider: 'local',
    jwt: {
      expires: expires,
      token: token
    }
  });
};

// app.settings.database = new DynamoDb({
//   // Leave these values as-is since they are the same values
//   // used by the create-test-tables script.
//   region: 'us-west-2',
//   accessKeyId: '4front',
//   secretAccessKey: '4front',
//   endpoint: 'http://localhost:8000'
// });

app.use(app.settings.logger.request());
app.use(require('./lib/portal')());

http.createServer(app).listen(3000, function(err) {
  app.settings.logger.info("portal app listening on port 3000");
});
