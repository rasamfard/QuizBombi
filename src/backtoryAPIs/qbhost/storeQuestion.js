var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var questiontext=requestBody.question;
	var ans1=requestBody.ans1;
	var ans2=requestBody.ans2;
	var ans3=requestBody.ans3;
	var ans4=requestBody.ans4;
        var level=Number(requestBody.level);
	var field=Number(requestBody.field);
	var correctAns=Number(requestBody.correctAns);
	var hasImage=requestBody.hasImage;
	var TQuestions = Backtory.Object.extend("TQuestions");
	var question = new TQuestions();
			question.set("question",questiontext);
			question.set("ans1",ans1);
			question.set("ans2",ans2);
			question.set("ans3",ans3);
			question.set("ans4",ans4);
			question.set("field",field);
                        question.set("level",level);
			question.set("image_path",'');
			question.set("correctAns",correctAns);
			question.save({
				success: function(question) {
					var result = {id:question.get("_id")};
					if(hasImage==true)
					{
						question.set("image_path",question.get("_id")+".jpg");
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
