'use strict';
var processInclude = require('base/util');
$(document).ready(function () {
    processInclude(require('base/checkout'));
    processInclude(require('./checkout/razor'));//razorpay checkout code
});
