'use strict';

/*
 * L.ImageOverlay.Canvas is used to overlay images over the map (to specific geographical bounds).
 */
L.ImageOverlay.Canvas = L.ImageOverlay.extend({
    includes: L.Mixin.Events,

    // The width and height relate to the drawing canvas
    // This is independent of the size of the canvas on the screen
    options: {
        width: 1000,
        height: 1000
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



// Example usage:
//
// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([37.92, -122.07], 10);

// add an OpenStreetMap tile layer
L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-i875mjb7'
}).addTo(map);


// var southWest = L.latLng(37.405, -122.66),
//     northEast = L.latLng(38.305, -121.885),
//     bounds = L.latLngBounds(southWest, northEast);

var southWest = L.latLng(37.4487848675731, -123.09234894317646),
    northEast = L.latLng(38.780310596186474, -121.2218887213739),
    bounds = L.latLngBounds(southWest, northEast);
L.imageOverlay.canvas(bounds, {id: 'webgl'}).addTo(map);
L.imageOverlay.canvas(bounds, {id: 'drawing'}).addTo(map);
