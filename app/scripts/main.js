/* global setupWebGL, createProgramFromSources, settings, addDrawing */
/* jshint devel:true, camelcase: false */

'use strict';


// Example usage:
//
// create a map in the "map" div, set the view to a given place and zoom
// var map = L.map('map');

// add an OpenStreetMap tile layer
// we keep this one so no need to add it to the list of layers
// L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
//     maxZoom: 18,
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
//         '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//         'Imagery © <a href="http://mapbox.com">Mapbox</a>',
//     id: 'examples.map-i875mjb7'
// }).addTo(map);
// L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',{
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
// }).addTo(map);

L.mapbox.accessToken = 'pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA';
var map = L.mapbox.map('map', 'siggyf.c74e2e04');

// var models = fetch('data/models.json');
// models
//     .then(function(response) {
//         return response.json();
//     }).then(function(data) {
//         console.log(data);
//         var model = _.values(data.models)[0];
//         return model;
//     });

var models = [
    {
        "title": "wadden",
        "abstract": "wadden model",
        "engine": "delft3d flow",
        "videos": [
            "movies/wadden.webm",
            "movies/wadden.mp4"
        ],
        "extent": {
            "sw": [52.498012542723586, 4.026927471160947],
            "ne": [53.758518218850185, 6.538724422447244]
        },
        "zoom": 10,
        "width": 1024,
        "height": 1024,
        "type": "img",
        "url": "images/monolisa.jpg"

    },
    {
        "title": "San Francisco ",
        "abstract": "wadden model",
        "engine": "delft3d flexible mesh",
        "videos": [
            "movies/im2.webm",
            "movies/im2.mp4"
        ],
        "extent": {
            "sw": [37.4487848675731, -123.09234894317646],
            "ne": [38.780310596186474, -121.2218887213739]
        },
        "zoom": 10,
        "width": 1024,
        "height": 1024,
        "type": "canvas"
    }
];

var model = models[0];
model.focus = [
    (model.extent.sw[0] + model.extent.ne[0])/2,
    (model.extent.sw[1] + model.extent.ne[1])/2
];
map.setView(model.focus, model.zoom);

var southWest = L.latLng(model.extent.sw[0], model.extent.sw[1]),
    northEast = L.latLng(model.extent.ne[0], model.extent.ne[1]),
    bounds = L.latLngBounds(southWest, northEast);

L.imageOverlay.canvas(bounds, {id: 'webgl'}).addTo(map);
if (model.type === 'canvas') {
    L.imageOverlay.canvas(bounds, {id: 'drawing'}).addTo(map);
}
else {
    // model should be of type img
    var overlay = L.imageOverlay(model.url, bounds, {id: 'drawing'}).addTo(map);
    var img = $(overlay._image);
    img.attr('id', 'drawing');
    img.attr('width', 1024);
    img.attr('height', 1024);
    console.log(overlay, img);

}

// the element where we going to draw on
var webgl = document.getElementById('webgl');
console.log('webgl', webgl);
// the image or video with the current uv map
var uv = document.getElementById('uv');

// the drawing
var drawing = document.getElementById('drawing');

if (model.type == 'canvas') {
    var drawingcontainer = document.getElementById('drawingcontainer');
    // call function defined in drawing.js
    addDrawing(drawing, drawingcontainer);
    // the 2d context
    var drawingContext = drawing.getContext('2d');
}


// the webgl context
var gl = setupWebGL(webgl, {
    preserveDrawingBuffer: false,
    premultipliedAlpha: true,
    stencil: false
});

// gl.enable(gl.BLEND);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
// the texture that we're using
var textures = [
    {
        name: 'webgl',
        clamping: gl.CLAMP_TO_EDGE,
        interpolation: gl.LINEAR,
        texture: null,
        sampler: null,
        fbo: null,
        element: webgl,
        width: webgl.width,
        height: webgl.height
    },
    {
        name: 'drawing',
        clamping: gl.CLAMP_TO_EDGE,
        interpolation: gl.NEAREST,
        texture: null,
        sampler: null,
        fbo: null,
        element: drawing,
        width: drawing.width,
        height: drawing.height
    },
    {
        name: 'uv',
        clamping: gl.CLAMP_TO_EDGE,
        interpolation: gl.LINEAR,
        texture: null,
        sampler: null,
        fbo: null,
        element: uv,
        width: uv.width,
        height: uv.height
    }
];

// Listen to updates from the images and canvases
_.each(textures, function(texture){
    $(texture.element).on('load', function(){
        console.log(this, 'loaded');
        texture.width = texture.element.width;
        texture.height = texture.element.height;
    });
});

_.each(textures, function(texture){
    $(texture.element).on('loadedmetadata', function(){
        console.log(this, 'metadata loaded');
        texture.width = texture.element.videoWidth;
        texture.height = texture.element.videoHeight;
    });
    $(texture.element).on('play', function(){
        console.log(this, 'playing');
    });
    $(texture.element).on('timeupdate', function(){
        // activate current texture
        gl.activeTexture(texture.id);
        // load the video into it
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.element);

    });
});


// the framebuffers that we need
var framebuffers = [
    {
        name: 'fbo0',
        clamping: gl.CLAMP_TO_EDGE,
        interpolation: gl.LINEAR,
        texture: null,
        sampler: null,
        fbo: null,
        element: webgl,
        width: webgl.width,
        height: webgl.height
    },
    {
        name: 'fbo1',
        clamping: gl.CLAMP_TO_EDGE,
        interpolation: gl.NEAREST,
        texture: null,
        sampler: null,
        fbo: null,
        element: webgl,
        width: webgl.width,
        height: webgl.height
    }

];

// our yet to define render function
var render;





// download vertex source
var vertex = document.getElementById('vertex');
var vertexSource = fetch(vertex.src)
        .then(function(response) {
            return response.text();
        }).then(function(body) {
            return body;
        });

// download fragment source
var fragment = document.getElementById('fragment');
var fragmentSource = fetch(fragment.src)
        .then(function(response) {
            return response.text();
        }).then(function(body) {
            return body;
        });


// When both vertex and fragment source are retrieved call the
Promise.all([vertexSource, fragmentSource])
    .then(function(sources){
        // Setup the program, from the two downloaded sources
        var program = createProgramFromSources(gl, sources);
        // set this program as the current program
        gl.useProgram(program);

        // non pre-multiplied alpha textures.
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // provide texture coordinates for the rectangle.
        // Create a buffer for the position of the rectangle corners.
        // The position is in scale 0,1
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Set a rectangle to the (0,1) domain
        var x1 = -1.0;
        var x2 = 0 + 1.0;
        var y1 = -1.0;
        var y2 = 0 + 1.0;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x2, y2,
            x1, y2
        ]), gl.STATIC_DRAW);


        // lookup canvas size location
        var webglSizeLocation = gl.getUniformLocation(program, "u_webglSize");
        // set the texture size
        gl.uniform2f(webglSizeLocation, webgl.width, webgl.height);

        var flipYLocation = gl.getUniformLocation(program, "u_flipY");
        gl.uniform1f(flipYLocation, 1);

        console.log('webglsize', webglSizeLocation, 'flip', flipYLocation);

        // create name textures


        _.each(textures, function(t, i) {
            // create a new texture
            var texture = gl.createTexture();
            t.id = gl.TEXTURE0 + i;
            // draw rectangle with current texture
            gl.activeTexture(t.id);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, t.clamping);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, t.clamping);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, t.interpolation);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, t.interpolation);

            // add the texture to the texture info
            t.texture = texture;

            // Fill the texture with the corresponding element
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.element);

            // lookup the sampler locations.
            var u_imageLocation = gl.getUniformLocation(program, "u_image" + t.name);
            // set which texture units to render with.
            gl.uniform1i(u_imageLocation, i);
            t.sampler = u_imageLocation;
        });
        // show what we have
        console.log(textures);



        // Create a framebuffer
        _.each(framebuffers, function(fbo, i){
            // Each framebuffer should have a texture attached to it.

            // create an empty texture to draw on
            var texture = gl.createTexture();
            // define it's id
            fbo.id = gl.TEXTURE0 + i + textures.length;
            // activate the id
            gl.activeTexture(fbo.id);
            // bind the texture to it
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, fbo.clamping);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, fbo.clamping);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, fbo.interpolation);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, fbo.interpolation);

            fbo.texture = texture;

            // Instantiate the image with an empty texture
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, webgl.width, webgl.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null
            );

            // lookup the sampler locations.
            var u_imageLocation = gl.getUniformLocation(program, "u_image" + fbo.name);
            // Lookup the location of the texture
            gl.uniform1i(u_imageLocation, i + textures.length);

            // Store the sampler
            fbo.sampler = u_imageLocation;

            // Create the framebuffer
            fbo.fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
            // Attach a texture to it.
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbo.texture, 0
            );

        });

        // select all webgl compatabile settings
        var glSettings = _.filter(
            // lookup all settings and convert to objects
            _.map(
                settings,
                function(value, key){
                    return {
                        name: key,
                        value: value,
                        gl: (typeof value) === 'number' || (typeof value === 'boolean'),
                        type: (typeof value)
                    };
                }),
            function(setting){
                return setting.gl;
            }
        );

        _.each(glSettings, function(setting){
            console.log(setting);
            // location of the setting in the graphics card
            setting.location = gl.getUniformLocation(program, "u_" + setting.name);
            // set the value
            gl.uniform1f(setting.location, setting.value);
        });
        console.log(glSettings);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // At init time. Clear the screen.
        gl.clearColor(1.0, 1.0, 1.0, 0.2);
        gl.clear(gl.COLOR_BUFFER_BIT);


        var stop = false;
        var frameCount = 0;
        var fpsInterval, startTime, now, then, elapsed;


        function startAnimating() {
            fpsInterval = 1000 / settings.fps;
            then = Date.now();
            startTime = then;
            console.log(startTime);
            render();
        }


        // // Turn off rendering to alpha
        // gl.colorMask(true, true, true, true);
        render = function(){

            // stop
            if (stop) {
                return;
            }
            // request another frame

            requestAnimationFrame(render);

            // calc elapsed time since last loop

            now = Date.now();
            elapsed = now - then;

            // if enough time has elapsed, draw the next frame

            if (elapsed > 1000 / settings.fps) {

                // first update the settings
                _.each(glSettings, function(setting){
                    // keep 2 objects in sync....
                    // no update, keep going
                    if (setting.value === settings[setting.name]) {
                        return;
                    }
                    // update, let's set it in memory
                    setting.value = settings[setting.name];
                    if (setting.type === 'boolean') {
                        console.log('updating setting', setting);
                        gl.uniform1i(setting.location, setting.value);
                    }
                });


                // Get ready for next frame by setting then=now, but...
                // Also, adjust for fpsInterval not being multiple of 16.67
                then = now - (elapsed % (1000 / settings.fps));

                // draw to the screen
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                // upload the active drawing
                if (settings.clear2d) {
                    gl.clearColor(0.0, 0.0, 0.0, 0.0);
                    gl.activeTexture(textures[1].id);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                } else
                {
                    gl.activeTexture(textures[1].id);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].element);
                }

                // clear the screen
                gl.clearColor(0.0, 0.0, 0.0, 0.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                // draw
                // finally draw the result to the canvas.
                gl.uniform1f(flipYLocation, -1);  // need to y flip for canvas
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                // // Ping-pong the framebuffers
                // // Select the texture of the previous framebuffer
                var previous = framebuffers[0];
                var current = framebuffers[1];

                // draw to this fbo
                gl.bindFramebuffer(gl.FRAMEBUFFER, current.fbo);
                // clear the screen
                gl.clearColor(0.0, 0.0, 0.0, 0.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                // draw
                // finally draw the result to the framebuffer
                gl.uniform1f(flipYLocation, 1);  // need to y flip for canvas
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


                // copy for next timestep
                // where to copy to?
                gl.activeTexture(previous.id);
                // copying from the framebuffer to the active texture
                gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, webgl.width, webgl.height, 0);


                // clear the drawing
                if (settings.clear2d && model.type === 'canvas') {
                    drawingContext.clearRect(0, 0, drawing.width, drawing.height);
                }
                // clear 3d, not working at the moment....
                if (settings.clear3d) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, previous.fbo);
                    gl.clearColor(0.0, 0.0, 0.0, 0.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }

                // TESTING...Report #seconds since start and achieved fps.
                var sinceStart = now - startTime;
                var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
                // upload to the gpu so we can scale
                if ((frameCount % 100) === 0) {
                    console.log("Elapsed time:", Math.round(sinceStart / 1000 * 100) / 100, 'fps', currentFps, 'frameCount:', frameCount);
                }

            }
        };

        startAnimating();
        // render();
    });




