var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var currentVersion=requestBody.currentVersion;
	var TAppInfo = Backtory.Object.extend("TAppInfo");
	var mainQuery=new Backtory.Query(TAppInfo); 
	mainQuery.greaterThan("codeVersion", currentVersion);
	mainQuery.ascending("codeVersion");
	mainQuery.limit(100);
	var minPlayers=[2,2];
	var newHeartTime=60;
	var battleRewards_mini=[5,4,3,2,1,1];
	var battleRewards_mega=[10,8,8,7,4,1,1,1,1,1];
	var battleRewards_friend=[5,4,3,3,3];
	mainQuery.find({
		success: function(list) {
			
			var changes =[];
			for(var i=0;i<list.length;i++)
			{
				changes.push.apply(changes, list[i].get("changes"));
			}
			if(list.length>0)
				{
					var last=list[list.length-1];
					
				succeed(context,{versionCode:last.get("codeVersion"),apkURL:last.get("apkURL"),changes:changes,minPlayers:minPlayers,newHeartTime:newHeartTime,battleRewards_mini:battleRewards_mini,battleRewards_mega:battleRewards_mega,battleRewards_friend:battleRewards_friend});
				}
			else
				succeed(context,{versionCode:currentVersion,apkURL:"http://quizbombi.ir/resources/assets/app/quizbombi.apk",changes:changes,minPlayers:minPlayers,newHeartTime:newHeartTime,battleRewards_mini:battleRewards_mini,battleRewards_mega:battleRewards_mega,battleRewards_friend:battleRewards_friend});
// 				fail(context,"this is the last version");
		},
		error: function(error) {
			var changes2=[];
			succeed(context,{versionCode:currentVersion,apkURL:"http://quizbombi.ir/resources/assets/app/quizbombi.apk",changes:changes2,minPlayers:minPlayers,newHeartTime:newHeartTime,battleRewards_mini:battleRewards_mini,battleRewards_mega:battleRewards_mega,battleRewards_friend:battleRewards_friend});
			//fail(context,error);
		}
	});
// 	context.succeed({codeVersion:1,apkURL:"http://konkoorwar.ir/resources/assets/app/konkoorwar.apk"});
};
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
// 	context.log("result:"+JSON.stringify(result));
	context.succeed(result);
}


