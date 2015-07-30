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
uniform bool u_clearwater;

uniform bool u_fade;

const bool u_mask = true;
const float u_scale = 1000.0;
// the texCoords passed in from the vertex shader, in 0,1.
varying vec2 v_texCoord;




void main() {

  vec4 clearcolor = vec4(0.0, 0.0, 0.0, 0.0);
  if (u_clearwater) {
    gl_FragColor = clearcolor;
    return;
  };
  // get color from drawing
  vec4 fbo0 = texture2D(u_imagefbo0, v_texCoord);
  vec4 colorold = fbo0;
  vec4 colordrawing = texture2D(u_imagedrawing, v_texCoord);

  // get uv velocity
  vec2 flipCoord = vec2(v_texCoord[0], 1.0-v_texCoord[1]);

  // I want to flip y, but can't get it working
  vec4 coloruv = texture2D(u_imageuv, flipCoord);


  // Correction in the range of 5.0???? Why? Compression artifacts...
  vec2 uv = vec2(
                 (coloruv.r - 0.5)/0.5 ,
                 -(coloruv.g - 0.5)/0.5
                 )  ;


  // if we're masked stop rendering
  if (u_mask  && coloruv.b > 0.5) {
    // gl_FragColor.a = 0.0;
    discard;
  }

  // if the velocity is 0 we don't have to render
  if (u_mask && uv.x == 0.0 && uv.y == 0.0) {
    // gl_FragColor.a = 0.0;
    discard;
  }

  // get advected color from previous texture
  // render using the old framebuffer
  vec2 source = v_texCoord - uv/(u_scale) ;

  vec4 colornew = texture2D(u_imagefbo0, source);

  // Either mix the color or just add them
  vec4 colormixed = mix(colornew, colordrawing, colordrawing.a);

  // Fade out over time
  if (!u_fade) {
    gl_FragColor = colormixed;
    return;
  }
  gl_FragColor = max(colormixed - 1.0/(60.0 * 5.0), 0.0);
  return;


}
