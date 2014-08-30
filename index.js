var port = Number(process.env.PORT || 8080);
var express = require('express');
var app = express();

app.use(express.static(__dirname+'/public'));

app.get(/^\//, function(req, res) {
  res.sendFile('public/index.html', { root: __dirname });
});

app.listen(port);
console.log('listening on '+port);
