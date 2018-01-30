var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var packageId=1;
	var TPackages = Backtory.Object.extend("TPackages");
	var qQuery=new Backtory.Query(TPackages);
	qQuery.equalTo("packageId",packageId);
	qQuery.select("count","item");
	qQuery.include("item");
	qQuery.find({
		success: function(items) {
			succeed(context,{packageId:packageId,items:items});
		},
		error: function(error) {
			fail(context,error);
		}
	});
};
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
 	context.log("result:"+JSON.stringify(result));
	
		context.succeed(result);
}