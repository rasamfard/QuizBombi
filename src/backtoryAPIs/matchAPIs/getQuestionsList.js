var Backtory = require('backtory-sdk');
var imagesURL = 'http://storage.backtory.com/quizbombi_images/';
exports.handler = function (requestBody, context) {
    var Ids = requestBody.Ids;
    var level = requestBody.level;
    getQuestions(context, Ids, level, 0, [], function (questions) {
        succeed(context, {questions: questions});
    });
};

function getQuestions(context, Ids, level, i, questions, callback)
{
    var TQuestions = Backtory.Object.extend("TQuestions");
    var qQuery = new Backtory.Query(TQuestions);
    qQuery.lessThanOrEqualTo("level", level);
    qQuery.skip(Ids[i]);
    qQuery.limit(1);
    qQuery.select("_id", "question", "ans1", "ans2", "ans3", "ans4", "correctAns", "field", "image_path");
    qQuery.find({
        success: function (Qs) {
            if (Qs.length > 0)
            {
                questions[i] = Qs[0];
                var image_path = questions[i].get("image_path");
                if (image_path && image_path.length > 0)
                    questions[i].set("image_path", imagesURL + image_path);
                var arr = [1, 2, 3, 4];
                arr = shuffleArray(arr);
                var anses = ["", "", "", ""];
                for (var k = 0; k < 4; k++)
                {
                    var ans = "ans" + (k + 1);
                    anses[k] = questions[i].get(ans);
                }
                for (var k = 0; k < 4; k++)
                {
                    var ans = "ans" + (k + 1);
                    questions[i].set(ans, anses[arr[k] - 1]);
                    if (arr[k] == 1)
                        questions[i].set("correctAns", k + 1);
                }
                questions[i].set("type", 5);
                if (questions.length < i - 1)
                    getQuestions(context, Ids, level, i + 1, questions, callback);
                else
                    callback(questions);
            } else
                callback(questions);
        },
        error: function (error) {
            fail(context, error);
        }
    });

}
function shuffleArray(a) {
    var i = a.length, t, j;
    a = a.slice();
    while (--i)
        t = a[i], a[i] = a[j = ~~(Math.random() * (i + 1))], a[j] = t;
    return a;
}
function fail(context, error)
{
    context.log("error:" + JSON.stringify(error));
    context.fail(error);
}
function succeed(context, result)
{
    context.succeed(result);
}
