var THREE = require("three");

export default class WebVRScene {
  
    constructor(camera) {
        this.camera = camera;
        this.camera.rotation.reorder("YXZ");
        this.facingForward = true;
    }

    update(){

        const y = this.camera.rotation.y;
        if(y > - 1 & y < 1){
            this.facingForward = true;
        }else if(y < -2 | y > 2){
            this.facingForward = false;
        }
    }
}