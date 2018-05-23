var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    context.log("requestBody:" + JSON.stringify(requestBody));
    var player_id = securityContext.userId;//
    context.log("player_id:" + player_id);
    findPlayer(context, player_id, function (player) {
      //  context.log("player:" + JSON.stringify(player));
        updateEnergy(context, player, function () {
            checkInfinitEnergy(context, player, function () {
                if (player.get("heartLastTime") != null)
                {
                   // var lastdate = new Date(player.get("heartLastTime").split("UTC")[0] + "Z");
                     context.log("lastTime:"+player.get("heartLastTime"));
                    var testDate = new Date(player.get("heartLastTime")).toUTCString();
                    player.set("heartLastTime", testDate);
                }
                player.set("telegramAndVote", player.get("extraInfo").get("telegramAndVote"));
                player.get("currentMission").set("currentMissionStep", player.get("currentMissionStep"));
               // player.set("heartLastTime",""+player.get("heartLastTime"));
             //   if(player.get("heart")==3||player.get("heart")==4)
               //     player.set("heart",2);
                 context.log("player:" + JSON.stringify(player));
                context.succeed(player);
            });
        });
    });

};
function findPlayer(context, userId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    mainQuery.equalTo("userId", userId);
    mainQuery.include("extraInfo");
    mainQuery.include("currentMission");
    mainQuery.limit(100);
    mainQuery.find({
        success: function (players) {
            context.log("players.length" + players.length);
            var player = players[0];
            if (player != null)
                callback(player);
            else
            {
                 context.log("try to register player and retry to find player");
                registerPlayerFunc(context, userId,function(){
                    findPlayer(context, userId, callback);
                });
               
                
            }
        },
        error: function (error) {
            context.log("retry to find player in error condition "+ JSON.stringify(error));
            findPlayer(context, userId, callback);
            // fail(context, error);
        }
    });
}
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
    if (pp.get("heart") < 3)
    {
        newHeart = pp.get("heart") + hours;
        if (newHeart >= 3)
        {
            newHeart = 3;
            var date = new Date();
            pp.set("heartLastTime", date);
        } else
        {
            pp.set("heartLastTime", myStartDate);
        }
    }
    else
    {
        //pp.set("heartLastTime", lastdate);
    }
    pp.set("heart", newHeart);
    savePlayer(context, pp, callback);
}
function savePlayer(context, player, callback)
{
    player.save({
        success: function (history) {
            callback();
        },
        error: function (error) {
            context.log("retry to save player data with error "+ JSON.stringify(error));
            savePlayer(context, player, callback);
            //fail(context, error);
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
            {
                context.log("cannot find item");
                callback(null);
            }

        },
        error: function (error) {
            context.log("finding shopItem failed with error " + JSON.stringify(error));
            callback(null);
            //fail(context, error);
        }
    });
}
function checkInfinitEnergy(context, pp, callback)
{
    getShopItem(context, "59671a673a42bc0001eef4ff", function (item) {
        if (item == null)
        {
            callback();
        } else
        {
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
        }
    });
}
/////////////////////// register/////////////////////////

function registerPlayerFunc(context, userId,callback)
{
            var TPlayers = Backtory.Object.extend("TPlayers");
            var player = new TPlayers();
            player.set("name", "user_" + userId.slice(21, 24));
            player.set("userId", userId);
            player.set("avatar", ["1", "1", "1"]);
            player.set("coin", 500);
            player.set("level", 1);
            player.set("heart", 3);
            player.set("ticket", 2);
            player.set("qCount", 5);
            player.set("matchCount", 0);
            player.set("xp", 0);
            player.set("heartLastTime", "0");
            player.set("endlessMaxQCount", 0);
            player.set("currentMissionStep", 0);

            generateUID(context, function (puid) {
                player.set("uid", puid);
                getMission(context, 1, function (mission) {
                    player.set("currentMission", mission);
                    createExtraInfo(context, mission, function (extraInfo) {
                        player.set("extraInfo", extraInfo);
                        savePlayerRegister(context, player,callback);

                    });

                });
            });
}
function savePlayerRegister(context, player,callback)
{
    player.save({
        success: function (player2) {
            createScreenItems(context, player2, function () {
                callback();
            });

        },
        error: function (error) {
            context.log("retry to save Player data with error " + JSON.stringify(error));
            savePlayerRegister(context, player);
            //  fail(context, error);
        }
    });
}
function createScreenItems(context, player, callback)
{
    var TScreenItems = Backtory.Object.extend("TScreenItems");
    var screen = new TScreenItems();
    screen.set("player", player);
    var items = [];
    var itemIds = ["5a5b5d97e7e9dc0001a27184", "5a5b5d99149ec00001b1633d", "5a5b6138e7e9dc0001a29ba7", "5a5b6138e7e9dc0001a29ba7", "5a5b60923d60fd0001a1c9d9", "5a5b60923d60fd0001a1c9d9", "5a5b5d98e7e9dc0001a27186"];
    var positions = [13, 14, 1, 10, 2, 9, 16];
    var date = new Date();
    for (var i = 0; i < itemIds.length; i++)
        items[items.length] = {itemId: itemIds[i], pose: positions[i], addTime: date};
    screen.set("items", items);
    screen.save({
        success: function (screen) {
            callback();
        },
        error: function (error) {
            context.log("retry to createScreenItems with error " + JSON.stringify(error));
            createScreenItems(context, player, callback);
            //fail(context,error);
        }
    });
}
function createExtraInfo(context, mission, callback)
{
    var TExtraInfo = Backtory.Object.extend("TExtraInfo");
    var extra_info = new TExtraInfo();
    extra_info.set("lastPackageId", 0);
    extra_info.set("lastPackageTime", "0");
    extra_info.set("usedHomesTF", 0);
    extra_info.set("telegramAndVote", 0);
    extra_info.save({
        success: function (extra_info) {
            callback(extra_info);
        },
        error: function (error) {
            context.log("retry createExtraInfo with error " + JSON.stringify(error));
            createExtraInfo(context, mission, callback);
            //context.fail(error);
        }
    });
}
function generateUID(context, callback)
{
    var uid = ("00000" + ((Math.random() * Math.pow(36, 5)) | 0).toString(36)).slice(-5);
    var TPlayers = Backtory.Object.extend("TPlayers");
    var _qQuery = new Backtory.Query(TPlayers);
    _qQuery.equalTo("uid", uid);
    _qQuery.limit(1);
    _qQuery.count({
        success: function (max) {
          //  if (max > 0)
            //    generateUID(context, callback);
            //else
                callback(uid);
        },
        error: function (error) {
            context.log("retry generateUID with error " + JSON.stringify(error));
            generateUID(context, callback);

            // fail(context, error);
        }
    });
}
function getMission(context, code, callback)
{
    var TMissions = Backtory.Object.extend("TMissions");
    var qQuery = new Backtory.Query(TMissions);
    qQuery.equalTo("code", code);
    qQuery.find({
        success: function (missions) {
            if (missions.length > 0)
            {
                callback(missions[0]);
            } else
            {
                context.log("retry, not found mission with code:" + code);
                getMission(context, code, callback);
            }
        },
        error: function (error) {
            context.log("retry getMission with error " + JSON.stringify(error));
            getMission(context, code, callback);
            // fail(context, error);
        }
    });

}


/////////////////////////////////////////////////////////



function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}

