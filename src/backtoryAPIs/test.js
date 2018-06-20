var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {
//    var securityContext = context.getSecurityContext();
//    var userId = "5a5b4e873d60fd0001a1bed3";
//    var TPlayersTest = Backtory.Object.extend("TPlayersTest");
//    var qquery = new Backtory.Query(TPlayersTest);
//    qquery.equalTo("_id", userId);
//    qquery.find({
//        success: function (players) {
//            var player = players[0];
//            var LoadTest = Backtory.Object.extend("LoadTest");
//            var query = new Backtory.Query(LoadTest);
//            context.log("player:"+player);
//            query.equalTo("player", player);
//            query.find({
//                success: function (items) {
//                    context.succeed(items);
//                    // comments now contains the comments for posts with images.
//                },
//                error: function (error) {
//                    context.fail(error);
//                    // There was an error.
//                }
//            });
//            // comments now contains the comments for posts with images.
//        },
//        error: function (error) {
//            context.fail(error);
//            // There was an error.
//        }
//    });
var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers);
	qQuery.limit(1);
	qQuery.find({
		success: function(players) {
			context.succeed(players[0]);
		},
		error: function(error) {
			context.fail(error);
		}
	});
};

