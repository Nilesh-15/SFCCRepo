"use strict";

// /**
//  * @subcategory assets
//  * @module imageTile
//  * @description imageTile Page Designer component that implement image with integrated CTA (kind of small banner).
//  */
var ImageTile = {
    template: "experience/components/custom_assets/imageTile",
    layoutClassNames: {
        "Caption over": "m-caption_over",
        "Caption below": "m-caption_below",
    },
    captionAlignmentNames: {
        Left: "left",
        Center: "center",
        Right: "right",
    },
    ctaTypesClassName: {
        "As link": "link",
        Solid: "btn-primary",
        Outline: "btn-outline-primary",
    },
};

// /**
//  * @description Get component model
//  * @param {dw.experience.ComponentScriptContext} context - The Component script context object.
//  * @returns {dw.util.HashMap} model hash map
//  */
ImageTile.getModel = function (context) {
    var HashMap = require("dw/util/HashMap");
    var URLUtils = require("dw/web/URLUtils");
    var imageHelper = require("*/cartridge/experience/utilities/imageHelper.js");

    var model = new HashMap();
    var content = context.content;
    model.isOnline = content.isOnline ? content.isOnline : null;
    model.image = imageHelper.getTransformedImage(content.image);
    model.imageAlt = content.imageAlt ? content.imageAlt : null;

    // Link and content
    var category = content.category;
    if (category) {
        model.url = URLUtils.url(
            "Search-Show",
            "cgid",
            category.getID()
        ).toString();
    } else {
        model.url = URLUtils.url("Home-Show");
    }
    model.caption = content.caption ? content.caption : null;

    // Presentation
    model.captionAlignmentClass =
        ImageTile.captionAlignmentNames[content.captionPosition.value] || "";
    model.layoutClassName =
        ImageTile.layoutClassNames[content.tileLayout.value] || "";
    model.ctaTypeClassName =
        ImageTile.ctaTypesClassName[content.ctaType.value] || "";
        
    return model;
};

// /**
//  * @description Render imageTile component
//  * @param {dw.experience.ComponentScriptContext} context The Component script context object.
//  * @returns {string} The template to be displayed
//  */
ImageTile.render = function (context) {
    var Template = require("dw/util/Template");
    var model = ImageTile.getModel(context);

    return new Template(ImageTile.template).render(model).text;
};

module.exports = ImageTile;
