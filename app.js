var express = require('express');
var app = express();

app.get('/sms', function(req, res){
  console.log(req);
});

app.listen(80);