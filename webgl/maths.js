class Matrix extends Float32Array {
    constructor() {
        super(16);
        this[0] = 1.0;
        this[5] = 1.0;
        this[10] = 1.0;
        this[15] = 1.0;
    }
}
class Vector4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

}
class Camera {
    constructor(x, y, d, p, a) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.p = p;
        this.a = a;
    }

}
class Maths {
    static scale(mat, v) {
        var res = new Matrix();
        for(var i = 0;i<16;i++){
            res[i] = mat[i];
        }
        res[0] = res[0] * v.x;
        res[1] = res[1] * v.x;
        res[2] = res[2] * v.x;

        res[4] = res[4] * v.y;
        res[5] = res[5] * v.y;
        res[6] = res[6] * v.y;

        res[8] = res[8] * v.z;
        res[9] = res[9] * v.z;
        res[10] = res[10] * v.z;

        return res;

    }
    static translate(mat, v) {
        var res = new Matrix();
        for(var i = 0;i<16;i++){
            res[i] = mat[i];
        }
        res[12] = mat[0] * v.x + mat[4] * v.y + mat[8] * v.z + mat[12];
        res[13] = mat[1] * v.x + mat[5] * v.y + mat[9] * v.z + mat[13];
        res[14] = mat[2] * v.x + mat[6] * v.y + mat[10] * v.z + mat[14];
        res[15] = mat[3] * v.x + mat[7] * v.y + mat[11] * v.z + mat[15];

        return res;
    }
    static normalize(v) {
        var result = new Vector3();
        result.x = v.x;
        result.y = v.y;
        result.z = v.z;
        
        var l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        result.x /= l;
        result.y /= l;
        result.z /= l;
        
        return result;
    }
    static mulVectorDouble(v, d) {
        var res = new Vector3(0,0,0);
        res.x = v.x;
        res.y = v.y;
        res.z = v.z;
        
        res.x *= d;
        res.y *= d;
        res.z *= d;

        return res;
    }
    static cross(v, p) {
        var r = new Vector3(0,0,0);

        r.x = v.y * p.z - v.z * p.y;
        r.y = v.z * p.x - v.x * p.z;
        r.z = v.x * p.y - v.y * p.x;

        return r;
    }
    static lookAt(eye, center, up) {
        var forward = new Vector3(0,0,0);
        var upt = new Vector3(0,0,0);

        forward.x = center.x - eye.x;
        forward.y = center.y - eye.y;
        forward.z = center.z - eye.z;
        
        forward = this.normalize(forward);

        
        var side = new Vector3(0,0,0);
        side = this.cross(forward, up);
  
        
        side = this.normalize(side);
       
        

        upt = this.cross(side, forward);
        

        var m = new Matrix();
        m[0] = side.x;
        m[1] = side.y;
        m[2] = side.z;
        m[4] = upt.x;
        m[5] = upt.y;
        m[6] = upt.z;
        m[8] = -forward.x;
        m[9] = -forward.y;
        m[10] = -forward.z;
        
        m = this.invert(m);

        return m;
    }
    static invert(m) {
        var result = new Matrix();
        var inv = new Matrix();
        
        var det = 0.0;
        inv[0] = m[5] * m[10] * m[15] -
            m[5] * m[11] * m[14] -
            m[9] * m[6] * m[15] +
            m[9] * m[7] * m[14] +
            m[13] * m[6] * m[11] -
            m[13] * m[7] * m[10];

        inv[4] = -m[4] * m[10] * m[15] +
            m[4] * m[11] * m[14] +
            m[8] * m[6] * m[15] -
            m[8] * m[7] * m[14] -
            m[12] * m[6] * m[11] +
            m[12] * m[7] * m[10];

        inv[8] = m[4] * m[9] * m[15] -
            m[4] * m[11] * m[13] -
            m[8] * m[5] * m[15] +
            m[8] * m[7] * m[13] +
            m[12] * m[5] * m[11] -
            m[12] * m[7] * m[9];

        inv[12] = -m[4] * m[9] * m[14] +
            m[4] * m[10] * m[13] +
            m[8] * m[5] * m[14] -
            m[8] * m[6] * m[13] -
            m[12] * m[5] * m[10] +
            m[12] * m[6] * m[9];

        inv[1] = -m[1] * m[10] * m[15] +
            m[1] * m[11] * m[14] +
            m[9] * m[2] * m[15] -
            m[9] * m[3] * m[14] -
            m[13] * m[2] * m[11] +
            m[13] * m[3] * m[10];

        inv[5] = m[0] * m[10] * m[15] -
            m[0] * m[11] * m[14] -
            m[8] * m[2] * m[15] +
            m[8] * m[3] * m[14] +
            m[12] * m[2] * m[11] -
            m[12] * m[3] * m[10];

        inv[9] = -m[0] * m[9] * m[15] +
            m[0] * m[11] * m[13] +
            m[8] * m[1] * m[15] -
            m[8] * m[3] * m[13] -
            m[12] * m[1] * m[11] +
            m[12] * m[3] * m[9];

        inv[13] = m[0] * m[9] * m[14] -
            m[0] * m[10] * m[13] -
            m[8] * m[1] * m[14] +
            m[8] * m[2] * m[13] +
            m[12] * m[1] * m[10] -
            m[12] * m[2] * m[9];

        inv[2] = m[1] * m[6] * m[15] -
            m[1] * m[7] * m[14] -
            m[5] * m[2] * m[15] +
            m[5] * m[3] * m[14] +
            m[13] * m[2] * m[7] -
            m[13] * m[3] * m[6];

        inv[6] = -m[0] * m[6] * m[15] +
            m[0] * m[7] * m[14] +
            m[4] * m[2] * m[15] -
            m[4] * m[3] * m[14] -
            m[12] * m[2] * m[7] +
            m[12] * m[3] * m[6];

        inv[10] = m[0] * m[5] * m[15] -
            m[0] * m[7] * m[13] -
            m[4] * m[1] * m[15] +
            m[4] * m[3] * m[13] +
            m[12] * m[1] * m[7] -
            m[12] * m[3] * m[5];

        inv[14] = -m[0] * m[5] * m[14] +
            m[0] * m[6] * m[13] +
            m[4] * m[1] * m[14] -
            m[4] * m[2] * m[13] -
            m[12] * m[1] * m[6] +
            m[12] * m[2] * m[5];

        inv[3] = -m[1] * m[6] * m[11] +
            m[1] * m[7] * m[10] +
            m[5] * m[2] * m[11] -
            m[5] * m[3] * m[10] -
            m[9] * m[2] * m[7] +
            m[9] * m[3] * m[6];

        inv[7] = m[0] * m[6] * m[11] -
            m[0] * m[7] * m[10] -
            m[4] * m[2] * m[11] +
            m[4] * m[3] * m[10] +
            m[8] * m[2] * m[7] -
            m[8] * m[3] * m[6];

        inv[11] = -m[0] * m[5] * m[11] +
            m[0] * m[7] * m[9] +
            m[4] * m[1] * m[11] -
            m[4] * m[3] * m[9] -
            m[8] * m[1] * m[7] +
            m[8] * m[3] * m[5];

        inv[15] = m[0] * m[5] * m[10] -
            m[0] * m[6] * m[9] -
            m[4] * m[1] * m[10] +
            m[4] * m[2] * m[9] +
            m[8] * m[1] * m[6] -
            m[8] * m[2] * m[5];

        det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
        det = 1.0 / det;
        
        for (var i = 0; i < 16; i++)
            result[i] = inv[i] * det;

        return result;
    }
    
    static rotate(mat, angle, v) {
        var result = new Matrix();
        var a = angle;
        var c = Math.cos(a);
        var s = Math.sin(a);

        var axis = new Vector3(0,0,0);
        axis.x = v.x;
        axis.y = v.y;
        axis.z = v.z;
        var temp = new Vector3(axis.x * (1.0 - c),axis.y * (1.0 - c),axis.z * (1.0 - c));
       
        result[0] = c + temp.x * axis.x;
        result[1] = temp.x * axis.y + s * axis.z;
        result[2] = temp.x * axis.z - s * axis.y;

        result[4] = temp.y * axis.x - s * axis.z;
        result[5] = c + temp.y * axis.y;
        result[6] = temp.y * axis.z + s * axis.x;

        result[8] = temp.z * axis.x + s * axis.y;
        result[9] = temp.z * axis.y - s * axis.x;
        result[10] = c + temp.z * axis.z;

        var R = new Matrix();
        for(var i = 0;i<16;i++){
            R[i] = mat[i];
        }
        R[0] = mat[0] * result[0] + mat[4] * result[1] + mat[8] * result[2];
        R[1] = mat[1] * result[0] + mat[5] * result[1] + mat[9] * result[2];
        R[2] = mat[2] * result[0] + mat[6] * result[1] + mat[10] * result[2];

        R[4] = mat[0] * result[4] + mat[4] * result[5] + mat[8] * result[6];
        R[5] = mat[1] * result[4] + mat[5] * result[5] + mat[9] * result[6];
        R[6] = mat[2] * result[4] + mat[6] * result[5] + mat[10] * result[6];
        
        R[8] = mat[0] * result[8] + mat[4] * result[9] + mat[8] * result[10];
        R[9] = mat[1] * result[8] + mat[5] * result[9] + mat[9] * result[10];
        R[10] = mat[2] * result[8] + mat[6] * result[9] + mat[10] * result[10];
        
        R[12] = mat[12];
        R[13] = mat[13];
        R[14] = mat[14];
        return R;
    }
    static createTransformationMatrix(x, y, z, rx, ry, rz, sx, sy, sz) {
        var res = new Matrix();
        res = Maths.translate(res, new Vector3(x, y, z));
        
        res = Maths.rotate(res, rx, new Vector3(1, 0, 0));
        res = Maths.rotate(res, ry, new Vector3(0, 1, 0));
        res = Maths.rotate(res, rz, new Vector3(0, 0, 1));

        res = Maths.scale(res, new Vector3(sx, sy, sz));

        return res;
    }
    static createViewMatrix(camera) {
        var view = new Matrix();
        
        view = this.lookAt(camera.p, camera.a, new Vector3(0, 1 ,0));
        view = this.translate(view, new Vector3(-camera.p.x, -camera.p.y, -camera.p.z));

        return view;
    }
    static createProjectionMatrix(FOV, NEAR_PLANE, FAR_PLANE, width, height) {
        var aspectRatio = width / height;
        var y_scale = ((1.0 / Math.tan(((FOV / 2.0) / 360.0) * 3.14)) * aspectRatio);
        var x_scale = y_scale / aspectRatio;
        var frustum_length = FAR_PLANE - NEAR_PLANE;

        var projectionMatrix = new Matrix();
        
        projectionMatrix[0] = x_scale;
        projectionMatrix[5] = y_scale;
        projectionMatrix[10] = -((FAR_PLANE + NEAR_PLANE) / frustum_length);
        projectionMatrix[11] = -1.0;
        projectionMatrix[14] = -((2.0 * NEAR_PLANE * FAR_PLANE) / frustum_length);
        projectionMatrix[15] = 0.0;

        return projectionMatrix;
    }
    static ortho(left, right, bottom, top, zNear, zFar) {
        var res = new Matrix();

        res[0] = 2.0 / (right - left);
        res[5] = 2.0 / (top - bottom);
        res[10] = -2 / (zFar - zNear);
        res[12] = -((right + left) / (right - left));
        res[13] = -((top + bottom) / (top - bottom));
        res[14] = -((zFar + zNear) / (zFar - zNear));

        return res;
    }
}

export default Matrix;
export { Maths, Vector3, Camera }