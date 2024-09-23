"use-strict";
let OTPService = require("*/cartridge/scripts/services/2factor");
const SERVICE_OTP_GEN = "service.2factor.send.otp";
const SERVICE_OTP_VERIFY = "service.2factor.verify.otp";
let Preferences = require("*/cartridge/config/preferences");
var StringUtils = require("dw/util/StringUtils");
var Resource = require("dw/web/Resource");

/**
 * Initiate the sending of a One-Time Password (OTP) to the customer to facilitate the login process.
 * @param {string} mobileNumber - Customer phone number for login
 * @param {string} otpTemplate - OTP template
 * @returns
 */

function triggerOTP(mobileNumber, otpTemplate) {
    if (empty(Preferences.apiKey) || Preferences.apiKey === null) {
        let error = {
            success: false,
            msg: Resource.msg("login.service.api.key.missing", "login", null),
        };
        return error;
    }
    let result = null;
    let service = OTPService.triggerOTPService(SERVICE_OTP_GEN);
    let serviceURL = StringUtils.format(
        service.getURL(),
        Preferences.apiKey,
        mobileNumber,
        otpTemplate
    );

    service.setURL(serviceURL);
    result = service.call();
    return result;
}

/**
 * Verify the OTP entered by the customer.
 * @param {Number} otp - The one-time password (OTP) is sent to the customer's registered phone number for login.
 * @param {String} otpSessionID :
 * @returns
 */
function validateOTP(otp, otpSessionID) {
    if (Preferences.apiKey == null) {
        return {
            error: true,
            msg: Resource.msg("otp-api-missing", "login", null),
        };
    }
    var service = OTPService.triggerOTPService("service.2factor.verify.otp");
    var serviceURL = StringUtils.format(
        service.getURL(),
        Preferences.apiKey,
        otpSessionID,
        otp
    );
    service.setURL(serviceURL);
    var result = service.call();
    return result;
}

module.exports = {
    triggerOTP: triggerOTP,
    validateOTP: validateOTP,
};
