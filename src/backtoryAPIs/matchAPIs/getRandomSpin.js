var Backtory = require('backtory-sdk');
var requestBodyStr = "";
var requestPlayer = "";
exports.handler = function (requestBody, context) {
    requestBodyStr = JSON.stringify(requestBody);
    var securityContext = context.getSecurityContext();
    requestPlayer = securityContext.userId;
    var userId = securityContext.userId;
    var heart = 0;
    var video_heart = 0;
    var ticket = 0;
    var video_ticket = 0;
    var coin = 0;
    var video_coin = 0;
    var items = [];
    var type_names = ['heart', 'ticket', '', 'coin', 'head'];


    //  var coins_count=Math.floor(Math.random() * 8) + 1;
    //50 150 250 coins 3 ya 2    1
    //1 2 heart 1 ya 2 ya  3
    //1 ticket 1 ya 2     4
    //1 head    5
    //puch 2 ya 3     2

    var random_items = [3, 2, 0];
    var random_coin_counts = [50, 75, 100];
    var random_heart_counts = [1, 2, 1];
    var random_ticket_counts = [1, 2, 1];

    var types = [0, 1, 4, 2, 2, 3, 3, random_items[Math.floor(Math.random() * random_items.length)]];
    types=shuffleArray(types);
    var counts = [1, 1, 0, 1, 1, 1, 1, 1];
    for (var i = 0; i < types.length; i++)
    {
        if (types[i] == 0)
            counts[i] = random_heart_counts[Math.floor(Math.random() * random_heart_counts.length)];
        else if (types[i] == 1)
            counts[i] = random_ticket_counts[Math.floor(Math.random() * random_ticket_counts.length)];
        else if (types[i] == 3)
            counts[i] = random_coin_counts[Math.floor(Math.random() * random_coin_counts.length)];
        else if (types[i] == 2)
            counts[i] = 1;
        else if (types[i] == 4)
            counts[i] = 1;
    }


    findPlayer(context, userId, function (player) {
        getRewardRecord(context, userId, function (rec) {
            getWinnerNumber(types, function (number) {
                var type = types[number - 1];
                var count = counts[number - 1];
                findHeadItem(context, type, userId, function (ritems) {
                    if (ritems.length > 0 && type == 0)
                        items[0] = ritems[count];
                    if (type == 0)
                    {
                        heart = count;
                        video_heart = count * 2;
                    }
                    if (type == 1)
                    {
                        ticket = count;
                        video_ticket = count * 2;
                    }
                    if (type == 3)
                    {
                        coin = count;
                        video_coin = count * 2;
                    }
                    rec.set("userId", userId);
                    rec.set("heart", heart);
                    rec.set("video_heart", video_heart);
                    rec.set("coin", coin);
                    rec.set("video_coin", video_coin);
                    rec.set("ticket", ticket);
                    rec.set("video_ticket", video_ticket);
                    rec.set("items", items);
                    rec.save({
                        success: function (rec) {
                            succeed(context, {number: number, types: types, counts: counts});
                        },
                        error: function (error) {
                            fail(context, error);
                        }
                    });
                });

            });
        });

    });


};
function shuffleArray(a) {
        var i = a.length, t, j;
        a = a.slice();
        while (--i)
            t = a[i], a[i] = a[j = ~~(Math.random() * (i + 1))], a[j] = t;
        return a;
    }
function findHeadItem(context, type, userId, callback)
{
    getPurchasedItems(context, userId, function (purchase_list) {
        var blackList = [];
        for (var i = 0; i < purchase_list.length; i++)
            blackList[i] = purchase_list[i].get("item").get("_id");
        getNotPurchasedItems(context, blackList, function (items) {
            items = items.sort(function (a, b) {
                if (a < a) {
                    return -1;
                }
                if (a > a) {
                    return 1;
                }
                return 0;
            });
            callback(items);
        });
    });
// 	checkIfNotPurchased(context,player_id,item,function(){
}
function getNotPurchasedItems(context, blackList, callback)
{
    var TShopItems = Backtory.Object.extend("TShopItems");
    var query = new Backtory.Query(TShopItems);
    query.limit(300);
    query.notContainedIn("_id", blackList);
    query.containedIn("sectionCode", [5]);
//	query.notEqualTo("price")
    query.find({
        success: function (list) {
            if (list.length > 0)
                callback(list);
            else
                callback([]);
        },
        error: function (error) {
            fail(context, error);
        }
    });
}
function getPurchasedItems(context, userId, callback)
{
    var TPurchases = Backtory.Object.extend("TPurchases");
    var query = new Backtory.Query(TPurchases);
    query.equalTo("userId", userId);
    query.include("item");
    query.find({
        success: function (purchase_list) {
            callback(purchase_list);
        },
        error: function (error) {
            fail(context, error);
        }
    });
}

function getRewardRecord(context, userId, callback)
{
    var TPlayerRewards = Backtory.Object.extend("TPlayerRewards");
    var qQuery = new Backtory.Query(TPlayerRewards);
    qQuery.equalTo("userId", userId);
    qQuery.find({
        success: function (recs) {
            var rec = new TPlayerRewards();
            if (recs.length > 0)
                callback(recs[0]);
            else
                callback(rec);

        },
        error: function (error) {
            fail(context, error);
        }
    });
}
function findPlayer(context, userId, callback)
{
    var TPlayers = Backtory.Object.extend("TPlayers");
    var qQuery = new Backtory.Query(TPlayers);
    qQuery.equalTo("userId", userId);
    qQuery.find({
        success: function (players) {
            if (players.length > 0)
                callback(players[0]);
            else
                fail(context, "not found player with id:" + userId);
        },
        error: function (error) {
            fail(context, error);
        }
    });

}
function getWinnerNumber(types, callback)
{
    var number = Math.floor(Math.random() * 8) + 1;
    if (types[number - 1] == 4)
        getWinnerNumber(types,callback);
    else
        callback(number);
}
function fail(context, error)
{
    context.log("userId:" + requestPlayer);
    context.log("request:" + requestBodyStr);
    context.log("error:" + JSON.stringify(error));

    var TErrorReports = Backtory.Object.extend("TErrorReports");
    var rec = new TErrorReports();
    rec.set("error", JSON.stringify(error));
    rec.set("requestBody", requestBodyStr);
    rec.set("userId", requestPlayer);
    rec.save({
        success: function (rec) {
            context.fail(error);

        },
        error: function (error) {
            context.fail(error);

        }
    });
}
function succeed(context, result)
{
    context.log("result:" + JSON.stringify(result));

    context.succeed(result);
}