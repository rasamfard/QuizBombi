var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	context.log(requestBody);
	var player_id=securityContext.userId;
	var avatar=requestBody.avatar;
	var TPlayers = Backtory.Object.extend("TPlayers");
	var mainQuery=new Backtory.Query(TPlayers);
	mainQuery.equalTo("userId",player_id);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			var player=list[0];
			//context.log("player:"+JSON.stringify(player));
			player.set("avatar",avatar);
			player.save({
				success: function(player) {
					context.succeed({message:"successful"});
				},
				error: function(error) {
					context.fail(error);
				}
			});
        },
        error: function(error) {
            context.fail(error);
        }
    });
};