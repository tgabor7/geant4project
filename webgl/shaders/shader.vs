precision mediump float;

attribute vec3 vertPosition;
attribute vec3 normal;

varying vec2 tex_coords;
varying vec3 Normal;
varying vec3 fragPos;

uniform mat4 projection;
uniform mat4 transformation;
uniform mat4 view;

void main()
{
  gl_Position = projection * view * transformation * vec4(vertPosition, 1.0);
  fragPos = vec3(transformation * vec4(vertPosition, 1.0));
  Normal = normal;
}