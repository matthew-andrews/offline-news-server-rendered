var port = Number(process.env.PORT || 8080);
var api = 'http' + (port === 8080 ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';
var express = require('express');
var cookieParser = require('cookie-parser');
var request = require('superagent');
var templates = require('./lib/templates');

var app = express();
app.use(cookieParser());
app.use(express.static(__dirname+'/public'));

// Manifest returns a 400 unless the AppCache cookie is set
app.get('/offline.appcache', function(req, res) {
  if (req.cookies.up) {
    res.set('Content-Type', 'text/cache-manifest');
    res.send(templates.manifest());
  } else {
    res.status(400).end();
  }
});

// Add middleware to send this when the appcache update cookie is set
app.get(/^\//, function(req, res, next) {
  if (req.cookies.up) res.send(templates.shell());
  else next();
});

app.get('/fallback.html', function(req, res) {
  res.send(templates.shell());
});

app.get('/tech-blog', function(req, res) {
  request.get(api+req.originalUrl)
    .end(function(err, data) {
      if (err) res.status(404).end();
      else res.send(templates.article(data.body));
    });
});

app.get('/', function(req, res) {
  request.get(api)
    .end(function(err, data) {
      if (err) res.status(404).end();
      else res.send(templates.list(data.body));
    });
});

app.listen(port);
console.log('listening on '+port);
