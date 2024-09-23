"use strict";
var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");
var PageRenderHelper = require("*/cartridge/experience/utilities/PageRenderHelper.js");
var RegionModelRegistry = require("*/cartridge/experience/utilities/RegionModelRegistry.js");
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
module.exports.render = function (context) {
    var model = new HashMap();
    var page = context.page;
    model.page = page;
    var metaDefinition = require("*/cartridge/experience/pages/blogPage.json");
    model.regions = new RegionModelRegistry(page, metaDefinition);
    try {
        var parameterObject = JSON.parse(context.getRenderParameters());
        for (var key in parameterObject) {
            if (parameterObject.hasOwnProperty(key)) {
                model.put(key, parameterObject[key]);
            }
        }
    } catch (e) {
        var Logger = require("dw/system/Logger");
        Logger.error(
            "Unable to parse renderParameters blogPage.js: " +
                parameterObject
        );
    }
    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        },
        {
            htmlValue: page.name,
            url: URLUtils.url('Page-Show', 'cid', page.ID).toString()
        }
    ];
    model.breadcrumbs = breadcrumbs;
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
    // render the page
    return new Template("experience/pages/blogPage").render(model).text;
};