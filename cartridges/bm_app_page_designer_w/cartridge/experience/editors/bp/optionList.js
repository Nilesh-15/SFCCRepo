'use strict';

var URLUtils = require('dw/web/URLUtils');

module.exports.init = function (editor) {
    editor.configuration.put('staticUrl', URLUtils.staticURL('images').toString());
};
