#include "Simulation.hh"
#include "G4Step.hh"
#include "DetectorConstruction.hh"
#include "G4MTRunManager.hh"
#include "G4VModularPhysicsList.hh"
#include "ActionInitialization.hh"
#include "QBBC.hh"
#include "G4StepLimiterPhysics.hh"
#include "Geometry.hh"
#include "G4RunManager.hh";
#include "G4StateManager.hh"

Simulation::Simulation(G4MTRunManager* runManager)
{
	this->runManager = runManager;
}
void Simulation::init()
{

}
void Simulation::clearDetectors()
{
	detectors.clear();
	de->clearGeometries();
}
void Simulation::addDetector(Geometry* d)
{
	de->addGeometry(d);
	detectors.push_back(d);
	runManager->ReinitializeGeometry();

}
void Simulation::addTrack(const G4Step* s)
{
	if (particle_tracks.size() == 1 && (activeTrack == s->GetTrack() || activeTrack == nullptr)) {

		Particle* first_hit = new Particle;
		first_hit->position.x = s->GetPostStepPoint()->GetPosition().getX();
		first_hit->position.y = s->GetPostStepPoint()->GetPosition().getY();
		first_hit->position.z = s->GetPostStepPoint()->GetPosition().getZ();
		first_hit->totalEnergy = s->GetPostStepPoint()->GetTotalEnergy();
		first_hit->kineticEnergy = s->GetPostStepPoint()->GetKineticEnergy();
		first_hit->energyDeposit = 0;

		particle_tracks[0]->track_id = 1;
		particle_tracks[0]->parent_id = 0;
		particle_tracks[0]->particles.push_back(first_hit);

		activeTrack = s->GetTrack();

		return;
	}

	if (!s->GetTrack()) {
		return;
	}
	if (activeTrack != s->GetTrack()) {
		currentTrack = new Track;
		currentTrack->definition = s->GetTrack()->GetDefinition()->GetParticleName();
		currentTrack->track_id = s->GetTrack()->GetTrackID();
		currentTrack->parent_id = s->GetTrack()->GetParentID();

		particle_tracks.push_back(currentTrack);

		Particle* p = new Particle();

		p->parent_id = s->GetTrack()->GetParentID();
		p->track_id = s->GetTrack()->GetTrackID();

		p->definition = s->GetTrack()->GetDefinition()->GetParticleName();

		p->totalEnergy = (double)s->GetPreStepPoint()->GetTotalEnergy();

		p->kineticEnergy = (double)s->GetTrack()->GetKineticEnergy();

		p->momentum.x = s->GetPreStepPoint()->GetMomentum().getX();
		p->momentum.y = s->GetPreStepPoint()->GetMomentum().getY();
		p->momentum.z = s->GetPreStepPoint()->GetMomentum().getZ();

		p->position.x = s->GetPreStepPoint()->GetPosition().getX();
		p->position.y = s->GetPreStepPoint()->GetPosition().getY();
		p->position.z = s->GetPreStepPoint()->GetPosition().getZ();

		p->energyDeposit = s->GetTotalEnergyDeposit();

		if (currentTrack) currentTrack->particles.push_back(p);

		Track* parent = getTrackByID(s->GetTrack()->GetParentID());

		if (parent) parent->next.push_back(currentTrack);


	}
	activeTrack = s->GetTrack();

	Particle* p1 = new Particle();

	p1->parent_id = activeTrack->GetParentID();
	p1->track_id = activeTrack->GetTrackID();



	p1->definition = activeTrack->GetDefinition()->GetParticleName();
	p1->totalEnergy = (double)s->GetPostStepPoint()->GetTotalEnergy();

	p1->kineticEnergy = (double)s->GetPostStepPoint()->GetKineticEnergy();

	p1->momentum.x = s->GetPostStepPoint()->GetMomentum().getX();
	p1->momentum.y = s->GetPostStepPoint()->GetMomentum().getY();
	p1->momentum.z = s->GetPostStepPoint()->GetMomentum().getZ();

	p1->position.x = s->GetPostStepPoint()->GetPosition().getX();
	p1->position.y = s->GetPostStepPoint()->GetPosition().getY();
	p1->position.z = s->GetPostStepPoint()->GetPosition().getZ();

	p1->energyDeposit = s->GetTotalEnergyDeposit();

	if (currentTrack) currentTrack->particles.push_back(p1);

}
Track* Simulation::getTrackByID(int i)
{
	for (int j = 0; j < particle_tracks.size(); j++) {
		if (particle_tracks[j]->track_id == i) return particle_tracks[j];
	}
	return nullptr;
}
std::stringstream Simulation::run(Gun *gun, int number_of_particles)
{
	//at least 1 detector and gun has to be added
	
	runManager->ReinitializeGeometry();

	for (int i = 0; i < particle_tracks.size(); i++) {
		particle_tracks[i]->particles.clear();
	}
	particle_tracks.clear();

	Particle* gun_particle = new Particle();
	gun_particle->position = gun->position;
	gun_particle->totalEnergy = gun->energy;

	Track* primary = new Track;

	switch (gun->definition)
	{
	case(GAMMA):
		gun_particle->definition = "gamma";
		break;
	case(ELECTRON):
		gun_particle->definition = "e-";
		break;
	case(POSITRON):
		gun_particle->definition = "e+";
		break;
	default:
		break;
	}
	primary->particles.push_back(gun_particle);

	primary->definition = gun_particle->definition;
	particle_tracks.push_back(primary);
	
	runManager->BeamOn(number_of_particles);

	std::stringstream ss;
	std::cout << "\n" << particle_tracks.size() << "\n";
	for (int i = 0; i < particle_tracks.size(); i++) {
		ss << particle_tracks[i]->particles.size();
		ss << " ";
		ss << particle_tracks[i]->definition;
		ss << " ";
		for (int j = 0; j < particle_tracks[i]->particles.size(); j++) {
			ss << particle_tracks[i]->particles[j]->position.x;
			ss << " ";
			ss << particle_tracks[i]->particles[j]->position.y;
			ss << " ";
			ss << particle_tracks[i]->particles[j]->position.z;
			ss << " ";
			ss << particle_tracks[i]->particles[j]->track_id;
			ss << " ";
			ss << particle_tracks[i]->particles[j]->parent_id;
			ss << " ";
			ss << particle_tracks[i]->particles[j]->totalEnergy;
			ss << " ";
			std::cout << particle_tracks[i]->particles[j]->definition;
		}
	}
	ss << " ";
	for (int i = 0; i < detectors.size(); i++) {
		ss << detectors[i]->energyDeposit;
		ss << " ";
	}
	print(particle_tracks[0], 0);

	for (int i = 0; i < detectors.size(); i++) {
		std::cout << "\nEnergyDeposit: " << detectors[i]->energyDeposit << "MeV\n";
	}
	return ss;
}
void Simulation::print(Track* t, int depth)
{
	std::cout << "\n\n";
	for (int j = 0; j < depth; j++) {
		std::cout << "\t";
	}
	std::cout << "Definition: " << t->definition << ", track_id: " << t->track_id << ", parent_id: " << t->parent_id << "\n";
	depth++;
	for (int i = 0; i < t->particles.size(); i++) {
		std::cout << "\n";
		for (int j = 0; j < depth; j++) {
			std::cout << "\t";
		}
		std::cout << "Position: " << t->particles[i]->position.x << ", " << t->particles[i]->position.y << ", " << t->particles[i]->position.z << ", TotalEnergy: "
			<< t->particles[i]->totalEnergy << ", EnergyDeposit: " << t->particles[i]->energyDeposit << " Momentum: " << t->particles[i]->momentum.x << ", " <<
			t->particles[i]->momentum.y << ", " << t->particles[i]->momentum.z << "\n";
	}
	for (int i = 0; i < t->next.size(); i++) {
		print(t->next[i], depth);
	}
}
Simulation::Simulation()
{
	runManager = new G4MTRunManager;

	activeTrack = nullptr;
	currentTrack = nullptr;
	
	Geometry* geo = new Geometry();

	geo->vertices.push_back(1);
	geo->vertices.push_back(0);
	geo->vertices.push_back(1);

	geo->vertices.push_back(0);
	geo->vertices.push_back(1);
	geo->vertices.push_back(1);

	geo->vertices.push_back(1);
	geo->vertices.push_back(1);
	geo->vertices.push_back(1);


	geo->scale = vector3(4, 4, 4);
	geo->position.z = -1;
	geo->position.x = .4;
	geo->rotation = vector3(.1, -.4, 5);
	
	de = new DetectorConstruction(detectors);
	runManager->SetUserInitialization(de);

	
	G4VModularPhysicsList* physicsList = new QBBC;
	physicsList->RegisterPhysics(new G4StepLimiterPhysics());
	runManager->SetUserInitialization(physicsList);

	gun = new Gun();
	gun->energy = 10;
	gun->definition = GAMMA;
	
	gun->position.x = 10;
	gun->direction.x = -1;

	ActionInitialization* action = new ActionInitialization(this, gun);
	runManager->SetUserInitialization(action);

	
	runManager->Initialize();
}
void Simulation::updateGun(Gun* gun)
{
	this->gun->energy = gun->energy;

	this->gun->position.x = gun->position.x;
	this->gun->position.y = gun->position.y;
	this->gun->position.z = gun->position.z;

	this->gun->direction.x = gun->direction.x;
	this->gun->direction.y = gun->direction.y;
	this->gun->direction.z = gun->direction.z;

}
Simulation::~Simulation()
{
	delete runManager;


}