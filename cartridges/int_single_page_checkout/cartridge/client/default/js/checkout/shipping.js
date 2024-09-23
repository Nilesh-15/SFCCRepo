var base = require('base/checkout/shipping');

base.selectSingleShipAddress = function () {
    $('.single-shipping .addressSelector').on('change', function () {
        var form = $(this).parents('form')[0];
        var selectedOption = $(this);
        var attrs = selectedOption.data();
        var shipmentUUID = selectedOption.val();
        var originalUUID = $('input[name=shipmentUUID]', form).val();
        var element;
        Object.keys(attrs).forEach(function (attr) {
            element = attr === 'countryCode' ? 'country' : attr;
            if (element !== 'country' && element !== 'countryCode') {
                // Update the field's value in the form
                $('[name$=' + element + ']', form).val(attrs[attr]);
            }
        });
        $('[name$=stateCode]', form).trigger('change');
        if (shipmentUUID === 'new') {
            $(form).attr('data-address-mode', 'new');
            $(form).find('.shipping-address-block').removeClass('d-none');
        } else if (shipmentUUID === originalUUID) {
            $(form).attr('data-address-mode', 'shipment');
        } else if (shipmentUUID.indexOf('ab_') === 0) {
            $(form).attr('data-address-mode', 'customer');
        } else {
            $(form).attr('data-address-mode', 'edit');
        }

        $('.btn-show-details').prop('disabled',true);
        $(this).closest('.row').find('.btn-show-details').prop('disabled',false);
    });
},

    module.exports = base;
