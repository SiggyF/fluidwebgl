/* exported: sketch  */
'use strict';

var COLOURS = [ '#E3EB64', '#A7EBCA', '#DD2244', '#D8EBA7', '#868E80' ];
var radius = 0;
Sketch.create({
    element: document.getElementById('drawing'),
    // if you don't pass a container, Sketch wil append the element to the body
    container: document.getElementById('drawingcontainer'),
    autoclear: false,
    fullscreen: false,
    exists: true,
    // strokeStyle: 'hsla(200, 50%, 50%, .4)',
    // globalCompositeOperation: 'darker',
    setup: function() {
        console.log( 'setup' );
    },
    update: function() {
        radius = 10 ;
    },
    // Event handlers
    keydown: function() {
        if ( this.keys.C ) {
            this.clear();
        }
    },
    // Mouse & touch events are merged, so handling touch events by default
    // and powering sketches using the touches array is recommended for easy
    // scalability. If you only need to handle the mouse / desktop browsers,
    // use the 0th touch element and you get wider device support for free.
    touchmove: function() {
        if (!this.keys.SHIFT) {
            return;
        }
        for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
            touch = this.touches[i];
            this.lineCap = 'round';
            this.lineJoin = 'round';
            this.fillStyle = this.strokeStyle = COLOURS[Math.floor(Math.random()*COLOURS.length)];
            // this.fillStyle = this.strokeStyle = 'black';
            this.lineWidth = radius;
            this.beginPath();
            this.moveTo( touch.ox, touch.oy );
            this.lineTo( touch.x, touch.y );
            this.stroke();
            this.fill();
        }
    },
    click: function() {
        for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
            touch = this.touches[i];
            this.lineCap = 'round';
            this.lineJoin = 'round';
            this.fillStyle = this.strokeStyle = COLOURS[Math.floor(Math.random()*COLOURS.length)];
            // this.fillStyle = this.strokeStyle = 'black';
            this.lineWidth = radius;
            this.beginPath();
            this.moveTo( touch.ox, touch.oy );
            this.arc(touch.ox, touch.oy, radius, 0, 2*Math.PI);
            this.fill();
        }
        console.log('click', this);
    }
    // touchmove: function() {
    //     for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
    //         touch = this.touches[i];
    //         this.lineCap = 'round';
    //         this.lineJoin = 'round';
    //         this.fillStyle = this.strokeStyle = 'red';
    //         this.lineWidth = radius;
    //         this.beginPath();
    //         this.moveTo( touch.ox, touch.oy );
    //         this.lineTo( touch.x, touch.y );
    //         this.stroke();
    //     }
    // }
    // touchmove: function() {
    //     for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
    //         touch = this.touches[i];
    //         for (var fraction = 0, l = 1; fraction < l; fraction+=0.1) {
    //             this.beginPath();
    //             var dx = (touch.x - touch.ox);
    //             var dy = (touch.y - touch.oy);
    //             this.arc(touch.ox + dx*fraction , touch.oy + dy*fraction, 10, 0, TWO_PI );
    //             this.closePath();
    //             this.fillStyle = 'rgba(0.4, 0.5, 0.6, 1.0)';
    //             this.fill();
    //             this.stroke();
    //         }
    //     }
    // }
});
