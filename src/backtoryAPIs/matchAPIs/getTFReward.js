var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var rewardStep=requestBody.rewardStep-1;
	var coins=[10,50,100];
	var hearts=[0,0,1];
	var tickets=[0,0,1];
	var player_id=securityContext.userId;
	var TPlayers = Backtory.Object.extend("TPlayers");
	var mainQuery=new Backtory.Query(TPlayers);
	mainQuery.equalTo("userId",player_id);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			var player=list[0];
				player.set("heart",player.get("heart")+hearts[rewardStep]);
				player.set("tiket",player.get("ticket")+tickets[rewardStep]);
				player.set("coin",player.get("coin")+coins[rewardStep]);
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
