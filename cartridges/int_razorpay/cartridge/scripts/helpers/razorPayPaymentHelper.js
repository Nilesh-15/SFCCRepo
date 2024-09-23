'use strict';

var URLUtils = require('dw/web/URLUtils');
var Logger = require('dw/system/Logger').getLogger('RazorPayment', 'RazorPayment');
var RazorPayUtils = require('*/cartridge/scripts/util/razorPayUtil');
var preferences = require('*/cartridge/config/preferences');

/**
* Generate HMC_SHA_256 signature for validation RazorPay response
* @param {String} orderId - string
* @param {String} paymentId - string
* @param {String} secretKey - string
* @returns {String} signature
*/
function generateHMAC_SHA_256Signature(orderId, paymentId, secretKey) {
    var Bytes = require('dw/util/Bytes');
    var Encoding = require('dw/crypto/Encoding');
    var Mac = require('dw/crypto/Mac');
    var strValue = orderId + '|' + paymentId;
    var digestedBytes = new Mac(Mac.HMAC_SHA_256).digest(new Bytes(strValue), secretKey);
    return Encoding.toHex(digestedBytes);
}

/**
 * Prepared request data to launch razorpay client script and returns the response.
 * @param {String} orderId - string
 * @returns {Object} responseJson object.
 */
function prepareRazorPayConfig(orderId) {
    var Resource = require('dw/web/Resource');
    var BasketMgr = require('dw/order/BasketMgr');
    var basket = BasketMgr.getCurrentBasket();
    var responseJson = {};
    try {
        var CurrencyCode = RazorPayUtils.getAmount();
        var responseJson = {
            key: preferences.razorId,
            amount: CurrencyCode.value * (preferences.razorpayPriceConversionFactor),//razorpay price convertion factor// amount: CurrencyCode.value * 100,//test purpose
            currency: CurrencyCode.currencyCode,
            name: preferences.razorPayStoreName, // need to check object for store name.
            description: preferences.razorPayStoreName,
            order_id: orderId,
            //callback_url:URLUtils.url("RazorPay-PaymentResponse").toString(),
            customerEmail:basket.customerEmail,
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
    generateSignature: generateHMAC_SHA_256Signature
};