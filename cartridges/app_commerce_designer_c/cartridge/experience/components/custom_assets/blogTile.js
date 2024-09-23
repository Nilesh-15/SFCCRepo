"use strict";
var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");
var PageMgr = require("dw/experience/PageMgr");
var URLUtils = require("dw/web/URLUtils");
var collections = require("*/cartridge/scripts/util/collections");

/**
 * Render logic for storefront.imageAndText component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} The template to be displayed
 */
module.exports.render = function (context) {
    var model = new HashMap();
    var content = context.content;
    var pageID = content.page.ID;
    var page = PageMgr.getPage(pageID);
    var region = page.getRegion("blogRegion");
    var visibleComponents = region.getVisibleComponents();
    collections.forEach(visibleComponents, function (component) {
        if (
            component.typeID.replace("custom_assets.", "") ==
            "blogDetail"
        ) {
            var removedHtmlTagString = component
                .getAttribute("title")
                .replace(/(<([^>]+)>)/gi, "");
            if (removedHtmlTagString) {
                model.titleImg = removedHtmlTagString;
            }
            if (component.getAttribute("title")) {
                model.title = component.getAttribute("title").replace(/(<([^>]+)>)/gi, "");
            }
            if (component.getAttribute("description")) {
                model.description = component.getAttribute("description");
            }
            if (component.getAttribute("tileImage")) {
                var image = component.getAttribute("tileImage").path;
                model.imagePath = URLUtils.imageURL(
                    URLUtils.CONTEXT_LIBRARY,
                    null,
                    image,
                    null
                );
            }
            if (component.getAttribute("creationdate")) {
                var date = new Date(component.getAttribute("creationdate"));
                var creationDate = date.toLocaleDateString();
                model.creationDate = creationDate;
            }
            if (component.getAttribute("readtime")) {
                model.readTime = component.getAttribute("readtime");
            }
            model.contentID = pageID;
        }
    });
    model.isOnline = content.isOnline ? content.isOnline : null;
    return new Template(
        "experience/components/custom_assets/blogTile"
    ).render(model).text;
};
