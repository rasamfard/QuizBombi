var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    //types: 0:normal_daily 1:normal_weekly 2:endless_daily 3:endless_weekly
    var leaderIds = ["5a4e1da2e4b050a851c7a665", "5a4e1f53e4b050a851c7a666", "5a4e20a5e4b0463d1a70c7d2", "5a4e20d1e4b050a851c7a667"];
    var leaderBoard = new Backtory.LeaderBoard(leaderIds[requestBody.type]);
    leaderBoard.getTopUsers(10, {
        success: function (response) {
            var topList = response.usersProfile;
            var users = [];
            for (var i = 0; i < topList.length; i++)
                users[i] = topList[i].userBriefProfile.userId;
            var TPlayers = Backtory.Object.extend("TPlayers");
            var players_query = new Backtory.Query(TPlayers);
            players_query.containedIn("userId", users);
            players_query.find({
                success: function (players) {
                    updateRank(leaderIds[requestBody.type], requestBody.type, players, 0, function () {
                        players.sort(function (a, b) {
                            if (b.get("rank") > a.get("rank"))
                                return 1;
                            else if (b.get("rank") < a.get("rank"))
                                return -1;
                            else
                                return 0;
                        });

                        var my_query = new Backtory.Query(TPlayers);
                        my_query.equalTo("userId", securityContext.userId);
                        my_query.find({
                            success: function (mplayer) {
                                getRank(leaderIds[requestBody.type], requestBody.type, mplayer[0], function () {
                                    players[players.length] = mplayer[0];
                                    succeed(context, {players: players, type: requestBody.type});
                                }, context);
                            },
                            error: function (error) {
                                fail(context, error);
                            }
                        });
                    }, context);

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

};

function updateRank(leaderId, type, players, i, callback, context)
{
    if (i < players.length)
    {
        getRank(leaderId, type, players[i], function () {
            updateRank(leaderId, type, players, i + 1, callback, context);
        }, context);
    } else
        callback();
}

function getRank(leaderId, type, player, callBack, context)
{
    if (player != null)
    {
        var leaderBoard = new Backtory.LeaderBoard(leaderId);
        leaderBoard.getUserRank(player.get("userId"), {
            success: function (rank, scores) {
                player.set("rank", rank);
                player.set("score", scores[1]);
                if (type == 2 || type == 3)
                    player.set("matchCount", scores[0]);
//                else
//                    player.set("matchCount", scores[1]);
                callBack();
            },
            error: function (error) {
                if (type < 2)
                {
                    var event = new Backtory.Event("UpdateRank_Normal");
                    event.add("Score", 0);
//                    event.add("matchCount", 0);
                    event.add("randomScore", Math.ceil(Math.random() * (1000000)));
                    event.sendFromUser(player.get("userId"), {
                        success: function () {
                            player.set("rank", 0);
                            player.set("score", 0);
//                            player.set("matchCount", 0);
                            callBack();
                        },
                        error: function (error) {
                            fail(context, error);
                        }
                    });
                } else
                {
                    var event = new Backtory.Event("UpdateRank_Endless");
                    event.add("Score", 0);
                    event.add("QCount", 0);
                    event.add("randomNum", Math.ceil(Math.random() * (1000000)));
                    event.sendFromUser(player.get("userId"), {
                        success: function () {
                            player.set("rank", 0);
                            player.set("score", 0);
                            player.set("maxCount", 0);
                            callBack();
                        },
                        error: function (error) {
                            fail(context, error);
                        }
                    });
                }
            }
        });
    } else
        callBack();
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