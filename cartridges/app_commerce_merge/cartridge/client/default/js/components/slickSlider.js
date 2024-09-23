"use strict";

function initSlickSlider() {
    $(".slick-slider").not(".slick-initialized").slick({
        prevArrow:
            '<button class="slick-prev slick-arrow " aria-label="Prev" type="button"></button>',
        nextArrow:
            '<button class="slick-next slick-arrow " aria-label="Next" type="button"></button>',
    });
}

/**
 * Initialize the Product Detail slick slider
 */
function initProductDetailSlider() {
    $('.product-detail-slider-for')
      .not('.slick-initialized')
      .slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: ".product-thumbnail-slider-nav"
    });

    $('.product-thumbnail-slider-nav')
      .not(".slick-initialized")
      .slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        asNavFor: ".product-detail-slider-for",
        dots: false,
        arrows: true,
        focusOnSelect: true,
        verticalSwiping: false,
        prevArrow:
          '<button class="slick-prev slick-up slick-arrow " aria-label="Prev" type="button"></button>',
        nextArrow:
          '<button class="slick-next slick-down slick-arrow " aria-label="Next" type="button"></button>'
    });

}

/**
 * Initialize the Product Detail Page Recommendation slider
 */
function initPDPRecommendationSlider() {
    var slideWidth;
    $(".pdp-recommendation-slider-nav")
      .on("init", function (event, slick) {
        var slideLength = $(".pdp-recommendation-slider-nav .slick-slide").length;
        slideWidth = 100 / slideLength;
        $(".pdp-recommendation-slider .custom-scrollbar-drag").css(
          "width",
          slideWidth + "%"
        );
      })
      .on("beforeChange", function (event, slick, currentSlide, nextSlide) {
        $(".pdp-recommendation-slider .custom-scrollbar-drag").css(
          "left",
          slideWidth * nextSlide + "%"
        );
      });
  
    $(".pdp-recommendation-slider-for")
      .not(".slick-initialized")
      .slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        fade: true,
        swipe: false,
      })
  
  
    $(".pdp-recommendation-slider-nav")
      .not(".slick-initialized")
      .slick({
        "slidesToShow": 4,
        "slidesToScroll": 1,
        "infinite": true,
        "dots": false,
        "arrows": true,
        "focusOnSelect": true,
        "touchThreshold": 100,
        "responsive": [
          {
            "breakpoint":991,
              "settings":{
                "arrows":false,
                "dots":false,
                "slidesToShow":3,
                "slidesToScroll":1,
                "autoplay":true
              }
            },
            {
            "breakpoint":544,
              "settings":{
                "arrows":false,
                "dots":false,
                "slidesToShow":1,
                "slidesToScroll":1,
                "autoplay":true
              }
            }
        ]
    })
  
}

module.exports = function () {
    $(document).on(":initSlickSlider", function () {
        initSlickSlider();
    });

    $(document).on(":initProductDetailSlider", function () {
        initProductDetailSlider();
    });
    
    $(document).on(":initPDPRecommendationSlider", function () {
        initPDPRecommendationSlider();
    });

    initSlickSlider();
    initProductDetailSlider();
    initPDPRecommendationSlider();
};
