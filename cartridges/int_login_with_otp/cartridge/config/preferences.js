"use-strict";
let Site = require("dw/system/Site");
let base = module.superModule;
Object.defineProperty(base, "apiKey", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("2factorAPIKey"),
});
Object.defineProperty(base, "resendOtpTimer", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("resendOtpTimer"),
});
Object.defineProperty(base, "loginOtpTemplate", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("loginOtpTemplate"),
});
Object.defineProperty(base, "mobileAuthProvider", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("mobileAuthProvider"),
});
module.exports = base;
