'use strict';

var server = require('server');
server.extend(module.superModule);

var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var ProductList = require('dw/customer/ProductList');
var PAGE_SIZE_ITEMS = 15;

/**
 * Wishlist-GetListProducts : This route is responsible for retreiving the list of products in the current customer wishlist
 * @function
 * @memberof Wishlist
 * @name Wishlist-GetListProducts
 * @param {httpparameter} - publicview
 * @param {httpparameter} - pageNumber
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('GetListProducts', function(req, res, next) {
    var collections = require('*/cartridge/scripts/util/collections');
    var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');
    var list = productListHelper.getCurrentOrNewList(req.currentCustomer.raw, { type: 10 });
    var productIds = [];

    if (list && list.items && list.items.length > 0) {
        collections.forEach(list.items, function (item) {
            var productId = item.productID;
            productIds.push(productId);
        });
    }
    res.print('<span class="wishlistProducts" data-productids="' + productIds + '"></span>');
    next();
});

/**
 * Wishlist-GetListProducts : The Wishlist-GetListProducts endpoint will send the product removed message
 */
server.append('RemoveProduct', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var viewData = res.getViewData();
    if (viewData.success) {
        viewData.msg = Resource.msg('wishlist.removefromwishlist.success.msg', 'product', null)
    }
    res.setViewData(viewData);
    next();
});

server.replace('Show', consentTracking.consent, server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 10 });
    var WishlistModel = require('*/cartridge/models/productList');
    var userName = '';
    var firstName;
    var rememberMe = false;
    if (req.currentCustomer.credentials) {
        rememberMe = true;
        userName = req.currentCustomer.credentials.username;
    }
    var loggedIn = req.currentCustomer.profile;

    var target = req.querystring.rurl || 1;
    var actionUrl = URLUtils.url('Account-Login');
    var createAccountUrl = URLUtils.url('Account-SubmitRegistration', 'rurl', target).relative().toString();
    var navTabValue = req.querystring.action;
    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        }
    ];
    if (loggedIn) {
        firstName = req.currentCustomer.profile.firstName;
        breadcrumbs.push({
            htmlValue: Resource.msg('page.title.myaccount', 'account', null),
            url: URLUtils.url('Account-Show').toString()
        });
    }

    var profileForm = server.forms.getForm('profile');
    profileForm.clear();
    var wishlistModel = new WishlistModel(
        list,
        {
            type: 'wishlist',
            publicView: false,
            pageSize: PAGE_SIZE_ITEMS,
            pageNumber: 1
        }
    ).productList;

    var context = {
        template: 'wishlist/wishlistLanding',
        wishlist: wishlistModel,
        navTabValue: navTabValue || 'login',
        rememberMe: rememberMe,
        userName: userName,
        actionUrl: actionUrl,
        actionUrls: {
            updateQuantityUrl: ''
        },
        profileForm: profileForm,
        breadcrumbs: breadcrumbs,
        oAuthReentryEndpoint: 1,
        loggedIn: loggedIn,
        firstName: firstName,
        socialLinks: loggedIn,
        publicOption: loggedIn,
        createAccountUrl: createAccountUrl,
        display: {
            ratings: true
        }
    }
    res.setViewData(context);

    this.on('route:BeforeComplete', function (req, res) {
        var viewData = res.getViewData();
        if (req.querystring.renderPage === 'true') {
            res.render('wishlist/wishlistLanding', {viewData: viewData});
        } else {
            var renderedTemplate = renderTemplateHelper.getRenderedHtml(viewData, viewData.template);
            res.json({
                renderedTemplate: renderedTemplate
            });
        }
    });
    next();
});

server.append('MoreList', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.display = {
        ratings: true
    }
    res.setViewData(viewData);
    next();
});

module.exports = server.exports();
