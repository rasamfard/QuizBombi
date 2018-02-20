var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
    var securityContext = context.getSecurityContext();
    var id = requestBody._id;
    var questiontext = requestBody.question;
    var ans1 = requestBody.ans1;
    var ans2 = requestBody.ans2;
    var ans3 = requestBody.ans3;
    var ans4 = requestBody.ans4;
    var level = Number(requestBody.level);
    var field = Number(requestBody.field);
    var correctAns = Number(requestBody.correctAns);
    var image_path = requestBody.image_path;
    var TQuestions = Backtory.Object.extend("TQuestions");
    var mainQuery = new Backtory.Query(TQuestions);
    mainQuery.equalTo("_id", id);
    mainQuery.limit(1);
    mainQuery.find({
        success: function (list) {
            if (list.length > 0)
            {
                var question = list[0];
                question.set("question", questiontext);
                question.set("ans1", ans1);
                question.set("ans2", ans2);
                question.set("ans3", ans3);
                question.set("ans4", ans4);
                question.set("field", field);
                question.set("level", level);

                question.set("image_path", image_path);
                question.set("correctAns", correctAns);
                question.save({
                    success: function (question) {

                        context.succeed(question);

                    },
                    error: function (error) {
                        context.fail(error);
                    }
                });
            } else
            {
                context.log("failed");
                context.fail({message: "cannot find any record"});
            }
        },
        error: function (error) {
            context.log(error);
            context.fail(error);
        }
    });




};
