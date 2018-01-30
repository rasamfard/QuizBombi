var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	context.log("field:"+requestBody.field);
 	findPlayer(context,securityContext.userId,function(player){
	//context.succeed();
		var fields=[];
		fields[0]=requestBody.field;
		fields[1]=Math.ceil((Math.random()+0.01)*(7.9));
		fields[2]=Math.ceil((Math.random()+0.01)*(7.9));
		fields[3]=Math.ceil((Math.random()+0.01)*(7.9));
 		player.set("favoriteField",fields);
		player.set("qCount",requestBody.qCount);
 		updatePlayerData(context,requestBody.qCount,player,securityContext.userId,fields);
 	});
};
function updatePlayerData(context,qCount,p,playerId,fields){
	p.save({
		success: function(p2) {
			findbots(context,qCount,playerId,function(bots){
				var bots2=[];
				var names=['mohammad','mamad','amirali','mitra','hosein','ali','mahdi','nima','mobin','parham','yaali','fati','maryam','narges','setayesh','zahra','hasti','zeinab','sari','hani','asal','mahdie','yalda','hadis','ayda','pari','elina','baran','nazijoon','nanaz','reza','alireza','amiri','meiti','mamali','brandeha','ghahremana','shayn','arian','mesi','ronaldo','iran','kia','ehsani','mahi','alijoon','nafas','nioosh','joojoo','rostam','palang','tehroon'];
				for(var i=0;i<bots.length;i++)
				{
					var rfields=[];
					rfields[0]=fields[i+1];
					rfields[1]=Math.ceil((Math.random()+0.01)*(7.9));
					rfields[2]=Math.ceil((Math.random()+0.01)*(7.9));
					rfields[3]=Math.ceil((Math.random()+0.01)*(7.9));
// 					bots[i].set("name",names[Math.ceil((Math.random()+0.01)*(49.9))]);
// 					bots[i].set("favoriteField",rfields);
// 					bots[i].set("_id",bots[i].get("_id")+"3");
					var botActions=[];
					var seconds=[8,40,67,99,131];
					var k=0;
					for(var j=0;j<5;j++)
					{
						var rActions=Math.ceil((Math.random()+0.01)*(1.9));
						var rTime=Math.floor(((Math.random()*6)+seconds[j])*100);
						var action=Math.ceil((Math.random()+0.01)*(3.9));
						botActions[k]={time:rTime,action:action};
						k++;
						for(var l=1;l<rActions;l++)
						{
							rTime=Math.floor(((Math.random()*6)+seconds[j])*100);
							action=Math.ceil((Math.random()+0.01)*(3.9));
							botActions[k]={time:rTime,action:action};
							k++;
						}
					}
					var name=names[Math.ceil((Math.random()+0.01)*(49.9))];
					for(var n=0;n<3;n++)
						for(var m=0;m<bots2.length;m++)
							if(bots2[m].name==name)
								name=names[Math.ceil((Math.random()+0.01)*(49.9))];
					bots2[i]={name:name,favoriteField:rfields,userId:bots[i].get("userId").substr(6,4)+"3",avatar:bots[i].get("avatar"),botActions:botActions};

// 					bots[i].set("botActions",botActions);
				}
				p2.set("bots",bots2);
				context.log("bots:"+bots2.length);
			succeed(context,p2);	
			});
			
		},
		error: function(error) {
			fail(context,error);
		}
	});	
}
function findbots(context,qCount,playerId,callback)
{
	var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers); 
	qQuery.notEqualTo("userId",playerId);
	var count=Math.ceil((Math.random()+0.01)*(1.9));
	if(qCount==505)
		count=2;
	qQuery.limit(count);
	qQuery.find({
		success: function(bots) {
			callback(bots);
		},
		error: function(error) {
			callback([]);
		}
	});
	
}
function findPlayer(context,playerId,callback)
{
	var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers); 
	qQuery.equalTo("userId",playerId);
	qQuery.find({
		success: function(players) {
			if(players.length>0)
				{
					callback(players[0]);
				}
			else
				fail(context,"not found player with id:"+playerId)
		},
		error: function(error) {
			fail(context,error);
		}
	});
	
}
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
	context.log("error:"+JSON.stringify(result));
	context.succeed(result);
}