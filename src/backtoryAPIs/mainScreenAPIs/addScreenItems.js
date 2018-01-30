var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var player_id=securityContext.userId;//"5a4be80be4b0ce87892f063f";//
	context.log(requestBody);
	var itemIds=requestBody.itemIds;
	var positions=requestBody.positions;
	
	var date = new Date();
	getScreen(context,player_id,function(screen){
		context.log(screen);
		var items=screen.get("items");
		for(var i=0;i<itemIds.length;i++)
		if(items.length<15)
			items[items.length]={itemId:itemIds[i],pose:positions[i],addTime:date}	;
		screen.set("items",items);
		screen.save({
			success: function(screen) {
				context.succeed({items:screen.get("items")});
			},
			error: function(error) {
				context.fail(error);
			}
		});	
	});
	
	
};
function checkIfPurchased()
{
	
}
function getPlayer(context,pId,callback)
{
	var TPlayers = Backtory.Object.extend("TPlayers");
	var mainQuery=new Backtory.Query(TPlayers);
 	mainQuery.equalTo("userId",pId);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			if(list.length>0)
				callback(list[0]);
			else
				context.fail('player not found');
		},
		error: function(error) {
			context.fail(error);
		}
	});
}
function getScreen(context,pId,callback)
{
	getPlayer(context,pId,function(player){
		var TScreenItems = Backtory.Object.extend("TScreenItems");
		var mainQuery=new Backtory.Query(TScreenItems);
		mainQuery.equalTo("player",player);
		mainQuery.include("player");
		mainQuery.limit(1);
		mainQuery.find({
			success: function(list) {
				if(list.length>0)
					callback(list[0]);
				else
				{

					var screen = new TScreenItems();
					screen.set("player",player);
					screen.set("items",[]);
					screen.save({
						success: function(screen) {
							callback(screen);
						},
						error: function(error) {
							context.fail(error);
						}
					});	



				}
			},
			error: function(error) {
				context.fail(error);
			}
		});
	});
}