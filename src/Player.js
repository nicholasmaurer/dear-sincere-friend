var THREE = require("three");

export default class Player {
  
    constructor(camera, scene, renderer, vrscene) {
        var camera = camera;
        camera.rotation.reorder("YXZ");
        var facingForward = true;
        var vrscene = vrscene;
        // Create cube to use as teleport marker
        var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        var material = new THREE.MeshNormalMaterial();
        var cube = new THREE.Mesh(geometry, material);
        cube.visible = false;
        vrscene.scene.add(cube);

        document.body.onkeyup = function(e){
            if(e.keyCode == 32){
                move();
            }
        }
       
        var raycaster = new THREE.Raycaster();

        requestAnimationFrame(animate);


        function move(){
            console.log("spacebar");
            console.log(vrscene);
        }
        function animate() {

            const y = camera.rotation.y;
            if(y > - 1 & y < 1){
                facingForward = true;
            }else if(y < -2 | y > 2){
                facingForward = false;
            }
    
          // Raycast
          var wpVector = new THREE.Vector3();
          camera.getWorldPosition(wpVector);
          var wdVector = new THREE.Vector3();
          camera.getWorldDirection(wdVector);
          raycaster.set(wpVector, wdVector);
          if(vrscene.model.navmesh){
            var intersects = raycaster.intersectObject(vrscene.model.navmesh);
            if(intersects.length > 0){
              var hit = intersects[0].point;
              cube.position.set(hit.x, hit.y +1, hit.z);
              cube.visible = true;
            }else{
                cube.visible = false;
            }
          }
        }
    }
}