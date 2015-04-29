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
uniform bool u_circle;
uniform bool u_mask;
uniform bool u_fade;

const float u_scale = 200.0;
// the texCoords passed in from the vertex shader, in 0,1.
varying vec2 v_texCoord;

vec2 uvcircle(vec2 v_texCoord) {
  float PI = 3.14159265;
  float r = length(v_texCoord*2.0 - 1.0);
  // coordinate in -1, 1
  float x = (v_texCoord.x - 0.5)*2.0;
  float y = (v_texCoord.y - 0.5)*2.0;

  float omega = 0.0;
  omega = atan(y, x);
  if (omega < 0.0) {
    omega =  (2.0*PI) + omega;
  }

  vec2 uv = vec2(r*sin(omega), -r*cos(omega)) * 1.1;
  return uv;
}

void main() {
  if (u_clear3d) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
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

  // uv in pixels/frame (0.5/128.0) -> correction for
  // vec2 uv = vec2(
  //                (coloruv.r - 0.5)/0.5,
  //                -(coloruv.g - 0.5)/0.5
  //                ) - vec2(1.0/256.0, -1.0/256.0) ;

  // Correction in the range of 5.0???? Why? Compression artifacts...
  vec2 uv = vec2(
                 (coloruv.r - 0.5)/0.5 - 1.0/256.0,
                 -(coloruv.g - 0.5)/0.5 - 1.0/256.0
                 )  ;


  // if we don't have a velocity, stop rendering
  // if (abs(uv).x  + abs(uv).y < 0.0001) {
  //   gl_FragColor.a = 0.0;
  //   discard;
  // }
  if (u_mask && uv.x == 0.0 && uv.y == 0.0) {
    gl_FragColor.a = 0.0;
    discard;
  }
  // if we're masked stop rendering
  if (u_mask  && coloruv.b > 0.5) {
    gl_FragColor.a = 0.0;
    discard;
  }

  // if we use a circular velocity field, update the uv using a circle
  if(u_circle) {
    uv = uvcircle(v_texCoord);
    float dx = 0.01;
    float dy = 0.01;
    vec2 duvdx = (uvcircle(v_texCoord + vec2(dx, 0.0)) - uvcircle(v_texCoord - vec2(dx, 0.0)))/dx ;
    vec2 duvdy = uvcircle(v_texCoord + vec2(0.0, dy)) - uvcircle(v_texCoord - vec2(0.0, dy)) ;
  }



  // get advected color from previous texture
  // render using the old framebuffer
  vec2 source = v_texCoord - uv/(u_scale);
  vec4 colornew = texture2D(u_imagefbo0, source);

  // Either mix the color or just add them
  gl_FragColor = mix(colornew, colordrawing, colordrawing.a);
  if (u_circle) {
    return;
  }
  if (u_fade) {
    gl_FragColor = max(gl_FragColor - 1.0/u_scale, 0.0);
  }
  // Optional, fade out on the coast
  if (abs(uv).x  + abs(uv).y <= 0.001) {
    // fade out points on land
    // gl_FragColor.a = max(gl_FragColor.a - 5.0/256.0, 0.0);
    gl_FragColor = max(gl_FragColor - 1.0/u_scale, 0.0);
  }
  return;


}
