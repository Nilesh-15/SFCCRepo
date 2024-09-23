'use strict';

var server = require('server');
server.extend(module.superModule);

/**
 * @namespace Checkout
 */

var server = require('server');

var URLUtils = require('dw/web/URLUtils');
var Locale = require('dw/util/Locale');

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var singlePageCheckoutHelpers = require('*/cartridge/scripts/helpers/singlePageCheckoutHelpers');
var preferences = require('*/cartridge/config/preferences');

/**
 * Main entry point for Checkout
 */

/**
 * Checkout-Begin : The Checkout-Begin endpoint will render the checkout shipping page for both guest shopper and returning shopper
 * @name Checkout-Begin
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - stage - a flag indicates the checkout stage
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace(
    'Begin',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var Transaction = require('dw/system/Transaction');
        var AccountModel = require('*/cartridge/models/account');
        var OrderModel = require('*/cartridge/models/order');
        var URLUtils = require('dw/web/URLUtils');
        var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
        var Locale = require('dw/util/Locale');
        var collections = require('*/cartridge/scripts/util/collections');
        var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

        // AC-41: Buy Now feature
        var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
        var currentBasket = COHelpers.getBasket(isBuyNowProduct);

        if (!currentBasket) {
            res.redirect(URLUtils.url('Cart-Show'));
            return next();
        }

        var validatedProducts = validationHelpers.validateProducts(currentBasket);
        if (validatedProducts.error) {
            res.redirect(URLUtils.url('Cart-Show'));
            return next();
        }

        var requestStage = req.querystring.stage;
        var currentStage = requestStage || 'customer';
        var billingAddress = currentBasket.billingAddress;

        var currentCustomer = req.currentCustomer.raw;
        var currentLocale = Locale.getLocale(req.locale.id);
        var preferredAddress;

        // only true if customer is registered
        if (req.currentCustomer.addressBook && req.currentCustomer.addressBook.preferredAddress) {
            var shipments = currentBasket.shipments;
            preferredAddress = req.currentCustomer.addressBook.preferredAddress;

            collections.forEach(shipments, function (shipment) {
                if (!shipment.shippingAddress) {
                    COHelpers.copyCustomerAddressToShipment(preferredAddress, shipment, isBuyNowProduct);
                }
            });

            if (!billingAddress) {
                COHelpers.copyCustomerAddressToBilling(preferredAddress, isBuyNowProduct);
            }
        }

        // Calculate the basket
        Transaction.wrap(function () {
            COHelpers.ensureNoEmptyShipments(req);
        });

        if (currentBasket.shipments.length <= 1) {
            req.session.privacyCache.set('usingMultiShipping', false);
        }

        if (currentBasket.currencyCode !== req.session.currency.currencyCode) {
            Transaction.wrap(function () {
                currentBasket.updateCurrency();
            });
        }

        COHelpers.recalculateBasket(currentBasket);

        var guestCustomerForm = COHelpers.prepareCustomerForm('coCustomer');
        var registeredCustomerForm = COHelpers.prepareCustomerForm('coRegisteredCustomer');
        var shippingForm = COHelpers.prepareShippingForm();
        var billingForm = COHelpers.prepareBillingForm();
        var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');

        if (preferredAddress) {
            shippingForm.copyFrom(preferredAddress);
            billingForm.copyFrom(preferredAddress);
        }

        // Loop through all shipments and make sure all are valid
        var allValid = COHelpers.ensureValidShipments(currentBasket);

        var orderModel = new OrderModel(
            currentBasket,
            {
                customer: currentCustomer,
                usingMultiShipping: usingMultiShipping,
                shippable: allValid,
                countryCode: currentLocale.country,
                containerView: 'basket'
            }
        );

        // Get rid of this from top-level ... should be part of OrderModel???
        var currentYear = new Date().getFullYear();
        var creditCardExpirationYears = [];

        for (var j = 0; j < 10; j++) {
            creditCardExpirationYears.push(currentYear + j);
        }

        var accountModel = new AccountModel(req.currentCustomer);

        var reportingURLs;
        reportingURLs = reportingUrlsHelper.getCheckoutReportingURLs(
            currentBasket.UUID,
            2,
            'Shipping'
        );

        if (currentStage === 'customer') {
            if (accountModel.registeredUser) {
                // Since the shopper already login upon starting checkout, fast forward to shipping stage
                currentStage = 'shipping';

                // Only need to update email address in basket if start checkout from other page like cart or mini-cart
                // and not on checkout page reload.
                if (!requestStage) {
                    Transaction.wrap(function () {
                        currentBasket.customerEmail = accountModel.profile.email;
                        orderModel.orderEmail = accountModel.profile.email;
                    });
                }
            } else if (currentBasket.customerEmail) {
                // Email address has already collected so fast forward to shipping stage
                currentStage = 'shipping';
            }
        }

        res.render('checkout/checkout', {
            order: orderModel,
            customer: accountModel,
            forms: {
                guestCustomerForm: guestCustomerForm,
                registeredCustomerForm: registeredCustomerForm,
                shippingForm: shippingForm,
                billingForm: billingForm
            },
            expirationYears: creditCardExpirationYears,
            currentStage: currentStage,
            reportingURLs: reportingURLs,
            oAuthReentryEndpoint: 2,
            isBuyNowProduct: isBuyNowProduct
        });

        return next();
    }
);

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
 *  Handle Ajax selected payment method (shipping and billing) form submit
 */
/**
 * Checkout-SubmitSinglePage : The Checkout-SubmitSinglePage endpoint will submit the shipping billing and payment information
 * @name Checkout-SubmitSinglePage
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('SubmitSinglePage',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var Resource = require('dw/web/Resource');
        var PaymentMgr = require('dw/order/PaymentMgr');
        var HookMgr = require('dw/system/HookMgr');
        var Transaction = require('dw/system/Transaction');
        var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

        var billingForm = server.forms.getForm('billing');
        var form = server.forms.getForm('shipping');
        singlePageCheckoutHelpers.handleShippingAddress(req, res, form);
        if (!res.getViewData().submitShipping.error) {
            singlePageCheckoutHelpers.handleBillingAddress(req, res, billingForm);
            if (res.getViewData().submitPayment.error) {
                res.json({ "submitPayment": res.getViewData().submitPayment });
                next();
                return
            }
        } else {
            let submitShippingRes = res.getViewData().submitShipping;
            res.json({ "submitShipping": submitShippingRes });
            next();
            return
        }

        //copy phone number to shipping address
        var contactInfoPhoneNo = res.getViewData().submitPayment.phone.value;
        var submitShippingViewData = res.getViewData().submitShipping;
        submitShippingViewData.address.phone = contactInfoPhoneNo;
        res.setViewData({ 'submitShipping': submitShippingViewData });

        //Submit Shipping
        singlePageCheckoutHelpers.submitShipping(req, res);
        if (res.getViewData().submitShipping.error) {
            next();
            return
        }

        //Submit Billing
        singlePageCheckoutHelpers.submitBilling(req, res);
        var billingData = res.getViewData().submitPayment;
        if (billingData.error) {
            next();
            return;
        }

        var paymentMethodID = billingForm.paymentMethod.value;
        billingForm.creditCardFields.cardNumber.htmlValue = '';
        billingForm.creditCardFields.securityCode.htmlValue = '';

        // AC-41: Buy Now feature
        var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
        var currentBasket = COHelpers.getBasket(isBuyNowProduct);

        // if there is no selected payment option and balance is greater than zero
        if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
            var noPaymentMethod = {};

            noPaymentMethod[billingData.paymentMethod.htmlName] =
                Resource.msg('error.no.selected.payment.method', 'payment', null);

            delete billingData.paymentInformation;

            res.json({
                submitPayment: {
                    form: billingForm,
                    fieldErrors: [noPaymentMethod],
                    serverErrors: [],
                    error: true
                }
            });
            return;
        }

        var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();
        // check to make sure there is a payment processor
        if (!processor) {
            throw new Error(Resource.msg(
                'error.payment.processor.missing',
                'checkout',
                null
            ));
        }

        var result;

        if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
            result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                'Handle',
                currentBasket,
                billingData.paymentInformation,
                paymentMethodID,
                req
            );
        } else {
            result = HookMgr.callHook('app.payment.processor.default', 'Handle');
        }

        if (result.error) {
            delete billingData.paymentInformation;

            res.json({
                form: billingForm,
                fieldErrors: result.fieldErrors,
                serverErrors: result.serverErrors,
                error: true
            });
            return next();
        }

        Transaction.wrap(function () {
            basketCalculationHelpers.calculateTotals(currentBasket);
        });

        // Re-calculate the payments.
        var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
            currentBasket
        );

        if (calculatedPaymentTransaction.error) {
            res.json({
                fieldErrors: [],
                serverErrors: [Resource.msg('error.technical', 'checkout', null)],
                error: true
            });
            return next();
        }

        res.json({paymentMethodID: paymentMethodID, result:result, isBuyNowProduct: isBuyNowProduct});
        next();
    });

/**
 *  This route sets the redirectUrl for cash on delivery payment method. If COD is not required, this can be removed.
 */
/**
 * @name Checkout-SubmitSinglePage
 * @function
 * @memberof Checkout
 */
server.append('SubmitSinglePage', function (req, res, next) {
    var Site = require('dw/system/Site');
    var URLUtils = require('dw/web/URLUtils');
    var preferences = require('*/cartridge/config/preferences.js');
    var isCODEnabled = preferences.isCODEnabled;
    var viewData = res.getViewData();
    if (isCODEnabled && viewData.paymentMethodID === 'CASH_ON_DELIVERY') {
        viewData.isOrderCOD = true;
        viewData.redirectUrl = URLUtils.url('CheckoutServices-PlaceOrder', 'buyNow', viewData.isBuyNowProduct).toString();
    }
    next();
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
