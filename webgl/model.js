import { Vector3 } from './maths.js';

class Model {

    constructor(vertices,normals, gl) {

        this.vertices = vertices;
        this.normals = normals;
        this.gl = gl;
        this.color = new Vector3(.1,.1,.1);
        this.drawLines = true;
        
        this.outline = true;

        this.position = new Vector3(0,0,0);
        this.rotation = new Vector3(0,0,0);
        this.scale = new Vector3(1,1,1);
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW, 0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);

        this.nvbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nvbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);


    }
    draw() {
        if(this.drawLines) this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.vertices.length / 3);
        else this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    }
};

export default Model;