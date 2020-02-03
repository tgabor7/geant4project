#pragma once

#include "G4VUserPrimaryGeneratorAction.hh"
#include "G4ParticleGun.hh"
#include "globals.hh"
#include "Maths.hh"
#include "Gun.hh"

class G4ParticleGun;
class G4Event;
class G4Box;

class PrimaryGeneratorAction : public G4VUserPrimaryGeneratorAction
{
  public:
    PrimaryGeneratorAction();    
	PrimaryGeneratorAction(Gun *gun);

    virtual ~PrimaryGeneratorAction();

    virtual void GeneratePrimaries(G4Event*);         
  
    const G4ParticleGun* GetParticleGun() const { return fParticleGun; }
  
  private:
    G4ParticleGun*  fParticleGun;
    G4Box* fEnvelopeBox;
	Gun *gun;
};