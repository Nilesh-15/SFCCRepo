'use strict';

var server = require('server');
server.extend(module.superModule);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Account-Show : The Account-Show endpoint will render the shopper's account page. Once a shopper logs in they will see is a dashboard that displays profile, address, payment and order information.
 * @name Base/Account-Show
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - registration - A flag determining whether or not this is a newly registered account
 * @param {category} - senstive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace(
    'Show',
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    consentTracking.consent,
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');
        var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
        var reportingURLs;

        // Get reporting event Account Open url
        if (req.querystring.registration && req.querystring.registration === 'submitted') {
            reportingURLs = reportingUrlsHelper.getAccountOpenReportingURLs(
                CustomerMgr.registeredCustomerCount
            );
        }

        var accountModel = accountHelpers.getAccountModel(req);

        res.render('account/accountDashboard', {
            account: accountModel,
            accountlanding: true,
            reportingURLs: reportingURLs,
            payment: accountModel.payment,
            viewSavedPaymentsUrl: URLUtils.url('PaymentInstruments-List').toString(),
            addPaymentUrl: URLUtils.url('PaymentInstruments-AddPayment').toString()
        });
        next();
    }
);

/**
 * Account-EditProfile : The Account-EditProfile endpoint renders the page that allows a shopper to edit their profile. The edit profile form is prefilled with the shopper's first name, last name, phone number and email
 * @name Base/Account-EditProfile
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace(
    'EditProfile',
    server.middleware.https,
    csrfProtection.generateToken,
    userLoggedIn.validateLoggedIn,
    consentTracking.consent,
    function (req, res, next) {
        var ContentMgr = require('dw/content/ContentMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');
        var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

        var accountModel = accountHelpers.getAccountModel(req);
        var content = ContentMgr.getContent('tracking_hint');
        var profileForm = server.forms.getForm('profile');
        profileForm.clear();
        profileForm.customer.firstname.value = accountModel.profile.firstName;
        profileForm.customer.lastname.value = accountModel.profile.lastName;
        profileForm.customer.phone.value = accountModel.profile.phone;
        profileForm.customer.email.value = accountModel.profile.email;

        var context = {
            template: 'account/profile',
            consentApi: Object.prototype.hasOwnProperty.call(req.session.raw, 'setTrackingAllowed'),
            caOnline: content ? content.online : false,
            profileForm: profileForm
        }
        res.setViewData(context);

        this.on('route:BeforeComplete', function (req, res) {
            var viewData = res.getViewData();
            var renderedTemplate = renderTemplateHelper.getRenderedHtml(viewData, viewData.template);
            res.json({
                renderedTemplate: renderedTemplate
            });
        });
        next();
    }
);

/**
 * Account-SaveProfile : The Account-SaveProfile endpoint is the endpoint that gets hit when a shopper has edited their profile
 * @name Account-SaveProfile
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_customer_emailconfirm - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password  - Input field for the shopper's password
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensititve
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace(
    'SaveProfile',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Transaction = require('dw/system/Transaction');
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
        var emailHelpers = require("*/cartridge/scripts/helpers/emailHelpers");

        var formErrors = require('*/cartridge/scripts/formErrors');

        var profileForm = server.forms.getForm('profile');

        var result = {
            firstName: profileForm.customer.firstname.value,
            lastName: profileForm.customer.lastname.value,
            email: profileForm.customer.email.value,
            profileForm: profileForm
        };
        if (profileForm.valid) {
            res.setViewData(result);
            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var formInfo = res.getViewData();
                var customer = CustomerMgr.getCustomerByCustomerNumber(
                    req.currentCustomer.profile.customerNo
                );
                var profile = customer.getProfile();
                if (profile) {
                    var emailType = emailHelpers.emailTypes.accountEdited;
                    if (
                        profile.getFirstName() + profile.getLastName() !=
                        formInfo.firstName + formInfo.lastName
                    ) {
                        emailType = emailHelpers.emailTypes.accountNameChanged;
                    }
                    if (profile.getEmail() != formInfo.email) {
                        emailType = emailHelpers.emailTypes.accountEmailChanged;
                    }

                    Transaction.wrap(function () {
                        profile.setFirstName(formInfo.firstName);
                        profile.setLastName(formInfo.lastName);
                        profile.setEmail(formInfo.email);
                        if (!empty(formInfo.birthday)) {
                            profile.birthday = new Date(formInfo.birthday);
                        }
                        if (!empty(formInfo.anniversary)) {
                            profile.custom.anniversary = new Date(
                                formInfo.anniversary
                            );
                        }
                    });
                    // Send account edited email
                    accountHelpers.sendAccountEditedEmail(
                        customer.profile,
                        emailType
                    );

                    delete formInfo.profileForm;
                    delete formInfo.email;
                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url("Account-Show").toString(),
                    });
                } else {
                    delete formInfo.profileForm;
                    delete formInfo.email;
                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(profileForm),
                    });
                }
            });
        } else {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(profileForm)
            });
        }
        return next();
    }
);

/**
 * Account-SaveProfile : The Account-Profile endpoint is the endpoint that gets hit when a shopper has selected profile details from navigation
 */
server.get(
    'Profile',
    server.middleware.https,
    userLoggedIn.validateLoggedInAjax,
    consentTracking.consent,
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');
        var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
        var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
        var reportingURLs;

        var data = res.getViewData();
        if (data && !data.loggedin) {
            res.json();
            return next();
        }

        // Get reporting event Account Open url
        if (req.querystring.registration && req.querystring.registration === 'submitted') {
            reportingURLs = reportingUrlsHelper.getAccountOpenReportingURLs(
                CustomerMgr.registeredCustomerCount
            );
        }

        var accountModel = accountHelpers.getAccountModel(req);

        var context = {
            template: 'account/accountDashboard',
            account: accountModel,
            accountlanding: true
        }
        res.setViewData(context);

        this.on('route:BeforeComplete', function (req, res) {
            var viewData = res.getViewData();
            var renderedTemplate = renderTemplateHelper.getRenderedHtml(viewData, viewData.template);
            res.json({
                renderedTemplate: renderedTemplate
            });
        });
        next();
    }
);

module.exports = server.exports();
