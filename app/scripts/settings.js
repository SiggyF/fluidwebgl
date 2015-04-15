// settings for gui
var settings = {
    clear2d: true,
    clear3d: true,
    togglemap: function(){$('#map').toggle();}
};
var gui = new dat.GUI();
gui.add(settings, 'clear2d');
gui.add(settings, 'clear3d');
gui.add(settings, 'togglemap');

