'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var imageHelper = require("*/cartridge/experience/utilities/imageHelper.js");

module.exports.render = function(context) {
    var model = new HashMap();
    var content = context.content;
    model.isOnline = content.isOnline ? content.isOnline : null;

    model.id = 'video-' + context.component.getID();
    model.videoUrl = content.videoUrl;
    model.autoplay = content.videoAutoplay? "autoplay" : " ";
    model.controller = content.videoControl? "controls" : " ";
    
    model.targetUrl = content.targetUrl;
    model.linkName = content.linkName;
    
    if (content.image) {
        model.image = imageHelper.getTransformedImage(content.image);
    }

    return new Template('experience/components/custom_assets/video').render(model).text;
};