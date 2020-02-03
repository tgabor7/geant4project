#pragma once
#include "Maths.hh"

enum particle_definition {
	GAMMA,
	ELECTRON,
	POSITRON
};
class Gun {
public:
	Gun() {}
	Gun(vector3 position, vector3 direction, double energy, particle_definition definition) {}
	vector3 position;
	vector3 direction;
	double energy;
	particle_definition definition;
	~Gun() {}
private:
	
};