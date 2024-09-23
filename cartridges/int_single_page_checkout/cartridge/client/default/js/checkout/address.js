'use strict';
var base = require('base/checkout/address');

base.addNewAddress = function () {
    $('.btn-add-new').on('click', function () {
        var $el = $(this);
        if ($el.parents('#dwfrm_billing').length > 0) {
            // Handle billing address case
            $('body').trigger('checkout:clearBillingForm');
            var $option = $($el.parents('form').find('.addressSelector option')[0]);
            $option.attr('value', 'new');
            var $newTitle = $('#dwfrm_billing input[name=localizedNewAddressTitle]').val();
            $option.text($newTitle);
            $option.prop('selected', 'selected');
            $el.parents('[data-address-mode]').attr('data-address-mode', 'new');
        } else {
            // Handle shipping address case
            var $newEl = $el.parents('form').find('input[value=new].addressSelector');
            $newEl.attr('checked', 'checked');
            $newEl.trigger('change');
        }
    });
}

base.showDetails = function () {
    $('.btn-show-details').on('click', function () {
        var form = $(this).closest('form');

        var $newEl = form.find('input.addressSelector');
        $newEl.trigger('change');
        form.attr('data-address-mode', 'details');
        form.find('.multi-ship-address-actions').removeClass('d-none');
        form.find('.multi-ship-action-buttons .col-12.btn-save-multi-ship').addClass('d-none');
    });
}

module.exports = base;
