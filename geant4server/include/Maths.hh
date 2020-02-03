#pragma once
#include <string>

#define PI 3.14159265359

class vector3;
class vector4 {
public:
	vector4();
	vector4(float d);
	vector4(float _x, float _y, float _z, float _w);
	vector4(vector3 v);
	std::string toString() {
		std::string res;
		res += "[";
		res += std::to_string(x);
		res += ",";
		res += std::to_string(y);
		res += ",";
		res += std::to_string(z);
		res += ",";
		res += std::to_string(w);
		res += "]";
		return res;
	}
	float x;
	float y;
	float z;
	float w;
	~vector4();
};
class vector3 {
public:
	vector3() {
		x = 0.0;
		y = 0.0;
		z = 0.0;
	}

	vector3(float d) {
		x = d;
		y = d;
		z = d;
	}

	vector3(float _x, float _y, float _z) {
		x = _x;
		y = _y;
		z = _z;
	}
	vector3(vector4 v) {
		x = v.x;
		y = v.y;
		z = v.z;
	}
	std::string toString() {
		std::string res;
		res += "[";
		res += std::to_string(x);
		res += ",";
		res += std::to_string(y);
		res += ",";
		res += std::to_string(z);
		res += "]";
		return res;
	}
	vector3 operator*(const double& d) {
		return vector3(x * d, y * d, z * d);
	}

	vector3 operator+(const vector3& v) {
		return vector3(x + v.x, y + v.y, z + v.z);
	}
		vector3 operator+(const vector3& v) const {
		return vector3(x + v.x, y + v.y, z + v.z);
	}
		vector3 operator-() {
		return vector3(-x, -y, -z);
	}
		vector3 operator-(const vector3& v) const {
		return vector3(x - v.x, y - v.y, z - v.z);
	}
	vector3 operator+(const float& v) {
		return vector3(x + v, y + v, z + v);
	}

		vector3 operator*(const vector3& v) {
		return vector3(x * v.x, y * v.y, z * v.z);
	}
		vector3 operator*(const vector3& v) const {
		return vector3(x * v.x, y * v.y, z * v.z);
	}
	float x;
	float y;
	float z;
	~vector3() {

	}
private:
};
class vector2 {
public:
	vector2();
	vector2(float d);
	vector2(float, float);
	std::string toString() {
		std::string res;
		res += "[";
		res += std::to_string(x);
		res += ",";
		res += std::to_string(y);
		return res;
	}

	float x;
	float y;
	~vector2();
private:
};
struct Camera
{
	float angley;
	float anglex;
	float distance;
	vector3 position;
	vector3 pointToLookAt;
};

struct Animation2D {
	float speed = .1f;
	int rows = 1;
	int columns = 1;
	float time = 0;
	vector2 pointer;
};
class matrix {
public:
	matrix();
	matrix(const matrix &m);
	matrix(int r, int c);
	int rows;
	int columns;
	void identity();
	double determinant2x2();
	double determinant(const matrix &mat);
	float* &operator[](int e) const;
	std::string toString();
	matrix &operator=(const matrix &m);
	matrix getCoFactor(const matrix &mat);

	friend matrix operator*(const matrix &n, const matrix &d);
	~matrix();
private:
	float** data;

};
class mat4x4 {
public:
	mat4x4();
	mat4x4(const mat4x4 &m);
	friend mat4x4 operator*(const mat4x4 &m, const mat4x4 &n);
	mat4x4 &operator=(const mat4x4 &m);
	float &operator[](int e) const;
	void identity();
	float* getPointer() const { return data; };
	~mat4x4();
private:
	float* data;
};
namespace maths {
	mat4x4 createTransformationMatrix(const vector3 &pos, const vector3 &rot, const vector3 &scale);
	mat4x4 createViewMatrix(Camera camera);
	mat4x4 ortho(const double &b, const double &t, const double &l, const double &r,
		const double &n, const double &f);
	mat4x4 createProjectionMatrix(float FOV, float NEAR_PLANE, float FAR_PLANE,float WIDTH,float HEIGHT);
	matrix translate(const matrix &mat, const vector3 &v);
	mat4x4 translate(const mat4x4 &mat, const vector3 &v);
	matrix rotate(matrix mat, double angle, const vector3 &axis);
	mat4x4 rotate(const mat4x4 &mat,const float &angle, const vector3 &axis);
	matrix scale(const matrix&mat, const vector3 &v);
	mat4x4 scale(const mat4x4&mat, const vector3 &v);
	matrix invert(const matrix &mat);
	vector3 cross(const vector3 &a, const vector3 &b);
	vector3 normalize(const vector3 &v);
	float length(const vector3 &v);
	double dot(const vector3 &a, const vector3 &b);
	matrix getCoFactor(const matrix &mat);
	double determinant(const matrix &mat);
	//matrix lookAtP(vector3 eye, vector3 center, vector3 up);
	mat4x4 lookAtP(const vector3 &eye,const vector3 &center,const vector3 &up);
	mat4x4 invert(const mat4x4 &m);
	double toDegree(double rad);
}
matrix operator*(const matrix &n, const double &d);

//vector3 operator*(const vector3 &v, const double &d);
//vector3 operator*(const vector3 &v, const vector3 &d);
//vector3 operator+(const vector3& v, const vector3& d);
//vector3 operator+(const vector3& v, const float& d);

//vector3 operator-(const vector3& v, const vector3& d);
//vector3 operator-(const vector3& v);

void operator*=(vector3 &v, const vector3 &d);
void operator+=(vector3 &v, const vector3 &d);
void operator+=(vector4 &v, const vector4 &d);
void operator-=(vector3& v, const vector3& d);

vector4 operator*(const matrix &m, const vector4 &v);
vector4 operator*(const mat4x4 &m, const vector4 &v);
vector4 operator+(const vector4& v, const vector4& d);
