var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    findPlayer(context, securityContext.userId, function (player) {
        var stepsCount = player.get("currentMission").get("stepsCount");
        var currentMissionStep = player.get("currentMissionStep");

        getMission(context, player.get("currentMission").get("code") + 1, function (mission) {
            player.set("currentMission", mission);
            if (stepsCount == currentMissionStep)
            {
                var reward = player.get("currentMission").get("reward");
                player.set("coin", player.get("coin") + reward);
                player.set("currentMissionStep", 0);
                player.save({
                    success: function (player) {
                        player.get("currentMission").set("currentMissionStep", player.get("currentMissionStep"));
                        succeed(context, player);
                    },
                    error: function (error) {
                        fail(context, error);
                    }
                });
            } else
            {
                context.log("not completed mission!");
                succeed(context, player);
                //fail(context,"not completed mission!");		
            }
        });
    });

};
function getMission(context, code, callback)
{
    var TMissions = Backtory.Object.extend("TMissions");
    var qQuery = new Backtory.Query(TMissions);
    if (code > 17)
        code = 8;
    qQuery.equalTo("code", code);
    qQuery.find({
        success: function (missions) {
            if (missions.length > 0)
            {
                callback(missions[0]);
            } else
                fail(context, "not found mission with code:" + code);
        },
        error: function (error) {
            fail(context, error);
        }
    });

}
function findPlayer(context, playerId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var qQuery = new Backtory.Query(TPlayers);
    qQuery.equalTo("userId", playerId);
    qQuery.include("currentMission");
    qQuery.find({
        success: function (players) {
            if (players.length > 0)
            {
                callback(players[0]);
            } else
                fail(context, "not found player with id:" + playerId);
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