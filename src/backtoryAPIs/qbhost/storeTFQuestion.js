var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var questiontext=requestBody.question;
	var ans=requestBody.ans;
	var type=Number(requestBody.type);
	var language=Number(requestBody.language);
	var image_path=requestBody.image_path;
	var TFQuestions = Backtory.Object.extend("TFQuestions");
	var question = new TFQuestions();
			question.set("question",questiontext);
			question.set("ans",ans);
			question.set("type",type);
			question.set("language",language);
			question.set("image_path",image_path);
			question.save({
				success: function(question) {
					var result = {id:question.get("_id")};
					if(question.get("image_path").length>0)
					{
						question.set("image_path",question.get("image_path")+question.get("_id")+".jpg");
						question.save({
							success: function(question) {
								
								context.succeed(result);	
							},
							error: function(error) {
								context.fail(error);
							}
						});		

					}
					else
					context.succeed(result);	
				},
				error: function(error) {
					context.fail(error);
				}
			});			
};
