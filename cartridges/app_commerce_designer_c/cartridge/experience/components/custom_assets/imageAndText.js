'use strict';
/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');


/**
 * Render logic for storefront.imageAndText component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    model.isOnline = content.isOnline ? content.isOnline : null;
    model.customContainerName = content.customContainerName ? content.customContainerName : ' ';

    model.bwText = content.bwText ? content.bwText : null;
    model.image = ImageTransformation.getScaledImage(content.image);
    model.bwtImage = content.bwtImage ? ImageTransformation.getScaledImage(content.bwtImage) : null;
    model.alt = content.alt ? content.alt : null;
    model.desktopAlignment = content.desktopAlignment ? content.desktopAlignment : " ";
    model.mobileAlignment = content.mobileAlignment ? content.mobileAlignment : " ";
    model.bwtImageLink = content.bwtImageLink ? content.bwtImageLink : null;
    
    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/custom_assets/imageAndText').render(model).text;
};
