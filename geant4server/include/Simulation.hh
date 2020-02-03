/*
	Ez az osztály kezeli a részecske szimulációt
*/
#pragma once

#include "Detektor.hh"
#include "Particle.hh"
#include "Geometry.hh"
#include "Gun.hh"
#include <string>


class G4Step;
class G4Track;
class DetectorConstruction;
class G4MTRunManager;

class Simulation {
public:
	Simulation();
	Simulation(G4MTRunManager*);
	void init();
	void addDetector(Geometry* d); // detector hozzáadása a rendszerhez
	void clearDetectors(); // törli az összes detektort
	void updateGun(Gun *gun); // frissíti a részecske ágyú helyzetét, irányát, a részecske energiáját és typusát
	void addTrack(const G4Step*); // 
	std::stringstream run(Gun* gun,int number_of_particles); // feldolgozza a kapott adatot, amit majd a server visszaküldi
	std::vector<Geometry*> detectors;
	G4MTRunManager* runManager;
	~Simulation();
private:
	std::vector<Track*> particle_tracks;
	Track* getTrackByID(int i);
	Track* currentTrack;
	const G4Track* activeTrack;
	Gun* gun;
	void print(Track* t, int depth);
	DetectorConstruction* de;
	
};