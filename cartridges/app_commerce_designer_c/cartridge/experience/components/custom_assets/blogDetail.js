"use strict";
var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");
var preferences = require("*/cartridge/config/preferences");
var imageHelper = require("*/cartridge/experience/utilities/imageHelper.js");
/**
 * Render logic for the storefront component
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed component
 */
module.exports.render = function (context) {
    var model = new HashMap();
    var content = context.content;
    model.isOnline = content.isOnline ? content.isOnline : null;
    model.image = imageHelper.getTransformedImage(content.image);
    model.tileImage = imageHelper.getTransformedImage(
        content.tileImage
    );
    model.title = content.title ? content.title : " ";
    model.titleImage = content.title.replace(/(<([^>]+)>)/gi, "");

    model.description = content.description ? content.description : " ";
    model.readTime = content.readtime ? content.readtime : " ";
    model.textColor = null;
    if(content.textColor) {
        model.textColor = content.textColor.value ? content.textColor.value : null;
    }

    if (content.creationdate) {
        var date = new Date(content.creationdate);
        var creationDate = date.toLocaleDateString();
        model.creationDate = creationDate;
    }
    model.backToList = preferences.blogListPage;

    return new Template(
        "experience/components/custom_assets/blogDetail"
    ).render(model).text;
};
