#pragma once

#include "G4UserSteppingAction.hh"
#include "globals.hh"
#include <vector>
#include "Simulation.hh"

class EventAction;

class G4LogicalVolume;

class SteppingAction : public G4UserSteppingAction
{
  public:
    SteppingAction(EventAction* eventAction);
	SteppingAction(Simulation* megjelenites);

    virtual ~SteppingAction();

    virtual void UserSteppingAction(const G4Step*);
	std::vector<double> *xs;

  private:
    G4LogicalVolume* fScoringVolume; 
	std::vector<G4LogicalVolume*> scoringVolumes;
	Simulation* simulation;
};
