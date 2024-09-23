'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');

/**
 * Creating Razorpay Payment Instrument
 * @param {dw.order.Basket} basket Current users's basket
 * @param {Object} paymentInformation - the payment information
 * @param {string} paymentMethodID - paymentmethodID
 * @param {Object} req the request object
 * @return {Object} returns an error object
 */
function Handle(basket, paymentInformation, paymentMethodID, req) {
    var currentBasket = basket;
    Transaction.wrap(function () {
        var paymentInstruments = currentBasket.getPaymentInstruments();

        collections.forEach(paymentInstruments, function (item) {
            currentBasket.removePaymentInstrument(item);
        });

        currentBasket.createPaymentInstrument(
            'RAZOR_PAY', currentBasket.totalGrossPrice
        );

    });
    var preferences = require('*/cartridge/config/preferences');
    var responseJson = { success: false };
    var RazorPayPaymentHelper = require('*/cartridge/scripts/helpers/razorPayPaymentHelper');
    var RazorPayServiceHelper = require('*/cartridge/scripts/helpers/razorPayServiceHelper');
    var razorPayOrderCallResponse = RazorPayServiceHelper.razorPayCreateOrderRequest(req);
    var orderRes = JSON.parse(razorPayOrderCallResponse.object.text);//parse the responce
    responseJson = RazorPayPaymentHelper.prepareRazorPayConfig(orderRes.id, req);
    responseJson.phoneNo = currentBasket.getBillingAddress().getPhone();
    responseJson.paymentResponseURL = URLUtils.url('CheckoutServices-PlaceOrder').toString();
    responseJson.razorpayCheckoutJsUrl = preferences.razorpayCheckouturlPreference;
    return { error: false, razorPayRes: responseJson };
}

exports.Handle = Handle;
exports.Authorize = base.Authorize;
