"use strict";

var BLP = {
    template: "experience/pages/blogLandingPage",
};

// Getting id from site preferences
BLP.getParams = function () {
    var preferences = require("*/cartridge/config/preferences");
    var blogSearchKeyword = preferences.blogSearchKeyword;
    var blogFolderID = preferences.blogFolderId;
    var params;
    if (!empty(blogFolderID)) {
        params = {
            blogFolderID: blogFolderID || null,
        };
    } else {
        params = {
            key: blogSearchKeyword || null,
        };
    }
    return params;
};

BLP.getModel = function (context) {
    var HashMap = require("dw/util/HashMap");
    var Resource = require('dw/web/Resource');
    var PageRenderHelper = require("*/cartridge/experience/utilities/PageRenderHelper.js");
    var RegionModelRegistry = require("*/cartridge/experience/utilities/RegionModelRegistry.js");
    var searchHelper = require("*/cartridge/scripts/helpers/searchHelpers");

    var model = new HashMap();
    var page = context.page;
    model.page = page;

    var metaDefinition = require("*/cartridge/experience/pages/blogLandingPage.json");
    model.regions = new RegionModelRegistry(page, metaDefinition);

    model.CurrentPageMetaData = PageRenderHelper.getPageMetaData(page);
    model.CurrentPageMetaData = {};
    model.CurrentPageMetaData.title = page.pageTitle;
    model.CurrentPageMetaData.description = page.pageDescription;
    model.CurrentPageMetaData.keywords = page.pageKeywords;
    if (!PageRenderHelper.isInEditMode() && page != null && page.isVisible()) {
        if (!page.hasVisibilityRules()) {
            var currentTime = new Date(Date.now());
            currentTime.setHours(currentTime.getHours());
            response.setExpires(currentTime);
        }
    }
    if (PageRenderHelper.isInEditMode()) {
        var HookManager = require("dw/system/HookMgr");
        HookManager.callHook("app.experience.editmode", "editmode");
        model.resetEditPDMode = true;
    }

    // calling parameter method for fetching blog from folder or searchkey
    var params = BLP.getParams();
    var contentData = {
        data: []
    };

    // getting page id from search helper
    contentData  = searchHelper.setupContentSearch(params); 
                        
    if(!empty(contentData)) {
       model.blogContent = searchHelper.searchBlogContent(contentData);
    } else {
        model.notFound = Resource.msg('error.not.found.blog', 'pageDesigner', null)
    }
    
    return model;
};

BLP.render = function (context) {
    var Template = require("dw/util/Template");
    var model = BLP.getModel(context);

    return new Template(BLP.template).render(model).text;
};

module.exports = BLP;
