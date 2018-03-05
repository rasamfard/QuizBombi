var Backtory = require('backtory-sdk');
var unirest = require('unirest');

exports.handler = function (requestBody, context) {

    clearLeaderBoard(context, "5a4e1f53e4b050a851c7a666", function () {
        clearLeaderBoard(context, "5a4e20d1e4b050a851c7a667", function () {
            context.succeed({response: "succeed"});
        });
    });


}
function clearLeaderBoard(context, id, callback)
{
    var leaderBoard = new Backtory.LeaderBoard(id);
    leaderBoard.remove({
        success: function () {
            callback()

            // The request succeeded.
        },
        error: function (error) {
            context.fail(error);
            // The request failed.
        }
    });
}

