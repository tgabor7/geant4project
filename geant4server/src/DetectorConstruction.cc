#pragma once

#include "DetectorConstruction.hh"
#include "G4UserLimits.hh"
#include "G4RunManager.hh"
#include "G4NistManager.hh"
#include "G4Box.hh"
#include "G4Cons.hh"
#include "G4Orb.hh"
#include "G4Sphere.hh"
#include "G4Trd.hh"
#include "G4LogicalVolume.hh"
#include "G4PVPlacement.hh"
#include "G4SystemOfUnits.hh"
#include "G4TessellatedSolid.hh"
#include "G4TriangularFacet.hh"
#include "G4SDManager.hh"


DetectorConstruction::DetectorConstruction()
: G4VUserDetectorConstruction()
{ 
	
}
DetectorConstruction::DetectorConstruction(std::vector<Geometry*> gs)
	: G4VUserDetectorConstruction()
{
	this->geometries = gs;
}
void DetectorConstruction::addGeometry(Geometry* g)
{
	this->geometries.push_back(g);
}
void DetectorConstruction::clearGeometries()
{
	this->geometries.clear();
	/*for (int i = 0; i < scoringVolumes.size(); i++) {
		delete scoringVolumes[i];
	}*/
	scoringVolumes.clear();
}
DetectorConstruction::~DetectorConstruction()
{ }

G4VPhysicalVolume* DetectorConstruction::Construct()
{  
  G4NistManager* nist = G4NistManager::Instance();
  
  G4double env_sizeXY = 20*cm, env_sizeZ = 30*cm;
  G4Material* env_mat = nist->FindOrBuildMaterial("G4_Pb");
   

  G4bool checkOverlaps = true;


  G4double world_sizeXY = 1.2*env_sizeXY*cm;
  G4double world_sizeZ  = 1.2*env_sizeZ*cm;
  G4Material* world_mat = nist->FindOrBuildMaterial("G4_AIR");
  
  G4Box* solidWorld =    
    new G4Box("World",                       //its name
       0.5*world_sizeXY, 0.5*world_sizeXY, 0.5*world_sizeZ);     //its size
      
  G4LogicalVolume* logicWorld =                         
    new G4LogicalVolume(solidWorld,          //its solid
                        world_mat,           //its material
                        "World");            //its name
                             
  G4VPhysicalVolume* physWorld = 
    new G4PVPlacement(0,                     //no rotation
                      G4ThreeVector(),       //at (0,0,0)
                      logicWorld,            //its logical volume
                      "World",               //its name
                      0,                     //its mother  volume
                      false,                 //no boolean operation
                      0,                     //copy number
                      checkOverlaps);        //overlaps checking
                     
  
  for (int j = 0; j < geometries.size(); j++) {
	  G4Material* material = nist->FindOrBuildMaterial(geometries[j]->material);
	  G4TessellatedSolid* tes = new G4TessellatedSolid();
	 
	  std::vector<float> data = geometries[j]->vertices;
	  for (int i = 0; i < data.size() / 9; i++) {
		  tes->AddFacet(new G4TriangularFacet(G4ThreeVector(data[i*9] * geometries[j]->scale.x*cm, data[i * 9 + 1] * geometries[j]->scale.y*cm, data[i * 9 + 2] * geometries[j]->scale.z*cm),
			  G4ThreeVector(data[i * 9 + 3] * geometries[j]->scale.x*cm, data[i * 9 + 4] * geometries[j]->scale.y*cm, data[i * 9 + 5] * geometries[j]->scale.z*cm),
			  G4ThreeVector(data[i * 9 + 6] * geometries[j]->scale.x*cm, data[i * 9 + 7] * geometries[j]->scale.y*cm, data[i * 9 + 8] * geometries[j]->scale.z*cm), ABSOLUTE));
	  }
	  tes->SetSolidClosed(true);
	 
	  G4LogicalVolume* logicEnv =
		  new G4LogicalVolume(tes, material, std::string("Detektor" + std::to_string(j)).c_str());

	  G4RotationMatrix* rotation = new G4RotationMatrix();
	  rotation->rotateX(-geometries[j]->rotation.x * rad);
	  rotation->rotateY(-geometries[j]->rotation.y * rad);
	  rotation->rotateZ(-geometries[j]->rotation.z * rad);

	  new G4PVPlacement(rotation,
		  G4ThreeVector(geometries[j]->position.x*cm, geometries[j]->position.y*cm, geometries[j]->position.z*cm),
		  logicEnv, std::string("Detektor" + std::to_string(j)).c_str(),logicWorld,false,0, checkOverlaps); 

	  
	  scoringVolumes.push_back(logicEnv);

  }
  return physWorld;
}
