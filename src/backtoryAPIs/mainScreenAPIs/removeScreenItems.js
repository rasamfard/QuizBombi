var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var player_id=securityContext.userId;//5a4be80be4b0ce87892f063f
	
	var positions=requestBody.positions;
	var date = new Date();
	getScreen(context,player_id,function(screen){
		var items=screen.get("items");
		var newItems=[];
		var k=0;
		for(var i=0;i<items.length;i++)
		{
			function find_Item(item) {
				return item == items[i].pose;
			}
			var nitems=positions.filter(find_Item);
			if(nitems.length==0)
			{
				newItems[k]=items[i];
				k++;
			}
		}
		context.log(newItems);
		screen.set("items",newItems);
		screen.save({
			success: function(screen) {
				items=screen.get("items");
				var myItemIds=[];
				for(var i=0;i<items.length;i++)
					myItemIds[i]=items[i].itemId;
				if(myItemIds.length>0)
				{
					getShopItems(context,myItemIds,function(allItems){
						for(var i=0;i<items.length;i++)
						{
							function find_Item2(item) {
								return item.get("_id") == items[i].itemId;
							}
							var nitems=allItems.filter(find_Item2);
							items[i].item=nitems[0];
						}
						// 					for(var i=0;i<items.length;i++)
						// 						items[i].item=allItems[i];
						context.succeed({items:items});
					});
				}
				else
				{
					context.succeed({items:items});
				}
			},
			error: function(error) {
				context.fail(error);
			}
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
			if(list.length>0)
				callback(list);
			else
				context.fail('item not found');
		},
		error: function(error) {
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
							context.succeed(screen.get("items"));
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