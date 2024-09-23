'use strict';
var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./checkout/checkout'));
    processInclude(require('int_razorpay/checkout/razor')); //razorpay checkout code
});
