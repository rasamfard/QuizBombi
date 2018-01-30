var Backtory = require('backtory-sdk');
var test1=10;
exports.handler = function(requestBody, context) {
	context.succeed(test1);
};

