var Backtory = require('backtory-sdk');
// types :    0.gameEndedNormal 1.gameEndedVideo  2.spinnerNormal 3.spinnerVideo 4.giftBox 3.TFQuestion
exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var userId=securityContext.userId;
	var type=0;
	type=requestBody.type;
	findPlayer(context,userId,function(player){
		findRewardsRec(context,userId,function(rec){
			if(type==0)
				player.set("coin",player.get("coin")+rec.get("coin"));
			if(type==1)
			{
				player.set("heart",player.get("heart")+rec.get("video_heart"));
				player.set("coin",player.get("coin")+rec.get("video_coin"));
			}
			if(type==2)
			{
				var heart=player.get("heart")+rec.get("heart");
				var coin=player.get("coin")+rec.get("coin");
				var ticket=player.get("ticket")+rec.get("ticket");
				player.set("heart",heart);
				player.set("coin",coin);
				player.set("ticket",ticket);
				//player.set("coin",player.get("coin")+rec.get("video_coin"));
				
			}
			if(type==3)
			{
				var heart=player.get("heart")+rec.get("video_heart");
				var coin=player.get("coin")+rec.get("video_coin");
				var ticket=player.get("ticket")+rec.get("video_ticket");
				player.set("heart",heart);
				player.set("coin",coin);
				player.set("ticket",ticket);
				//player.set("coin",player.get("coin")+rec.get("video_coin"));
				
			}
			clearRewards(context,rec);
			saveAll(context,player,rec);
		});
	});

};
function clearRewards(context,rec)
{
	rec.set("coin",0);
	rec.set("heart",0);
	rec.set("ticket",0);
	rec.set("video_heart",0);
	rec.set("video_coin",0);
	rec.set("items",[]);
}
function saveAll(context,player,rec)
{
	player.save({
		success: function(player) {
			rec.save({
				success: function(rec) {
					succeed(context,{});
				},
				error: function(error) {
					fail(context,error);
				}
			});	
		},
		error: function(error) {
			fail(context,error);
		}
	});	
}
function findPlayer(context,userId,callback)
{
	var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers); 
	qQuery.equalTo("userId",userId);
	qQuery.find({
		success: function(players) {
			if(players.length>0)
				callback(players[0]);
			else
				fail(context,"not found player with id:"+userId);
		},
		error: function(error) {
			fail(context,error);
		}
	});
	
}
function findRewardsRec(context,userId,callback)
{
	var TPlayerRewards = Backtory.Object.extend("TPlayerRewards");
	var qQuery=new Backtory.Query(TPlayerRewards); 
	qQuery.equalTo("userId",userId);
	qQuery.find({
		success: function(recs) {
			if(recs.length>0)
				callback(recs[0]);
			else
				succeed(context,{});
			
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function fail(context,errors)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
	context.succeed(result);
}