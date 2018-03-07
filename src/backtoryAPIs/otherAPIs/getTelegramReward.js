var Backtory = require('backtory-sdk');
exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var userId = securityContext.userId;

    findPlayer(context, userId, function (player) {
        var extraInfo = player.get("extraInfo");
        var telegramAndVote = extraInfo.get("telegramAndVote");
        if(telegramAndVote==null)
            telegramAndVote=0;
        //1: telegram
        //2: vote
        //3: vote and telegram
        if (telegramAndVote == 0 || telegramAndVote == 2)
        {
            extraInfo.set("telegramAndVote", telegramAndVote + 1);
            extraInfo.save({
                success: function (extraInfo) {
                    succeed(context, {message: "succeed"});
                },
                error: function (error) {
                    fail(context, error);
                }
            });

        } else
        {
            fail(context, "already recieved");
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
function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}
function succeed(context, result)
{
    context.succeed(result);
}