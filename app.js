var http = require('http');
var express = require('express');
var debug = require('debug')('4front-portal');
var DynamoDb = require('4front-dynamodb');

var app = express();

app.settings.identityProvider = {
  name: 'local',
  login: function(username, password, callback) {
    debug("fake identify provider login");
    callback(null, {
      userId: username,
      username: username
    });
  }
};

app.settings.database = new DynamoDb({
  // Leave these values as-is since they are the same values
  // used by the create-test-tables script.
  region: 'us-west-2',
  accessKeyId: '4front',
  secretAccessKey: '4front',
  endpoint: 'http://localhost:8000'
});

app.use(require('./lib/portal')());

http.createServer(app).listen(3000, function(err) {
  console.log("portal app listening on port 3000");
});
