'use strict';

var server = require('server');
server.extend(module.superModule);

var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Creates a list of address model for the logged in user
 * @param {string} customerNo - customer number of the current customer
 * @returns {List} a plain list of objects of the current customer's addresses
 */
function getList(customerNo) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var AddressModel = require('*/cartridge/models/address');
    var collections = require('*/cartridge/scripts/util/collections');

    var customer = CustomerMgr.getCustomerByCustomerNumber(customerNo);
    var rawAddressBook = customer.addressBook.getAddresses();
    var addressBook = collections.map(rawAddressBook, function (rawAddress) {
        var addressModel = new AddressModel(rawAddress);
        addressModel.address.UUID = rawAddress.UUID;
        return addressModel;
    });
    return addressBook;
}

/**
 * Address-List : Used to show a list of address created by a registered shopper
 * @name Base/Address-List
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');

    var actionUrls = {
        deleteActionUrl: URLUtils.url('Address-DeleteAddress').toString(),
        listActionUrl: URLUtils.url('Address-List').toString()
    };
    var accountModel = accountHelpers.getAccountModel(req);
    var context = {
        addressBook: getList(req.currentCustomer.profile.customerNo),
        account: accountModel,
        actionUrls: actionUrls,
        template: 'account/addressBook',
        addressBookView: true
    }
    res.setViewData(context);

    this.on('route:BeforeComplete', function (req, res) {
        var viewData = res.getViewData();
        var renderedTemplate = renderTemplateHelper.getRenderedHtml(viewData, viewData.template);
        if (req.querystring.renderPage === 'true') {
            res.render('account/addressBook', {viewData: viewData});
        } else {
            res.json({
                renderedTemplate: renderedTemplate
            });
        }
    });
    next();
});

/**
 * Address-AddAddress : A link to a page to create a new address
 * @name Base/Address-AddAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace(
    'AddAddress',
    csrfProtection.generateToken,
    consentTracking.consent,
    userLoggedIn.validateLoggedInAjax,
    function (req, res, next) {
        var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

        var data = res.getViewData();
        if (data && !data.loggedin) {
            res.json();
            return next();
        }

        var addressForm = server.forms.getForm('address');
        addressForm.clear();

        var context = {
            addressForm: addressForm,
            template: 'account/editAddAddress'
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
 * Address-EditAddress : A link to edit and existing address
 * @name Base/Address-EditAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace(
    'EditAddress',
    csrfProtection.generateToken,
    userLoggedIn.validateLoggedInAjax,
    consentTracking.consent,
    function (req, res, next) {
        var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

        var data = res.getViewData();
        if (data && !data.loggedin) {
            res.json();
            return next();
        }

        var CustomerMgr = require('dw/customer/CustomerMgr');
        var AddressModel = require('*/cartridge/models/address');

        var addressId = req.querystring.addressId;
        var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );
        var addressBook = customer.getProfile().getAddressBook();
        var rawAddress = addressBook.getAddress(addressId);
        var addressModel = new AddressModel(rawAddress);
        var addressForm = server.forms.getForm('address');
        addressForm.clear();

        addressForm.copyFrom(addressModel.address);

        var context = {
            template: 'account/editAddAddress',
            addressForm: addressForm,
            addressId: addressId
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
 * Address-SaveAddress : Save a new or existing address
 * @name Base/Address-SaveAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {httpparameter} - dwfrm_address_addressId - An existing address id (unless new record)
 * @param {httpparameter} - dwfrm_address_firstName - A person’s first name
 * @param {httpparameter} - dwfrm_address_lastName - A person’s last name
 * @param {httpparameter} - dwfrm_address_address1 - A person’s street name
 * @param {httpparameter} - dwfrm_address_address2 -  A person’s apartment number
 * @param {httpparameter} - dwfrm_address_country - A person’s country
 * @param {httpparameter} - dwfrm_address_states_stateCode - A person’s state
 * @param {httpparameter} - dwfrm_address_city - A person’s city
 * @param {httpparameter} - dwfrm_address_postalCode - A person’s united states postel code
 * @param {httpparameter} - dwfrm_address_phone - A person’s phone number
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var formErrors = require('*/cartridge/scripts/formErrors');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    var addressForm = server.forms.getForm('address');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    if (addressForm.valid) {
        res.setViewData(addressFormObj);
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            var formInfo = res.getViewData();
            Transaction.wrap(function () {
                var address = null;
                if (formInfo.addressId.equals(req.querystring.addressId) || !addressBook.getAddress(formInfo.addressId)) {
                    address = req.querystring.addressId
                        ? addressBook.getAddress(req.querystring.addressId)
                        : addressBook.createAddress(formInfo.addressId);
                }

                if (address) {
                    if (req.querystring.addressId) {
                        address.setID(formInfo.addressId);
                    }

                    // Save form's address
                    addressHelpers.updateAddressFields(address, formInfo);

                    // Send account edited email
                    accountHelpers.sendAccountEditedEmail(customer.profile);

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Address-List', 'renderPage', true).toString()
                    });
                } else {
                    formInfo.addressForm.valid = false;
                    formInfo.addressForm.addressId.valid = false;
                    formInfo.addressForm.addressId.error =
                        Resource.msg('error.message.idalreadyexists', 'forms', null);
                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(addressForm)
                    });
                }
            });
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(addressForm)
        });
    }
    return next();
});

/**
 * Address-SetDefault : Set an address to be the default address
 * @name Base/Address-SetDefault
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.replace('SetDefault', userLoggedIn.validateLoggedIn, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var addressId = req.querystring.addressId;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        Transaction.wrap(function () {
            addressBook.setPreferredAddress(address);
        });

        // Send account edited email
        accountHelpers.sendAccountEditedEmail(customer.profile);

        res.redirect(URLUtils.url('Address-List', 'renderPage', true));
    });
    next();
});

module.exports = server.exports();
