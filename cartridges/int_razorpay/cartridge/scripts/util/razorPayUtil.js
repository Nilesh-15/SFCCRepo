/** 
* getting amount of order 
* @param {basket} basketObj - basket object 
* @returns {object} orderTotal object
*/
function getAmount(basketObj) {
    var BasketMgr = require('dw/order/BasketMgr');
    var basket = basketObj || BasketMgr.getCurrentBasket();
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
