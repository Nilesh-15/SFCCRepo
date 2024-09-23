'use strict';
var server = require('server');
server.extend(module.superModule);
var Order = require('dw/order/Order');

/* If payment method is Razor_Pay,
1. Signature validation
2. Authorization call
3. Placing Order */
server.prepend('PlaceOrder', server.middleware.https, function (req, res, next) {
    var preferences = require('*/cartridge/config/preferences');
    var OrderMgr = require('dw/order/OrderMgr');
    var Transaction = require('dw/system/Transaction');
    var RazorPayPaymentHelper = require('*/cartridge/scripts/helpers/razorPayPaymentHelper');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var razorPayHelper = require('*/cartridge/scripts/helpers/razorPayHelper');
    var Resource = require('dw/web/Resource');

    var razorPayRes = req.form;
    var razorpaySignature = razorPayRes.razorpay_signature;
    var razorpayOrderId = razorPayRes.razorpay_order_id;
    var razorpayPaymentId = razorPayRes.razorpay_payment_id;
    var paymentMethodId = razorPayRes.paymentMethod;
    var amount = razorPayRes.amount;
    var currencyCode = razorPayRes.currency;

    if (paymentMethodId !== 'RAZOR_PAY') {
        return next();
    }

    var order = razorPayRes.orderId && razorPayRes.orderToken && OrderMgr.getOrder(razorPayRes.orderId, razorPayRes.orderToken);
    if (!(order && order instanceof Order)) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.invalid.token.or.orderid', 'razor', null)
        });
        return next(new Error('Invalid Request'));
    }
    var calculatedSignature = RazorPayPaymentHelper.generateSignature(razorpayOrderId, razorpayPaymentId, preferences.razorKey);
    if (calculatedSignature !== razorpaySignature) {
        var failRes = Resource.msg('error.message.signature.missmatch', 'razor', null);
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        razorPayHelper.saveRazorpayFailureResponse(order, { razorpayFailOrderResponse: failRes });
        next(new Error('Payment Failed'));
    }
    var handlePaymentResult = COHelpers.handlePayments(order, razorpayPaymentId);
    razorPayHelper.placeRazorPayOrder(req, res, handlePaymentResult, order);
    var viewData = res.getViewData();
    if (!viewData.error) {
        Transaction.wrap(function () {
            order.custom.externalPaymentOrderId = razorpayOrderId;
            order.custom.externalPaymentId = razorpayPaymentId;
            order.custom.externalPaymentSignature = razorpaySignature;
            order.custom.externalPaymentStatus = preferences.razorAuthStatus;
            order.custom.externalPaymentAmount = amount;
            order.custom.externalPaymentCurrencyCode = currencyCode;
            order.setPaymentStatus(order.PAYMENT_STATUS_PAID);
        });
    }
    this.emit('route:Complete', req, res);
});

server.post('FailOrder', server.middleware.https, function (req, res, next) {
    var OrderMgr = require('dw/order/OrderMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var razorPayRes = req.form;
    var razorPayHelper = require('*/cartridge/scripts/helpers/razorPayHelper');
    //here we are checking orderId and token is present in req and validating the order
    var order = razorPayRes.orderId && razorPayRes.orderToken && OrderMgr.getOrder(razorPayRes.orderId, razorPayRes.orderToken);
    if (!(order && order instanceof Order)) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.invalid.token.or.orderid', 'razor', null)
        });
        return next();
    }
    // Handles payment authorization
    COHelpers.handlePayments(order, razorPayRes.orderId);
    Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
    // saves Razorpay response attributes.
    razorPayHelper.saveRazorpayFailureResponse(order, razorPayRes);
    res.json({
        error: true,
        errorMessage: Resource.msg('subheading.error.general', 'error', null)
    });
    return next();
});
module.exports = server.exports();