"use strict";

const Template = require("dw/util/Template");
const URLUtils = require("dw/web/URLUtils");
const HashMap = require("dw/util/HashMap");

module.exports.render = function (context) {
    // Initialize local variables
    let model, content;
    model = new HashMap();
    content = context.content;
    model.isOnline = content.isOnline ? content.isOnline : null;
    model.videoId = content.videoId;
    return new Template("experience/components/custom_assets/youtube").render(model).text;
}
