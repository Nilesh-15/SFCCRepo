'use strict';
var base = require('./base');

function fillModalElement($tilePreview,selectedValueUrl) {
    $.ajax({
        url: selectedValueUrl,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            $($tilePreview).parents().siblings('.product-tilePreview').removeClass('d-none');
            $($tilePreview).parents().find('.product').data('pid',data.product.id);
            $($tilePreview).parents().siblings('.product-tilePreview').append(data.renderedTemplate);
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

module.exports = {
    showQuickview: function () {
        $('body').on('click', '.productTilePreview', function (e) {
            e.preventDefault();
            var $tilePreview = (this);
            var selectedValueUrl = $(this).closest('a.productTilePreview').attr('href');
            fillModalElement($tilePreview,selectedValueUrl);
        });
    },
    availability: base.availability,
    addToCart: base.addToCart,
    beforeUpdateAttribute: function () {
        $('body').on('product:beforeAttributeSelect', function (event) {
            $(event.target).spinner().start();
        });
    },
    updateAttribute: function () {
        $('body').on('product:afterAttributeSelect', function (e, response) {
                $('.product-grid .product').data('pid', response.data.product.id);
                $('.modal.show .full-pdp-link').attr('href', response.data.product.selectedProductUrl);
        });
    },
    updateAddToCart: function () {
        $('body').on('product:updateAddToCart', function (e, response) {
            // update local add to cart (for sets)
            $('button.add-to-cart', response.$productContainer).attr('disabled',
                (!response.product.readyToOrder || !response.product.available));
        });
    },
    closeTilePreview:function(){
        $(document).on('click','.tile-preview-close',function(event){
            event.preventDefault();
            $(this).parents().closest('.product-tilePreview').addClass('d-none');
            $(this).parents().closest('.product-tilePreview').empty();
        });
    }
};
