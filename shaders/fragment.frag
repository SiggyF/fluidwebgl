precision mediump float;

// our textures
// current drawing
uniform sampler2D u_imagedrawing;
// velocities
uniform sampler2D u_imageuv;
// buffer 0 (previous timestep)
uniform sampler2D u_imagefbo0;

uniform vec2 u_webglSize;

// Should we clear?
uniform bool u_clear3d;

// the texCoords passed in from the vertex shader, in 0,1.
varying vec2 v_texCoord;


void main() {
  // get color from drawing
  vec4 fbo0 = texture2D(u_imagefbo0, v_texCoord);
  vec4 colorold = fbo0;
  vec4 colordrawing = texture2D(u_imagedrawing, v_texCoord);

  // get uv velocity
  vec2 flipCoord = vec2(v_texCoord[0], 1.0-v_texCoord[1]);

  // I want to flip y, but can't get it working
  vec4 coloruv = texture2D(u_imageuv, flipCoord);

  // uv in pixels/frame (0.5/128.0) -> correction for
  vec2 uv = vec2(
                 (coloruv[0] - 0.5)/0.5,
                 -(coloruv[1] - 0.5)/0.5
                 ) - vec2(1.0/256.0, -1.0/256.0) ;

  // if we don't have a velocity, stop rendering
  if (abs(uv).x + abs(uv).y < 0.001) {
    // gl_FragColor.a = 0.0;
    discard;
  }



  // get advected color from previous texture

  // render using the old framebuffer
  vec2 source = v_texCoord - uv/60.0;
  vec4 colornew = texture2D(u_imagefbo0, source);


  // Either mix the color or just add them
  gl_FragColor = mix(colornew, colordrawing, colordrawing.a);
  return;

  // Optional, fade out on the coast
  if (abs(uv).x  + abs(uv).y <= 0.001) {
    // fade out points on land
    // gl_FragColor.a = max(gl_FragColor.a - 5.0/256.0, 0.0);
    gl_FragColor = max(gl_FragColor - 3.0/256.0, 0.0);
  }
  return;


}
