var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    context.log(JSON.stringify(requestBody));
    updatePlayers(context, requestBody.usersId, 0);
};
function updateNormalRanks(pId, callback)
{
//    var event = new Backtory.Event("UpdateRank_Normal");
//    event.add("Score", 0);
//    event.add("matchCount", 1);
//    event.add("randomScore", Math.ceil(Math.random() * (1000000)));
//    event.sendFromUser(pId, {
//        success: function () {
            callback();
//        },
//        error: function (error) {
//            callback();
//        }
//    });
}
function updatePlayers(context, players, _index)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var qQuery = new Backtory.Query(TPlayers);
    qQuery.equalTo("userId", players[_index]);
    qQuery.find({
        success: function (list) {

            var pr = list[0];
            var qCount = pr.get("qCount");
            var type = calcType(qCount);
            pr = decreaseFunc(pr, type);
            pr.set("matchCount", pr.get("matchCount") + 1);
            updateNormalRanks(players[_index], function () {
                pr.save({
                    success: function (p2) {
                        if (_index == players.length - 1)
                            succeed(context, {});
                        else
                            updatePlayers(context, players, _index + 1);
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
}
function decreaseFunc(pr, type)
{
    //type4 5 ticket 1
    //type6 2 heart 1
    //type 3 coins 10
    if (type == 6 || type == 2)
    {
        var heart = pr.get("heart");
        heart = heart - 1;
        if (heart < 0)
            heart = 0;
        pr.set("heart", heart);
        if (pr.get("heart") >= 4 || pr.get("heartLastTime") == null)
        {
            var date = new Date();
            pr.set("heartLastTime", date);
        }
    }
    if (type == 4 || type == 5)
    {
        var ticket = pr.get("ticket");
        ticket = ticket - 1;
        if (ticket < 0)
            ticket = 0;
        pr.set("ticket", ticket);

    }
    if (type == 3)
    {
        var coin = pr.get("coin");
        coin = coin - 10;
        if (coin < 0)
            coin = 0;
        pr.set("coin", coin);
    }

    return pr;
}

function calcType(qCount)
{
    var ttype = 1;
    //context.log("qCount"+qCount);
    if (qCount > 100 && qCount < 200)
    {
        ttype = 2;
        qCount = qCount - 100;
    } else if (qCount > 200 && qCount < 300)
    {
        ttype = 3;
        qCount = qCount - 200;
    } else if (qCount > 500 && qCount < 600)
    {
        ttype = 4;
        qCount = qCount - 500;
    } else if (qCount > 600 && qCount < 700)
    {
        ttype = 5;
        qCount = qCount - 600;
    } else if (qCount > 700 && qCount < 800)
    {
        ttype = 6;
        qCount = qCount - 700;
    } else if (qCount > 800 && qCount < 900)
    {
        ttype = 7;
        qCount = qCount - 800;
    }
    return ttype;
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