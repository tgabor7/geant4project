import { Vector3 } from './maths.js';

class Particle {
    constructor(){
        this.track_id = 0;
        this.parent_id = 0;
        this.position = new Vector3(0,0,0);
        this.totalEnergy = 0;
        this.definition = "";
        this.id = "";
    }
    
};

export default Particle;