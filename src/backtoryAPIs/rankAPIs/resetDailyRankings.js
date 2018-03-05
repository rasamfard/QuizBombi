var Backtory = require('backtory-sdk');
var unirest = require('unirest');

exports.handler = function (requestBody, context) {

    clearLeaderBoard(context, "5a4e1da2e4b050a851c7a665", function () {
        clearLeaderBoard(context, "5a4e20a5e4b0463d1a70c7d2", function () {
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

