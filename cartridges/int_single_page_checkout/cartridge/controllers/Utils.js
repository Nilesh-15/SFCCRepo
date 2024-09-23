"use strict";

var server = require("server");
var preferences = require("*/cartridge/config/preferences");
var Resource = require("dw/web/Resource");
var cache = require("*/cartridge/scripts/middleware/cache");

/**
 * Utils-GetResources : Data required for client side we pass that data from this controller
 * @name Utils-GetResources
 * @function
 * @memberof Utils
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get("GetResources", cache.applyDefaultCache, function (req, res, next) {
    res.render('utils/resources', {
        sitePreferences: {
            googleCloudApiKey: preferences.googleCloudApiKey,
        },
        resources: {
            COMMON_MSG_INVALID_LOCATION: Resource.msg(
                "msg.invalid.location",
                "common",
                null
            ),
            COMMON_MSG_HTTP_ERROR_STATUS: Resource.msg(
                "msg.http.error.status",
                "common",
                null
            ),
            COMMON_MSG_NO_RESULTS_FOUND: Resource.msg(
                "msg.no.results.found",
                "common",
                null
            ),
            COMMON_MSG_ENABLE_GEO_LOCATION: Resource.msg(
                "msg.enable.geo.location",
                "common",
                null
            ),
            COMMON_MSG_GEOLOCATION_NOT_SUPPORTED: Resource.msg(
                "msg.geolocation.not.supported",
                "common",
                null
            ),
            MOBILE_NUMBER_MISSING: Resource.msg(
                "error.login.mobile.number.missing",
                "login",
                null
            ),
            CANT_FIND_MY_CITY_CITYNAME_ERROR: Resource.msg(
                "msg.cant.find.my.city.cityname.error",
                "common",
                null
            ),
            CANT_FIND_MY_CITY_FIRST_NAME_ERROR: Resource.msg(
                "msg.cant.find.my.city.firstName.error",
                "common",
                null
            ),
            CANT_FIND_MY_CITY_LAST_NAME_ERROR: Resource.msg(
                "msg.cant.find.my.city.lastName.error",
                "common",
                null
            ),
            CANT_FIND_MY_CITY_MOBILE_ERROR: Resource.msg(
                "msg.cant.find.my.city.mobile.error",
                "common",
                null
            ),
            CANT_FIND_MY_CITY_EMAIL_ERROR: Resource.msg(
                "msg.cant.find.my.city.email.error",
                "common",
                null
            ),
            CANT_FIND_MY_CITY_FORM_ERROR: Resource.msg(
                "msg.cant.find.my.city.form.error",
                "common",
                null
            ),
            WELCOME_BACK: Resource.msg("label.welcome.back", "login", null),
        },
    });
    next();
});
module.exports = server.exports();
