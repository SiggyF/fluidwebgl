/* exported: sketch  */
'use strict';

var COLOURS = [ '#E3EB64', '#A7EBCA', '#DD2244', '#D8EBA7', '#868E80' ];
COLOURS = ['red', 'green', 'blue', 'grey', 'orange'];
COLOURS = ['black', 'white', 'grey'];
COLOURS = ['#96CEB4', '#FFEEAD', '#FF6F69', '#FFCC5C', '#AAD8B0'];
var radius = 2.5;
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
        radius = radius ;
    },
    // Event handlers
    keydown: function() {
        var i, j, l, x, y;
        if ( this.keys.C ) {
            this.clear();
        }
        if ( this.keys.P ) {

            for (i = 0, l = 1000; i < l; i++) {
                x = Math.random() * this.element.width;
                y = Math.random() * this.element.height;
                this.lineCap = 'round';
                this.lineJoin = 'round';
                this.fillStyle = COLOURS[Math.floor(Math.random()*COLOURS.length)];
                this.lineWidth = radius;
                this.beginPath();
                this.moveTo( x, y );
                this.arc(x, y, radius, 0, 2*Math.PI);
                this.fill();

            }
        }
        if ( this.keys.Q ) {
            for (i = 0; i < this.element.width; i+=50) {
                for (j = 0; j < this.element.height; j+=50) {
                    x = Math.random() * this.element.width;
                    y = Math.random() * this.element.height;
                    this.lineCap = 'round';
                    this.lineJoin = 'round';
                    this.fillStyle = 'white';
                    this.lineWidth = radius;
                    this.beginPath();
                    this.moveTo( i, j );
                    this.arc(i, j, radius, 0, 2*Math.PI);
                    this.fill();
                }
            }
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
            this.strokeStyle = COLOURS[Math.floor(Math.random()*COLOURS.length)];
            this.lineWidth = radius;
            this.beginPath();
            this.moveTo( touch.ox, touch.oy );
            this.lineTo( touch.x, touch.y );
            this.stroke();
        }
    },
    click: function() {
        for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
            touch = this.touches[i];
            this.lineCap = 'round';
            this.lineJoin = 'round';
            this.fillStyle = COLOURS[Math.floor(Math.random()*COLOURS.length)];
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
