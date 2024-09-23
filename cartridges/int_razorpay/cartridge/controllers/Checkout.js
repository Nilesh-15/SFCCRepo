'use strict';

var server = require('server');
server.extend(module.superModule);

var preferences = require('*/cartridge/config/preferences');

/**
 * @name Checkout-Begin
 * @function
 * @memberof Checkout
 */
server.append('Begin', function (req, res, next) {
    var viewData = res.getViewData();
    var isRazropayEnabled = preferences.razorEnable;
    var razorpayCheckouturl = preferences.razorpayCheckouturlPreference;
    if (isRazropayEnabled) {
        var result = {
            razorEnable: isRazropayEnabled,
            razorpayCheckouturl: razorpayCheckouturl
        }
        res.setViewData(result);
    }
    return next();
});

/**
 *  This route sets the redirectUrl for razor pay payment method and creates the order.
 */
/**
 * @name Checkout-SubmitSinglePage
 * @function
 * @memberof Checkout
 */
server.append('SubmitSinglePage', function (req, res, next) {
    var Site = require('dw/system/Site');
    var URLUtils = require('dw/web/URLUtils');
    var Transaction = require('dw/system/Transaction');
    var razorEnable = preferences.razorEnable;
    var viewData = res.getViewData();

    if (razorEnable && viewData.paymentMethodID === 'RAZOR_PAY') {
        var razorPayHelper = require('*/cartridge/scripts/helpers/razorPayHelper');
        var Order = require('dw/order/Order');
        var order = razorPayHelper.createRazorPayOrder(req, res);
        var result = viewData.result;
        if (order instanceof Order) {
            result.razorPayRes.orderId = order.getOrderNo();
            result.razorPayRes.orderToken = order.getOrderToken();
            result.razorPayRes.paymentMethod = viewData.paymentMethodID;
            Transaction.wrap(function () {
                order.custom.externalPaymentOrderId = result.razorPayRes.order_id;
                order.custom.externalPaymentMode = viewData.paymentMethodID;
            });
        }
    }
    return next();
});

module.exports = server.exports();
