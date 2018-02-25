var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var currDate = new Date();
    var userId = securityContext.userId;
    findPlayer(context, userId, function (player) {
        var extraInfo = player.get("extraInfo");
        var packageExists = true;
        if (extraInfo.get("lastPackageTime") != null)
        {
            var lastPackageTime = new Date(extraInfo.get("lastPackageTime").split("UTC")[0] + "Z");
            var diffHours = Math.floor(Math.abs(currDate - lastPackageTime) / 3600000);
            packageExists = diffHours >= 24 ? true : false;
        }
        if (packageExists)
        {
            var packageId = extraInfo.get("lastPackageId") + 1;
//            if (packageId > 3)
//                packageId = 1;
//            extraInfo.set("lastPackageId", packageId);
//            extraInfo.set("lastPackageTime", currDate);
//            extraInfo.save({
//                success: function (extraInfo) {
            var TPackages = Backtory.Object.extend("TPackages");
            var qQuery = new Backtory.Query(TPackages);
            qQuery.equalTo("packageId", packageId);
            qQuery.select("count", "item");
            qQuery.include("item");
            qQuery.find({
                success: function (items) {
                    getRewardRecord(context, userId, function (rec) {
                        var recItems = [];
                        for (var i = 0; i < items.length; i++)
                        {
                            recItems[i] = items[i].get("item");
                            recItems[i].set("count",items[i].get("count"));
                        }
                        rec.set("userId", userId);
                        rec.set("items", recItems);
                        rec.set("heart",0);
                        rec.set("video_heart",0);
                        rec.set("coin",0);
                        rec.set("video_coin",0);
                        rec.set("ticket",0);
                        rec.set("video_ticket",0);
                        rec.save({
                            success: function (rec) {
                                succeed(context, {packageId: packageId, items: items});
                            },
                            error: function (error) {
                                fail(context, error);
                            }
                        });
                    });

                },
                error: function (error) {
                    fail(context, error);
                }
            });
//                },
//                error: function (error) {
//                    fail(context, error);
//                }
//            });

        } else
            succeed(context, {});
//            fail(context, 'you should wait for one hour!');
    });

};
function getRewardRecord(context, userId, callback)
{
    var TPlayerRewards = Backtory.Object.extend("TPlayerRewards");
    var qQuery = new Backtory.Query(TPlayerRewards);
    qQuery.equalTo("userId", userId);
    qQuery.find({
        success: function (recs) {
            var rec = new TPlayerRewards();
            if (recs.length > 0)
                callback(recs[0]);
            else
                callback(rec);

        },
        error: function (error) {
            fail(context, error);
        }
    });
}
function findPlayer(context, userId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", userId);
    mainQuery.include("extraInfo");
    mainQuery.limit(1);
    mainQuery.find({
        success: function (players) {
            if (players.length > 0)
                callback(players[0]);
            else
                context.fail('player not found!');
        },
        error: function (error) {
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
    context.log("result:" + JSON.stringify(result));

    context.succeed(result);
}