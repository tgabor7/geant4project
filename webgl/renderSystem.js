import Shader from './shader.js'

class RenderSystem {
    constructor(gl){
        this.shader = new Shader(gl);

    }
}
export default RenderSystem;