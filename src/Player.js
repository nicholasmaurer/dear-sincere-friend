var THREE = require("three");

export default class Player {
  
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.camera.rotation.reorder("YXZ");
        this.facingForward = true;
        this.positions = [
            new THREE.Vector3(0,10,0),
            new THREE.Vector3(0,10,20),
            new THREE.Vector3(2,10,30),
        ];
        this.index = 0;
        var element = document.querySelector("Body");
        // element.addEventListener("click", ()=>{
        //     console.log(this.index);
        //     this.index++;
        //     if(this.index > this.positions.length -1)
        //         this.index = 0;
        //     const pos = this.positions[this.index];
        //     this.camera.position.set(pos.x,pos.y,pos.z);
        // });
    }

    changePos(){
 
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