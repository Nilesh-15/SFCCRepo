'use strict';

/**
 * This function used to Retain the wishlist heart filled image for produts added as wishlist on PLP
 */
function showWishlistSelected() {
    var selectedwishlistproducts = $('.wishlistProducts').attr('data-productids');
    if (selectedwishlistproducts) {
        var $product = $('.product').length ? $('.product') : $('.pd-tile');
        $product.each(function () {
            var productid = $('.product').length ? $(this).data('pid') : $(this).find('.wishlist-tile-plp').data('pid');
            if (selectedwishlistproducts.indexOf(productid) !== -1) {
                $(this).find('.wishlist-tile-plp').addClass('d-none');
                $(this).find('.remove-from-wishlist').removeClass('d-none');
            }
        });
    }
}

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} icon - icon that was clicked to add a product to the wishlist
 */
function displayMessageAndChangeIcon(data, icon) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
        $(icon).closest('.remove-from-wishlist').addClass('d-none');
        $(icon).closest('.product-tile').find('.wishlist-tile-plp').removeClass('d-none');
        $(icon).closest('.product-tile-pd').find('.wishlist-tile-plp').removeClass('d-none');
    } else {
        status = 'alert-danger';
    }

    if ($('.add-to-wishlist-messages').length === 0) {
        $('body').append(
            '<div class="add-to-wishlist-messages "></div>'
        );
    }

    $('.add-to-wishlist-messages')
        .append('<div class="add-to-wishlist-alert text-center ' + status + '">' + data.msg + '</div>');

    setTimeout(function () {
        $('.add-to-wishlist-messages').remove();
    }, 5000);
}

module.exports = {
    showWishlistSelected: showWishlistSelected,

    removeFromWishlist: function () {
        $('body').on('click', '.remove-from-wishlist', function (e) {
            e.preventDefault();
            var url = $(this).attr('href');
            var pid = $(this).closest('.product').data('pid') || $(this).data('pid');
            var icon = this;
            if (!url || !pid) {
                return;
            }

            $.spinner().start();
            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                data: {},
                success: function (data) {
                    var selectedwishlistproducts = $('.wishlistProducts').attr('data-productids');
                    selectedwishlistproducts = selectedwishlistproducts.replace(pid, '');
                    $('.wishlistProducts').attr('data-productids', selectedwishlistproducts);
                    displayMessageAndChangeIcon(data, icon);
                },
                error: function () {
                    displayMessageAndChangeIcon(err, icon);
                }
            });
        });
    }
}