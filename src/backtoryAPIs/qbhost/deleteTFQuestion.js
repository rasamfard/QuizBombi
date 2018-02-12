var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext = context.getSecurityContext();
	var id=requestBody._id;
	var TFQuestions = Backtory.Object.extend("TFQuestions");
	var mainQuery=new Backtory.Query(TFQuestions);
	mainQuery.equalTo("_id",id);
	mainQuery.limit(1);
	mainQuery.find({
        success: function(list) {
			if(list.length>0)
				{
					var question=list[0];
				question.destroy({
					success: function() {
						context.succeed({message:"seccess"});
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
