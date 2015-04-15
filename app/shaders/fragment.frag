precision mediump float;

// our textures
// drawing from previous timestep
uniform sampler2D u_imagewebgl;
// current drawing
uniform sampler2D u_imagedrawing;

// velocities
uniform sampler2D u_imageuv;
// buffer 0
uniform sampler2D u_imagedrawing0;
// buffer 1
uniform sampler2D u_imagedrawing1;

uniform vec2 u_webglSize;

uniform bool u_clear3d;

// the texCoords passed in from the vertex shader, in 0,1.
varying vec2 v_texCoord;

void main() {

  // get uv velocity
  vec2 flipCoord = vec2(v_texCoord[0], 1.0-v_texCoord[1]);
  // I want to flip y, but can't get it working
  vec4 coloruv = texture2D(u_imageuv, flipCoord);

  // uv in pixels/frame (0.5/128.0) -> correction for
  vec2 uv = vec2(
                 (coloruv[0] - 0.5)/0.5,
                 -(coloruv[1] - 0.5)/0.5
                 ) - vec2(1.0/256.0, -1.0/256.0) ;

  // // if we don't have a velocity, stop rendering
  // if (abs(uv).x + abs(uv).y <= 0.0001) {
  //   // gl_FragColor.a = 0.0;
  //   discard;
  // }

  // get color from drawing
  vec4 colordrawing = texture2D(u_imagedrawing, v_texCoord);

  vec4 colorold = texture2D(u_imagedrawing0, v_texCoord);

  // get advected color from previous texture
  // render using the old framebuffer
  vec2 source = v_texCoord - uv/60.0;
  vec4 colornew = texture2D(u_imagedrawing0, source);


  // Either mix the color or just add them
  gl_FragColor = mix(colornew, colordrawing, colordrawing.a);
  // gl_FragColor = colornew+colordrawing;
  if (colorold.rgb == gl_FragColor.rgb) {
    // 1  less opaque if color remains constant
    gl_FragColor.a = max(gl_FragColor.a - 1.0/256.0, 0.0);
  }
  if (abs(uv).x  + abs(uv).y <= 0.0001) {
    // 5 less opaque if u, v = 0
    gl_FragColor.a = max(gl_FragColor.a - 5.0/256.0, 0.0);
  }

  if (u_clear3d) {
    // clear if clear, workaround
    gl_FragColor.a = 0.0;
  };


}
