#include "PrimaryGeneratorAction.hh"
#include "G4LogicalVolumeStore.hh"
#include "G4LogicalVolume.hh"
#include "G4Box.hh"
#include "G4RunManager.hh"
#include "G4ParticleGun.hh"
#include "G4ParticleTable.hh"
#include "G4ParticleDefinition.hh"
#include "G4SystemOfUnits.hh"
#include "Randomize.hh"

PrimaryGeneratorAction::PrimaryGeneratorAction()
: G4VUserPrimaryGeneratorAction(),
  fParticleGun(0), 
  fEnvelopeBox(0)
{
  G4int n_particle = 1;
  fParticleGun  = new G4ParticleGun(n_particle);

  // default particle kinematic
  G4ParticleTable* particleTable = G4ParticleTable::GetParticleTable();
  G4String particleName;
  G4ParticleDefinition* particle
    = particleTable->FindParticle(particleName="e-");
  fParticleGun->SetParticleDefinition(particle);
  fParticleGun->SetParticleMomentumDirection(G4ThreeVector(0.,0,-1.));
  fParticleGun->SetParticleEnergy(6.*eV);
}
PrimaryGeneratorAction::PrimaryGeneratorAction(Gun *gun)
	: G4VUserPrimaryGeneratorAction(),
	fParticleGun(0),
	fEnvelopeBox(0)
{
	G4int n_particle = 1;
	fParticleGun = new G4ParticleGun(n_particle);

	// default particle kinematic
	G4ParticleTable* particleTable = G4ParticleTable::GetParticleTable();
	G4String particleName;
	G4ParticleDefinition* particle;
	switch (gun->definition)
	{
	case(GAMMA):
		particle = particleTable->FindParticle(particleName = "gamma");
		break;
	case(ELECTRON):
		particle = particleTable->FindParticle(particleName = "e-");
		break;
	case(POSITRON):
		particle = particleTable->FindParticle(particleName = "e+");
		break;
	default:
		break;
	}
		
	fParticleGun->SetParticleDefinition(particle);
	fParticleGun->SetParticleEnergy(gun->energy);

	this->gun = gun;
}
PrimaryGeneratorAction::~PrimaryGeneratorAction()
{
  delete fParticleGun;
}
void PrimaryGeneratorAction::GeneratePrimaries(G4Event* anEvent)
{
  fParticleGun->SetParticleEnergy(gun->energy);
  fParticleGun->SetParticlePosition(G4ThreeVector(gun->position.x,gun->position.y,gun->position.z));
  //fParticleGun->SetParticleMomentumDirection(G4ThreeVector(G4UniformRand() - .5, G4UniformRand() - .5, -1));
  fParticleGun->SetParticleMomentumDirection(G4ThreeVector(gun->direction.x, gun->direction.y, gun->direction.z));
  fParticleGun->GeneratePrimaryVertex(anEvent);
}