var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var player_id = securityContext.userId;//"5a2e5bf6e4b012a7c3f9baf1";//
    getPlayer(context, player_id, function (player) {
        getScreen(context, player, function (screen) {
            var items = screen.get("items");
            var myItemIds = [];
            for (var i = 0; i < items.length; i++)
                myItemIds[i] = items[i].itemId;
            getShopItems(context, myItemIds, function (allItems) {
                var extraInfo = player.get("extraInfo");
                var usedHomesTF = extraInfo.get("usedHomesTF");
                for (var i = 0; i < items.length; i++)
                {

                    function find_Item(item) {
                        return item.get("_id") == items[i].itemId;
                    }
                    var nitems = allItems.filter(find_Item);
                    items[i].item = nitems[0];
                    items[i].item.set("lifeTime", correctLifeTime(items[i].item, usedHomesTF));
                }
                context.succeed({items: items});
            });
        });
    });
};
function correctLifeTime(itemm, usedHomesTF)
{
    var lifeTime = itemm.get("lifeTime");
    var count = 0;
    if (itemm.get("_id") == "5a5b5d97e7e9dc0001a27184")
        count = 2;
    if (itemm.get("_id") == "5a5b5d98e7e9dc0001a27186")
        count = 4;
    if (count > 0)
    {
        
        if (usedHomesTF == 0)
            lifeTime = 1;
        if (count == 2 && usedHomesTF == 2)
            lifeTime = 1;
        if (count == 4 && usedHomesTF == 1)
            lifeTime = 1;
    }
    return lifeTime;
}
function getShopItems(context, itemIds, callback)
{
    var TShopItems = Backtory.Object.extend("TShopItems");
    var mainQuery = new Backtory.Query(TShopItems);
    mainQuery.containedIn("_id", itemIds);
    mainQuery.limit(1000);
    mainQuery.find({
        success: function (list) {
            callback(list);
        },
        error: function (error) {
            context.log('111111111111111111');
            fail(context,error);

        }
    });
}
function getPlayer(context, pId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", pId);
    mainQuery.include("extraInfo");
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
                context.fail('player not found');
        },
        error: function (error) {
            context.log('222222222222222');
                        fail(context,error);

        }
    });
}
function getScreen(context, player, callback)
{

    var TScreenItems = Backtory.Object.extend("TScreenItems");
    var mainQuery = new Backtory.Query(TScreenItems);
    mainQuery.equalTo("player", player);
    mainQuery.include("player");
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
            {

                var screen = new TScreenItems();
                screen.set("player", player);
                screen.set("items", []);
                screen.save({
                    success: function (screen) {
                        context.succeed({items: screen.get("items")});
                    },
                    error: function (error) {
                        context.log('333333333333333');
                        context.fail(error);
                    }
                });



            }
        },
        error: function (error) {
            context.log('4444444444444');
            context.fail(error);
        }
    });

}
function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}
function succeed(context, result)
{
// 	context.log("result:"+JSON.stringify(result));
    context.succeed(result);
}