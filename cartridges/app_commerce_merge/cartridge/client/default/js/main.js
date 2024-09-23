window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(function(e){
    processInclude(require('base/components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('base/components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('base/components/toolTip'));
    processInclude(require('./product/wishlistHeart'));
    processInclude(require('./components/wishlist'));
    processInclude(require('./components/slickSlider'));

    try {
        processInclude(require("int_login_with_otp/login/login"));
    } catch (err) {
        console.log("Error With Login with OTP",err);
    }
    try {
        processInclude(require('plugin_gtm/tagmanager'));
    } catch (error) {
        console.log('plugin-gtm', error);
    }
    try {
        processInclude(require('app_account_widgets/profile/profile'));
    } catch (error) {
        console.log('Error in profile.js', error);
    }
});

require("slick-carousel");
require('base/thirdParty/bootstrap');
require('base/components/spinner');
