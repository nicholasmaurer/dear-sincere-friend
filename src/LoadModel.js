var THREE = require('three');
import GLTFLoader from 'three-gltf-loader';
import RendererStats from '@xailabs/three-renderer-stats';
import Stats from 'stats-js';

const wall_left = require('./textures/wall_left.jpg');
const wall_right = require('./textures/wall_right.jpg');
const wall_end = require('./textures/wall_end.jpg');
const floor = require('./textures/floor_map.jpg');
const cubeImgs = [
    require('./textures/cubemap/px.png'),
    require('./textures/cubemap/nx.png'),
    require('./textures/cubemap/py.png'),
    require('./textures/cubemap/ny.png'),
    require('./textures/cubemap/pz.png'),
    require('./textures/cubemap/nz.png')
]

export default class LoadModel {

    constructor(scene) {

        const cubeTex = new THREE.CubeTextureLoader().load(cubeImgs);
        cubeTex.format = THREE.RGBFormat;
        scene.background = cubeTex;
        // Load textures
        var textureLoader = new THREE.TextureLoader();
        var floorTex = textureLoader.load(floor);
        floorTex.flipY = false;
        floorTex.encoding = THREE.sRGBEncoding;
        var wallEndTex = textureLoader.load(wall_end);
        wallEndTex.flipY = false;
        wallEndTex.encoding = THREE.sRGBEncoding;
        var wallLeftTex = textureLoader.load(wall_left);
        wallLeftTex.flipY = false;
        wallLeftTex.encoding = THREE.sRGBEncoding;
        var wallRightTex = textureLoader.load(wall_right);
        wallRightTex.flipY = false;
        wallRightTex.encoding = THREE.sRGBEncoding;
        var floorMat = new THREE.MeshBasicMaterial({map: floorTex, envMap: cubeTex, combine: THREE.MixOperation,reflectivity: 0.2})        
        var wallEndMat = new THREE.MeshBasicMaterial({map: wallEndTex});
        var wallLeftMat = new THREE.MeshBasicMaterial({map: wallLeftTex});
        var wallRightMat = new THREE.MeshBasicMaterial({map: wallRightTex});    
        // Load a glTF resource
        var loader = new GLTFLoader();
        loader.load(
            // resource URL
            `./assets/duveen_gallery.glb`,
            // called when the resource is loaded
                function ( gltf ) {
                    gltf.scene.children.forEach(child => {
                        console.log(child.name)
                        switch (child.name) {
                            case 'wall_left':
                                child.material = wallLeftMat;
                                break;
                            case 'wall_right':
                                child.material = wallRightMat;
                                break;
                            case 'wall_end':
                                child.material = wallEndMat;
                                break;
                            case 'floor':
                                child.material = floorMat;
                                break;
                            default:
                                break;
                        }
                    });
                    gltf.scene.position.setY(-10);
                    scene.add(gltf.scene);
                    gltf.animations; // Array<THREE.AnimationClip>
                    gltf.scene; // THREE.Scene
                    gltf.scenes; // Array<THREE.Scene>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object

            },
            // called while loading is progressing
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {
                console.log(error);
            }
        );
    }
    
}