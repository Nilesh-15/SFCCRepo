window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('base/components/footer'));
    processInclude(require('app_merge/components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('base/components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('app_merge/product/wishlistHeart'));
    processInclude(require('app_merge/components/wishlist'));
    processInclude(require('app_merge/components/slickSlider'));
    
    try {
        processInclude(require("int_login_with_otp/login/login"));
    } catch (err) {
        console.log("Error With Login with OTP",err);
    }

});

require("slick-carousel");
require("base/thirdParty/bootstrap");
require("base/components/spinner");
