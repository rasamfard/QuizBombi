var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var player_id=securityContext.userId;//"5a2e5bf6e4b012a7c3f9baf1";//
	getScreen(context,player_id,function(screen){
		var items=screen.get("items");
		context.log('7777777'+items);
		var myItemIds=[];
		for(var i=0;i<items.length;i++)
			myItemIds[i]=items[i].itemId;
		context.log('6666666666666');
		getShopItems(context,myItemIds,function(allItems){
			for(var i=0;i<items.length;i++)
			{
				
				function find_Item(item) {
					return item.get("_id") == items[i].itemId;
				}
				var nitems=allItems.filter(find_Item);
				items[i].item=nitems[0];
			}
			context.succeed({items:items});
		});
	});
};
function getShopItems(context,itemIds,callback)
{
	var TShopItems = Backtory.Object.extend("TShopItems");
	var mainQuery=new Backtory.Query(TShopItems);
 	mainQuery.containedIn("_id",itemIds);
	mainQuery.limit(1000);
	mainQuery.find({
        success: function(list) {
				callback(list);
		},
		error: function(error) {
			context.log('111111111111111111');
			context.fail(error);
			
		}
	});
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
			context.log('222222222222222');
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
							context.succeed({items:screen.get("items")});
						},
						error: function(error) {
							context.log('333333333333333');
							context.fail(error);
						}
					});	



				}
			},
			error: function(error) {
				context.log('4444444444444');
				context.fail(error);
			}
		});
	});
}