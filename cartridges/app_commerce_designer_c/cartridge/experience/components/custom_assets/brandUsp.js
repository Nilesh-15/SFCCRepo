"use strict";

var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");
var imageHelper = require("*/cartridge/experience/utilities/imageHelper.js");
var PageRenderHelper = require("*/cartridge/experience/utilities/PageRenderHelper.js");
var ArrayList = require('dw/util/ArrayList');

module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    var brandUspList = new ArrayList();
    model.customContainerName = content.customContainerName ? content.customContainerName : ' ';
    
    for(var i=1; i<=4 ; i++ ){
        var result = {};
        result.image = imageHelper.getTransformedImage(content['brandUspImage'+ i],"mainfirst");
        result.altText = content['altText'+ i] || "";
        result.title = PageRenderHelper.getBannerMarkup(content['brandUspTitle'+ i] || "" );
        brandUspList.push(result);
    }

    model.brandUspList = brandUspList;

    return new Template(
        "experience/components/custom_assets/brandUsp"
    ).render(model).text;
};
