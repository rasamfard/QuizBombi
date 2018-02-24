var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var count = requestBody.count;
    var securityContext = context.getSecurityContext();
    var player_id = securityContext.userId;
    var currDate = new Date();
    getPlayer(context, player_id, function (player) {
        getScreen(context, player, function (screen) {
            var homeItemId = count == 2 ? "5a5b5d97e7e9dc0001a27184" : "5a5b5d98e7e9dc0001a27186";
            var items = screen.get("items");
            var homeIndex = items.findIndex(function (item) {
                return item.itemId == homeItemId;
            });
            if (homeIndex < 0)
            {
                fail(context,'item not purchased');
                return;
            }
            
            var homeItem = items[homeIndex];
            getShopItem(context, homeItemId, function (item) {
                var lifeTime = item.get("lifeTime");
                var extraInfo = player.get("extraInfo");
                var usedHomesTF = extraInfo.get("usedHomesTF");
                if (usedHomesTF == 0)
                    lifeTime = 1;
                if (count == 2 && usedHomesTF == 2)
                    lifeTime = 1;
                if (count == 4 && usedHomesTF == 1)
                    lifeTime = 1;

                if (count == 2 && usedHomesTF == 0)
                    usedHomesTF = 1;
                else if (count == 2 && usedHomesTF == 2)
                    usedHomesTF = 3;

                if (count == 4 && usedHomesTF == 0)
                    usedHomesTF = 2;
                else if (count == 4 && usedHomesTF == 1)
                    usedHomesTF = 3;
//                item.set("lifeTime", lifeTime);

                var lastHomeTime = new Date(homeItem.addTime);
                var diffMins = Math.floor(Math.abs(currDate - lastHomeTime) / 60000);
                var timeOk = diffMins >= lifeTime ? true : false;
                if (timeOk)
                {
                    getQuestions(context, count, function (questions) {
                        items[homeIndex].addTime = currDate;
                        screen.set("items", items);
                        screen.save({
                            success: function (screen) {
                                if (lifeTime < 2)
                                {
                                    extraInfo.set("usedHomesTF", usedHomesTF);
                                    extraInfo.save({
                                        success: function (eI) {
                                            succeed(context, {questions: questions, item: item});
                                        },
                                        error: function (error) {
                                            fail(context,error);
                                        }
                                    });
                                } else
                                    succeed(context, {questions: questions, item: item});
                            },
                            error: function (error) {
                                fail(context,error);
                            }
                        });

                    });
                } else
                {
                    fail(context,'time not reached');
                }
            });
        });
    });

};
function getShopItem(context, itemId, callback)
{
    var TShopItems = Backtory.Object.extend("TShopItems");
    var mainQuery = new Backtory.Query(TShopItems);
    mainQuery.equalTo("_id", itemId);
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
                fail(context,'item not found');
        },
        error: function (error) {
            fail(context,error);

        }
    });
}
function getPlayer(context, pId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", pId);
    mainQuery.include("extraInfo");
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
                fail(context,'player not found');
        },
        error: function (error) {
            fail(context,error);
        }
    });
}
function getScreen(context, player, callback)
{
    var TScreenItems = Backtory.Object.extend("TScreenItems");
    var mainQuery = new Backtory.Query(TScreenItems);
    mainQuery.equalTo("player", player);
    mainQuery.include("player");
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
                fail(context,'screen not found');
        },
        error: function (error) {
            fail(context,error);
        }
    });
}
function getHome(context, count, callback)
{

}

function getQuestion(context, ids, i, qs, count, callback)
{
    var TFQuestions = Backtory.Object.extend("TFQuestions");
    var qQuery = new Backtory.Query(TFQuestions);
    qQuery.skip(ids[i]);
    context.log(ids);
    qQuery.limit(1);
    qQuery.select("_id", "question", "ans", "image_path", "type", "language");
    qQuery.find({
        success: function (Qs) {
            qs[i] = Qs[0];
            i++;
            if (i < count)
                getQuestion(context, ids, i, qs, count, callback);
            else
                callback(qs);
        },
        error: function (error) {
            fail(context, error);
        }
    });
}
function getQuestions(context, count, callback)
{
    var TFQuestions = Backtory.Object.extend("TFQuestions");
    var qQuery = new Backtory.Query(TFQuestions);
    qQuery.count({
        success: function (max) {
            count = Math.min(count, max);
            var Ids = randomNumberGenerator(max, count);
            getQuestion(context, Ids, 0, [], count, function (questions) {
                callback(questions);
            });

        },
        error: function (error) {
            fail(context, error);
        }
    });

}
function randomNumberGenerator(max, count)
{
    var result = [];
    var i = 0;
    while (result.length < count) {
        var randomnumber = Math.floor(Math.random() * max);
        if (result.indexOf(randomnumber) > -1)
            continue;
        result[i] = randomnumber;
        i++;
    }
    return result;
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
