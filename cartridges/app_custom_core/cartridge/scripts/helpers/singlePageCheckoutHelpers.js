'use strict';

var base = module.superModule;

function handleShippingAddress(req, res, form) {
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

    // AC-41: Buy Now feature
    var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
    var currentBasket = COHelpers.getBasket(isBuyNowProduct);

    if (!currentBasket) {
        res.json({
            "submitShipping": {
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            }
        });
        return;
    }

    var validatedProducts = validationHelpers.validateProducts(currentBasket);
    if (validatedProducts.error) {
        res.json({
            'submitShipping': {
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            }
        });
        return;
    }

    var result = {};

    // verify shipping form data
    var shippingFormErrors = COHelpers.validateShippingForm(form.shippingAddress.addressFields);

    if (Object.keys(shippingFormErrors).length > 0) {
        req.session.privacyCache.set(currentBasket.defaultShipment.UUID, 'invalid');

        res.json({
            'submitShipping': {
                form: form,
                fieldErrors: [shippingFormErrors],
                serverErrors: [],
                error: true
            }
        });
    } else {
        req.session.privacyCache.set(currentBasket.defaultShipment.UUID, 'valid');

        result.address = {
            firstName: form.shippingAddress.addressFields.firstName.value,
            lastName: form.shippingAddress.addressFields.lastName.value,
            address1: form.shippingAddress.addressFields.address1.value,
            address2: form.shippingAddress.addressFields.address2.value,
            city: form.shippingAddress.addressFields.city.value,
            postalCode: form.shippingAddress.addressFields.postalCode.value,
            countryCode: form.shippingAddress.addressFields.country.value,
            phone: form.shippingAddress.addressFields.phone.value
        };
        if (Object.prototype.hasOwnProperty
            .call(form.shippingAddress.addressFields, 'states')) {
            result.address.stateCode =
                form.shippingAddress.addressFields.states.stateCode.value;
        }

        result.shippingBillingSame =
            form.shippingAddress.shippingAddressUseAsBillingAddress.value;

        result.shippingMethod = form.shippingAddress.shippingMethodID.value
            ? form.shippingAddress.shippingMethodID.value.toString()
            : null;

        result.isGift = form.shippingAddress.isGift.checked;

        result.giftMessage = result.isGift ? form.shippingAddress.giftMessage.value : null;

        res.setViewData({'submitShipping': result });
    }

    return;
}

function submitShipping(req, res) { // eslint-disable-line no-shadow
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var BasketMgr = require('dw/order/BasketMgr');

    // AC-41: Buy Now feature
    var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
    var currentBasket = COHelpers.getBasket(isBuyNowProduct);

    var OrderModel = require('*/cartridge/models/order');
    var AccountModel = require('*/cartridge/models/account');
    var Locale = require('dw/util/Locale');

    var shippingData = res.getViewData().submitShipping;
    if (shippingData.error) {
        res.json({ "submitShipping": shippingData });
        return;
    }

    COHelpers.copyShippingAddressToShipment(
        shippingData,
        currentBasket.defaultShipment
    );
    var giftResult = COHelpers.setGift(
        currentBasket.defaultShipment,
        shippingData.isGift,
        shippingData.giftMessage
    );

    if (giftResult.error) {
        res.json({
            error: giftResult.error,
            fieldErrors: [],
            serverErrors: [giftResult.errorMessage]
        });
        return;
    }

    if (!currentBasket.billingAddress) {
        if (req.currentCustomer.addressBook
            && req.currentCustomer.addressBook.preferredAddress) {
            // Copy over preferredAddress (use addressUUID for matching)
            COHelpers.copyBillingAddressToBasket(
                req.currentCustomer.addressBook.preferredAddress, currentBasket);
        } else {
            // Copy over first shipping address (use shipmentUUID for matching)
            COHelpers.copyBillingAddressToBasket(
                currentBasket.defaultShipment.shippingAddress, currentBasket);
        }
    }
    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
        req.session.privacyCache.set('usingMultiShipping', false);
        usingMultiShipping = false;
    }
    COHelpers.recalculateBasket(currentBasket);
    var currentLocale = Locale.getLocale(req.locale.id);
    var basketModel = new OrderModel(
        currentBasket,
        {
            usingMultiShipping: false,
            shippable: true,
            countryCode: currentLocale.country,
            containerView: 'basket'
        }
    );

    res.json({
        customer: new AccountModel(req.currentCustomer),
        order: basketModel
    });
}

function submitBilling(req, res) {
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');
    var Locale = require('dw/util/Locale');
    var Transaction = require('dw/system/Transaction');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    // AC-41: Buy Now feature
    var isBuyNowProduct = req.querystring.buyNow && req.querystring.buyNow === 'true';
    var currentBasket = COHelpers.getBasket(isBuyNowProduct);

    // var billingForm = server.forms.getForm('billing');

    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
    var billingData = res.getViewData().submitPayment;

    if (billingData.error) {
        return;
    }
    var billingFromShippingSelector = billingData.billingFromShippingSelector;

    if (!currentBasket) {
        delete billingData.paymentInformation;
        res.json({
            submitPayment: {
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            }
        });
        return;
    }

    var validatedProducts = validationHelpers.validateProducts(currentBasket);
    if (validatedProducts.error) {
        delete billingData.paymentInformation;
        res.json({
            submitPayment: {
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            }
        });
        return;
    }

    var billingAddress = currentBasket.billingAddress;


    Transaction.wrap(function () {
        if (!billingAddress) {
            billingAddress = currentBasket.createBillingAddress();
        }
        currentBasket.setCustomerEmail(billingData.paymentInformation.billingForm.contactInfoFields.email.htmlValue);
        billingAddress.setPhone(billingData.phone.value);

        var billingAddressData;
        if ('DIFFERENT_BILLING_ADDRESS' == billingFromShippingSelector) {
            billingAddressData = billingData;
            billingAddress.setFirstName(billingAddressData.address.firstName.value);
            billingAddress.setLastName(billingAddressData.address.lastName.value);
            billingAddress.setAddress1(billingAddressData.address.address1.value);
            billingAddress.setAddress2(billingAddressData.address.address2.value);
            billingAddress.setCity(billingAddressData.address.city.value);
            billingAddress.setPostalCode(billingAddressData.address.postalCode.value);
            if (Object.prototype.hasOwnProperty.call(billingAddressData.address, 'stateCode')) {
                billingAddress.setStateCode(billingAddressData.address.stateCode.value);
            }
            billingAddress.setCountryCode(billingAddressData.address.countryCode.value);
        } else {
            billingAddressData = res.getViewData().submitShipping;
            billingAddress.setFirstName(billingAddressData.address.firstName);
            billingAddress.setLastName(billingAddressData.address.lastName);
            billingAddress.setAddress1(billingAddressData.address.address1);
            billingAddress.setAddress2(billingAddressData.address.address2);
            billingAddress.setCity(billingAddressData.address.city);
            billingAddress.setPostalCode(billingAddressData.address.postalCode);
            if (Object.prototype.hasOwnProperty.call(billingAddressData.address, 'stateCode')) {
                billingAddress.setStateCode(billingAddressData.address.stateCode);
            }
            billingAddress.setCountryCode(billingAddressData.address.countryCode);
        }
    });


}

module.exports = {
    handleShippingAddress: handleShippingAddress,
    handleBillingAddress: base.handleBillingAddress,
    submitShipping: submitShipping,
    submitBilling: submitBilling
};
