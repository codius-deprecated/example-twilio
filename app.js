var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
	res.send('Hey there, waiting for an SMS');
});

app.post('/sms', function(req, res){
  console.log(req);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});