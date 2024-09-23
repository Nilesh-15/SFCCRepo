"use-strict";

let base = module.superModule;

let Site = require("dw/system/Site");

Object.defineProperty(base,"fromEmail",{    
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
});

module.exports = base;