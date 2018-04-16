var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var currentVersion = requestBody.currentVersion;
    var botSpawnTime = 8;
    var QCURL="http://quizbombi.ir";
    //battle 1
    var BattlesInfo = [];
    BattlesInfo[0] = {battleType: 1, minPlayer: 1, maxPlayer: 6, backtoryTimes: [20, 20, 30, 40, 50, 60], battleStageTimes: [27, 59, 86, 118]};
    BattlesInfo[1] = {battleType: 2, minPlayer: 2, maxPlayer: 10, backtoryTimes: [30, 40, 50, 60], battleStageTimes: [27, 59, 86, 118, 150, 177, 209, 236, 263]};
    BattlesInfo[2] = {battleType: 3, minPlayer: 2, maxPlayer: 6, backtoryTimes: [60], battleStageTimes: [27, 59, 86, 118]};
    BattlesInfo[3] = {battleType: 4, minPlayer: 2, maxPlayer: 6, backtoryTimes: [60], battleStageTimes: [27, 59, 86, 118]};
    BattlesInfo[4] = {battleType: 5, minPlayer: 3, maxPlayer: 3, backtoryTimes: [20, 30, 40, 50, 60], battleStageTimes: [27, 59, 86, 118]};
    BattlesInfo[5] = {battleType: 6, minPlayer: 1, maxPlayer: 6, backtoryTimes: [20, 20, 30, 40, 50, 60], battleStageTimes: [32, 59, 86, 113, 140, 167, 194, 221, 248, 275, 302, 329, 356, 383, 410, 437, 464, 491, 518]};
    BattlesInfo[6] = {battleType: 7, minPlayer: 1, maxPlayer: 6, backtoryTimes: [20, 30, 40, 50, 60], battleStageTimes: [27, 59, 86, 118]};
    
    var maxHearts=4; 
    
    var telegramReward=500;
    var voteReward=500;
    
    var TAppInfo = Backtory.Object.extend("TAppInfo");
    var mainQuery = new Backtory.Query(TAppInfo);
    mainQuery.greaterThan("codeVersion", currentVersion);
    mainQuery.ascending("codeVersion");
    mainQuery.limit(100);
    var minPlayers = [2, 2];
    var newHeartTime = 60;
    var battleRewards_mini = [5, 4, 3, 2, 1, 1];
    var battleRewards_mega = [10, 8, 8, 7, 4, 1, 1, 1, 1, 1];
    var battleRewards_friend = [5, 4, 3, 3, 3];
    mainQuery.find({
        success: function (list) {

            var changes = [];
            for (var i = 0; i < list.length; i++)
            {
                changes.push.apply(changes, list[i].get("changes"));
            }
            if (list.length > 0)
            {
                var last = list[list.length - 1];

                succeed(context, {versionCode: last.get("codeVersion"), apkURL: last.get("apkURL"), changes: changes, minPlayers: minPlayers, newHeartTime: newHeartTime, battleRewards_mini: battleRewards_mini, battleRewards_mega: battleRewards_mega, battleRewards_friend: battleRewards_friend, BattlesInfo: BattlesInfo, botSpawnTime: botSpawnTime,maxHearts:maxHearts,telegramReward:telegramReward,voteReward:voteReward,QCURL:QCURL});
            } else
                succeed(context, {versionCode: currentVersion, apkURL: "https://cafebazaar.ir/app/ir.magma.quizbombi/?l=fa", changes: changes, minPlayers: minPlayers, newHeartTime: newHeartTime, battleRewards_mini: battleRewards_mini, battleRewards_mega: battleRewards_mega, battleRewards_friend: battleRewards_friend, BattlesInfo: BattlesInfo, botSpawnTime: botSpawnTime,maxHearts:maxHearts,telegramReward:telegramReward,voteReward:voteReward,QCURL:QCURL});
// 				fail(context,"this is the last version");
        },
        error: function (error) {
            var changes2 = [];
            succeed(context, {versionCode: currentVersion, apkURL: "https://cafebazaar.ir/app/ir.magma.quizbombi/?l=fa", changes: changes2, minPlayers: minPlayers, newHeartTime: newHeartTime, battleRewards_mini: battleRewards_mini, battleRewards_mega: battleRewards_mega, battleRewards_friend: battleRewards_friend, BattlesInfo: BattlesInfo, botSpawnTime: botSpawnTime,maxHearts:maxHearts,telegramReward:telegramReward,voteReward:voteReward,QCURL:QCURL});
            //fail(context,error);
        }
    });
// 	context.succeed({codeVersion:1,apkURL:"http://konkoorwar.ir/resources/assets/app/konkoorwar.apk"});
};
function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}
function succeed(context, result)
{
// 	context.log("result:"+JSON.stringify(result));
    context.succeed(result);
}


