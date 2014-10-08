var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var twilio = require('twilio');
var twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var app = express();

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
	throw new Error('Must supply environment variables TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
}

var serverStartTime = Date.now();
var RIPPLE_NAME_REGEX = /~\w+|^\w+$/;

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded());

// Receive SMS notifications from Twilio
app.post('/sms', function(req, res){

	var incomingMessage = req.body;
	console.log('Got message: "' + incomingMessage.Body + '" from: ' + incomingMessage.From );

	var matchedRippleNames = incomingMessage.Body.match(RIPPLE_NAME_REGEX);
	var nameToFund;
	if (matchedRippleNames && typeof matchedRippleNames[0] === 'string') {
		nameToFund = matchedRippleNames[0];
	}
	if (!nameToFund) {
		sendTwilioResponse(res, 'We\'re sorry, you need to send your Ripple Name with the "~" in front to receive payment');
		return;
	}

	// Check if this person has already requested to fund an account
	twilioClient.messages.list({ from: incomingMessage.From }, function(err, data){
		if (err) {
			console.error(err);
			return;
		}

		var fundingRequests = _.map(data.messages, function(message) {
			var body = message.body;
			var dateSent = new Date(message.date_sent).getTime();

			if (dateSent < serverStartTime) {
				return null;
			}

			var matches = body.match(RIPPLE_NAME_REGEX);
			if (matches && typeof matches[0] === 'string') {
				return matches[0];
			} else {
				return null;
			}
		});
		fundingRequests = _.without(fundingRequests, null);

		if (fundingRequests.length > 1) {
			sendTwilioResponse(res, 'We\'re sorry, the rules stipulate that only one account will be funded per person :(');
		} else {
			fundAccount(nameToFund);
			sendTwilioResponse(res, 'Thanks for participating in the Codius demo! You should receive your XRP momentarily :)');
		}

	});

});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

function sendTwilioResponse(res, message) {
	var twiml = new twilio.TwimlResponse();
	twiml.message(message);
	res.set('Content-Type', 'text/xml');
	res.status(200);
	res.send(twiml.toString());
}

function fundAccount (rippleName) {
	console.log('Send 25 XRP to: ', rippleName);
}