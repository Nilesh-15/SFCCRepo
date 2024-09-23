'use-strict';
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');

function subscribe(emailID) {
    Transaction.wrap(function(){
        var emailSub = CustomObjectMgr.createCustomObject("EmailSubcription", emailID);
        emailSub.custom.emailId = emailID;
        emailSub.custom.isSubscribed= true;
    });
    return;
}

exports.subscribe = subscribe;