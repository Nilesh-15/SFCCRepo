window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(function(e){
    processInclude(require('base/components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('base/components/footer'));
    processInclude(require('base/components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('base/components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('base/components/toolTip'));
    try {
        processInclude(require("int_login_with_otp/login/login"));
    } catch (err) {
        console.log("Error With Login with OTP");
    }
});

require('base/thirdParty/bootstrap');
require('base/components/spinner');
