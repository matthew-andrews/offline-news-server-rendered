var port = Number(process.env.PORT || 8080);
var express = require('express');
var app = express();

app.use(express.static(__dirname+'/public'));

app.get('/offline.appcache', function(req, res) {
  res.set('Content-Type', 'text/cache-manifest');
  res.send('CACHE MANIFEST'
    + '\n./styles.css'
    + '\n./indexeddb.shim.min.js'
    + '\n./promise.js'
    + '\n./superagent.js'
    + '\n./application.js'
    + '\n'
    + '\nFALLBACK:'
    + '\n/ /'
    + '\n'
    + '\nNETWORK:'
    + '\n*');
});

app.get(/^\//, function(req, res) {
  res.sendFile('public/index.html', { root: __dirname });
});

app.listen(port);
console.log('listening on '+port);
