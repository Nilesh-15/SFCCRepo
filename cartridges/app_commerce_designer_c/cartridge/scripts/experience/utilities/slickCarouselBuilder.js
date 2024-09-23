"use strict";

/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["model"] }] */

/**
 * Helper to encapsulate common code for building a carousel
 *
 * @param {Object} model - model object for a component
 * @param {Object} context - model object for a component
 * @return {Object} model - prepared model
 */
function init(model, context) {
    var PageRenderHelper = require("*/cartridge/experience/utilities/PageRenderHelper.js");
    model.regions = PageRenderHelper.getRegionModelRegistry(context.component);
    model.isOnline = context.content.isOnline ? context.content.isOnline : null;

    var xsColSize = parseInt(context.content.xsCarouselSlidesToDisplay, 10);
    var smColSize = parseInt(context.content.smCarouselSlidesToDisplay, 10);
    var mdColSize = parseInt(context.content.mdCarouselSlidesToDisplay, 10);

    var xsScrollSize = parseInt(context.content.xsCarouselSlidesToScroll, 10);
    var smScrollSize = parseInt(context.content.smCarouselSlidesToScroll, 10);
    var mdScrollSize = parseInt(context.content.mdCarouselSlidesToScroll, 10);

    var xsIndicators = context.content.xsCarouselIndicators;
    var smIndicators = context.content.smCarouselIndicators;
    var mdIndicators = context.content.mdCarouselIndicators;

    var xsControls = context.content.xsCarouselControls;
    var smControls = context.content.smCarouselControls;
    var mdControls = context.content.mdCarouselControls;

    var xsCarouselCenterModeValue = context.content.xsCarouselCenterModeValue;
    var smCarouselCenterModeValue = context.content.smCarouselCenterModeValue;
    var mdCarouselCenterModeValue = context.content.mdCarouselCenterModeValue;

    var carouselAutoPlayValue = context.content.carouselAutoPlayValue
        ? context.content.carouselAutoPlayValue
        : false;
    var carouselInfinitePlayValue = context.content.carouselInfinitePlayValue
        ? context.content.carouselInfinitePlayValue
        : false;

    var slickSettingJson = {
        arrows: mdControls,
        dots: mdIndicators,
        slidesToShow: mdColSize,
        slidesToScroll: mdScrollSize,
        pauseOnFocus: false,
        autoplay: carouselAutoPlayValue,
        infinite: carouselInfinitePlayValue,
        centerMode: mdCarouselCenterModeValue,
        responsive: [
            {
                breakpoint: 1040,
                settings: {
                    arrows: mdControls,
                    dots: mdIndicators,
                    slidesToShow: smColSize,
                    slidesToScroll: mdScrollSize,
                    centerMode: mdCarouselCenterModeValue,
                },
            },
            {
                breakpoint: 769,
                settings: {
                    arrows: smControls,
                    dots: smIndicators,
                    slidesToShow: smColSize,
                    slidesToScroll: smScrollSize,
                    centerMode: smCarouselCenterModeValue,
                },
            },
            {
                breakpoint: 544,
                settings: {
                    arrows: xsControls,
                    dots: xsIndicators,
                    slidesToShow: xsColSize,
                    slidesToScroll: xsScrollSize,
                    centerMode: xsCarouselCenterModeValue,
                },
            },
        ],
    };

    var slickSetting = JSON.stringify(slickSettingJson);

    if (context.content.carouselIndicatorsAlignment == "Left") {
        model.regions.slides.setClassName(
            "slick-carousel-inner slick-slider slick-dot-left"
        );
    } else if (context.content.carouselIndicatorsAlignment == "Right") {
        model.regions.slides.setClassName(
            "slick-carousel-inner slick-slider slick-dot-right"
        );
    } else {
        model.regions.slides.setClassName(
            "slick-carousel-inner slick-slider slick-dot-center"
        );
    }

    model.regions.slides.setAttribute("data-slick", slickSetting);

    var numberOfSlides = model.regions.slides.region.size;

    if (
        context.component.typeID === "einstein.einsteinCarousel" ||
        context.component.typeID === "einstein.einsteinCarouselProduct" ||
        context.component.typeID === "einstein.einsteinCarouselCategory"
    ) {
        numberOfSlides = context.content.count;
    }

    model.id =
        "carousel-" + PageRenderHelper.safeCSSClass(context.component.getID());
    model.numberOfSlides = model.regions.slides.region.size;

    if (
        context.component.typeID === "einstein.einsteinCarousel" ||
        context.component.typeID === "einstein.einsteinCarouselProduct" ||
        context.component.typeID === "einstein.einsteinCarouselCategory"
    ) {
        model.numberOfSlides = context.content.count - 1;
    }

    model.title = context.content.textHeadline
        ? context.content.textHeadline
        : null;
    model.subTitle = context.content.subTextHeadline
        ? context.content.subTextHeadline
        : null;
    model.containerClass = context.content.containerClass
        ? context.content.containerClass
        : "";

    return model;
}

module.exports = {
    init: init,
};
