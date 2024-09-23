'use strict';
var scrollAnimate = require('base/components/scrollAnimate');
var failureResponse;


function failOrder(requestOptionsData) {
    $('body').trigger('checkout:onErrorActivity');
    requestOptionsData.razorpayFailOrderResponse = 'Closed';
    if (typeof failureResponse !== 'undefined' && failureResponse !== null) {
        requestOptionsData.razorpayFailOrderResponse = JSON.stringify(failureResponse);
        failureResponse = null;
    }
    $.ajax({
        url: requestOptionsData.failUrl,
        method: 'POST',
        data: requestOptionsData,
        success: function (data) {
            if (data.error) {
                if (data.errorMessage) {
                    $('.error-message').show();
                    $('.error-message-text').text(data.errorMessage);
                    scrollAnimate($('.error-message'));
                }
            }
        },
        error: function () {
            $('.error-message').show();
            $('.error-message-text').text(requestOptionsData.closePopUpMessage);
            scrollAnimate($('.error-message'));
        }
    });
}

function placeOrder(data) {
    $.ajax({
        url: data.paymentResponseURL,
        method: 'POST',
        data: data,
        success: function (data) {
            if (data.error) {
                if (data.errorMessage) {
                    $('.error-message').show();
                    $('.error-message-text').text(data.errorMessage);
                    scrollAnimate($('.error-message'));
                }
            } else {
                //redirect to review page
                redirectToOrderConfirmationPage(data)
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

function getRazorpayRequestOptions(requestOptionsData) {
    var options = {
        "key": requestOptionsData.key, // Enter the Key ID generated from the Dashboard
        "currency": requestOptionsData.currency,
        "order_id": requestOptionsData.order_id,
        "handler": function (response) {
            requestOptionsData.razorpay_payment_id = response.razorpay_payment_id;
            requestOptionsData.razorpay_order_id = response.razorpay_order_id;
            requestOptionsData.razorpay_signature = response.razorpay_signature;
            placeOrder(requestOptionsData);
        },
        "theme": {
            "color": "#3399cc"
        },
        "modal": {
            "ondismiss": function () {
                failOrder(requestOptionsData);
            }
        },
        'retry': true,
        "prefill": {
            "contact": requestOptionsData.phoneNo,
            "email": requestOptionsData.customerEmail
        }
    };
    return options;
}

function createRazorpayOrder(requestOptionsData) {
    $.getScript(requestOptionsData.razorpayCheckoutJsUrl, function (data) {
        var requestOptions = getRazorpayRequestOptions(requestOptionsData);
        var razorpayObject = new Razorpay(requestOptions);
        razorpayObject.on('payment.failed', function (response) {
            failureResponse = response;
        });
        // $.spinner().stop();
        razorpayObject.open();
    });
}

function createOrder(paymentURL) {
    $.ajax({
        url: paymentURL,
        type: 'post',
        dataType: 'json',
        success: function (data) {
            // enable the placeOrder button here
            $('body').trigger('checkout:enableButton', '.next-step-button button');
            if (data.error) {
                $('.error-message').show();
                $('.error-message-text').text(data.errorMessage);
                scrollAnimate($('.error-message'));
                // $.spinner().stop();
            } else {
                createRazorpayOrder(data);
            }
        },
        error: function () {
            // enable the placeOrder button here
            $('body').trigger('checkout:enableButton', $('.next-step-button button'));
        }
    });
}
function redirectToOrderConfirmationPage(data) {
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

    $('<input>')
        .appendTo(redirect)
        .attr({
            name: 'payInstrument',
            value: data.payInstrument
        });

    redirect.submit();
}
$(function () {
    $(document).on('click', '.razor-pay', function (e) {
        var urlConfig = $(this).attr('url-config');
        createOrder(urlConfig)
    });

});




module.exports = {
    createOrder: createOrder,
    createRazorpayOrder: createRazorpayOrder
}