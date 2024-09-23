
var Logger = require('dw/system/Logger').getLogger('RazorPay', 'Payment');
let preferences = require('*/cartridge/config/preferences');

/**
 * function to create order request to razorpay.
 * @returns {Object} response object
 */
function razorPayCreateOrderRequest() {
    var RazorPayUtils = require('*/cartridge/scripts/util/razorPayUtil');
    var serviceCallHelper = require('*/cartridge/scripts/services/razorPayService');
    var amount = RazorPayUtils.getAmount();

    //data object for making service call
    var dataPost = {
        amount: amount.value * (preferences.razorpayPriceConversionFactor),//specific of Razorpay service convertion factor // amount: amount.value * 100, // test purpose
        currency: amount.currencyCode,
        receipt: amount.value + " "+amount.currencyCode //test receipt information to razorpay, we can modify as per our requirement
    };
    var response = {};
    try {
        response = serviceCallHelper.getService('service.razorpay.orders',false).call(JSON.stringify(dataPost))//getservice(service_name, isCapture)
        
    } catch (e) {
        Logger.error('Error in razorPayOrderRequest: {0}', JSON.stringify(e));
    }
    return response;
}

module.exports = {
    razorPayCreateOrderRequest: razorPayCreateOrderRequest,
};