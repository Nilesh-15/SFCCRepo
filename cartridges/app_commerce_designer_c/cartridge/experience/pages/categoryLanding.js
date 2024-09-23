'use strict';
/* global request, response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var page = context.page;
    model.page = page;
    var content = context.content;

    if(context.renderParameters){ 
    var render = JSON.parse(context.renderParameters);
    model.queryString = render.queryString;
    model.action = render.action;
    }

    if (content.category) {
        var categoryId = content.category.ID;
        var ProductSearchModel = require('dw/catalog/ProductSearchModel');
        var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        var apiProductSearch = new ProductSearchModel();
        var params = { cgid: categoryId };
        apiProductSearch = searchHelper.setupSearch(apiProductSearch, params);
        // we do not need to execute the search, that is handled by a component, we just need the meta tags
        pageMetaHelper.setPageMetaTags(request.pageMetaData, apiProductSearch);        
    }

    model.classCategory = content.category.ID ? content.category.ID + "__clp" : "No_custom_class";

    // automatically register configured regions
    model.regions = PageRenderHelper.getRegionModelRegistry(page);

    if (PageRenderHelper.isInEditMode()) {
        var HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    var expires = new Date();
    expires.setHours(expires.getHours() + 1); // this handles overflow automatically
    response.setExpires(expires);

    model.CurrentPageMetaData = PageRenderHelper.getPageMetaData(page);

    // render the page
    return new Template('experience/pages/categoryLanding').render(model).text;
};
