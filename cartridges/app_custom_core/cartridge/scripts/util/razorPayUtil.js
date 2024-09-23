'use strict';

var base = module.superModule;

/** 
* getting amount of order 
* @param {basket} basketObj - basket object 
* @returns {object} orderTotal object
*/
function getAmount(basketObj, req) {
    var BasketMgr = require('dw/order/BasketMgr');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    // AC-41: Buy Now feature
    var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
    var currentBasket = COHelpers.getBasket(isBuyNowProduct);

    var basket = basketObj || currentBasket;
    var orderTotal = basket.getTotalGrossPrice().available
        ? basket.getTotalGrossPrice()
        : basket.getAdjustedMerchandizeTotalGrossPrice();

    if (!orderTotal.available) {
        orderTotal = basket.getTotalNetPrice().available
            ? basket.getTotalNetPrice()
            : basket.getAdjustedMerchandizeTotalNetPrice();
    }

    return orderTotal;
}

module.exports = {
    getAmount: getAmount
};
