'use strict';

var base = module.superModule;

var Site = require("dw/system/Site");

Object.defineProperty(base, "isCODEnabled", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("enableCOD"),
});

module.exports = base;
