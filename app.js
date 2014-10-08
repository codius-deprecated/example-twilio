var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.send('Hey there, waiting for an SMS');
});

app.post('/sms', function(req, res){
  console.log(req);
});

app.listen(80);