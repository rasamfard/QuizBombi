var Backtory = require('backtory-sdk');
// types :    0.gameEndedNormal 1.gameEndedVideo  2.spinnerNormal 3.spinnerVideo 4.giftBox 3.TFQuestion
exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var userId = securityContext.userId;
    var type = 0;
    type = requestBody.type;
    findPlayer(context, userId, function (player) {
        findRewardsRec(context, userId, function (rec) {
            var items = rec.get("items");
            var extraInfo = player.get("extraInfo");
            if (type == 0)
                player.set("coin", player.get("coin") + rec.get("coin"));
            if (type == 1)
            {
                player.set("heart", player.get("heart") + rec.get("video_heart"));
                player.set("coin", player.get("coin") + rec.get("video_coin"));
            }
            if (type == 2)
            {
                var heart = player.get("heart") + rec.get("heart");
                var coin = player.get("coin") + rec.get("coin");
                var ticket = player.get("ticket") + rec.get("ticket");
                player.set("heart", heart);
                player.set("coin", coin);
                player.set("ticket", ticket);
                //player.set("coin",player.get("coin")+rec.get("video_coin"));

            }
            if (type == 3)
            {
                var heart = player.get("heart") + rec.get("video_heart");
                var coin = player.get("coin") + rec.get("video_coin");
                var ticket = player.get("ticket") + rec.get("video_ticket");
                player.set("heart", heart);
                player.set("coin", coin);
                player.set("ticket", ticket);
                //player.set("coin",player.get("coin")+rec.get("video_coin"));

            }

            if (type == 4)
            {
                var currDate = new Date();
                var packageId = extraInfo.get("lastPackageId") + 1;
                if (packageId > 3)
                    packageId = 1;
                extraInfo.set("lastPackageId", packageId);
                extraInfo.set("lastPackageTime", currDate);
                addFreeItemsToPlayer(context, player, items);
            }
            clearRewards(context, rec);
            saveAll(context, player, extraInfo, rec, items, type);
        });
    });

};
function addFreeItemsToPlayer(context, player, items)
{
    var filteredItems = [];
    var k = 0;
    for (var i = 0; i < items.length; i++)
    {
        var item = items[i];
        if (item.name == "coin" || item.name == "heart" || item.name == "ticket")
            player.set(item.name, item.count+player.get(item.name));
        else
        {
            filteredItems[k] = item;
            k++;
        }
    }
    items = filteredItems;
}

function filterPurchasedItems(context, player, items, callback)
{
    var itemIds = [];
    for (var i = 0; i < items.length; i++)
        itemIds[i] = items[i]._id;
    var fItems = [];
    var TPurchases = Backtory.Object.extend("TPurchases");
    var query = new Backtory.Query(TPurchases);
    query.equalTo("userId", player.get("userId"));
    query.containedIn("_id", itemIds);
    query.find({
        success: function (purchase_list) {
            var k = 0;
            for (var i = 0; i < items.length; i++)
            {
                function find_Item(item) {
                    return item.get("_id") == items[i]._id;
                }
                var nitems = purchase_list.filter(find_Item);
                if (nitems.length == 0)
                {
                    fItems[k] = itemIds[i];
                    k++;
                }
            }
            var TShopItems = Backtory.Object.extend("TShopItems");
            var squery = new Backtory.Query(TShopItems);
            squery.containedIn("_id", fItems);
            squery.find({
                success: function (list) {
                    callback(list);
                },
                error: function (error) {
                    fail(context, error);
                }
            });


        },
        error: function (error) {
            fail(context, error);
        }
    });
}
function addItemsToPlayer(context, player, items, ii, callback)
{
    var TPurchases = Backtory.Object.extend("TPurchases");
    var purchase = new TPurchases();
    purchase.set("userId", player.get("userId"));
    purchase.set("item", items[ii]);
    purchase.save({
        success: function (purchase) {
            if (ii < items.length - 1)
                addItemsToPlayer(context, player, items, ii + 1, callback);
            else
                callback();
        },
        error: function (error) {
            context.fail(error);
        }
    });
}
function clearRewards(context, rec)
{
    rec.set("coin", 0);
    rec.set("heart", 0);
    rec.set("ticket", 0);
    rec.set("video_heart", 0);
    rec.set("video_coin", 0);
    rec.set("items", []);
}
function saveAll(context, player, extraInfo, rec, items, type)
{
    player.save({
        success: function (player) {
            rec.save({
                success: function (rec) {
                    if (type == 4)
                    {
                        extraInfo.save({
                            success: function (extraInfo) {
                                filterPurchasedItems(context, player, items, function (fItems) {
                                    addItemsToPlayer(context, player, fItems, 0, function () {
                                        succeed(context, {});
                                    });
                                });
                            },
                            error: function (error) {
                                fail(context, error);
                            }
                        });
                    } else if (type == 2 || type == 3)
                    {
                        filterPurchasedItems(context, player, items, function (fItems) {
                            addItemsToPlayer(context, player, fItems, 0, function () {
                                succeed(context, {});
                            });
                        });
                    } else
                    {
                        succeed(context, {});
                    }
                },
                error: function (error) {
                    fail(context, error);
                }
            });
        },
        error: function (error) {
            fail(context, error);
        }
    });
}
function findPlayer(context, userId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var qQuery = new Backtory.Query(TPlayers);
    qQuery.equalTo("userId", userId);
    qQuery.include("extraInfo");
    qQuery.find({
        success: function (players) {
            if (players.length > 0)
                callback(players[0]);
            else
                fail(context, "not found player with id:" + userId);
        },
        error: function (error) {
            fail(context, error);
        }
    });

}
function findRewardsRec(context, userId, callback)
{
    var TPlayerRewards = Backtory.Object.extend("TPlayerRewards");
    var qQuery = new Backtory.Query(TPlayerRewards);
    qQuery.equalTo("userId", userId);
    qQuery.find({
        success: function (recs) {
            if (recs.length > 0)
                callback(recs[0]);
            else
                succeed(context, {});

        },
        error: function (error) {
            fail(context, error);
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
    context.succeed(result);
}