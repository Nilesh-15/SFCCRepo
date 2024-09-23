'use strict';

var server = require('server');
server.extend(module.superModule);

var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Order-History : This endpoint is invoked to get Order History for the logged in shopper
 * @name Base/Order-History
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.replace(
    'History',
    consentTracking.consent,
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var OrderHelpers = require('*/cartridge/scripts/order/orderHelpers');
        var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
        var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');

        var ordersResult = OrderHelpers.getOrders(
            req.currentCustomer,
            req.querystring,
            req.locale.id
        );
        var orders = ordersResult.orders;
        var filterValues = ordersResult.filterValues;
        var accountModel = accountHelpers.getAccountModel(req);

        var context = {
            account: accountModel,
            orders: orders,
            filterValues: filterValues,
            orderFilter: req.querystring.orderFilter,
            accountlanding: false,
            template: 'account/order/history'
        }
        res.setViewData(context);

        this.on('route:BeforeComplete', function (req, res) {
            var viewData = res.getViewData();
            var renderedTemplate = renderTemplateHelper.getRenderedHtml(viewData, viewData.template);
            if (req.querystring.renderPage === 'true') {
                res.render('account/order/history', {viewData: viewData});
            } else {
                res.json({
                    renderedTemplate: renderedTemplate
                });
            }
        });
        next();
    }
);

module.exports = server.exports();
