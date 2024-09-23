'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var ProductFactory = require('*/cartridge/scripts/factories/product');

module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var component = context.component;
    var product = context.content.product;
    var params = { pid: product.ID };

    model.isOnline = context.content.isOnline ? context.content.isOnline : null;
    model.product = ProductFactory.get(params);

    if(model.product) {
        model.addToCartUrl = URLUtils.url('Cart-AddProduct');
        model.canonicalUrl = URLUtils.url('Product-Show', 'pid', model.product.id);
    }

    var template = new Template('experience/components/custom_assets/productBanner');

    return template.render(model).text;
};
