var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();

	var userInfo1 = {
		"firstName":"",
		"lastName":"",
		"username":requestBody.username,
		"password":requestBody.password,
		"email":requestBody.username+"@quizbombi.ir",
		"phoneNumber": ""
	};

	Backtory.Users.signUp(userInfo1,{
		success: function(userInfo) {
			context.log(userInfo);
			var TPlayers = Backtory.Object.extend("TPlayers");
			var player = new TPlayers();
			player.set("name","user_"+userInfo.userId.slice(21, 24));
			player.set("userId",userInfo.userId);
			player.set("avatar",["1","1","1"]);
			player.set("coin",20000);
			player.set("level",1);
			player.set("heart",3);
                        player.set("ticket",5);
			player.set("qCount",5);
			player.set("matchCount",0);
			player.set("xp",0);
			player.set("heartLastTime","0");
			player.set("currentMissionStep",0);
			
			generateUID(context,function(puid){
				player.set("uid",puid);
				getMission(context,1,function(mission){
					player.set("currentMission",mission);
					createExtraInfo(context,mission,function(extraInfo){
						player.set("extraInfo",extraInfo);
						player.save({
							success: function(player) {
								context.succeed({});
							},
							error: function(error) {
								context.fail(error);
							}
						});	
					});

				});
			});
		},
		error: function(error) {
			context.fail(error);
		}
	});
};
function createExtraInfo(context,mission,callback)
{
	var TExtraInfo = Backtory.Object.extend("TExtraInfo");
	var extra_info = new TExtraInfo();
	extra_info.set("lastPackageId",0);
        extra_info.set("lastPackageTime","0");
        extra_info.set("usedHomesTF",0);
	extra_info.save({
		success: function(extra_info) {
			callback(extra_info);
		},
		error: function(error) {
			context.fail(error);
		}
	});		
}
function generateUID(context,callback)
{
	var uid = ("00000" + ((Math.random() * Math.pow(36, 5)) | 0).toString(36)).slice(-5);
	var TPlayers = Backtory.Object.extend("TPlayers");
	var _qQuery=new Backtory.Query(TPlayers);
	_qQuery.equalTo("uid",uid);
	_qQuery.count({
		success: function(max) {
			if(max>0)
				generateUID(context,callback);
			else
				callback(uid);
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function getMission(context,code,callback)
{
	var TMissions = Backtory.Object.extend("TMissions");
	var qQuery=new Backtory.Query(TMissions); 
	qQuery.equalTo("code",code);
	qQuery.find({
		success: function(missions) {
			if(missions.length>0)
			{
				callback(missions[0]);
			}
			else
				fail(context,"not found mission with code:"+code);
		},
		error: function(error) {
			fail(context,error);
		}
	});

}
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
