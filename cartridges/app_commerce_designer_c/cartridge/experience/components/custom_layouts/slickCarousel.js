"use strict";

var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");
var carouselBuilder = require("*/cartridge/scripts/experience/utilities/slickCarouselBuilder.js");

/**
 * Render logic for storefront.carousel layout.
 * @param {dw.experience.ComponentScriptContext} context The component script context object.
 * @returns {string} The template to be displayed
 */
module.exports.render = function (context) {
    var model = new HashMap();

    model = carouselBuilder.init(model, context);

    return new Template(
        "experience/components/custom_layouts/slickCarousel"
    ).render(model).text;
};
