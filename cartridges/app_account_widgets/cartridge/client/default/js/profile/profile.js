'use strict';

var formValidation = require('base/components/formValidation');

/**
 * Parses the html for a modal window
 * @param {string} html - representing the body and footer of the modal window
 *
 * @return {Object} - Object with properties body and footer.
 */
function parseHtml(html) {
    var $html = $('<div>').append($.parseHTML(html));

    var body = $html.find('.account-navigation-container');
    // var breadcrumbs = $html.find('.breadcrumbs');

    return {
        body: body
    };
}

module.exports = {
    submitProfile: function () {
        $('body').on('submit', 'form.edit-profile-form', function (e) {
            var $form = $(this);
            e.preventDefault();
            var url = $form.attr('action');
            $form.spinner().start();
            $('form.edit-profile-form').trigger('profile:edit', e);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: $form.serialize(),
                success: function (data) {
                    $form.spinner().stop();
                    if (!data.success) {
                        formValidation($form, data);
                    } else {
                        window.location.href = data.redirectUrl;
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                    $form.spinner().stop();
                }
            });
            return false;
        });
    },

    submitPassword: function () {
        $('form.change-password-form').submit(function (e) {
            var $form = $(this);
            e.preventDefault();
            var url = $form.attr('action');
            $form.spinner().start();
            $('form.change-password-form').trigger('password:edit', e);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: $form.serialize(),
                success: function (data) {
                    $form.spinner().stop();
                    if (!data.success) {
                        formValidation($form, data);
                    } else {
                        location.href = data.redirectUrl;
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                    $form.spinner().stop();
                }
            });
            return false;
        });
    },

    accountDetails: function () {
        $('body').on('click', '.side-bar-link', function (e) {
            e.preventDefault();
            var url = $(this).data('url');
            var button = $(this);
            $.spinner().start();
            $.ajax({
                url: url,
                type: 'get',
                success: function (data) {
                    if (data) {
                        var parsedHtml = parseHtml(data.renderedTemplate);
                        $('.list-group-item.active').removeClass('active');
                        button.closest('.list-group-item').addClass('active');
                        $('.account-navigation-container').empty();
                        $('.account-navigation-container').replaceWith(parsedHtml.body);
                        // $('.breadcrumb').replaceWith(parsedHtml.breadcrumbs);
                        $.spinner().stop();
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                    $.spinner().stop();
                }
            });
        })
    },

    addAddress: function () {
        $('body').on('click', '.add-address', function (e) {
            e.preventDefault();
            var url = $(this).attr("href");
            var button = $(this);
            $.spinner().start();
            $.ajax({
                url: url,
                type: 'get',
                success: function (data) {
                    if (data) {
                        var parsedHtml = parseHtml(data.renderedTemplate);
                        $('.account-navigation-container').empty();
                        $('.account-navigation-container').replaceWith(parsedHtml.body);
                        $.spinner().stop();
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                    $.spinner().stop();
                }
            });
        })
    }
}
