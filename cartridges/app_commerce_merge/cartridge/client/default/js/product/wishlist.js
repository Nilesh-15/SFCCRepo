"use strict";

/**
 * This function used to Retain the wishlist heart filled image for product added as wishlist on PDP
 */
function showWishlistSelectedOnPDP() {
    var selectedwishlistproducts = $(".wishlistProducts").attr("data-productids");
    if (selectedwishlistproducts) {
        $(".product-detail").each(function () {
            var productid = $(this).data("pid");
            if (selectedwishlistproducts.indexOf(productid) !== -1) {
                $(this).find(".add-to-wish-list-pdp").addClass("d-none");
                $(this).find(".remove-from-wishlist-pdp").removeClass("d-none");
            }
        });
    }
}

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked to add a product to the wishlist
 */
function displayMessageAndChangeButton(data, button, productAdded) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = "alert-success";
        if (productAdded) {
            $(button).closest(".add-to-wish-list-pdp").addClass("d-none");
            $(".remove-from-wishlist-pdp").removeClass("d-none");
        } else {
            $(button).closest(".remove-from-wishlist-pdp").addClass("d-none");
            $(".add-to-wish-list-pdp").removeClass("d-none");
        }
    } else {
        status = "alert-danger";
    }

    if ($(".add-to-wishlist-messages").length === 0) {
        $("body").append('<div class="add-to-wishlist-messages "></div>');
    }
    $(".add-to-wishlist-messages").append(
        '<div class="add-to-wishlist-alert text-center ' +
            status +
            '">' +
            data.msg +
            "</div>"
    );

    setTimeout(function () {
        $(".add-to-wishlist-messages").remove();
        button.removeAttr("disabled");
    }, 2000);
}

module.exports = {
    showWishlistSelectedOnPDP: showWishlistSelectedOnPDP,

    addToWishlist: function () {
        $(".add-to-wish-list-pdp").on("click", function (e) {
            e.preventDefault();
            var url = $(this).attr("href");
            var button = $(this);
            var pid = $(this).closest(".product-detail").data("pid");
            var optionId = $(this).closest(".product-detail").find(".product-option").attr("data-option-id");
            var optionVal = $(this).closest(".product-detail").find(".options-select option:selected").attr("data-value-id");
            optionId = optionId || null;
            optionVal = optionVal || null;
            if (!url || !pid) {
                return;
            }

            $.spinner().start();
            $(this).attr("disabled", true);
            $.ajax({
                url: url,
                type: "post",
                dataType: "json",
                data: {
                    pid: pid,
                    optionId: optionId,
                    optionVal: optionVal,
                },
                success: function (data) {
                    displayMessageAndChangeButton(data, button, true);
                },
                error: function (err) {
                    displayMessageAndChangeButton(err, button, true);
                },
            });
        });
    },

    removeFromWishlist: function () {
        $("body").on("click", ".remove-from-wishlist-pdp", function (e) {
            e.preventDefault();
            var url = $(this).data("href");
            var button = $(this);
            if (!url) {
                return;
            }

            $.spinner().start();
            $.ajax({
                url: url,
                type: "get",
                dataType: "json",
                data: {},
                success: function (data) {
                    displayMessageAndChangeButton(data, button, false);
                },
                error: function () {
                    displayMessageAndChangeButton(err, button, false);
                },
            });
        });
    },
};
