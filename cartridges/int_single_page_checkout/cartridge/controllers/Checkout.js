'use strict';

var server = require('server');
server.extend(module.superModule);

var singlePageCheckoutHelpers = require('*/cartridge/scripts/helpers/singlePageCheckoutHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var URLUtils = require('dw/web/URLUtils');
var Locale = require('dw/util/Locale');

function validateCustomerForm(form) {
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var result = COHelpers.validateCustomerForm(form);
    if (result.formFieldErrors.length) {
        result.json = {
            form: result.customerForm,
            fieldErrors: result.formFieldErrors,
            serverErrors: [],
            error: true
        };
    }
    return result;
}

function handleCustomerRouteBeforeComplete(req, res, accountModel, redirectUrl) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var OrderModel = require('*/cartridge/models/order');

    var customerData = res.getViewData();
    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return;
    }

    Transaction.wrap(function () {
        currentBasket.setCustomerEmail(customerData.customer.email.value);
    });

    var currentLocale = Locale.getLocale(req.locale.id);
    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: false, countryCode: currentLocale.country, containerView: 'basket' }
    );

    res.json({
        customer: accountModel,
        error: false,
        order: basketModel,
        csrfToken: customerData.csrfToken,
        redirectUrl: redirectUrl
    });
}

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
server.post('SubmitSinglePage',
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

        var currentBasket = BasketMgr.getCurrentBasket();
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

        res.json({paymentMethodID: paymentMethodID, result:result});
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
        viewData.redirectUrl = URLUtils.url('CheckoutServices-PlaceOrder').toString();
    }
    next();
});

module.exports = server.exports();