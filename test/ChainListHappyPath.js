var ChainList = artifacts.require("./ChainList.sol")

contract('ChainList', function(accounts) {
    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName1 = "article 1";
    var articleDescription1 = "article description for article 1";
    var articlePrice1 = 10;

    var articleName2 = "article 2";
    var articleDescription2 = "article description for article 2";
    var articlePrice2 = 20;

    var sellerBalanceBeforeBuy, sellerBuyAfterBuy;
    var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

   it("should be initialized with empty values", function() {
       return ChainList.deployed().then(function(instance){
        chainListInstance = instance;    
        return chainListInstance.getNumberOfArticles();
       }).then(function(data){
           assert.equal(data.toNumber(), 0, "number of articles must be zero");
        return chainListInstance.getArticlesForSale();
       }).then(function(data){
        assert.equal(data.length, 0, "number of articles for sale must be zero");
       });
   });

   //sell a fisrt article
   it("should let us sell a first article", function(){
       return ChainList.deployed().then(function(instance){
           chainListInstance = instance;

           return chainListInstance.sellArticle(
               articleName1,
               articleDescription1,
               web3.toWei(articlePrice1, "ether"),
               {from: seller })
       }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "One event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
        assert.equal(receipt.logs[0].args._name, articleName1, "event articleName must be " + articleName1);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be " + web3.toWei(articlePrice1, "ether"));
        
        return chainListInstance.getNumberOfArticles();
    }).then(function(data){
        assert.equal(data, 1, "number of articles must be one");

        return chainListInstance.getArticlesForSale();
    }).then(function(data){
        assert.equal(data.length, 1, "there must be one article for sale");
        assert.equal(data[0].toNumber(), 1, "article id must be one");

        return chainListInstance.articles(data[0]);    
    }).then(function(data){
        assert.equal(data[0].toNumber(), 1, "Article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be empty");
        assert.equal(data[3], articleName1, "Article name must be " + articleName1);
        assert.equal(data[4], articleDescription1, "Article name must be " + articleDescription1);
        assert.equal(data[5], web3.toWei(articlePrice1, "ether"), "Price must be " + web3.toWei(articlePrice1, "ether"));
        
    })
   });

   //sell a second article
   it("should let us sell a second article", function(){
    return ChainList.deployed().then(function(instance){
        chainListInstance = instance;

        return chainListInstance.sellArticle(
            articleName2,
            articleDescription2,
            web3.toWei(articlePrice2, "ether"),
            {from: seller })
    }).then(function(receipt){
     assert.equal(receipt.logs.length, 1, "One event should have been triggered");
     assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
     assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 1");
     assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
     assert.equal(receipt.logs[0].args._name, articleName2, "event articleName must be " + articleName2);
     assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event price must be " + web3.toWei(articlePrice2, "ether"));
     
     return chainListInstance.getNumberOfArticles();
 }).then(function(data){
     assert.equal(data, 2, "number of articles must be one");

     return chainListInstance.getArticlesForSale();
 }).then(function(data){
     assert.equal(data.length, 2, "there must be two article for sale");
     assert.equal(data[1].toNumber(), 2, "article id must be two");

     return chainListInstance.articles(data[1]);    
 }).then(function(data){
     assert.equal(data[0].toNumber(), 2, "Article id must be two");
     assert.equal(data[1], seller, "seller must be " + seller);
     assert.equal(data[2], 0x0, "buyer must be empty");
     assert.equal(data[3], articleName2, "Article name must be " + articleName2);
     assert.equal(data[4], articleDescription2, "Article name must be " + articleDescription2);
     assert.equal(data[5], web3.toWei(articlePrice2, "ether"), "Price must be " + web3.toWei(articlePrice2, "ether"));
     
 })
});

   //buy the first article

   it("should buy an article", function () {
       return ChainList.deployed().then(function (instance) {
           chainListInstance = instance;
           //record balances of seller and buyer before the buy
           sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
           buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
           
           return chainListInstance.buyArticle(1, {
               from: buyer,
               value: web3.toWei(articlePrice1, "ether")
           });
       }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "One event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id ust be one");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, "event seller must be " + buyer);
        assert.equal(receipt.logs[0].args._name, articleName1, "event articleName must be " + articleName1);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be " + web3.toWei(articlePrice1, "ether"));
        
        //record balances of buyer and seller after the buy
        sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
        buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
        //check the effect of the buy on the balances
        assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "selle should have earned " + articlePrice1 + " ETH");
        // <= because buyer pay also gas
        assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "selle should have earned " + articlePrice1 + " ETH");

        return chainListInstance.getArticlesForSale();
    }).then(function(data){
        assert.equal(data.length, 1, "there should be only one article");
        assert.equal(data[0].toNumber(), 2, "only article 2 for sale");
        return chainListInstance.getNumberOfArticles();
    }).then(function(data){
        assert.equal(data.toNumber(),2,"there shoub still be 2 articles in total");
    });
   });
});