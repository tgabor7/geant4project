#version 300 es

in vec3 vertices;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 transformation;

void main(void){

	gl_Position = projection * view * transformation * vec4(vertices,1.0);

}