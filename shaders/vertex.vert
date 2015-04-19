// coordinates in 0,1
attribute vec2 a_position;

// don't y flip images while drawing to the textures
uniform float u_flipY;

// coordinate in 0,1 space
varying vec2 v_texCoord;

void main() {

  // convert the rectangle from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = zeroToOne;
}