"use-strict";
let LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
let Logger = require("dw/system/Logger");

/**
 * This service is employed to initiate and validate OTPs sent to customers' phones, using the information obtained from the form.
 */
module.exports = {
    triggerOTPService: function (svcName) {
        let service = null;
        try {
            service = LocalServiceRegistry.createService(svcName, {
                createRequest: function (svc, arg) {
                    if (arg) {
                        return arg;
                    } else {
                        return null;
                    }
                },
                parseResponse: function (svc, arg) {
                    return arg.text;
                },
                mockCall: function (svc, arg) {
                    var result = "";
                    if (svc.configuration.ID == "service.2factor.send.otp") {
                        return {
                            statusCode: 200,
                            statusMessage: "Success",
                            text: JSON.stringify({
                                Details: "ab88279e-0105-415f-912e-2f24162b8cbb",
                                OTP:
                                    "MOCK OTP RESPONSE " +
                                    Math.floor(100000 + Math.random() * 900000),
                                Status: "Success",
                            }),
                        };
                    } else {
                        return {
                            statusCode: 200,
                            statusMessage: "Success",
                            text: JSON.stringify({
                                Details: "OTP Matched",
                                Status: "Success",
                            }),
                        };
                    }
                },
            });
        } catch (error) {
            Logger.error(`ERROR IN 2FACTOR SERVICE ${error}`);
        }
        return service;
    },
};
