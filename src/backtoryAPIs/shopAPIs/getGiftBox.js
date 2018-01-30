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
            packageExists = diffHours > 1 ? true : false;
        }
        if (packageExists)
        {
            var packageId = extraInfo.get("lastPackageId") + 1;
            if (packageId > 3)
                packageId = 1;
            extraInfo.set("lastPackageId", packageId);
            extraInfo.set("lastPackageTime", currDate);
            extraInfo.save({
                success: function (extraInfo) {
                    var TPackages = Backtory.Object.extend("TPackages");
                    var qQuery = new Backtory.Query(TPackages);
                    qQuery.equalTo("packageId", packageId);
                    qQuery.select("count", "item");
                    qQuery.include("item");
                    qQuery.find({
                        success: function (items) {
                            succeed(context, {packageId: packageId, items: items});
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

        } else
            fail(context, 'you should wait for one hour!');
    });

};
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