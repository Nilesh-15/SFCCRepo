'use strict';

var server = require('server');
server.extend(module.superModule);
var cache = require('*/cartridge/scripts/middleware/cache');

server.append('Show', function (req, res, next) {
    var Site = require('dw/system/Site');
    var preferences = require('*/cartridge/config/preferences.js');

    // AC-41: Buy Now feature
    var viewData = res.getViewData();
    viewData.enableBuyNow = preferences.enableBuyNow;

    next();
});

/**
 * Product-TileQuickView : This endpoint is called when a product quick view button is clicked
 * @function
 * @memberof Product
 * @param {middleware} - cache.applyPromotionSensitiveCache
 * @param {querystringparameter} - pid - Product ID
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('TileQuickView', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var ProductFactory = require('*/cartridge/scripts/factories/product');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var Resource = require('dw/web/Resource');

    var params = req.querystring;
    var product = ProductFactory.get(params);
    var addToCartUrl = URLUtils.url('Cart-AddProduct');
    var template = 'product/tilePreview.isml';

    var context = {
        product: product,
        addToCartUrl: addToCartUrl,
        resources: productHelper.getResources(),
        quickViewFullDetailMsg: Resource.msg('link.quickview.viewdetails', 'product', null),
        closeButtonText: Resource.msg('link.quickview.close', 'product', null),
        enterDialogMessage: Resource.msg('msg.enter.quickview', 'product', null),
        template: template,
        productUrl: URLUtils.url('Product-Show', 'pid', product.id).relative().toString()
    };

    res.setViewData(context);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();
        var renderedTemplate = renderTemplateHelper.getRenderedHtml(viewData, viewData.template);

        res.json({
            renderedTemplate: renderedTemplate,
        });
    });

    next();
});

module.exports = server.exports();
