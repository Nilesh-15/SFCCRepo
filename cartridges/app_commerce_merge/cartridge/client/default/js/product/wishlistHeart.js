'use strict';

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
        $(icon).closest('.wishlist-tile-plp').addClass('d-none');
        $(icon).closest('.product-tile').find('.remove-from-wishlist').removeClass('d-none');
        $(icon).closest('.product-tile-pd').find('.remove-from-wishlist').removeClass('d-none');
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
    addToWishlist: function () {
        $('body').on('click', '.wishlist-tile-plp', function (e) {
            e.preventDefault();
            var icon = $(this).find($('i'));
            var url = $(this).attr('href');
            var pid = $(this).closest('.product').data('pid') || $(this).data('pid');
            var optionId = $(this).closest('.product-detail').find('.product-option').attr('data-option-id');
            var optionVal = $(this).closest('.product-detail').find('.options-select option:selected').attr('data-value-id');
            optionId = optionId || null;
            optionVal = optionVal || null;
            if (!url || !pid) {
                return;
            }

            $.spinner().start();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: {
                    pid: pid,
                    optionId: optionId,
                    optionVal: optionVal
                },
                success: function (data) {
                    var selectedwishlistproducts = $('.wishlistProducts').attr('data-productids');
                    if (selectedwishlistproducts.indexOf(pid) === -1) {
                        selectedwishlistproducts = selectedwishlistproducts.length > 0 ? selectedwishlistproducts + ',' + pid : pid;
                    }
                    $('.wishlistProducts').attr('data-productids', selectedwishlistproducts);
                    displayMessageAndChangeIcon(data, icon);
                },
                error: function (err) {
                    displayMessageAndChangeIcon(err, icon);
                }
            });
        });
    }
};
