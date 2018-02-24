var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    context.log(requestBody);
    var securityContext = context.getSecurityContext();
    var userId = securityContext.userId;
    var uid = requestBody.uid;


    findPlayer(context, userId, function (player) {
        var extraInfo = player.get("extraInfo");
        var invitedUID = extraInfo.get("invitedUID");
        if (invitedUID.length > 0)
            fail(context, "you have entered an invitation code");
        else
        {
            findParentPlayer(context, uid, function (parentPlayer) {
                extraInfo.set("invitedUID", uid);
                extraInfo.save({
                    success: function (extraInfo) {
                        player.set("coin", player.get("coin") + 1000);
                        player.save({
                            success: function (player) {
                                parentPlayer.set("coin", parentPlayer.get("coin") + 500);
                                parentPlayer.save({
                                    success: function (parentPlayer) {
                                        succeed(context, {message: "successful"});
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


    var name = requestBody.name;
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", player_id);
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            player = list[0];
            player.set("name", name);
            player.save({
                success: function (player) {
                    context.succeed({message: "successful"});
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
                fail(context, "not found player with uid:" + uid);
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