#include "Geometry.hh"

Geometry::Geometry(std::vector<float> data)
{
	this->vertices = data;
	this->energyDeposit = 0;
}