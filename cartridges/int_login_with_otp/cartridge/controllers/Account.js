let server = require("server");
server.extend(module.superModule);

let csrfProtection = require("*/cartridge/scripts/middleware/csrf");
let userLoggedIn = require("*/cartridge/scripts/middleware/userLoggedIn");
let CustomerMgr = require("dw/customer/CustomerMgr");
var accountHelpers = require("*/cartridge/scripts/helpers/accountHelpers");
let Resource = require("dw/web/Resource");
let smsHelper = require("*/cartridge/scripts/helpers/smsHelper");
let apiCsrfProtection = require("dw/web/CSRFProtection");
let URLUtils = require("dw/web/URLUtils");
let renderTemplateHelper = require("*/cartridge/scripts/renderTemplateHelper");
let Preferences = require("*/cartridge/config/preferences");

const LOGIN_OTP_TEMPLATE = Preferences.loginOtpTemplate;
const mobileOauthProviderID = Preferences.mobileAuthProvider;
const emailOauthProviderID = "Email";
let isRegister = false;

/**
 * Account-SendOTP : The Account-Login endpoint will transmit the one-time password (OTP) to the shopper's mobile number, facilitating the login process for the shopper's account.
 */
server.post("SendOTP", server.middleware.https, function (req, res, next) {
    let target = req.querystring.rurl || 1;
    let otploginForm = server.forms.getForm("login");
    let phoneNumber = otploginForm.phonenumber.value;
    let otpFormTemplate = "account/components/otpForm";
    let actionURL = URLUtils.url("Account-Login", "rurl", target).toString();
    let resendOTP = URLUtils.url("Account-ResendOTP").toString();
    let oAuthReentryEndpoint = req.session.privacyCache.get("rurl");

    if (empty(phoneNumber)) {
        res.json({
            success: false,
            msg: Resource.msg(
                "error.login.mobile.number.missing",
                "login",
                null
            ),
        });
        return next();
    }

    var authenticatedCustomerProfile =
        CustomerMgr.getExternallyAuthenticatedCustomerProfile(
            mobileOauthProviderID,
            phoneNumber
        );

    if (!authenticatedCustomerProfile) {
        res.json({
            success: false,
            msg: Resource.msg("error.dont.have.account", "login", null),
        });
        return next();
    }

    let result = smsHelper.triggerOTP(phoneNumber, LOGIN_OTP_TEMPLATE);
    if (result.status !== "OK" || result.error) {
        res.json({
            success: false,
            msg: result.msg,
        });
        return next();
    }

    let response = JSON.parse(result.object);
    let otpSessionID = response.Details;
    req.session.privacyCache.set("otpSessionID", otpSessionID);
    req.session.privacyCache.set("customerMobile", phoneNumber);
    let csrf = {
        tokenName: apiCsrfProtection.getTokenName(),
        token: apiCsrfProtection.generateToken(),
    };
    const maskedPhoneNumber = maskPhoneNumber(phoneNumber);
    otploginForm.clear();
    let otpReq = {
        actionUrl: actionURL,
        isMockService: result.mockResult,
        resendOTP: resendOTP,
        csrf: csrf,
        phonenumber: phoneNumber,
        otploginForm: otploginForm,
        otpTimer: Preferences.resendOtpTimer,
        maskedPhoneNumber: maskedPhoneNumber,
        headerTitle: Resource.msg("label.welcome.back", "login", null),
    };

    res.json({
        success: true,
        otpFormTemplate: renderTemplateHelper.getRenderedHtml(
            otpReq,
            otpFormTemplate
        ),
    });
    return next();
});

/**
 * Account-Login : The Account-Login endpoint will render the shopper's account page. Once a shopper logs in they will see is a dashboard that displays profile, address, payment and order information.
 */
server.replace(
    "Login",
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Transaction = require("dw/system/Transaction");

        var oauthProviderID = "";
        var otppin = req.form.otp;
        var phoneNumber = req.form.phonenumber;
        var fName = req.form.firstname;
        var lName = req.form.lastname;
        var userEmail = req.form.email;
        var isRegister = req.form.isregister;

        var authenticatedCustomerProfile =
            CustomerMgr.getExternallyAuthenticatedCustomerProfile(
                mobileOauthProviderID,
                phoneNumber
            );

        // if (!authenticatedCustomerProfile) {
        //     res.json({
        //         success: false,
        //         error: Resource.msg("error.dont.have.account", "login", null),
        //     });
        //     return next();
        // }

        if (otppin == null) {
            res.json({
                success: false,
                error: Resource.msg("otp.verify.error", "login", null),
            });
            return next();
        }

        var otpSessionID = req.session.privacyCache.get("otpSessionID");
        var rurl = req.session.privacyCache.get("rurl");
        var result = smsHelper.validateOTP(otppin, otpSessionID);
        var responseObj = JSON.parse(result.object);

        // valid = true;
        if(responseObj && responseObj.Status == 'Success' && responseObj.Details == 'OTP Matched'){
            if (!authenticatedCustomerProfile) {
                // Create new profile
                Transaction.wrap(function () {
                    var newCustomer = CustomerMgr.createExternallyAuthenticatedCustomer(
                        mobileOauthProviderID,
                        phoneNumber
                    );
        
                    authenticatedCustomerProfile = newCustomer.getProfile();
                    var firstName;
                    var lastName;
                    var email;
                    
                    firstName = fName;
                    lastName = lName;
                    email = userEmail;
    
                    authenticatedCustomerProfile.setFirstName(firstName);
                    authenticatedCustomerProfile.setLastName(lastName);
                    authenticatedCustomerProfile.setEmail(email);
                    authenticatedCustomerProfile.setPhoneHome(phoneNumber);
                });
        
        
                var credentials = authenticatedCustomerProfile.getCredentials();
                if (credentials.isEnabled()) {
                    Transaction.wrap(function () {
                        CustomerMgr.loginExternallyAuthenticatedCustomer(mobileOauthProviderID, phoneNumber, false);
                    });
                } else {
                    res.render('/error', {
                        message: Resource.msg('error.oauth.login.failure', 'login', null)
                    });
            
                    return next();
                }
                accountHelpers.sendCreateAccountEmail(authenticatedCustomerProfile);
                res.json({
                    success: true,
                    redirectUrl: accountHelpers.getLoginRedirectURL(req.querystring.rurl, req.session.privacyCache, true)
                });
                return next();
        
            }else{
                Transaction.wrap(function(){
                    CustomerMgr.loginExternallyAuthenticatedCustomer(mobileOauthProviderID, phoneNumber, false);
                })
                res.json({
                    success: true,
                    redirectUrl: accountHelpers.getLoginRedirectURL(
                        req.querystring.rurl,
                        req.session.privacyCache,
                        false
                    ),
                    pageReload: rurl == 3 ? true : false
                });
            }
        }else{
            res.json({
                success: false,
                msg : responseObj != null ? Resource.msg('error.otp.expired', 'login', null) : Resource.msg('login.verifyotp.error', 'login', null)
            });
        }
        return next();
    }
);

/**
 * Account-ResendOTP : The Account-ResendOTP endpoint is designed to resend the OTP to the Shopper's mobile number.
 */
server.get("ResendOTP", function (req, res, next) {
    let mobileNumber = req.session.privacyCache.get("customerMobile");
    let fullNumber = "";
    if (mobileNumber == null) {
        fullNumber = req.querystring.phone;
    } else {
        fullNumber = mobileNumber;
    }

    let result = smsHelper.triggerOTP(fullNumber, LOGIN_OTP_TEMPLATE);
    if (result.error) {
        res.json({ success: false, error: result.msg });
        return next();
    }
    let response = JSON.parse(result.object);

    if (response && response.Status == "Success") {
        let otpSessionID = response.Details;
        req.session.privacyCache.set("otpSessionID", otpSessionID);
        req.session.privacyCache.set("customerMobile", fullNumber);
        res.json({ success: true });
    } else {
        res.josn({ success: false, error: result.error });
    }
    return next();
});


server.get("Register", function (req, res, next) {
    var apiCsrfProtection = require("dw/web/CSRFProtection");
    var renderTemplateHelper = require("*/cartridge/scripts/renderTemplateHelper");
    var registerForm = server.forms.getForm("register");
    registerForm.clear();

    let registerUrl = URLUtils.url("Account-HandleCustomerRegistration", "rurl", req.querystring.rurl);
    var csrf = {
        tokenName: apiCsrfProtection.getTokenName(),
        token: apiCsrfProtection.generateToken(),
    };

    var registerReq = {
        registerForm: registerForm,
        registerUrl: registerUrl,
        csrf: csrf,
    };
    var registrationTemplate = "/account/components/registrationForm";
    res.json({
        success: true,
        modalTemplate: renderTemplateHelper.getRenderedHtml(
            registerReq,
            registrationTemplate
        ),
        headerTitle: Resource.msg("login.new.user.heading", "login", null),
    });
    return next();
});


function maskPhoneNumber(phoneNumber) {
    // Convert the phone number to a string
    let numString = phoneNumber.toString();
    // Check if the phone number has at least 6 digits
    if (numString.length >= 6) {
        // Calculate the start and end indices for the middle 6 digits
        const startIndex = Math.floor((numString.length - 6) / 2);
        const endIndex = startIndex + 6;

        // Replace the middle 6 digits with asterisks
        numString =
            numString.substring(0, startIndex) +
            "XXXXXX" +
            numString.substring(endIndex);
    } else {
        // If the phone number has less than 6 digits, mask the entire number
        numString = "XXXXXX";
    }

    return numString;
}


server.post(
    "HandleCustomerRegistration",
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Transaction = require("dw/system/Transaction");
        var emailHelper = require('*/cartridge/scripts/helpers/emailHelpers');
        
        var registerForm = server.forms.getForm("register");
        var target = req.querystring.rurl || 1;

        var firstname = registerForm.customer.firstname.value;
        var lastname = registerForm.customer.lastname.value;
        var email = registerForm.customer.email.value;
        var mobileNo = registerForm.customer.phonenumber.value;

        var isValidEmailid = emailHelper.validateEmail(email);
        if(!isValidEmailid){
            res.json({
                success: false,
                msg: Resource.msg('subscribe.to.contact.us.email.invalid', 'login', null),
                isValidEmailid: isValidEmailid
            });
            return next();
        }

        var authenticatedCustomerProfile =
        CustomerMgr.getExternallyAuthenticatedCustomerProfile(
            mobileOauthProviderID,
            mobileNo
        );

        if (authenticatedCustomerProfile) {
            res.json({
                success: false,
                error: Resource.msg("error.mobile.already.register", "login", null),
            });
            return next();
        }

        var customerEmail = CustomerMgr.searchProfile('email={0}',email);
        if(customerEmail != null){
            res.json({
                success: false,
                error: Resource.msg("error.email.already.register", "login", null),
            });
            return next();
        }

        var result = smsHelper.triggerOTP(mobileNo,LOGIN_OTP_TEMPLATE);
        if(result.error){
            res.json({"success":false, "error":result.msg});
            return next();
        }

        const maskedPhoneNumber = maskPhoneNumber(mobileNo);
        var response = JSON.parse(result.object);
        if(response.Status == 'Success'){

            var otpExpireTime = new Date();
            otpExpireTime.setMinutes(otpExpireTime.getMinutes() + 2 );
            var otpSessionID = response.Details;
            req.session.privacyCache.set('otpSessionID',otpSessionID);
            req.session.privacyCache.set('phonenumber',mobileNo);
            var actionUrl = URLUtils.url('Account-Login', 'rurl', target);
            var resendOTP = URLUtils.url('Account-ResendOTP');
            // var privacyURL = URLUtils.url('Page-Show','cid','privacy-policy');
            var privacyURL = Resource.msg('login.modal.privacy.policy','account',null);
            var termURL = URLUtils.url('Page-Show','cid','terms-and-conditions');

            var csrf =  {
                tokenName: apiCsrfProtection.getTokenName(), 
                token: apiCsrfProtection.generateToken() 
            }
            var otploginForm = server.forms.getForm('login');
            otploginForm.clear();
            var loginReq = {
                actionUrl : actionUrl,
                firstname:firstname,
                lastname:lastname,
                email:email,
                resendOTP:resendOTP,
                csrf:csrf,
                otploginForm:otploginForm,
                phonenumber:mobileNo,
                maskedPhoneNumber:maskedPhoneNumber,
                isRegister:true,
                otpTimer: Preferences.resendOtpTimer,
                oAuthReentryEndpoint:req.session.privacyCache.get('rurl')
            }    
            var otpTemplate = '/account/components/otpForm';
            res.json({
                success:true,
                modalTemplate:renderTemplateHelper.getRenderedHtml(loginReq,otpTemplate)
            });

        }else{
            res.json({'error':true, 'msg':response.Details})
        }
        return next();
        
    }
);

module.exports = server.exports();
