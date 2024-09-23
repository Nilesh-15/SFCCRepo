var base = require('base/checkout/shipping');

base.customerFormResponse = function (defer, data) {
    var parentForm = isGuestFormActive() ? GUEST_FORM : REGISTERED_FORM;
    var formSelector = '.customer-section ' + parentForm;

    // highlight fields with errors
    if (data.error) {
        if (data.fieldErrors.length) {
            data.fieldErrors.forEach(function (error) {
                if (Object.keys(error).length) {
                    formHelpers.loadFormErrors(formSelector, error);
                }
            });
        }

        if (data.customerErrorMessage) {
            createErrorNotification(ERROR_SECTION, data.customerErrorMessage);
        }

        if (data.fieldErrors.length || data.customerErrorMessage || (data.serverErrors && data.serverErrors.length)) {
            defer.reject(data);
        }

        if (data.cartError) {
            window.location.href = data.redirectUrl;
            defer.reject();
        }
    } else {
        // Populate the Address Summary

        $('body').trigger('checkout:updateCheckoutView', {
            order: data.order,
            customer: data.customer,
            csrfToken: data.csrfToken
        });
        scrollAnimate($('.shipping-form'));
    }
}

module.exports = base;
