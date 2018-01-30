var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	context.log('my request Id is ' + context.requestId);
	context.log('my request body is ' + requestBody);
	context.log('security context is ' + JSON.stringify(context.getSecurityContext(), null , 4));
	context.log('request headers are ' + JSON.stringify(context.getRequestHeaders(), null , 4));
	context.log('remaining time is ' + context.getRemainingTimeInMillis());
	context.succeed('hello world');
};


