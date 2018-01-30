var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var rewardCode=requestBody.rewardCode;
	getReward(context,function(code,type,itemId,coins){
		findPlayer(context,securityContext.userId,function(player){
			if(rewardCode!=code)
				fail(context,"the code is not correct");	
			if(player.get("lastRewardCode")==null || player.get("lastRewardCode")!=code)
			{
				if(rewardCode==code)
				{
					if(type==1)
						updatePlayerCoins(context,player,code,coins);
					else if(type==2)
					{
						updatePlayerItems(context,player,code,itemId);
					}
				}
				
			}
			else
				fail(context,"it is used.");		
		});
	});
	
	
};
function updatePlayerCoins(context,pl,code,coins)
{
	pl.set("coin",pl.get("coin")+coins);
	pl.set("lastRewardCode",code);
	pl.save({
		success: function(history) {
			succeed(context,{message:"successful"});
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function checkIfNotPurchased(context,pId,item_Id,callback)
{
	var TPurchases = Backtory.Object.extend("TPurchases");
	var query = new Backtory.Query(TPurchases);
	query.equalTo("userId",pId);
	query.equalTo("itemId",item_Id);
	query.find({
		success: function(list) {
			if(list.length>0)
				fail(context,{message:"purchased"});
			else
				callback();
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function updatePlayerItems(context,pl,code,_itemId)
{
	checkIfNotPurchased(context,pl.get("userId"),_itemId,function(){
		var TPurchases = Backtory.Object.extend("TPurchases");
		var purchase = new TPurchases();
		purchase.set("userId",pl.get("userId"));
		purchase.set("itemId",_itemId);
		purchase.save({
			success: function(purchase) {
				pl.set("lastRewardCode",code);
				pl.save({
					success: function(history) {
						succeed(context,{message:"successful"});
					},
					error: function(error) {
						fail(context,error);
					}
				});
			},
			error: function(error) {
				context.fail(error);
			}
		});
		
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
function getPlayerLastRewardCode()
{
	
}
function getReward(context,callback)
{
	var TRewards = Backtory.Object.extend("TRewards");
	var mainQuery=new Backtory.Query(TRewards);
	mainQuery.equalTo("_id","598ee45b5e3de0000113d935");
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			if(list.length>0)
				callback(list[0].get("rewardCode"),list[0].get("type"),list[0].get("itemId"),list[0].get("coins"));
			else
				fail(context,"no reward exist");
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
// 	context.log("result:"+JSON.stringify(result));
	context.succeed(result);
}
