var port = Number(process.env.PORT || 8080);
var api = 'http' + (port === 8080 ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';
var express = require('express');
var cookieParser = require('cookie-parser');
var request = require('superagent');
var templates = require('./public/templates');

var app = express();
app.use(cookieParser());
app.use(express.static(__dirname+'/public'));

// Manifest returns a 400 unless the AppCache cookie is set
app.get('/offline.appcache', function(req, res) {
  if (req.cookies.up) {
    res.set('Content-Type', 'text/cache-manifest');
    res.send('CACHE MANIFEST'
      + '\n./appcache.js'
      + '\n./application.js'
      + '\n./iframe.js'
      + '\n./indexeddb.shim.min.js'
      + '\n./promise.js'
      + '\n./styles.css'
      + '\n./superagent.js'
      + '\n./templates.js'
      + '\n'
      + '\nFALLBACK:'
      + '\n/ /'
      + '\n'
      + '\nNETWORK:'
      + '\n*');
  } else {
    res.status(400).end();
  }
});

// Add middleware to send this when the appcache update cookie is set
app.get('/', offlineMiddleware);
app.get('/article/:guid', offlineMiddleware);

function offlineMiddleware(req, res, next) {
  if (req.cookies.up) res.send(layoutShell());
  else next();
}

app.get('/fallback.html', function(req, res) {
  res.send(layoutShell());
});

app.get('/article/:guid', function(req, res) {
  request.get(api+'/'+req.params.guid)
    .end(function(err, data) {
      if (err || !data.ok) {
        res.status(404);
        res.send(layoutShell({
          main: templates.article({
            title: 'Story cannot be found',
            body: '<p>Please try another</p>'
          })
        }));
      } else {
        res.send(layoutShell({
          main: templates.article(data.body)
        }));
      }
    });
});

app.get('/', function(req, res) {
  request.get(api)
    .end(function(err, data) {
      if (err) {
        res.status(404).end();
      } else {
        res.send(layoutShell({
          main: templates.list(data.body)
        }));
      }
    });
});

app.listen(port);
console.log('listening on '+port);

function layoutShell(data) {
  data = {
    title: data && data.title || 'FT Tech News',
    main: data && data.main || ''
  };
  return '<!DOCTYPE html>'
    + '\n<html>'
    + '\n  <head>'
    + '\n    <title>'+data.title+'</title>'
    + '\n    <link rel="stylesheet" href="/styles.css" type="text/css" media="all" />'
    + '\n  </head>'
    + '\n  <body>'
    + '\n    <div class="brandrews"><a href="https://mattandre.ws">mattandre.ws</a> | <a href="https://twitter.com/andrewsmatt">@andrewsmatt</a></div>'
    + '\n    <main>'+data.main+'</main>'
    + '\n    <script src="/indexeddb.shim.min.js"></script>'
    + '\n    <script src="/superagent.js"></script>'
    + '\n    <script src="/promise.js"></script>'
    + '\n    <script src="/templates.js"></script>'
    + '\n    <script src="/application.js"></script>'
    + '\n    <script src="/appcache.js"></script>'
    + '\n    <script>'
    + '\n      (function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){'
    + '\n      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),'
    + '\n      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)'
    + '\n      })(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');'
    + '\n      ga(\'create\', \'UA-34192510-7\', \'auto\');'
    + '\n      ga(\'send\', \'pageview\');'
    + '\n    </script>'
    + '\n  </body>'
    + '\n</html>';
}
