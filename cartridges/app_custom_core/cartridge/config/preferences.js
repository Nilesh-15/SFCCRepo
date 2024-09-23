"use-strict";

let base = module.superModule;

let Site = require("dw/system/Site");

Object.defineProperty(base, "enableBuyNow", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("enableBuyNow"),
});

module.exports = base;
