"use strict";
var base = module.superModule;
var Site = require("dw/system/Site");

Object.defineProperty(base, "blogFolderId", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("blogFolderId"),
});
Object.defineProperty(base, "blogSearchKeyword", {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue("blogSearchKeyword"),
});

module.exports = base;
