'use strict';

var server = require('server');
server.extend(module.superModule);

/**
 * @namespace CheckoutServices
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * CheckoutServices-PlaceOrder : The CheckoutServices-PlaceOrder endpoint places the order
 * @name Base/CheckoutServices-PlaceOrder
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('PlaceOrder', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var OrderMgr = require('dw/order/OrderMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    // AC-41: Buy Now feature
    var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
    var currentBasket = COHelpers.getBasket(isBuyNowProduct);

    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var validatedProducts = validationHelpers.validateProducts(currentBasket);
    if (validatedProducts.error) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    if (req.session.privacyCache.get('fraudDetectionStatus')) {
        res.json({
            error: true,
            cartError: true,
            redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });

        return next();
    }

    var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
    if (validationOrderStatus.error) {
        res.json({
            error: true,
            errorMessage: validationOrderStatus.message
        });
        return next();
    }

    // Check to make sure there is a shipping address
    if (currentBasket.defaultShipment.shippingAddress === null) {
        res.json({
            error: true,
            errorStage: {
                stage: 'shipping',
                step: 'address'
            },
            errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
        });
        return next();
    }

    // Check to make sure billing address exists
    if (!currentBasket.billingAddress) {
        res.json({
            error: true,
            errorStage: {
                stage: 'payment',
                step: 'billingAddress'
            },
            errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
        });
        return next();
    }

    // Calculate the basket
    Transaction.wrap(function () {
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    // Re-validates existing payment instruments
    var validPayment = COHelpers.validatePayment(req, currentBasket);
    if (validPayment.error) {
        res.json({
            error: true,
            errorStage: {
                stage: 'payment',
                step: 'paymentInstrument'
            },
            errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
        });
        return next();
    }

    // Re-calculate the payments.
    var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
    if (calculatedPaymentTransactionTotal.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    // Creates a new order.
    var order = COHelpers.createOrder(currentBasket);
    if (!order) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    // Handles payment authorization
    var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo);

    // Handle custom processing post authorization
    var options = {
        req: req,
        res: res
    };
    var postAuthCustomizations = hooksHelper('app.post.auth', 'postAuthorization', handlePaymentResult, order, options, require('*/cartridge/scripts/hooks/postAuthorizationHandling').postAuthorization);
    if (postAuthCustomizations && Object.prototype.hasOwnProperty.call(postAuthCustomizations, 'error')) {
        res.json(postAuthCustomizations);
        return next();
    }

    if (handlePaymentResult.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
    if (fraudDetectionStatus.status === 'fail') {
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });

        // fraud detection failed
        req.session.privacyCache.set('fraudDetectionStatus', true);

        res.json({
            error: true,
            cartError: true,
            redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });

        return next();
    }

    // Places the order
    var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
    if (placeOrderResult.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    if (req.currentCustomer.addressBook) {
        // save all used shipping addresses to address book of the logged in customer
        var allAddresses = addressHelpers.gatherShippingAddresses(order);
        allAddresses.forEach(function (address) {
            if (!addressHelpers.checkIfAddressStored(address, req.currentCustomer.addressBook.addresses)) {
                addressHelpers.saveAddress(address, req.currentCustomer, addressHelpers.generateAddressName(address));
            }
        });
    }

    if (order.getCustomerEmail()) {
        COHelpers.sendConfirmationEmail(order, req.locale.id);
    }

    // Reset usingMultiShip after successful Order placement
    req.session.privacyCache.set('usingMultiShipping', false);

    // TODO: Exposing a direct route to an Order, without at least encoding the orderID
    //  is a serious PII violation.  It enables looking up every customers orders, one at a
    //  time.
    res.json({
        error: false,
        orderID: order.orderNo,
        orderToken: order.orderToken,
        continueUrl: URLUtils.url('Order-Confirm').toString()
    });

    return next();
});

/* If payment method is Razor_Pay,
1. Signature validation
2. Authorization call
3. Placing Order */
server.prepend('PlaceOrder', server.middleware.https, function (req, res, next) {
    var Order = require('dw/order/Order');
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

module.exports = server.exports();
