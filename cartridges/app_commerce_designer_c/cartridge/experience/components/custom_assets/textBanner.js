'use strict';

// /**
//  * @memberof app_page_designer_w.module:textBanner
//  * @property {string} template - ISML template to render.
//  */
var TextBanner = {
    template: 'experience/components/custom_assets/textBanner'
};

// /**
//  * @description Get component model
//  * @param {dw.experience.ComponentScriptContext} context - The Component script context object.
//  * @returns {dw.util.HashMap} model hash map
//  */
TextBanner.getModel = function (context) {
    var HashMap = require('dw/util/HashMap');
    var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');

    var model = new HashMap();
    var content = context.content;
    var component = context.component;
    
    model.isOnline = content.isOnline ? content.isOnline : null;
    model.customContainerName = content.customContainerName ? content.customContainerName : ' ';
    model.title = content.title ? content.title : null;
    model.subTitle = content.subTitle ? content.subTitle : null;
    
    //img related
    model.image = content.image ? ImageTransformation.getScaledImage(content.image) : null;
    model.alt = content.alt ? content.alt : null;

    model.textColor = content.textColor.value ? content.textColor.value : null;
    model.backgroundColor = content.backgroundColor.value ? content.backgroundColor.value : null;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);

    return model;
};

// /**
//  * @description Render TextBanner component
//  * @param {dw.experience.ComponentScriptContext} context The Component script context object.
//  * @returns {string} The template to be displayed
//  */
TextBanner.render = function (context) {
    var Template = require('dw/util/Template');
    var model = TextBanner.getModel(context);

    return new Template(TextBanner.template).render(model).text;
};

module.exports = TextBanner;
