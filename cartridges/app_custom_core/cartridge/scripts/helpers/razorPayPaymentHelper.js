'use strict';

var base = module.superModule;

var URLUtils = require('dw/web/URLUtils');
var Logger = require('dw/system/Logger').getLogger('RazorPayment', 'RazorPayment');
var RazorPayUtils = require('*/cartridge/scripts/util/razorPayUtil');
var preferences = require('*/cartridge/config/preferences');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

/**
 * Prepared request data to launch razorpay client script and returns the response.
 * @param {String} orderId - string
 * @returns {Object} responseJson object.
 */
function prepareRazorPayConfig(orderId, req) {
    var Resource = require('dw/web/Resource');
    var BasketMgr = require('dw/order/BasketMgr');

    // AC-41: Buy Now feature
    var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
    var currentBasket = COHelpers.getBasket(isBuyNowProduct);

    var responseJson = {};
    try {
        var CurrencyCode = RazorPayUtils.getAmount(null, req);
        var responseJson = {
            key: preferences.razorId,
            amount: CurrencyCode.value * (preferences.razorpayPriceConversionFactor),//razorpay price convertion factor// amount: CurrencyCode.value * 100,//test purpose
            currency: 'INR',
            name: preferences.razorPayStoreName, // need to check object for store name.
            description: preferences.razorPayStoreName,
            order_id: orderId,
            //callback_url:URLUtils.url("RazorPay-PaymentResponse").toString(),
            customerEmail: currentBasket.customerEmail,
            closePopUpMessage: Resource.msg('error.message.payment.not.complete', 'razor', null),
            failUrl: URLUtils.url('CheckoutServices-FailOrder').toString()
        };
        responseJson.success = true;
    } catch (error) {
        Logger.error('Error in prepareRazorPayConfig: {0}', JSON.stringify(error));
        responseJson.success = false;
    }

    return responseJson;
}

module.exports = {
    prepareRazorPayConfig: prepareRazorPayConfig,
    generateSignature: base.generateSignature
};