var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    context.log("requestBody:"+requestBody);
    var player_id = securityContext.userId;//
    context.log("player_id:"+player_id);
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", player_id);
    mainQuery.include("extraInfo");
    mainQuery.include("currentMission");
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list2) {
            var pp = list2[0];
           // context.log("player:"+JSON.stringify(pp));
            updateEnergy(context, pp, function () {
           //     context.log("updateEnergy");
                checkInfinitEnergy(context, pp, function () {
             //       context.log(JSON.stringify(pp));
                    if (pp.get("heartLastTime") != null)
                    {
                        var testDate = new Date(pp.get("heartLastTime")).toUTCString();
                        pp.set("heartLastTime", testDate);
                    }
                    pp.set("telegramAndVote",pp.get("extraInfo").get("telegramAndVote"));
                    pp.get("currentMission").set("currentMissionStep", pp.get("currentMissionStep"));
                     context.log("player:"+JSON.stringify(pp));
                    context.succeed(pp);
                    // 				var leaderBoard = new Backtory.LeaderBoard("5992e583e4b0dce69e446541");
                    // 				leaderBoard.getUserRank(player_id, {
                    // 					success: function(rank, scores) {
                    // 						pp.set("rank",rank);
                    // 						context.log(pp);
                    // 						context.succeed(pp);
                    // 					},

                    // 					error: function(error) {
                    // 						var event = new Backtory.Event("UpdateRank");
                    // 						event.add("score",0);
                    // 						event.add("score2", Math.ceil(Math.random()*(1000000)));
                    // 						event.sendFromUser(player_id, {
                    // 							success: function() {
                    // 								pp.set("rank",0);
                    // 								context.succeed(pp);
                    // 							},

                    // 							error: function(error) {
                    // 								context.log(error);
                    // 								context.fail(error);
                    // 							}
                    // 						});

                    // 					}
                    // 				});
                });
            });

        },
        error: function (error) {
            fail(context,error);
        }
    });
};
function updateEnergy(context, pp, callback)
{
    if (pp.get("heartLastTime") == null)
    {
        context.log("errrrrrrrrrrrrrrrrrrr");
        callback();
        return;
    }
    var lastdate = new Date(pp.get("heartLastTime").split("UTC")[0] + "Z");
    var curdate = new Date();
    var hours = Math.floor(Math.abs(curdate - lastdate) / 3600000);  //curdate-lastdate in miliseconds
    var myStartDate = new Date(lastdate.getTime() + (hours * 3600000));
    var newHeart = pp.get("heart");
    if (pp.get("heart") < 5)
    {
        newHeart = pp.get("heart") + hours;
        if (newHeart >= 5)
        {
            newHeart = 5;
            var date = new Date();
            pp.set("heartLastTime", date);
        } else
        {
            pp.set("heartLastTime", myStartDate);
        }
    }
    pp.set("heart", newHeart);
    pp.save({
        success: function (history) {
            callback();
        },
        error: function (error) {
            fail(context, error);
        }
    });

}
function getShopItem(context, itemId, callback)
{
    var TShopItems = Backtory.Object.extend("TShopItems");
    var query = new Backtory.Query(TShopItems);
    query.equalTo("_id", itemId);
    query.find({
        success: function (list) {
            if (list.length > 0)
                callback(list[0]);
            else
                fail(context, 'cannot find item');

        },
        error: function (error) {
            fail(context, error);
        }
    });
}
function checkInfinitEnergy(context, pp, callback)
{
    getShopItem(context, "59671a673a42bc0001eef4ff", function (item) {
        var TPurchases = Backtory.Object.extend("TPurchases");
        var query = new Backtory.Query(TPurchases);
        query.equalTo("userId", pp.get("userId"));
        query.equalTo("item", item);
        query.find({
            success: function (list) {
                if (list.length > 0)
                    pp.set("heart", -1);
                callback();
            },
            error: function (error) {
                callback();
              //  fail(context, error);
            }
        });
    });
}

function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}

