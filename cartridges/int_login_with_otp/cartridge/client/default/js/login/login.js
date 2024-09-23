$(function () {
    var clientsideValidation = require("base/components/clientSideValidation");
    var interval = null;

    /**
     * The CountDownTimer method will be employed to initiate a countdown,
     * allowing the customer to resend an OTP to their number if it has not been received within a specified time period.
     */
    function countDownTimer() {
        var timerInSec = $(".otp__timer").val();
        var countDownDate = new Date().getTime() + timerInSec * 1000;
        // Update the count down every 1 second
        interval = setInterval(function () {
            var now = new Date().getTime() - 2000;
            var distance = countDownDate - now;

            //     // Time calculations for days, hours, minutes and seconds
            //     // var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            //     // var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            $(".verify-login-otp")
                .find(".resendOTPContainer")
                .removeClass("d-none");
            $(".verify-login-otp").find(".resendOTPLink").addClass("d-none");
            $(".verify-login-otp #resendOTPCounter").text(
                minutes + ":" + seconds + " secs"
            );

            // If the count down is over, show resent otp link
            if (distance < 0) {
                clearInterval(interval);
                $(".verify-login-otp")
                    .find(".resendOTPContainer")
                    .addClass("d-none");
                $(".verify-login-otp")
                    .find(".resendOTPLink")
                    .removeClass("d-none");
            }
        }, 1000);
    }
    function resetDialogPosition(modalselector) {
        var screenheight = $(window).height();
        var modalheight = modalselector.height();
        var marginTop = (screenheight > modalheight) ? screenheight - modalheight : 0 ;
        modalselector.css('margin-top', marginTop/2 +'px');
    }

    /**
     * Enabling customers to input only digits in the designated field.
     */
    $(document).on("keyup", ".user-mobileno", function (e) {
        if ($(!this.value.match("/[0-9]"))) {
            this.value = this.value.replace(/[^0-9]/g, "");
        }
    });

    /**
     * Enabling customers to input only character in the designated field.
     */
        $(document).on("keyup", "#loginModal .customerName", function (e) {
            if ($(!this.value.match("^[a-zA-Z]+$"))) {
                this.value = this.value.replace(/[^a-zA-Z]+/g, "");
            }
        });
    /**
     * Prevent the default form submission to avoid the default behavior associated with pressing the Enter key.
     */
    $(document).on("keypress", ".user-mobileno", function (event) {
        if (event.keyCode === 13) {
            // Check if Enter key is pressed
            event.preventDefault(); //Prevent the default form submission
        }
    });

    $(".user-login-modal").on("click", function (e) {
        e.preventDefault();
        var rurl = $(this).data("rurl");
        var isCheckoutLogin = $(this).attr('data-isCheckoutLogin');
        $.ajax({
            url: $(this).attr("href"),
            type: "get",
            data: {
                rurl: rurl,
                isCheckoutLogin: isCheckoutLogin
            },
            success: function (data) {
                if (data.success) {
                    $("#loginModal .modal-header .header__title").html(
                        data.headerTitle
                    );
                    $("#loginModal .modal-body").empty();
                    $("#loginModal .modal-body").html(data.modalTemplate);
                    $("#loginModal").modal("show");
                    setTimeout(function(){
                        resetDialogPosition($('#loginModal .modal-dialog'));
                    },300);

                } else {
                }
                clientsideValidation.invalid();
                clientsideValidation.submit();
            },
        });
    });

    $(document).on("click", ".create_account", function (e) {
        e.preventDefault();
        $.ajax({
            url: $(this).attr("href"),
            type: "get",
            success: function (data) {
                if (data.success) {
                    $("#loginModal .modal-header .header__title").html(
                        data.headerTitle
                    );
                    $("#loginModal .modal-body").empty();
                    $("#loginModal .modal-body").html(data.modalTemplate);
                    $("#loginModal").modal("show");
                } else {
                }
                clientsideValidation.invalid();
                clientsideValidation.submit();
            },
        });
    });

    /**
     * Initiate the form submission process upon obtaining the customer's phone number.
     */
    $(document).on("submit", "form.login-form-modal", function (e) {
        $.spinner().start();
        e.preventDefault();
        let url = $(this).attr("action");
        $.ajax({
            url: url,
            type: "post",
            async: false,
            dataType: "json",
            data: $(this).serialize(),
            success: function (res) {
                if (res.success) {
                    $("#loginModal .modal-header .header__title").html(
                        res.headerTitle
                    );
                    $("#loginModal .modal-body").empty();
                    $("#loginModal .modal-body").html(res.otpFormTemplate);
                    $("#loginModal").modal("show");
                    $("loginModal .modal-body .no__account.error__msg").text("");
                    $("loginModal .modal-body .no__account").addClass("d-none");
                    countDownTimer();
                    $.spinner().stop();
                } else {
                    $("#loginModal").find('.invalid-feedback').text('');
                    $("#loginModal .modal-body .no__account.error__msg").text(res.msg);
                    $("#loginModal .modal-body .no__account").removeClass("d-none");
                }
            },
            error: function (err) {
                $.spinner().stop();
            },
        }).always(function () {
            $.spinner().stop();
        });

        return false;
    });

    /**
     * The "Resend OTP" function is activated when the user clicks the "Resend OTP" button.
     */
    $(document).on("click", ".trigger-resend-otp", function (event) {
        event.preventDefault();
        $(".load__forms").spinner().start();
        $.ajax({
            url: $(this).data("actionurl"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if (data.success) {
                    if (
                        $("#loginModal .modal-body").find(
                            ".login-form__otp-container"
                        ).length > 0
                    ) {
                        countDownTimer();
                    }
                }
                clientsideValidation.invalid();
                clientsideValidation.submit();
                $("#loginModal").spinner().stop();
            },
        });
    });

    /**
     * The focus will automatically shift to the next input field once the user enters the OTP value.
     */
    $(document).on("keyup", ".otp__pin", function (e) {
        if ($(this).val().length == parseInt($(this).attr("maxLength"), 10)) {
            $(this).next("form.verify-login-otp input").focus();
        }
    });

    /**
     * Submit the OTP form; upon a successful response,
     * redirect the user to the dashboard. In case of an unsuccessful response, display the error to the user.
     */
    $(document).on("submit", "form.verify-login-otp", function (event) {
        event.preventDefault();
        var otpPin = $(".otp__pin");

        if (
            !$("form.verify-login-otp .otp-mistmatch-error").hasClass("d-none")
        ) {
            $("form.verify-login-otp .otp-mistmatch-error").addClass("d-none");
            $(".otp__pin").removeClass("is-invalid");
        }

        var otp = otpPin
            .map(function () {
                var value = $.trim(this.value);
                return value ? value : undefined;
            })
            .get();

        var register = $('.isregister').val();
        register = register == 'true' ? true:false;

        var form = {
            otp:otp.join(''),
            isregister:register,
            firstname:$('form.verify-login-otp input[name=firstname]').val(),
            lastname:$('form.verify-login-otp input[name=lastname]').val(),
            email:$('form.verify-login-otp input[name=email]').val(),
            phonenumber:$('form.verify-login-otp input[name=phonenumber]').val(),
            csrf_token:$("form.verify-login-otp input[name=csrf_token]").val()
        }

        $.ajax({
            url: $(this).attr("action"),
            type: "post",
            dataType: "json",
            data: form,
            success: function (response) {
                if (response.success) {
                    if (response.pageReload) {
                        location.reload();
                    } else {
                        window.location.replace(response.redirectUrl);
                    }
                } else {
                    $("form.verify-login-otp .otp-mistmatch-error").removeClass(
                        "d-none"
                    );
                    $("form.verify-login-otp .otp-mistmatch-error .otp_mistmatch_expired").text(response.msg);
                    $(".otp__pin").val("");
                    $(".otp__pin").addClass("is-invalid");
                    return;
                }
                clientsideValidation.invalid();
                clientsideValidation.submit();
            },
        });
    });

    /**
     * Enable the button if the input field is not blank.
     */
    $(document).on("keyup", "#loginModal input", function () {
        var form = $(this).closest("form");
        var inputFields = form.find("input[type=text]");
        var noEmptyField = true;
        inputFields.each(function (index, element) {
            if ($(element).val().trim() === "") {
                noEmptyField = false;
                return;
            }
            if (
                $(element).hasClass("user-mobileno") &&
                $(element).val().trim().length < 10
            ) {
                noEmptyField = false;
                return;
            }
        });

        if (noEmptyField) {
            form.find("button").prop("disabled", false);
            if ($(".otp__pin").length > 0) {
                $(".otp__pin").removeClass("is-invalid");
            }
        } else {
            form.find("button").prop("disabled", true);
        }
    });

    $(document).on("click", ".btn-modal-close", function (e) {
        clearInterval(interval);
        // $("#loginModal .modal-header .header__title").html(
        //     window.resources.WELCOME_BACK
        // );
        $("#loginModal .modal-body").empty();
        $("#loginModal").modal("hide");
    });

    $(document).on("submit", ".register-form-modal", function (e) {
        $.spinner().start();
        e.preventDefault();
        let form = $(this).serialize();
        $.ajax({
            url: $(this).attr("action"),
            type: "POST",
            dataType: "JSON",
            data: form,
            success: function (res) {
                if (res.success) {
                    if (res.pageReload) {
                        location.reload();
                    } else {
                        $("#loginModal .modal-body").empty();
                        $("#loginModal .modal-body").html(res.modalTemplate);
                        $("#loginModal").modal("show");
                        $("loginModal .modal-body .no__account.error__msg").text("");
                        $("loginModal .modal-body .no__account").addClass("d-none");
                        $("#loginModal .modal-body .email-validation").text('');
                        countDownTimer();
                    }
                } else {
                    $("#loginModal").find('.invalid-feedback').text('')
                    $("#loginModal .modal-body .email-validation").text('');
                    if(res.hasOwnProperty('isValidEmailid') && !(res.isValidEmailid)){
                        $("#loginModal .modal-body .email-validation").text(res.msg);
                        $("loginModal .modal-body .no__account.error__msg").text("");
                        $("loginModal .modal-body .no__account").addClass("d-none");
                        $("#loginModal .modal-body .already__register.error__msg").text('');
                        $("#loginModal .modal-body .already__register").removeClass("d-none");
                    }else{
                        $("#loginModal .modal-body .email-validation").text('');
                        $("#loginModal .modal-body .already__register.error__msg").text(res.error);
                        $("#loginModal .modal-body .already__register").removeClass("d-none");
                    }
                }
                clientsideValidation.invalid();
                clientsideValidation.submit();
                $.spinner().stop();
            },
        });
    });
});
