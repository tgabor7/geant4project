#pragma once

/*
	Itt hozzuk létre detectorokat
*/

#include "G4VUserDetectorConstruction.hh"
#include "globals.hh"
#include "Geometry.hh"

class G4VPhysicalVolume;
class G4LogicalVolume;

class DetectorConstruction : public G4VUserDetectorConstruction
{
  public:
    DetectorConstruction();
	DetectorConstruction(std::vector<Geometry*> gs);

	void addGeometry(Geometry* g);
	void clearGeometries();

    virtual ~DetectorConstruction();

    virtual G4VPhysicalVolume* Construct();

    std::vector<G4LogicalVolume*> GetAllScoringVolumes() const { return scoringVolumes; }

  protected:
    std::vector<G4LogicalVolume*> scoringVolumes;
private:
	std::vector<Geometry*> geometries;
};
