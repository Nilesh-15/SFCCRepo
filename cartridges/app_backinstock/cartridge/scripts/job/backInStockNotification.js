'use-strict';
var URLUtils = require('dw/web/URLUtils');
var CustomeObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var ProductMgr = require('dw/catalog/ProductMgr');
var Resource = require('dw/web/Resource');
const BACK_IN_STOCK = 'productBackInStock';

function BISNotification(){
    var BISObject = CustomeObjectMgr.getAllCustomObjects(BACK_IN_STOCK);
    if(BISObject == null){
        return;
    }
    while (BISObject.hasNext()) {
        var objID = BISObject.next();
        var product = ProductMgr.getProduct(objID.custom.productId);
        var customerEmail = objID.custom.customerEmail;
        var isSend = sendBackInStockEmail(product,customerEmail);
        if(isSend != null && isSend.code == 'OK'){
            Transaction.wrap(function(){
                CustomeObjectMgr.remove(objID);
            });
        }
    }
    
}

function sendBackInStockEmail(product,customerEmail){
    var emailHelper = require('~/cartridge/scripts/helpers/emailHelpers');
    var preferences = require('~/cartridge/config/preferences.js');
    if(product.availabilityModel.inventoryRecord.ATS.value > 0){
        var customerObj = {
            product:product,
            customerEmail:customerEmail,
            redicrectURL:URLUtils.abs('Product-Show','pid',product.ID).toString()
        }
        var emailObj = {
            to : customerEmail,
            subject : Resource.msg('label.email.subject','product',null),
            from : preferences.fromEmail,
            type :  Resource.msg('lable.email.type','product',null)
        }

        var sendEmail = emailHelper.send(emailObj, 'emailTemplate/bisNotification', customerObj);
        return sendEmail;
    }
    return null;    
}

module.exports = {BISNotification:BISNotification};