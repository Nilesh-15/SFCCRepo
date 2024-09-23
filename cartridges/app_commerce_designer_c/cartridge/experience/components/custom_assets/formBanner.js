'use strict';

var TextBanner = {
    template: 'experience/components/custom_assets/formBanner'
};

TextBanner.getModel = function (context) {
    var HashMap = require('dw/util/HashMap');
    var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

    var model = new HashMap();
    var content = context.content;
    var component = context.component;
    
    model.isOnline = content.isOnline ? content.isOnline : null;
    model.customContainerName = content.customContainerName ? content.customContainerName : ' ';

    model.headingForm = content.headingForm ? content.headingForm : null;
    model.subTxtForm = content.subTxtForm ? content.subTxtForm : null;
    model.formBtnTxt = content.formBtnTxt ? content.formBtnTxt : null;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);

    return model;
};


TextBanner.render = function (context) {
    var Template = require('dw/util/Template');
    var model = TextBanner.getModel(context);

    return new Template(TextBanner.template).render(model).text;
};

module.exports = TextBanner;
