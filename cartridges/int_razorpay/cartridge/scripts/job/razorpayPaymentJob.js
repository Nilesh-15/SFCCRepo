'use strict';
var OrderMgr = require('dw/order/OrderMgr');

//getting all objects of order having razorpay status as 'Authorized'
function razorpayCapture() {
    let authorizedObjects = OrderMgr.queryOrders('custom.externalPaymentStatus = {0}', null, 'Authorized');
    while (authorizedObjects.hasNext()) {
        interableauthorizedObjects(authorizedObjects.next());
    }
}

/** 
* interating for all authorised  order objects and hitting service
* @param {order} item - order obect 
* @return {void}
*/
function interableauthorizedObjects(item) {
    let Transaction = require("dw/system/Transaction");
    var serviceCallHelper = require('*/cartridge/scripts/services/razorPayService');

    // body part object to hit service for changing 'authorised' status to 'captured'
    let parmsBody = {
        "amount": item.custom.externalPaymentAmount,
        "currency": item.custom.externalPaymentCurrencyCode
    };
    session.privacy.itemPaymentId = item.custom.externalPaymentId;//setting razorpay payment id
    let preferences = require('*/cartridge/config/preferences');
    let result = serviceCallHelper.getService('service.razorpay.payment.capture', true).call(JSON.stringify(parmsBody))

    if (result) {
        Transaction.wrap(function () {
            var orderObject = OrderMgr.getOrder(item.orderNo);
            orderObject.custom.externalPaymentStatus = preferences.razorpayCaptureStatus;//captured
            orderObject.paymentStatus = 2;//making status as paid
        });
    }
}

/** 
* Place orders by checking the razorpay side payment information/Status 
* @return {void}
*/
function processCreatedOrders(args) {
    var Order = require('dw/order/Order');
    var serviceCallHelper = require('*/cartridge/scripts/services/razorPayService');
    var Transaction = require("dw/system/Transaction");
    var Status = require('dw/system/Status');
    var whatsappHelpers = require('*/cartridge/scripts/helpers/whatsappHelpers');
    var OrderModel = require('*/cartridge/models/order');
    var Resource = require('dw/web/Resource');
    var Site = require('dw/system/Site');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var preferences = require('*/cartridge/config/preferences');
    var Logger = require('dw/system/Logger');
    var Calendar = require('dw/util/Calendar')
    var numberOfHours = args.numberOfHours;
    var currentDate = new Date();
    var orderPickUpTime = new Calendar(currentDate);
    orderPickUpTime.setTimeZone("Etc/GMT+1");
    orderPickUpTime.add(Calendar.HOUR, - numberOfHours);

    //fetching order having status is 'Created' and payment method is RAZOR_PAY
    var customerOrders = OrderMgr.searchOrders(
        'status={0} AND custom.externalPaymentMode={1} AND creationDate <= {2}',
        'creationDate desc',
        Order.ORDER_STATUS_CREATED,
        'RAZOR_PAY',
        orderPickUpTime.time
    );
    var result = {};
    if (customerOrders.getCount() > 0) {
        Logger.info('CREATED orders processing started');
    } else {
        Logger.info('No orders has been processed');
    }
    while (customerOrders.hasNext()) {
        //Get order from search query
        var order = customerOrders.next();
        //fetching payment information from razorpay by razorpay_order_id 
        try {
            result = serviceCallHelper.getServiceForOrderProcess('service.razorpay.orders', order.custom.externalPaymentOrderId).call();
        } catch (error) {
            Logger.error('processCreatedOrders - Error while service call service.razorpay.orders' + error.message);
        }
        if (result.status == 'OK') {
            var parsedResult = JSON.parse(result.object.text);
            if (parsedResult.count) {
                var razorPayPaymentInfo = parsedResult.items[0];
                if (razorPayPaymentInfo.captured) {
                    Transaction.wrap(function () {
                        var placeOrderStatus = OrderMgr.placeOrder(order);
                        if (placeOrderStatus.status !== Status.ERROR) {
                            order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
                            order.custom.externalPaymentId = razorPayPaymentInfo.id;
                            order.custom.externalPaymentAmount = razorPayPaymentInfo.amount;
                            order.custom.externalPaymentCurrencyCode = razorPayPaymentInfo.currency;
                            order.custom.externalPaymentStatus = preferences.razorAuthStatus;
                            Logger.info('Order No: ' + order.getOrderNo() + ' Order Status: ' + order.getStatus().getDisplayValue());
                            var orderConfig = {
                                config: {
                                    numberOfLineItems: '*'
                                },
                                containerView: 'order'
                            }
                            var orderModel = new OrderModel(order, orderConfig);
                            if (orderModel) {

                                //Send whatsapp confiramtion 
                                try {
                                    var isWhatsappMsgTriggered = order.custom.isWhatsappMsgTriggered;
                                    if (!isWhatsappMsgTriggered && !empty(order.billingAddress.phone)) {
                                        whatsappHelpers.sendWhatsAppOrderConfirmation(orderModel);
                                        Transaction.wrap(function () {
                                            order.custom.isWhatsappMsgTriggered = true;
                                        });
                                    }
                                } catch (error) {
                                    Logger.error('processCreatedOrders - Error while WhatsApp order confirmation' + error.message);
                                }

                                //Send email confiramtion
                                try {
                                    if (order.getCustomerEmail()) {
                                        var orderObject = { order: orderModel };
                                        var emailObj = {
                                            to: order.customerEmail,
                                            subject: Resource.msg('subject.order.confirmation.email', 'order', null),
                                            from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
                                            type: emailHelpers.emailTypes.orderConfirmation
                                        };
                                        emailHelpers.sendEmail(emailObj, 'checkout/confirmation/confirmationEmail', orderObject);
                                    }
                                } catch (error) {
                                    Logger.error('processCreatedOrders - Error while sending email' + error.message);
                                }

                            }
                        }
                    });
                    continue;
                }
            }
        }
        Transaction.wrap(function () {
            OrderMgr.failOrder(order, false);
        });
        Logger.info('Order No: ' + order.getOrderNo() + ' Order Status: ' + order.getStatus().getDisplayValue());
    }
}
module.exports = {
    razorpayCapture: razorpayCapture,
    processCreatedOrders: processCreatedOrders
};
