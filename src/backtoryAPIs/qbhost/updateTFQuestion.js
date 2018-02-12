var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var id=requestBody._id;
	var questiontext=requestBody.question;
	var ans=requestBody.ans;
	var type=Number(requestBody.type);
	var language=Number(requestBody.language);
	var image_path=requestBody.image_path;
	var TFQuestions = Backtory.Object.extend("TFQuestions");
	var mainQuery=new Backtory.Query(TFQuestions);
	mainQuery.equalTo("_id",id);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			if(list.length>0)
				{
			var question=list[0];
			question.set("question",questiontext);
			question.set("ans",ans);
					
			question.set("type",type);
					question.set("language",language);
			question.set("image_path",image_path);
			question.save({
				success: function(question) {
					
					context.succeed(question);
					
				},
				error: function(error) {
					context.fail(error);
				}
			});			
				}
			else
				{
					context.log("failed");
					context.fail({message:"cannot find any record"});
				}
        },
        error: function(error) {
			context.log(error);
            context.fail(error);
        }
    });
	
	


};
