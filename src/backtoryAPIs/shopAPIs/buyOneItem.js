var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext=context.getSecurityContext();
	var player_id=securityContext.userId;
	var item_id=requestBody.itemId;
	var TShopItems = Backtory.Object.extend("TShopItems");
	var query = new Backtory.Query(TShopItems);
	query.equalTo("_id",item_id);
	query.find({
		success: function(list) {
			var item= list[0];
			checkIfNotPurchased(context,player_id,item,function(){
				var price = item.get("coins");
				var TPlayers = Backtory.Object.extend("TPlayers");
				var playerQuery=new Backtory.Query(TPlayers); //Backtory.Query.or(query_year,query_studyfield);//,query_course);
				playerQuery.equalTo("userId",player_id);
				playerQuery.find({
					success: function(player_list) {
						var player=player_list[0];
						var coins=player.get("coin");
						if(coins<price)
							fail(context,"not enough money");
						else
						{
							if(item.get("name")=="heart")
							{
								if(player.get("heart")<5)
								{
									player.set("coin",(coins-price));
									player.set("heart",5);
								}
								else
									fail(context,"heart is full");
							}
							else
								player.set("coin",(coins-price));

							player.save({
								success: function(player) {
									if(item.get("name")!="heart")
									{

										var TPurchases = Backtory.Object.extend("TPurchases");
										var purchase = new TPurchases();
										purchase.set("userId",player_id);
										purchase.set("item",item);
										purchase.save({
											success: function(purchase) {
												context.succeed({message:"successful"});
											},
											error: function(error) {
												context.fail(error);
											}
										});
									}
									else
										context.succeed({message:"successful"});

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

		},
		error: function(error) {
			context.fail(error);
		}
	});





};
function checkIfNotPurchased(context,pId,itemId,callback)
{
	var TPurchases = Backtory.Object.extend("TPurchases");
	var query = new Backtory.Query(TPurchases);
	query.equalTo("userId",pId);
	query.equalTo("item",itemId);
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
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
	context.log("result:"+JSON.stringify(result));
	context.succeed(result);
}

