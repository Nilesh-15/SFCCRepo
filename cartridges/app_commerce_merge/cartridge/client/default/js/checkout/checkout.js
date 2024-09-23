'use strict';

var customerHelpers = require('base/checkout/customer');
var addressHelpers = require('int_single_page_checkout/checkout/address');
var shippingHelpers = require('int_single_page_checkout/checkout/shipping');
var billingHelpers = require('int_single_page_checkout/checkout/billing');
var formHelpers = require('base/checkout/formErrors');
var scrollAnimate = require('base/components/scrollAnimate');
var createErrorNotification = require('base/components/errorNotification');

function onCustLogin() {
    {
        customerHelpers.methods.clearErrors();
        var customerFormSelector = customerHelpers.vars.REGISTERED_FORM;
        var customerForm = $(customerFormSelector);
        $.ajax({
            url: customerForm.attr('action'),
            type: 'post',
            data: customerForm.serialize(),
            success: function (data) {
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else {
                    var parentForm = '#registered-customer';
                    var formSelector = '.customer-section ' + parentForm;
                    if (data.error) {
                        if (data.fieldErrors.length) {
                            data.fieldErrors.forEach(function (error) {
                                if (Object.keys(error).length) {
                                    formHelpers.loadFormErrors(formSelector, error);
                                }
                            });
                        }
                        if (data.customerErrorMessage) {
                            createErrorNotification('.customer-error', data.customerErrorMessage);
                        }
                        if (data.cartError) {
                            window.location.href = data.redirectUrl;
                        }
                    }
                }
            },
            error: function (err) {
                if (err.responseJSON && err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }

            }
        });
    }
}
function shippingFormResponse(data) {
    var isMultiShip = $('#checkout-main').hasClass('multi-ship');
    var formSelector = isMultiShip
        ? '.multi-shipping .active form'
        : '.single-shipping form';
    // highlight fields with errors
    if (data.error) {
        if (data.fieldErrors.length) {
            data.fieldErrors.forEach(function (error) {
                if (Object.keys(error).length) {
                    formHelpers.loadFormErrors(formSelector, error);
                }
            });
        }
        if (data.cartError) {
            window.location.href = data.redirectUrl;
        }
    }
}
function paymentFormResponse(data) {
    if (data && data.error) {
        if (data.fieldErrors.length) {
            data.fieldErrors.forEach(function (error) {
                if (Object.keys(error).length) {
                    formHelpers.loadFormErrors('.payment-form', error);
                }
            });
        }

        if (data.serverErrors.length) {
            data.serverErrors.forEach(function (error) {
                $('.error-message').show();
                $('.error-message-text').text(error);
                scrollAnimate($('.error-message'));
            });
        }

        if (data.cartError) {
            window.location.href = data.redirectUrl;
        }

    }
}
var exports = {
    initialize: function () {
        $(".shipping-section").css("display", "block");
        $(".card.payment-form").css("display", "block");
        $('.billing-address').hide();
        $('input[type=radio][name=billing_from_shipping_selector]').change(function () {
            if (this.value == 'DIFFERENT_BILLING_ADDRESS') {
                $('body').trigger('checkout:clearBillingForm');
                $('.billing-address').show();
            }
            else if (this.value == 'SAME_AS_SHIPPING') {
                $('.billing-address').hide();
            }
        });
        $('body').on('click', '.submit-customer-login', function (e) {
            e.preventDefault();
            onCustLogin();
        });
        $('input[name="paymentMethod"]').change(function () {
            let value = $(this).val();
            $('.selected-payment-method').val(value);
        });

        if ($('input[name="paymentMethod"]:checked').length) {
            let value = $('input[name="paymentMethod"]:checked').val();
            $('.selected-payment-method').val(value);
        }
    },

    disableButton: function () {
        $('body').on('checkout:disableButton', function (e, button) {
            $(button).prop('disabled', true);
        });
    },

    enableButton: function () {
        $('body').on('checkout:enableButton', function (e, button) {
            $(button).prop('disabled', false);
        });
    },
    onSubmitSPC: function () {
        $('.spc-btn').on('click', function (e) {
            e.preventDefault();
            var url = $(this).data('url');
            //shipping
            formHelpers.clearPreviousErrors('.shipping-form');
            var formSelector = '.single-shipping .shipping-form';
            var form = $(formSelector);
            var shippingFormData = form.serialize();
            $('body').trigger('checkout:serializeShipping', {
                form: form,
                data: shippingFormData,
                callback: function (data) {
                    shippingFormData = data;
                }
            });
            formHelpers.clearPreviousErrors('.payment-form');
            var billingAddressForm = $('#dwfrm_billing .billing-address-block :input').serialize();
            $('body').trigger('checkout:serializeBilling', {
                form: $('#dwfrm_billing .billing-address-block'),
                data: billingAddressForm,
                callback: function (data) {
                    if (data) {
                        billingAddressForm = data;
                    }
                }
            });
            var contactInfoForm = $('#dwfrm_billing .contact-info-block :input').serialize();
            $('body').trigger('checkout:serializeBilling', {
                form: $('#dwfrm_billing .contact-info-block'),
                data: contactInfoForm,
                callback: function (data) {
                    if (data) {
                        contactInfoForm = data;
                    }
                }
            });
            var activeTabId = $('.tab-pane.active').attr('id');
            var paymentInfoSelector = '#dwfrm_billing .payment-form-fields :input';
            var paymentInfoForm = $(paymentInfoSelector).serialize();
            $('body').trigger('checkout:serializeBilling', {
                form: $(paymentInfoSelector),
                data: paymentInfoForm,
                callback: function (data) {
                    if (data) {
                        paymentInfoForm = data;
                    }
                }
            });
            var paymentForm = billingAddressForm + '&' + contactInfoForm + '&' + paymentInfoForm;
            var spcData = shippingFormData + '&' + paymentForm;
            $.ajax({
                url: url,
                type: 'post',
                data: spcData,
                success: function (data) {
                    if (!data.error) {
                        shippingFormResponse(data.submitShipping);
                        paymentFormResponse(data.submitPayment);
                        if (!data.submitShipping.error && !data.submitPayment.error) {
                            if(data.result.razorPayRes){
                                var razor = require('int_razorpay/checkout/razor');
                                razor.createRazorpayOrder(data.result.razorPayRes)
                            } else if (data.isOrderCOD && data.redirectUrl) {
                                $.ajax({
                                    url: data.redirectUrl,
                                    method: 'post',
                                    success: function (data) {
                                        if (data.error) {
                                            if (data.cartError) {
                                                window.location.href = data.redirectUrl;
                                                defer.reject();
                                            } else {
                                                // go to appropriate stage and display error message
                                                defer.reject(data);
                                            }
                                        } else {
                                            var redirect = $('<form>')
                                                .appendTo(document.body)
                                                .attr({
                                                    method: 'POST',
                                                    action: data.continueUrl
                                                });
            
                                            $('<input>')
                                                .appendTo(redirect)
                                                .attr({
                                                    name: 'orderID',
                                                    value: data.orderID
                                                });
            
                                            $('<input>')
                                                .appendTo(redirect)
                                                .attr({
                                                    name: 'orderToken',
                                                    value: data.orderToken
                                                });
            
                                            redirect.submit();
                                            defer.resolve(data);
                                        }
                                    },
                                    error: function (err) {
                                        if (err.responseJSON) {
                                            $('.error-message').show();
                                            $('.error-message-text').text(err.responseJSON.message);
                                            scrollAnimate($('.error-message'));
                                        }
                                    }
                                });
                            }
                        }
                    }
                },
                error: function (err) {
                    if (err.responseJSON) {
                        $('.error-message').show();
                        $('.error-message-text').text(err.responseJSON.message);
                        scrollAnimate($('.error-message'));
                    }
                }
            });
        });
    }

};
var customTypeOf = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};
[customerHelpers, billingHelpers, shippingHelpers, addressHelpers].forEach(function (library) {
    Object.keys(library).forEach(function (item) {
        if (customTypeOf(library[item]) === 'object') {
            exports[item] = $.extend({}, exports[item], library[item]);
        } else {
            exports[item] = library[item];
        }
    });
});

module.exports = exports;
