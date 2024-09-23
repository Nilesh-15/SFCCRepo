'use strict';
let LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var dummyURL = "";

function getService(serviceName,isCapture) {
    var razorpayService = LocalServiceRegistry.createService(serviceName, {
        createRequest: function (svc, requestObj) {
            if (isCapture) {
                var paymentId = session.privacy.itemPaymentId;
                if (dummyURL === "") {
                    dummyURL = svc.URL;
                }
                let UrlM = dummyURL + '/' + paymentId + '/capture';
                svc.setURL(UrlM);
            }
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            return requestObj;
        },
        parseResponse: function (svc, response) {
            return response;
        }
    })
    return razorpayService;
}
function getServiceForOrderProcess(serviceName, razorPayOrderId) {
    var razorpayService = LocalServiceRegistry.createService(serviceName, {
        createRequest: function (svc) {
            svc.setRequestMethod('GET');
            svc.setURL(svc.URL + '/' + razorPayOrderId + '/payments');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
        },
        parseResponse: function (svc, response) {
            return response;
        }
    });
    return razorpayService;
}

module.exports = {
    getService: getService,
    getServiceForOrderProcess: getServiceForOrderProcess
};

