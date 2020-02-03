#pragma once
#include "G4Types.hh"
#include <string>
#include <vector>
#include "Maths.hh"

class Particle {
  public:
	  Particle() {}
	  ~Particle() {}
	  vector3 position;
	  G4double totalEnergy;
	  G4double kineticEnergy;
	  G4double energyDeposit;
	  vector3 momentum;
	  std::string definition;
	  std::vector<Particle*> next;
	  int parent_id;
	  int track_id;
private:  
};

class Track {
public:
	Track() {}
	std::vector<Particle*> particles;
	std::string definition;
	std::vector<Track*> next;
	int parent_id;
	int track_id;
	~Track() {}
private:
};