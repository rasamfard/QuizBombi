var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	context.log(JSON.stringify(requestBody));
	updatePlayers(context,requestBody.usersId,0);
};

function updatePlayers(context,players,_index)
{
	var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers);
	qQuery.equalTo("userId",players[_index]);
	qQuery.find({
		success: function(list) {
			var pr=list[0];
			var heart=pr.get("heart");
			heart=heart-1;
			if(heart<0)
				heart=0;
			pr.set("heart",heart);
			pr.set("matchCount",pr.get("matchCount")+1);
			if(pr.get("heart")>=4||pr.get("heartLastTime")==null)
			{
				var date = new Date();
				pr.set("heartLastTime",date);
			}
			pr.save({
				success: function(p2) {
					if(_index==players.length-1)
						succeed(context,{});
					else
						updatePlayers(context,players,_index+1);
				},
				error: function(error) {
					fail(context,error);
				}
			});	
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
function succeed(context,result)
{
		context.succeed(result);
}