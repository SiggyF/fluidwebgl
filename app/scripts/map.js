
/* exported togglecontrols */

'use strict';

/*
 * L.ImageOverlay.Canvas is used to overlay images over the map (to specific geographical bounds).
 */
L.ImageOverlay.Canvas = L.ImageOverlay.extend({
    includes: L.Mixin.Events,

    // The width and height relate to the drawing canvas
    // This is independent of the size of the canvas on the screen
    options: {
        width: 1024,
        height: 1024
    },

    // We need a bounding box where we're drawing on
    initialize: function (bounds, options) { // (LatLngBounds, Object)
        this._bounds = L.latLngBounds(bounds);

        L.Util.setOptions(this, options);
    },

    // Here we overwrite the _initImage so we correctly place the canvas on the screen.
    _initImage: function () {
        var topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest());
        var bottomRight = this._map.latLngToLayerPoint(this._bounds.getSouthEast());
        var size = bottomRight._subtract(topLeft);

        // The image is the canvas
        this._image = this.canvas = L.DomUtil.create('canvas', 'leaflet-image-layer');
        if (this.options.id) {
            this._image.id = this.options.id;
        }
        // Set the width and height properties, custom or depending on view size
        this._image.width  = this.options.width || size.x;
        this._image.height = this.options.width || size.y;

        if (this._map.options.zoomAnimation && L.Browser.any3d) {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
        } else {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
        }

        this._updateOpacity();

        //TODO createImage util method to remove duplication
        L.Util.extend(this._image, {
            galleryimg: 'no',
            onselectstart: L.Util.falseFn,
            onmousemove: L.Util.falseFn,
            onload: L.Util.bind(this._onImageLoad, this)
        });
    },

    _reset: function () {
        var image   = this._image;
        var topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest());
        var bottomRight = this._map.latLngToLayerPoint(this._bounds.getSouthEast());
        // recompute the size
        var size = bottomRight._subtract(topLeft);

        image.width  = this.options.width || size.x;
        image.height = this.options.width || size.y;

        // reposition the image on reset
        L.DomUtil.setPosition(image, topLeft);

        // rescale in view
        image.style.width  = size.x + 'px';
        image.style.height = size.y + 'px';

    },

    // Not sure if canvas also has a load event...
    _onImageLoad: function () {
        this.fire('load');
    }
});

L.imageOverlay.canvas = function (bounds, options) {
    // Constructor function is lower case by default.
    return new L.ImageOverlay.Canvas(bounds, options);
};




function togglecontrols(map){
    // disable the controls of the map
    if (map.dragging.enabled()) {
        console.log('disabling map controls');
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) {
            map.tap.disable();
        }
        document.getElementById('map').style.cursor='default';
    } else {
        console.log('enable map controls');
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) {
            map.tap.enable();
        }
        document.getElementById('map').style.cursor='grab';
    }

}
