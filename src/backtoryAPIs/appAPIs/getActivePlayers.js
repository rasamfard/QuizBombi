var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
    var hours=requestBody.hours;
	findPlayers(context,hours);
        
        
	
};
function findPlayers(context,hours)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var mainQuery = new Backtory.Query(TPlayers);
    
    
    var date=new Date();
    var myStartDate = new Date(date.getTime() -  (hours * 3600000) ).toISOString();
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





