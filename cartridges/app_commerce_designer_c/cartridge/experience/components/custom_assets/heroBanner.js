"use strict";
var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");
var preferences = require("*/cartridge/config/preferences");
var PageRenderHelper = require("*/cartridge/experience/utilities/PageRenderHelper.js");
var imageHelper = require("*/cartridge/experience/utilities/imageHelper.js");

module.exports.render = function (context) {
    var model = new HashMap();
    var content = context.content;
    var component = context.component;

    model.isOnline = content.isOnline ? content.isOnline : null;
    model.image = content.image ? imageHelper.getTransformedImage(content.image) : null;
    model.imageMobile = content.imageMobile ? imageHelper.getTransformedImage(content.imageMobile) : null;
    model.imageAlt = content.imageAlt ? content.imageAlt : null;
    model.bannerClass = model.imageAlt.replace(/-|\s/g, "");

    var Banner = {
        captionAlignmentNames: {
            Left: 'center__left',
            Center: 'centered',
            Right: 'center__right'
        },
        positionNames: {
            'Text over': 'hover',
            'Text under': 'under'
        }
    };

    model.layoutClass = Banner.positionNames[content.bannerLayout.value] || '';
    model.alignmentClass = Banner.captionAlignmentNames[content.captionPosition.value] || '';
    model.title = content.title ? content.title : null;
    model.subTitle = content.subTitle ? content.subTitle : null;
    model.imageLink = content.imageLink ? content.imageLink : null;
    model.textColor = null;
    if(content.textColor) {
        model.textColor = content.textColor.value ? content.textColor.value : null;
    }

    model.regions = PageRenderHelper.getRegionModelRegistry(component);

    return new Template('experience/components/custom_assets/heroBanner').render(model).text;
};
