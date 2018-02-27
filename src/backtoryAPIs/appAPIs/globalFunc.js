var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
        var req=requestBody.req;
        if(req=="getFirstScreenItems")
            getFirstScreenItems(context);
        
        
	
};
function getFirstScreenItems(context)
{
    var itemIds = ["5a5b5d97e7e9dc0001a27184","5a5b5d99149ec00001b1633d","5a5b6138e7e9dc0001a29ba7","5a5b6138e7e9dc0001a29ba7","5a5b60923d60fd0001a1c9d9","5a5b60923d60fd0001a1c9d9"];
    succeed(context,itemIds);
}
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
	context.succeed(result);
}





