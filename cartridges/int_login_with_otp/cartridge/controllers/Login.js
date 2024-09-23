var server = require("server");
server.extend(module.superModule);

var csrfProtection = require("*/cartridge/scripts/middleware/csrf");
var consentTracking = require("*/cartridge/scripts/middleware/consentTracking");
var apiCsrfProtection = require("dw/web/CSRFProtection");
/**
 *  Login-Show : This endpoint is called to load the login page
 */
server.replace(
    "Show",
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var URLUtils = require("dw/web/URLUtils");
        var Resource = require("dw/web/Resource");
        var renderTemplateHelper = require("*/cartridge/scripts/renderTemplateHelper");

        if (req.querystring.rurl == 1) {
            req.session.privacyCache.set("rurl", 1);
        } else if (req.querystring.rurl == 3) {
            req.session.privacyCache.set("rurl", 3);
        } else {
            req.session.privacyCache.set("rurl", 2);
        }

        var userName = "";
        var actionUrl = URLUtils.url(
            "Account-SendOTP",
            "rurl",
            req.querystring.rurl
        );

        var isCheckoutLogin = req.querystring.isCheckoutLogin && req.querystring.isCheckoutLogin ==="true";
        var registerUrl = URLUtils.url("Account-Register", "rurl", isCheckoutLogin ? 2 : req.querystring.rurl);

        if (req.currentCustomer.credentials) {
            userName = req.currentCustomer.credentials.username;
        }

        var breadcrumbs = [
            {
                htmlValue: Resource.msg("global.home", "common", null),
                url: URLUtils.home().toString(),
            },
        ];

        var loginForm = server.forms.getForm("login");
        loginForm.clear();

        var csrf = {
            tokenName: apiCsrfProtection.getTokenName(),
            token: apiCsrfProtection.generateToken(),
        };

        var loginReq = {
            csrf: csrf,
            actionUrl: actionUrl,
            loginForm: loginForm,
            registerUrl: registerUrl,
            oAuthReentryEndpoint: 1,
            headerTitle: Resource.msg("label.welcome.back", "login", null),
        };

        var loginTemplate = "/account/components/loginForm";
        res.json({
            success: true,
            modalTemplate: renderTemplateHelper.getRenderedHtml(
                loginReq,
                loginTemplate
            ),
        });
        next();
    }
);

module.exports = server.exports();
