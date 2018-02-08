var Backtory = require('backtory-sdk');

exports.handler = function (requestBody, context) {

    var securityContext = context.getSecurityContext();
    var player_id = securityContext.userId;
    var TPurchases = Backtory.Object.extend("TPurchases");
    var pquery = new Backtory.Query(TPurchases);
    pquery.include("item");
    pquery.equalTo("userId", player_id);
    pquery.find({
        success: function (purchase_list) {
            var TShopItems = Backtory.Object.extend("TShopItems");
            var query = new Backtory.Query(TShopItems);
            query.limit(1000);
            query.find({
                success: function (list) {


                    function find_InfiniteEnergy(item) {
                        return item.get("sectionCode") == 3;
                    }
                    var infiniteEnergy = list.filter(find_InfiniteEnergy);

                    function find_Hearts(item) {
                        return item.get("sectionCode") == 2;
                    }

                    var hearts = list.filter(find_Hearts);

                    function find_CoinPacks(item) {
                        return item.get("sectionCode") == 1;
                    }
                    var coinPacks = list.filter(find_CoinPacks);

                    function find_Bodies(item) {
                        return item.get("sectionCode") == 4;
                    }
                    var bodies = list.filter(find_Bodies);

                    function find_Heads(item) {
                        return item.get("sectionCode") == 5;
                    }
                    var heads = list.filter(find_Heads);

                    function find_HeadBs(item) {
                        return item.get("sectionCode") == 6;
                    }
                    var headBs = list.filter(find_HeadBs);

                    function find_Tickets(item) {
                        return item.get("sectionCode") == 7;
                    }
                    var tickets = list.filter(find_Tickets);

                    function find_HearTicks(item) {
                        return item.get("sectionCode") == 8;
                    }
                    var hearticks = list.filter(find_HearTicks);

                    function find_GiftBoxes(item) {
                        return item.get("sectionCode") == 9;
                    }
                    var giftboxes = list.filter(find_GiftBoxes);

                    function find_Decorates(item) {
                        return item.get("sectionCode") == 10;
                    }
                    var decorates = list.filter(find_Decorates);

                    function find_Trees(item) {
                        return item.get("sectionCode") == 11;
                    }
                    var trees = list.filter(find_Trees);

                    function find_Flowers(item) {
                        return item.get("sectionCode") == 12;
                    }
                    var flowers = list.filter(find_Flowers);

                    function find_SpecialPackages(item) {
                        return item.get("sectionCode") == 14;
                    }
                    var specialPackages = list.filter(find_SpecialPackages);

                    getSpecialPackagesDetail(context, specialPackages, 0, function (specialPackages) {


                        context.succeed({
                            infiniteEnergy: infiniteEnergy,
                            hearts: hearts,
                            purchases: purchase_list,
                            bodies: bodies,
                            heads: heads,
                            headBs: headBs,
                            tickets: tickets,
                            hearticks: hearticks,
                            giftboxes: giftboxes,
                            decorates: decorates,
                            trees: trees,
                            flowers: flowers,
                            coinPacks: coinPacks,
                            specialPackages: specialPackages
                        });
                    });
                },
                error: function (error) {
                    context.fail(error);
                }
            });
        },
        error: function (error) {
            context.fail(error);
        }
    });

};
function getSpecialPackagesDetail(context, SPackages, i, callback)
{
    var TSpecialPackages = Backtory.Object.extend("TSpecialPackages");
    var mquery = new Backtory.Query(TSpecialPackages);
    mquery.include("item");
    mquery.equalTo("packageId", SPackages[i].get("specialPackageId"));
    mquery.find({
        success: function (list) {
            var items = list.length > 0 ? list : [];
            SPackages[i].set("items", items);
            if (i < SPackages.length - 1)
                getSpecialPackagesDetail(context, SPackages, i + 1,callback);
            else
                callback(SPackages)
        },
        error: function (error) {
            context.fail(error);
        }
    });
}
