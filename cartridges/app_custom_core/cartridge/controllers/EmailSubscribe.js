'use-strict';

var server = require('server');
server.extend(module.superModule);

function validateEmail(email) {
    var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
    return regex.test(email);
}

server.replace('Subscribe', function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Resource = require('dw/web/Resource');
    var HookMgr = require('dw/system/HookMgr');

    var emailId = req.form.emailId;
    var isValidEmailid;
    var existingSubscription = false;

    if (emailId) {
        isValidEmailid = validateEmail(emailId);

        if (isValidEmailid) {
            var subscription = CustomObjectMgr.getCustomObject("EmailSubcription", emailId);
            
            if(subscription) {
                var Transaction = require('dw/system/Transaction');
                existingSubscription = true;
                Transaction.wrap(function() {
                    subscription.custom.isSubscribed = true;
                });
            }
            
            if(!existingSubscription) {
                HookMgr.callHook('app.mailingList.subscribe', 'subscribe', emailId);

                res.json({
                    success: true,
                    msg: Resource.msg('subscribe.email.success', 'homePage', null)
                });
                
            } else {
                res.json({
                    error: true,
                    msg: Resource.msg('msg.already.existing', 'common', null)
                });
            }            
        } else {
            res.json({
                error: true,
                msg: Resource.msg('subscribe.email.invalid', 'homePage', null)
            });
        }
    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.email.invalid', 'homePage', null)
        });
    }

    next();
});


module.exports = server.exports();
