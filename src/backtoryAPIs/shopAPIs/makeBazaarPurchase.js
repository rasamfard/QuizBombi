var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var itemId=requestBody.itemId;
	var token=requestBody.token;
	if(token.length==0)
		fail(context,"token problem");
	findPlayer(context,securityContext.userId,function(player){
		getPackInfo(context,itemId,function(coins){
			updatePlayerCoins(context,player,coins);
		});
	});
};
function getPackInfo(context,itemId,callback)
{
	var TShopItems = Backtory.Object.extend("TShopItems");
	var mainQuery=new Backtory.Query(TShopItems);
	mainQuery.equalTo("_id",itemId);
	context.log(itemId);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			if(list.length>0)
				callback(list[0].get("amount"));
			else
				fail(context,"item not found");
		},
        error: function(error) {
            fail(context,error);
        }
    });
}
			   
function updatePlayerCoins(context,pl,coins)
{
	context.log(coins);
	pl.set("coin",pl.get("coin")+coins);
	pl.save({
		success: function(history) {
			succeed(context,{message:"successful"});
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function findPlayer(context,id,callback)
{
	var TPlayers = Backtory.Object.extend("TPlayers");
	var mainQuery=new Backtory.Query(TPlayers);
	mainQuery.equalTo("userId",id);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			if(list.length>0)
				callback(list[0]);
			else
				fail(context,"player not found");
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
// 			context.log("result:"+JSON.stringify(result));
			context.succeed(result);
}
