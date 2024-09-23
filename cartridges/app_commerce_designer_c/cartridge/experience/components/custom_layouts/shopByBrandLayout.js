"use strict";

var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");
var PageRenderHelper = require("*/cartridge/experience/utilities/PageRenderHelper.js");

/**
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var component = context.component;
    var content = context.content;

    model.heading = content.shopByBrand ? content.shopByBrand : null;
    model.customContainerName = content.customContainerName ? content.customContainerName : ' ';
    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    model.noOfComponents = model.regions.brandSection.region.visibleComponents
        ? model.regions.brandSection.region.visibleComponents
        : 0;

    return new Template("experience/components/custom_layouts/shopByBrandContainer").render(model).text;
};
