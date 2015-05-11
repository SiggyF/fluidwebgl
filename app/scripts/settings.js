/* jshint: exported settings */
'use strict';

// settings for gui
var settings = {
    clear2d: true,
    clear3d: false,
    circle: false,
    horizontal: false,
    mask: true,
    fade: false,
    second: false,
    fps: 60.0,
    togglemap: function(){$('#map').toggle();}
};
var gui = new dat.GUI();
gui.add(settings, 'clear2d');
gui.add(settings, 'clear3d');
gui.add(settings, 'circle');
gui.add(settings, 'horizontal');
gui.add(settings, 'mask');
gui.add(settings, 'fade');
gui.add(settings, 'fps', 1, 60);
gui.add(settings, 'togglemap');

