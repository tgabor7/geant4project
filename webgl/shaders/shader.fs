precision mediump float;

varying vec2 tex_coords;
varying vec3 Normal;
varying vec3 fragPos;

uniform vec3 color;
uniform sampler2D sampler;

void main()
{
  vec3 norm = normalize(Normal);
  vec3 lightDir = normalize(vec3(100) - fragPos); 
  float diff = max(dot(norm, lightDir), 0.0); 
  vec3 diffuse = diff * vec3(1); 
  gl_FragColor = vec4((vec3(.1)+diffuse)*color,1.0);
 }