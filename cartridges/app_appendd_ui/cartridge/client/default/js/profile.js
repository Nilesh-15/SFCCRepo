"use strict";

var processInclude = require("base/util");

$(document).ready(function () {
    try {
        processInclude(require('app_account_widgets/profile/profile'));
    } catch (error) {
        console.log('Error in profile.js', error);
    }

    try {
        processInclude(require('./addressBook/addressBook'));
    } catch (error) {
        console.log('Error in addressBook.js', error);
    }

    try {
        processInclude(require('app_merge/wishlist/wishlist'));
    } catch (error) {
        console.log('Error in wishlist.js', error);
    }

});
