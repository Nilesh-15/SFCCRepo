var base = module.superModule;

base.getPageDesignerCategoryPage = function (categoryID) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var PageMgr = require('dw/experience/PageMgr');
    var HashMap = require('dw/util/HashMap');

    var category = CatalogMgr.getCategory(categoryID.toLowerCase());
    var page = PageMgr.getPage(category, true, 'plp');
    var invisiblePage = PageMgr.getPage(category, false, 'plp');
    
    if(category.products.empty){
        page = PageMgr.getPage(category, true, 'clp');
        invisiblePage = PageMgr.getPage(category, false, 'clp');
    }

    if (page) {
        var aspectAttributes = new HashMap();
        aspectAttributes.category = category;
        return {
            page: page,
            invisiblePage: page.ID !== invisiblePage.ID ? invisiblePage : null,
            aspectAttributes: aspectAttributes
        };
    }
    return {
        page: null,
        invisiblePage: invisiblePage,
        aspectAttributes: null
    };
}
module.exports = base;