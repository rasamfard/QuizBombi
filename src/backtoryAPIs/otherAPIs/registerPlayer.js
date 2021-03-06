var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {

    var securityContext = context.getSecurityContext();
    var uid = ("00000" + ((Math.random() * Math.pow(36, 5)) | 0).toString(36)).slice(-5);
    var emailName = requestBody.username + uid + "@quizbombi.ir";
    var userInfo1 = {
        "firstName": "",
        "lastName": "",
        "username": requestBody.username,
        "password": requestBody.password,
        "email": emailName,
        "phoneNumber": ""
    };
    context.log("input userInfo:" + JSON.stringify(userInfo1));

    registerPlayerFunc(context, userInfo1, requestBody.username);
};
function registerPlayerFunc(context, userInfos, username)
{
    Backtory.Users.signUp(userInfos, {
        success: function (userInfo) {
            context.log(userInfo);
            var TPlayers = Backtory.Object.extend("TPlayers");
            var player = new TPlayers();
            player.set("name", "user_" + userInfo.userId.slice(21, 24));
            player.set("userId", userInfo.userId);
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
            context.log("line 40");
            generateUID(context, function (puid) {
                context.log("line 42");
                player.set("uid", puid);
                getMission(context, 1, function (mission) {
                    context.log("line 45");
                    player.set("currentMission", mission);
                    createExtraInfo(context, mission, function (extraInfo) {
                        context.log("line 48");
                        player.set("extraInfo", extraInfo);
                        savePlayer(context, player);

                    });

                });
            });
        },
        error: function (error) {
            if (error.responseCode == 409)
                context.succeed({});
            else
            {
                context.log("retry to register with error " + JSON.stringify(error) + " username:" + username);
                registerPlayerFunc(context, userInfos, username);
            }
            //fail(context,error);
        }
    });
}
function savePlayer(context, player)
{
    player.save({
        success: function (player2) {
            createScreenItems(context, player2, function () {
                context.succeed({});
            });

        },
        error: function (error) {
            context.log("retry to save Player data with error " + JSON.stringify(error));
            savePlayer(context, player);
            //  fail(context, error);
        }
    });
}
function createScreenItems(context, player, callback)
{
    context.log("line 87");
    var TScreenItems = Backtory.Object.extend("TScreenItems");
    var screen = new TScreenItems();
    context.log("line 90");
    screen.set("player", player);
    context.log("line 91");
    var items = [];
    var itemIds = ["5a5b5d97e7e9dc0001a27184", "5a5b5d99149ec00001b1633d", "5a5b6138e7e9dc0001a29ba7", "5a5b6138e7e9dc0001a29ba7", "5a5b60923d60fd0001a1c9d9", "5a5b60923d60fd0001a1c9d9", "5a5b5d98e7e9dc0001a27186"];
    var positions = [13, 14, 1, 10, 2, 9, 16];
    var date = new Date();
    context.log("line 97");
    for (var i = 0; i < itemIds.length; i++)
        items[items.length] = {itemId: itemIds[i], pose: positions[i], addTime: date};
    context.log("line 100");
    screen.set("items", items);
    context.log("line 102");
    screen.save({
        success: function (screen) {
            context.log("line 105");
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
    context.log("line 117");
    var TExtraInfo = Backtory.Object.extend("TExtraInfo");
    var extra_info = new TExtraInfo();
    extra_info.set("lastPackageId", 0);
    extra_info.set("lastPackageTime", "0");
    extra_info.set("usedHomesTF", 0);
    extra_info.set("telegramAndVote", 0);
    context.log("line 124");
    extra_info.save({
        success: function (extra_info) {
            context.log("line 127");
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
      //      if (max > 0)
    //            generateUID(context, callback);
        //    else
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
function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}
