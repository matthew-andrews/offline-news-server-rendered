var port = Number(process.env.PORT || 8080);
var express = require('express');
var request = require('superagent');
var templates = require('./lib/templates');
var app = express();
var api = 'http' + (port === 8080 ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';


app.use(express.static(__dirname+'/public'));

app.get('/offline.appcache', function(req, res) {
  res.send(templates.manifest());
});

app.get('/fallback.html', function(req, res) {
  res.send(templates.shell());
});

// TODO: Add middlewear to send this when the appcache update cookie is set
  //res.sendFile('public/index.html', { root: __dirname });

app.get(/^\/(.+)/, function(req, res) {
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
