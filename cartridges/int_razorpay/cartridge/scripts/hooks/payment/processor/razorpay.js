'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var Resource = require('dw/web/Resource');
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
    var razorPayOrderCallResponse = RazorPayServiceHelper.razorPayCreateOrderRequest();
    var orderRes = JSON.parse(razorPayOrderCallResponse.object.text);//parse the responce
    responseJson = RazorPayPaymentHelper.prepareRazorPayConfig(orderRes.id);
    responseJson.phoneNo = currentBasket.getBillingAddress().getPhone();
    responseJson.paymentResponseURL = URLUtils.url('CheckoutServices-PlaceOrder').toString();
    responseJson.razorpayCheckoutJsUrl = preferences.razorpayCheckouturlPreference;
    return { error: false, razorPayRes: responseJson };
}

/**
 * Razorpay Authorization
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;

    try {
        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
            paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
        });
    } catch (e) {
        error = true;
        serverErrors.push(
            Resource.msg('error.technical', 'checkout', null)
        );
    }

    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}

exports.Handle = Handle;
exports.Authorize = Authorize;  