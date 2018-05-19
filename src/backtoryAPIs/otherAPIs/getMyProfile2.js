var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    context.log("requestBody:" + JSON.stringify(requestBody));
    var player_id = securityContext.userId;//
    context.log("player_id:" + player_id);
    findPlayer(context, player_id, function (player) {
        context.log("player:" + JSON.stringify(player));
        updateEnergy(context, player, function () {
            checkInfinitEnergy(context, player, function () {
                if (player.get("heartLastTime") != null)
                {
                    var testDate = new Date(player.get("heartLastTime")).toUTCString();
                    player.set("heartLastTime", testDate);
                }
                player.set("telegramAndVote", player.get("extraInfo").get("telegramAndVote"));
                player.get("currentMission").set("currentMissionStep", player.get("currentMissionStep"));
                context.succeed(player);
            });
        });
    });

};
function findPlayer(context, userId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", userId);
    mainQuery.include("extraInfo");
    mainQuery.include("currentMission");
    mainQuery.limit(100);
    mainQuery.find({
        success: function (players) {
            context.log("players.length" + players.length);
            var player = players[0];
            if (player != null)
                callback(player);
            else
            {
                context.log("retry to find player");
                findPlayer(context, userId, callback);
            }
        },
        error: function (error) {
            context.log("retry to find player in error condition "+ JSON.stringify(error));
            findPlayer(context, userId, callback);
            // fail(context, error);
        }
    });
}
function updateEnergy(context, pp, callback)
{
    if (pp.get("heartLastTime") == null)
    {
        context.log("errrrrrrrrrrrrrrrrrrr");
        callback();
        return;
    }
    var lastdate = new Date(pp.get("heartLastTime").split("UTC")[0] + "Z");
    var curdate = new Date();
    var hours = Math.floor(Math.abs(curdate - lastdate) / 3600000);  //curdate-lastdate in miliseconds
    var myStartDate = new Date(lastdate.getTime() + (hours * 3600000));
    var newHeart = pp.get("heart");
    if (pp.get("heart") < 3)
    {
        newHeart = pp.get("heart") + hours;
        if (newHeart >= 3)
        {
            newHeart = 3;
            var date = new Date();
            pp.set("heartLastTime", date);
        } else
        {
            pp.set("heartLastTime", myStartDate);
        }
    }
    pp.set("heart", newHeart);
    savePlayer(context, pp, callback);
}
function savePlayer(context, player, callback)
{
    player.save({
        success: function (history) {
            callback();
        },
        error: function (error) {
            context.log("retry to save player data with error "+ JSON.stringify(error));
            savePlayer(context, player, callback);
            //fail(context, error);
        }
    });
}
function getShopItem(context, itemId, callback)
{
    var TShopItems = Backtory.Object.extend("TShopItems");
    var query = new Backtory.Query(TShopItems);
    query.equalTo("_id", itemId);
    query.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
            {
                context.log("cannot find item");
                callback(null);
            }

        },
        error: function (error) {
            context.log("finding shopItem failed with error " + JSON.stringify(error));
            callback(null);
            //fail(context, error);
        }
    });
}
function checkInfinitEnergy(context, pp, callback)
{
    getShopItem(context, "59671a673a42bc0001eef4ff", function (item) {
        if (item == null)
        {
            callback();
        } else
        {
            var TPurchases = Backtory.Object.extend("TPurchases");
            var query = new Backtory.Query(TPurchases);
            query.equalTo("userId", pp.get("userId"));
            query.equalTo("item", item);
            query.find({
                success: function (list) {
                    if (list.length > 0)
                        pp.set("heart", -1);
                    callback();
                },
                error: function (error) {
                    callback();
                    //  fail(context, error);
                }
            });
        }
    });
}

function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}

