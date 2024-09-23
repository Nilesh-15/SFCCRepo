'use strict'
var Transaction = require('dw/system/Transaction');
var collections = require('*/cartridge/scripts/util/collections');

/**
 * razorpay payment handle
 * @param {object} currentBasket - current Basket
 * @param {String} paymentMethodId - payment Method Id
 * @param {String} razorpay_order_id - razorpay order id
 * @param {String} razorpay_payment_id - razorpay payment id
 * @returns {void}
 */
function RazorPayPaymentHandle(currentBasket,paymentMethodId,processor,razorpay_order_id,razorpay_payment_id) {
    Transaction.wrap(function () {
        var paymentInstruments = currentBasket.getPaymentInstruments(
            paymentMethodId
            );
        collections.forEach(paymentInstruments, function (item) {
            currentBasket.removePaymentInstrument(item);
        });

        var paymentInstrument = currentBasket.createPaymentInstrument(
            paymentMethodId, currentBasket.totalGrossPrice
        );
        paymentInstrument.paymentTransaction.setPaymentProcessor(processor);
        paymentInstrument.paymentTransaction.setTransactionID(razorpay_payment_id);
    }); 
}

exports.RazorPayPaymentHandle = RazorPayPaymentHandle;