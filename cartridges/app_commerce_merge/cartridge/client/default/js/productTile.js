'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./product/tilePreview'));
    processInclude(require('./product/wishlistHeart'));
});
