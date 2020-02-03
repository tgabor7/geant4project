/*
	Ez az oszt�ly kezeli a r�szecske szimul�ci�t
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
	void addDetector(Geometry* d); // detector hozz�ad�sa a rendszerhez
	void clearDetectors(); // t�rli az �sszes detektort
	void updateGun(Gun *gun); // friss�ti a r�szecske �gy� helyzet�t, ir�ny�t, a r�szecske energi�j�t �s typus�t
	void addTrack(const G4Step*); // 
	std::stringstream run(Gun* gun,int number_of_particles); // feldolgozza a kapott adatot, amit majd a server visszak�ldi
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