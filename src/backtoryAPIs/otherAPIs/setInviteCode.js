var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    context.log(requestBody);
    var securityContext = context.getSecurityContext();
    var userId = securityContext.userId;
    var uid = requestBody.uid;

    var coins=1000;
    findPlayer(context, userId, function (player) {
        var extraInfo = player.get("extraInfo");
        var invitedUID = extraInfo.get("invitedUID");
        if (invitedUID!=null&&invitedUID.length > 0)
        {
            succeed(context, {coins: -1});
           // fail(context, "you have entered an invitation code");
        }
        else if(player.get("uid")==uid)
        {
            succeed(context, {coins: -1});
        }
        else
        {
            findParentPlayer(context, uid, function (parentPlayer) {
                extraInfo.set("invitedUID", uid);
                extraInfo.save({
                    success: function (extraInfo) {
                        player.set("coin", player.get("coin") + coins);
                        player.save({
                            success: function (player) {
                                parentPlayer.set("coin", parentPlayer.get("coin") + 500);
                                parentPlayer.save({
                                    success: function (parentPlayer) {
                                        succeed(context, {coins: coins});
                                    },
                                    error: function (error) {
                                        context.fail(error);
                                    }
                                });
                            },
                            error: function (error) {
                                context.fail(error);
                            }
                        });
                    },
                    error: function (error) {
                        fail(context, error);
                    }
                });
            });

        }
    });


   
};

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
function findParentPlayer(context, uid, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var qQuery = new Backtory.Query(TPlayers);
    qQuery.equalTo("uid", uid);
    qQuery.find({
        success: function (players) {
            if (players.length > 0)
                callback(players[0]);
            else
                succeed(context, {coins: 0});
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