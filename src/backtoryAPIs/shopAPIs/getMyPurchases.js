var Backtory = require('backtory-sdk');

exports.handler = function(requestBody, context) {
	var securityContext=context.getSecurityContext();
	var player_id=securityContext.userId;
	var TPurchases = Backtory.Object.extend("TPurchases");
    var query = new Backtory.Query(TPurchases);
	query.equalTo("userId",player_id);
	query.include("item");
    query.find({
        success: function(purchase_list) {
			context.succeed({purchases:purchase_list});
		},
        error: function(error) {
            context.fail(error);
        }
    });
};
