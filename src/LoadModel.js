var THREE = require('three');
import GLTFLoader from 'three-gltf-loader';
import RendererStats from '@xailabs/three-renderer-stats';
import Stats from 'stats-js';

const testImg = require('./textures/test.png');
const centerImg = require('./textures/center.jpg');
const sideImg = require('./textures/side.jpg');
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
        scene.background = 0x000000;
        var fogColor = 0xffffff;
        scene.fog = new THREE.Fog(fogColor, 150, 500);
        // Load textures
        var textureLoader = new THREE.TextureLoader();
        var testTex = textureLoader.load(testImg)
        var testMat = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true}); 
        var centerTex = textureLoader.load(centerImg);
        centerTex.flipY = false;
        centerTex.encoding = THREE.sRGBEncoding;
        var sideTex = textureLoader.load(sideImg);
        sideTex.encoding = THREE.sRGBEncoding;
        sideTex.flipY = false;
        var centerMat = new THREE.MeshBasicMaterial({map: centerTex, envMap: cubeTex, combine: THREE.MixOperation,reflectivity: 0.2})          
        var sideMat = new THREE.MeshBasicMaterial({map: sideTex});
        this.navmesh = null;
        // Load a glTF resource
        var loader = new GLTFLoader();
        loader.load(
            // resource URL
            `./assets/duveen_gallery.glb`,
            // called when the resource is loaded   
                ( gltf ) => {
                    console.log(gltf);
                    gltf.scene.children.forEach(child => {
                        console.log(child.name)
                        child.material = testMat;
                        switch (child.name) {
                            case 'side':
                                child.material = sideMat;
                                break;
                            case 'side001':
                                child.material = sideMat;
                                break;
                            case 'center':
                                child.material = centerMat;
                                break;
                            case 'navmesh':
                                this.navmesh = child;
                                child.renderOrder = -1;
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