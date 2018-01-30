var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	context.log(requestBody);
	var securityContext = context.getSecurityContext();
	var player_id=securityContext.userId;
	var name=requestBody.name;
	var TPlayers = Backtory.Object.extend("TPlayers");
	var mainQuery=new Backtory.Query(TPlayers);
	mainQuery.equalTo("userId",player_id);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			player=list[0];
			player.set("name",name);
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