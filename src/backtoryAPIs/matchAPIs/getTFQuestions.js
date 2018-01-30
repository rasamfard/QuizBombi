var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	getQuestions(context,requestBody.count,function(questions){
		succeed(context,{questions:questions});
	});
};
function getQuestion(context,ids,i,qs,count,callback)
{
	var TFQuestions = Backtory.Object.extend("TFQuestions");
	var qQuery=new Backtory.Query(TFQuestions);
	qQuery.skip(ids[i]);
	context.log(ids);
	qQuery.limit(1);
	qQuery.select("_id", "question","ans","image_path","type","language");
	qQuery.find({
		success: function(Qs) {
			qs[i]=Qs[0];
			i++;
			if(i<count)
				getQuestion(context,ids,i,qs,count,callback);
			else
				callback(qs);	
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function getQuestions(context,count,callback)
{
	var TFQuestions = Backtory.Object.extend("TFQuestions");
	var qQuery=new Backtory.Query(TFQuestions); 
	qQuery.count({
		success: function(max) {
			count=Math.min(count,max);
			var Ids=randomNumberGenerator(max,count);
			getQuestion(context,Ids,0,[],count,function(questions){
				callback(questions);
			});
			
		},
		error: function(error) {
			fail(context,error);
		}
	});
	
}
function randomNumberGenerator(max,count)
{
	var result = [];
	var i=0;
	while(result.length < count){
		var randomnumber = Math.floor(Math.random()*max);
		if(result.indexOf(randomnumber) > -1) continue;
		result[i] = randomnumber;
		i++;
	}
	return result;
}
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
 	context.log("result:"+JSON.stringify(result));
	
		context.succeed(result);
}
