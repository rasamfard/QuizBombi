var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers);
        var uid=requestBody.uid;
        uid=uid.toLowerCase();
	qQuery.equalTo("uid",uid);
	qQuery.limit(1);
	qQuery.find({
		success: function(players) {
			if(players.length>0)
			{
				var player=players[0];
				context.succeed(player);
			}
			else
				fail(context,"player not found");	
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