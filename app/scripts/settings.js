/* jshint: exported settings */
// Togglemap should be defined by the map control
/* global togglecontrols, map */
'use strict';

// settings for gui
var settings = {
    cleardrawing: true,
    clearwater: false,
    fade: false,
    second: false,
    fps: 60.0,
    togglecontrols: function(){
        togglecontrols(map);
    }
};
var gui = new dat.GUI();
gui.add(settings, 'cleardrawing');
gui.add(settings, 'clearwater');
gui.add(settings, 'fade');
gui.add(settings, 'fps', 1, 60);
gui.add(settings, 'togglecontrols');


