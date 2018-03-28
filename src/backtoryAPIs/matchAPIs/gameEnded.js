var Backtory = require('backtory-sdk');
var coin=0;
var video_heart= 0;
var video_coin=0;
exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
//types= 1:mini(6p,15MS) 2:mega(10p,30MS) 3:mega(5p,15MS) 4:mega(5p,15MS) 5:mega(4p,15MS) 6:mega(6p,-MS) 7:mega(6p,15MS)
	var type= requestBody.type;
	var rank= requestBody.rank;
	var gameScore=requestBody.gameScore;
	var qCount=requestBody.qCount;
	var answers= requestBody.answers;
	var maxScores=[15,30,15,15,15,-1,15];
        context.log("rank:"+rank);
	//context.log("score:"+gameScore);
	//context.log("userId:"+securityContext.userId);
	var coins=[[30,10,5,2,2,2],[10,8,8,7,4,1,1,1,1,1],[30,10,5,2,2],[30,10,5,2,2],[30,20,10,5],[30,10,5,2,2,2],[30,10,5,2,2,2]];
	var xps=[[5,4,3,2,2,2],[10,8,8,7,4,2,2,2,2,2],[5,4,3,3,3],[5,4,3,2,1],[5,4,3,2],[5,4,3,2,1,1],[5,4,3,2,1,1]];
	var score=Math.min(gameScore,maxScores[type-1]);//scores[type-1][rank-1];
	if(type==6)
		score=gameScore;
	coin=coins[type-1][rank-1];
	video_heart= Math.ceil(Math.random()*100)>40?1:0;
	video_coin=rank>2?coins[type-1][rank-1]*3:coins[type-1][rank-1]*2;
	var xp=xps[type-1][rank-1];
	
	findPlayer(context,securityContext.userId,function(player){
	//	player.set("coin",player.get("coin")+coin);
            if(player.get("heart")>3)
                video_heart=0;
		savePlayerRewards(context,player,function(){
			xp=xp+player.get("xp");
			if(xp>=player.get("level")*3+3)
			{
				xp=xp-(player.get("level")*3+3);
				if(xp<0)
					xp=0;
				player.set("level",player.get("level")+1);
				
			}
                        player.set("xp",xp);
                        if(type==6)
                            player.set("endlessMaxQCount",Math.max(qCount,player.get("endlessMaxQCount")));
			missions(context,player,type,rank,gameScore,answers);
			player.save({
				success: function(p2) {
					if(type==1||type==7)
					{
						updateNormalRanks(securityContext.userId,score,function(){
							succeed(context);
						});
					}
					else if(type==6)
					{
						updateEndlessRanks(securityContext.userId,score,qCount,function(){
							succeed(context);
						});	
					}
					else
					{
						succeed(context);
					}
				},
				error: function(error) {
					fail(context,error);
				}
			});
		});	

	});
	//types 1=5 players , 2=10 players 3= friendly  
	
	
};
function savePlayerRewards(context,player,callback)
{
	var TPlayerRewards = Backtory.Object.extend("TPlayerRewards");
	var qQuery=new Backtory.Query(TPlayerRewards); 
	qQuery.equalTo("userId",player.get("userId"));
	qQuery.find({
		success: function(recs) {
			var rec = new TPlayerRewards();
			if(recs.length>0)
			{
				rec=recs[0];
				rec.set("coin",coin);
				rec.set("video_heart",video_heart);
				rec.set("video_coin",video_coin);
			}
			else
			{
				rec.set("userId",player.get("userId"));
				rec.set("coin",coin);
				rec.set("video_heart",video_heart);
				rec.set("video_coin",video_coin);
			}
			rec.save({
				success: function(rec) {
					callback();
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
function updateNormalRanks(pId,score,callback)
{
	var event = new Backtory.Event("UpdateRank_Normal");
	event.add("Score", score);
//        event.add("matchCount",0);
	event.add("randomScore", Math.ceil(Math.random()*(1000000)));
	event.sendFromUser(pId, {
		success: function() {
			callback();
		},
		error: function(error) {
			callback();
		}
	});
}
function updateEndlessRanks(pId,score,qcount,callback)
{
	var event = new Backtory.Event("UpdateRank_Endless");
	event.add("Score", score);
	event.add("QCount", qcount);
	event.add("randomNum", Math.ceil(Math.random()*(1000000)));
	event.sendFromUser(pId, {
		success: function() {
			callback();
		},
		error: function(error) {
			callback();
		}
	});
}

function findPlayer(context,playerId,callback)
{
	var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers); 
	qQuery.equalTo("userId",playerId);
	qQuery.include("currentMission");
	qQuery.find({
		success: function(players) {
			if(players.length>0)
				{
					callback(players[0]);
				}
			else
				fail(context,"not found player with id:"+playerId);
		},
		error: function(error) {
			fail(context,error);
		}
	});
	
}
function missions(context,pl,t,r,gs,ans)
{
	switch(pl.get("currentMission").get("code"))
	{
		case 1:
				pl.set("currentMissionStep",1);
			break;
		case 2:
			if(t==1)
			{
				var step=pl.get("currentMissionStep")+1;
				if(step>2)
					step=2;
				pl.set("currentMissionStep",step);
			}
			break;
		case 3:
			if(pl.get("level")>=2)
				pl.set("currentMissionStep",1);
			break;
		case 4:
			if(t==7)
			{
				var step=pl.get("currentMissionStep")+1;
				if(step>3)
					step=3;
				pl.set("currentMissionStep",step);
			}
			break;
		case 5:
			if(t==1&&gs>=10)
				pl.set("currentMissionStep",1);
			break;
		case 6:
			if(t==1&&r<4)
				pl.set("currentMissionStep",1);
			break;
		case 7:
			if(t==1&&r==1)
				pl.set("currentMissionStep",1);
			break;
		case 8:
			if(t==1)
			{
				var step=pl.get("currentMissionStep")+1;
				if(step>10)
					step=10;
				pl.set("currentMissionStep",step);
			}
			break;
		case 9:
			if(pl.get("level")>=5)
				pl.set("currentMissionStep",1);
			break;
		case 10:
			if(t==1&&r==1)
			{
				var step=pl.get("currentMissionStep")+1;
				if(step>3)
					step=3;
				pl.set("currentMissionStep",step);
			}
			break;
		case 11:
			if(t==7&&r<4)
				pl.set("currentMissionStep",1);
			break;

		case 12:
			if(((t==1||t==3)&&ans[4]==1)||(t==2&&(ans[1]==1||ans[9]==1) ))
				pl.set("currentMissionStep",1);
			break;

		case 13:
			if(((t==1||t==3)&&ans[4]==1)||(t==2&&(ans[1]==1||ans[9]==1) ))
			{
				var step=pl.get("currentMissionStep")+1;
				if(step>3)
					step=3;
				pl.set("currentMissionStep",step);
			}
			break;
		
		case 14:
			if(pl.get("level")>=20)
				pl.set("currentMissionStep",1);
			break;
		case 15:
			if(t==1&&gs>=15)
				pl.set("currentMissionStep",1);
			break;
		case 16:
			if(t==7&&gs>=10)
				pl.set("currentMissionStep",1);
			break;
		case 17:
			if(t==7&&r==1)
			{
				var step=pl.get("currentMissionStep")+1;
				if(step>3)
					step=3;
				pl.set("currentMissionStep",step);
			}			
			break;
			
				
	}
}
function fail(context,errors)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context)
{
    context.log("coin:"+coin);
    
	context.succeed({coin:coin,video_heart:video_heart,video_coin:video_coin});
}