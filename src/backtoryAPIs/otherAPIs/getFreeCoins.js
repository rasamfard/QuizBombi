var Backtory = require('backtory-sdk');
exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var userId = securityContext.userId;
    //types: 0=telegram 1=vote 2=instagram
    var type= securityContext.type;
    context.log("type:"+type);
    var values=[[1,1,3,3,5,5,7,7],[2,3,3,3,6,7,6,7],[4,5,6,7,4,5,6,7]];
    var rewards=[100,100,100];
    
    findPlayer(context, userId, function (player) {
        var extraInfo = player.get("extraInfo");
        var telegramAndVote=0;
        if(extraInfo.get("telegramAndVote")!=null)
            telegramAndVote = extraInfo.get("telegramAndVote");
        //1: telegram
        //2: vote
        //3: vote and telegram
        //4: instagram
        //5: instagram and telegram
        //6: instagram and vote
        //7: instagram and vote and telegram
        context.log("telegramAndVote:"+telegramAndVote);
        if (telegramAndVote != values[type][telegramAndVote] )
        {
            extraInfo.set("telegramAndVote", values[type][telegramAndVote]);
            extraInfo.save({
                success: function (extraInfo) {
                    player.set("coin",player.get("coin")+rewards[type]);
                    player.save({
                        success: function (player) {
                            succeed(context, {message: "succeed"});
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