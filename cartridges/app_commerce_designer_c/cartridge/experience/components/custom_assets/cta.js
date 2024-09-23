'use strict';

// /**
//  * @property {string}  template               - ISML template to render.
//  * @property {object}  buttonTypesClassName   - Class names mapping depend of cta type
//  */
var Cta = {
    template: 'experience/components/custom_assets/cta',
    buttonTypesClassName: {
        Solid: 'btn-primary',
        Outline: 'btn-outline-primary',
        'As link': 'link'
    }
};

Cta.getModel = function (context) {
    var HashMap = require('dw/util/HashMap');
    var model = new HashMap();
    var content = context.content;
    var component = context.component;
    var rawUrl = component.getAttribute('url');
    
    model.isOnline = content.isOnline ? content.isOnline : null;
    model.label = content.label ? content.label : null;
    model.ariaLabel = content.ariaLabel ? content.ariaLabel : null;
    model.url = content.url ? content.url : null;
    model.isExternalLink = rawUrl === model.url;

    // Presentation
    model.typeClassName = Cta.buttonTypesClassName[content.type.value];
    var renderSetting = context.componentRenderSettings;

    return model;
};

// /**
//  * @description Render Cta component
//  * @param {dw.experience.ComponentScriptContext} context The Component script context object.
//  * @returns {string} The template to be displayed
//  */
Cta.render = function (context) {
    var Template = require('dw/util/Template');
    var model = Cta.getModel(context);

    return new Template(Cta.template).render(model).text;
};

module.exports = Cta;
