'use strict';

var server = require('server');
server.extend(module.superModule);

/**
 * CheckoutShippingServices-UpdateShippingMethodsList : The CheckoutShippingServices-UpdateShippingMethodsList endpoint gets hit once a shopper has entered certain address infromation and gets the applicable shipping methods based on the shopper's supplied shipping address infromation
 * @name Base/CheckoutShippingServices-UpdateShippingMethodsList
 * @function
 * @memberof CheckoutShippingServices
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - shipmentUUID - the universally unique identifier of the shipment
 * @param {httpparameter} - firstName - shipping address input field, shopper's shipping first name
 * @param {httpparameter} - lastName - shipping address input field, shopper's last name
 * @param {httpparameter} - address1 - shipping address input field, address line 1
 * @param {httpparameter} - address2 - shipping address nput field address line 2
 * @param {httpparameter} - city - shipping address input field, city
 * @param {httpparameter} - postalCode -  shipping address input field, postal code (or zipcode)
 * @param {httpparameter} - stateCode - shipping address input field, state code (Not all locales have state code)
 * @param {httpparameter} - countryCode -  shipping address input field, country
 * @param {httpparameter} - phone - shipping address input field, shopper's phone number
 * @param {httpparameter} - shipmentUUID - The universally unique identifier of the shipment
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('UpdateShippingMethodsList', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var URLUtils = require('dw/web/URLUtils');
    var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');
    var Locale = require('dw/util/Locale');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

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

    var shipmentUUID = req.querystring.shipmentUUID || req.form.shipmentUUID;
    var shipment;
    if (shipmentUUID) {
        shipment = ShippingHelper.getShipmentByUUID(currentBasket, shipmentUUID);
    } else {
        shipment = currentBasket.defaultShipment;
    }

    var address = ShippingHelper.getAddressFromRequest(req);

    var shippingMethodID;

    if (shipment.shippingMethod) {
        shippingMethodID = shipment.shippingMethod.ID;
    }

    Transaction.wrap(function () {
        var shippingAddress = shipment.shippingAddress;

        if (!shippingAddress) {
            shippingAddress = shipment.createShippingAddress();
        }

        Object.keys(address).forEach(function (key) {
            var value = address[key];
            if (value) {
                shippingAddress[key] = value;
            } else {
                shippingAddress[key] = null;
            }
        });

        ShippingHelper.selectShippingMethod(shipment, shippingMethodID);

        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    var currentLocale = Locale.getLocale(req.locale.id);

    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
    );

    res.json({
        customer: new AccountModel(req.currentCustomer),
        order: basketModel,
        shippingForm: server.forms.getForm('shipping')
    });

    return next();
});

module.exports = server.exports();
