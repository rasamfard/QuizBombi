var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	findPlayers(context);
        
        
	
};
function findPlayers(context)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    
    
    var date=new Date();
    var myStartDate = new Date(date.getTime() -  (48 * 3600000) ).toISOString();
    myStartDate = myStartDate.split("Z")[0]+"UTC";
    mainQuery.greaterThan("updatedAt",myStartDate);
    mainQuery.count({
        success: function (max) {
            succeed(context,{count:max});
        },
        error: function (error) {
            context.fail(error);
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





