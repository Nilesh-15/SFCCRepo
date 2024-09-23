var detail = require('base/product/detail');
var base = require('./base');

//Check Customer already subscribe or not.
function CheckBackInStockNotification(product){
    var url = $('.back-in-stock .backInStock-checkReq').val();
    var form = {
        productId : product.id
    }
    $.ajax({
        url: url,
        type : 'POST',
        async: false,
        dataType: 'JSON',
        data: form,
        success: function(res){
            if(res.data.success){
                if($('.product-set-detail > .set-items > .product-detail').hasClass('set-item')){
                    $('.set-item .product-id').each(function(){
                        if($(this).text() ===res.data.productID){
                            $(this).find('.cart-and-ipay .add-to-cart').addClass('d-none');
                            $('.back-in-stock .notify-form-container').addClass('d-none');
                            $(this).parents('.product-detail.set-item').find('.already-subscribe-msg span').text(res.data.msg);
                        }
                      });
                }else{
                    $('.back-in-stock .notify-form-container').addClass('d-none');
                    $('.already-subscribe-msg span').text(res.data.msg);
                }
            }else{
                if(product.availability.hasOwnProperty('outOfStock') && product.availability.outOfStock){
                    if($('.product-set-detail > .set-items > .product-detail').hasClass('set-item')){
                        $('.set-item .product-id').each(function(){
                            if($(this).text() === product.id){
                                $(this).find('.cart-and-ipay .add-to-cart').addClass('d-none')
                                $(this).find('.back-in-stock').removeClass('d-none');
                                $(this).parents('.product-detail.set-item').find('.notify-form-container').hasClass('d-none') ? $(this).parents('.product-detail.set-item').find('.notify-form-container').removeClass('d-none') : '';
                            }
                          });
                    }else{
                        $('.cart-and-ipay .add-to-cart').addClass('d-none')
                        $('.back-in-stock').removeClass('d-none');
                        $('.notify-form-container').hasClass('d-none') ? $('.notify-form-container').removeClass('d-none') : '';
                    }
                }else{
                    $('.back-in-stock').addClass('d-none')
                    $('.already-subscribe-msg span').text('');
                    $('.cart-and-ipay .add-to-cart').removeClass('d-none')
                }
            }
        }
    })
}

//Show Action button on PDP based on Product Variation.
function showProductAction(product){
    if(product.availability.hasOwnProperty('outOfStock') && product.availability.outOfStock){
        $('.cart-and-ipay .add-to-cart').addClass('d-none')
        $('.back-in-stock').removeClass('d-none')   
    }else{
        $('.back-in-stock').addClass('d-none')
        $('.cart-and-ipay .add-to-cart').removeClass('d-none')
    }
}

/**
 * Enable/disable UI elements
 * @param {boolean} enableOrDisable - true or false
 */
function updateAddToCartEnableDisableOtherElements(enableOrDisable) {
    $('button.add-to-cart-global').attr('disabled', enableOrDisable);
}

/**
 * Prevent the default form submission to avoid the default behavior associated with pressing the Enter key.
 */
$(document).on("keypress", ".back-in-stock-form", function (event) {
    if (event.keyCode === 13) {
        // Check if Enter key is pressed
        event.preventDefault(); //Prevent the default form submission
        $('.btn-back-in-stock').click();
    }
});

module.exports = {
    methods: {
        updateAddToCartEnableDisableOtherElements: updateAddToCartEnableDisableOtherElements
    },

    availability: base.availability,

    addToCart: base.addToCart,

    updateAttributesAndDetails: function () {
        $('body').on('product:statusUpdate', function (e, data) {
            var $productContainer = $('.product-detail[data-pid="' + data.id + '"]');

            $productContainer.find('.description-and-detail .product-attributes')
                .empty()
                .html(data.attributesHtml);

            if (data.shortDescription) {
                $productContainer.find('.description-and-detail .description')
                    .removeClass('hidden-xl-down');
                $productContainer.find('.description-and-detail .description .content')
                    .empty()
                    .html(data.shortDescription);
            } else {
                $productContainer.find('.description-and-detail .description')
                    .addClass('hidden-xl-down');
            }

            if (data.longDescription) {
                $productContainer.find('.description-and-detail .details')
                    .removeClass('hidden-xl-down');
                $productContainer.find('.description-and-detail .details .content')
                    .empty()
                    .html(data.longDescription);
            } else {
                $productContainer.find('.description-and-detail .details')
                    .addClass('hidden-xl-down');
            }
        });
    },

    showSpinner: function () {
        $('body').on('product:beforeAddToCart product:beforeAttributeSelect', function () {
            $.spinner().start();
        });
    },
    updateAttribute: function () {
        $('body').on('product:afterAttributeSelect', function (e, response) {
            if ($('.product-detail>.bundle-items').length) {
                response.container.data('pid', response.data.product.id);
                response.container.find('.product-id').text(response.data.product.id);
                
                $('.product-detail .backInStock-productId').val(response.data.product.id);
                CheckBackInStockNotification(response.data.product);
            } else if ($('.product-set-detail').eq(0)) {
                response.container.data('pid', response.data.product.id);
                response.container.find('.product-id').text(response.data.product.id);

                $('.product-detail .backInStock-productId').val(response.data.product.id);
                CheckBackInStockNotification(response.data.product);
            } else {
                $('.product-id').text(response.data.product.id);
                $('.product-detail:not(".bundle-item")').data('pid', response.data.product.id);

                $('.product-detail .backInStock-productId').val(response.data.product.id);
                CheckBackInStockNotification(response.data.product);
            }
        });
    },

    updateAvailability: function () {
        $('body').on('product:updateAvailability', function (e, response) {
            $('div.availability', response.$productContainer)
                .data('ready-to-order', response.product.readyToOrder)
                .data('available', response.product.available);

            $('.availability-msg', response.$productContainer)
                .empty().html(response.message);

            if ($('.global-availability').length) {
                var allAvailable = $('.product-availability').toArray()
                    .every(function (item) { return $(item).data('available'); });

                var allReady = $('.product-availability').toArray()
                    .every(function (item) { return $(item).data('ready-to-order'); });

                $('.global-availability')
                    .data('ready-to-order', allReady)
                    .data('available', allAvailable);

                $('.global-availability .availability-msg').empty()
                    .html(allReady ? response.message : response.resources.info_selectforstock);
            }

            showProductAction(response.product);
        });
    },
    updateAddToCart: function () {
        $('body').on('product:updateAddToCart', function (e, response) {
            // update local add to cart (for sets)
            $('button.add-to-cart', response.$productContainer).attr('disabled',
                (!response.product.readyToOrder || !response.product.available));

                
            var enable = $('.product-availability').toArray().every(function (item) {
                return $(item).data('available') && $(item).data('ready-to-order');
            });
            module.exports.methods.updateAddToCartEnableDisableOtherElements(!enable);
        });
    },
    storeBackInStockRequest: function(){
        $(document).on('click','.btn-back-in-stock',function(event){
            event.preventDefault();
            var $form = $('.back-in-stock-form');
            var url = $form.attr('action');
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                data: $form.serialize(),
                success: function(res){
                    if(res.data.success && !res.data.isSubscribe){
                        $('.stock-customer-email').val('');
                        if ($('.add-to-cart-messages').length === 0) {
                            $('body').append(
                                '<div class="add-to-cart-messages"></div>'
                            );
                        }
                
                        $('.add-to-cart-messages').append(
                            '<div class="alert alert-success add-to-basket-alert text-center" role="alert">'
                            + res.data.msg
                            + '</div>'
                        );
                        $('.backInStock-error .backInStock-email-error').text('');
                        setTimeout(function () {
                            $('.add-to-basket-alert').remove();
                        }, 5000);

                    }else{
                        $('.backInStock-error .backInStock-email-error').text(res.data.msg);
                    }
                }
            });
        });
    },
    availability: base.availability,
    addToCart: base.addToCart,
    updateAttributesAndDetails: detail.updateAttributesAndDetails,
    showSpinner:detail.showSpinner,
    sizeChart: detail.sizeChart,
    copyProductLink: detail.copyProductLink,
    focusChooseBonusProductModal: base.focusChooseBonusProductModal()
}
