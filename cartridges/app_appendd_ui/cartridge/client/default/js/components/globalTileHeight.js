
/**
* This function calculates max height of a tile and set to other tiles to equalize the height
*/
function equalTileHeight() {
    var maxTileBodyHeight = 0;
    var $tileBodies = $(".product-tile .prod-tile__body");
    
    $tileBodies.each(function() {
        var currentTileBodyHeight = $(this).outerHeight();
        if (currentTileBodyHeight > maxTileBodyHeight) {
            maxTileBodyHeight = currentTileBodyHeight;
        }
    });
    
    $tileBodies.css("height", maxTileBodyHeight + "px");
}

$(window).on('load', function(){
    equalTileHeight();
});

$(window).on('resize', function(){
    equalTileHeight();
});

module.exports = {
    equalTileHeight:equalTileHeight
}

