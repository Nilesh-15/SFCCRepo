'use strict';

/**
 * Deletes the first temporary basket if the no. of temporary baskets is more than 3
 */
function deleteTempBasket() {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var collections = require('*/cartridge/scripts/util/collections');

    var tempBaskets = BasketMgr.getTemporaryBaskets();
    if (tempBaskets.length > 3) {
        var tempBasket = collections.first(tempBaskets);
        Transaction.wrap(function () {
            BasketMgr.deleteTemporaryBasket(tempBasket);
        });
    }
}

/**
 * Creates a temporary basket if isBuyNowProduct is true otherwise creates/gets storefront basket.
 */
function createBasket(isBuyNowProduct) {
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');

    var currentBasket;
    if (isBuyNowProduct) {
        deleteTempBasket();

        var temporaryBasket = BasketMgr.createTemporaryBasket();
        if (temporaryBasket) {
            currentBasket = temporaryBasket;
            session.custom.tempBasket = temporaryBasket.UUID;
        }
    } else {
        currentBasket = BasketMgr.getCurrentOrNewBasket();
    }
    return currentBasket;
}

module.exports = {
    createBasket: createBasket
}