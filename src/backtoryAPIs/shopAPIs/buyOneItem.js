var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var player_id = securityContext.userId;
    var item_id = requestBody.itemId;
    getPlayer(context, player_id, function (player) {
        getShopItem(context, item_id, function (item) {
            if (item.get("sectionCode") != 14)
            {
                checkIfNotPurchased(context, player.get("userId"), item, function (notPurchased) {
                    if (notPurchased)
                    {
                        var price = item.get("coins");
                        var coins = player.get("coin");
                        if (coins < price)
                            fail(context, "not enough money");
                        else
                            player.set("coin", (coins - price));
                        buyItem(context, player, item, function () {
                            player.save({
                                success: function (player) {
                                    context.succeed({message: "successful"});
                                },
                                error: function (error) {
                                    context.fail(error);
                                }
                            });
                        });
                    } else
                        fail(context, "already purchased");
                });
            } else
            {
                var price = item.get("coins");
                var coins = player.get("coin");
                if (coins < price)
                {
                    fail(context, "not enough money");
                    return;
                } else
                    player.set("coin", (coins - price));

                getSpecialPackageItems(context, item.get("specialPackageId"), function (items) {
                    buyItems(context, player, items, 0, function () {
                        player.save({
                            success: function (player) {
                                context.succeed({message: "successful"});
                            },
                            error: function (error) {
                                context.fail(error);
                            }
                        });
                    });
                });
            }

        });
    });

};
function buyItems(context, player, items, i, callback)
{
    checkIfNotPurchased(context, player.get("userId"), items[i], function (notPurchased) {
        if (notPurchased)
        {
            buyItem(context, player, items[i], function () {
                if (i < items.length - 1)
                    buyItems(context, player, items, i + 1, callback);
                else
                    callback();
            });
        } else
        {
            if (i < items.length - 1)
                buyItems(context, player, items, i + 1, callback);
            else
                callback();
        }
    });
}
function getSpecialPackageItems(context, packageId, callback)
{
    var TSpecialPackages = Backtory.Object.extend("TSpecialPackages");
    var mquery = new Backtory.Query(TSpecialPackages);
    mquery.include("item");
    mquery.equalTo("packageId", packageId);
    mquery.find({
        success: function (list) {
            var items = list.length > 0 ? list : [];
            callback(items);
        },
        error: function (error) {
            context.fail(error);
        }
    });
}
function getShopItem(context, itemId, callback)
{
    var TShopItems = Backtory.Object.extend("TShopItems");
    var mainQuery = new Backtory.Query(TShopItems);
    mainQuery.equalTo("_id", itemId);
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
                context.fail('item not found');
        },
        error: function (error) {
            context.fail(error);
        }
    });
}
function getPlayer(context, pId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", pId);
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
                context.fail('player not found');
        },
        error: function (error) {
            context.fail(error);
        }
    });
}
function buyItem(context, player, item, callback)
{
    if (item.get("sectionCode") == 2)//heart
        player.set("heart", player.get("heart") + item.get("amount"));
    else
    if (item.get("sectionCode") == 13 && item.get("name") == "heart")//heart
        player.set("heart", player.get("heart") + item.get("amount"));
    else
    if (item.get("sectionCode") == 8)//hearttick
    {
        player.set("heart", player.get("heart") + (item.get("amount") / 2));
        player.set("ticket", player.get("ticket") + (item.get("amount") / 2));
    } else
    if (item.get("sectionCode") == 13 && item.get("name") == "ticket")//ticket
        player.set("ticket", player.get("ticket") + item.get("amount"));
    else
    if (item.get("sectionCode") == 7)//ticket
        player.set("ticket", player.get("ticket") + item.get("amount"));

    if (item.get("maxPurchases") > 0)
    {
        var TPurchases = Backtory.Object.extend("TPurchases");
        var purchase = new TPurchases();
        purchase.set("userId", player.get("userId"));
        purchase.set("item", item);
        purchase.save({
            success: function (purchase) {
                callback();
            },
            error: function (error) {
                context.fail(error);
            }
        });
    } else
        callback();
}
function checkIfNotPurchased(context, pId, itemId, callback)
{
    var TPurchases = Backtory.Object.extend("TPurchases");
    var query = new Backtory.Query(TPurchases);
    query.equalTo("userId", pId);
    query.equalTo("item", itemId);
    query.find({
        success: function (list) {
            if (list.length > 0)
                callback(false);
//                fail(context, {message: "purchased"});
            else
                callback(true);
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
    context.log("result:" + JSON.stringify(result));
    context.succeed(result);
}

