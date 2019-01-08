var THREE = require("three");
import WebVRPolyfill from "webvr-polyfill";
import VRControls from "three-vrcontrols-module";
import VREffect from "three-vreffect-module";
import RendererStats from "@xailabs/three-renderer-stats";
import Stats from "stats-js";
import GLTFLoader from 'three-gltf-loader';
var PointerLockControls = require('three-pointerlock');
var OrbitControls = require('three-orbit-controls')(THREE);

const testImg = require('./textures/test.png');
const centerImg = require('./textures/center.jpg');
const floorImg = require('./textures/floor.jpg');
const sideImg = require('./textures/side.jpg');
const cubeImgs = [
    require('./textures/cubemap/x+.jpg'),
    require('./textures/cubemap/x-.jpg'),
    require('./textures/cubemap/y+.jpg'),
    require('./textures/cubemap/y-.jpg'),
    require('./textures/cubemap/z+.jpg'),
    require('./textures/cubemap/z+.jpg')
];

export default class WebVRScene {
  constructor() {
    // Get config from URL
    var config = (function() {
      var config = {};
      var q = window.location.search.substring(1);
      if (q === "") {
        return config;
      }
      var params = q.split("&");
      var param, name, value;
      for (var i = 0; i < params.length; i++) {
        param = params[i].split("=");
        name = param[0];
        value = param[1];
        // All config values are either boolean or float
        config[name] =
          value === "true"
            ? true
            : value === "false"
            ? false
            : parseFloat(value);
      }
      return config;
    })();

    var polyfill = new WebVRPolyfill(config);
    console.log(
      "Using webvr-polyfill version " +
        WebVRPolyfill.version +
        " with configuration: " +
        JSON.stringify(config)
    );
    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

    // Append the canvas element created by the renderer to document body element.
    var canvas = renderer.domElement;
    document.body.appendChild(canvas);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    // Add camera to a group so the camera can be moved
    var camHeight = 10
    var user = new THREE.Group();
    user.add(camera);
    var sphereGeo = new THREE.SphereBufferGeometry( 1, 32, 32 );
    var sphereMat = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.BackSide, transparent: true, opacity: 0} );
    var sphere = new THREE.Mesh( sphereGeo, sphereMat  );
    var fade = 0;
    var fadeIn = false;
    var fadeOut = false;
    user.add( sphere );
    scene.add(user);
    user.position.setY(camHeight);
    // Apply VR stereo rendering to renderer.
    var effect = new VREffect(renderer);
    effect.setSize(canvas.clientWidth, canvas.clientHeight, false);
    var vrDisplay, controls;
    // Raycaster to move teleport marker
    var raycaster = new THREE.Raycaster();
    
    // Request animation frame loop function
    var lastRender = 0;
    // The polyfill provides this in the event this browser
    // does not support WebVR 1.1
    // If we have a native display, or we have a CardboardVRDisplay
    // from the polyfill, use it
    // Otherwise, we're on a desktop environment with no native
    // displays, so provide controls for a monoscopic desktop view
    var isVR = false;
    var inVR = false;
    navigator.getVRDisplays().then(function(vrDisplays) {
      if (vrDisplays.length) {
        vrDisplay = vrDisplays[0];
        // Apply VR headset positional data to camera.
        controls = new VRControls(camera);
        // Kick off the render loop.
        isVR = true;
        vrDisplay.requestAnimationFrame(animate);
      } else {
        // Add a button for full screen and vr
        // controls = new OrbitControls(user);
        // controls.target = new THREE.Vector3(0,0,-1);
        // Disable the "Enter VR" button
        var enterVRButton = document.querySelector('#vr');
        enterVRButton.disabled = true;
        // Kick off the render loop.
        isVR = false;
        requestAnimationFrame(animate);
      }
      // Button click handlers.
      if(isVR){
        var buttonElement = document.querySelector("button#vr");
        buttonElement.style.display = "inline";
        buttonElement.addEventListener("click", function() {
          vrDisplay.requestPresent([{ source: renderer.domElement }]);
        });
        buttonElement = document.querySelector("button#fullscreen");
        buttonElement.style.display = "inline";
        buttonElement.addEventListener("click", function() {
            enterFullscreen(renderer.domElement);
        });
      }else{
        var buttonElement = document.querySelector("button#fullscreen");
        buttonElement.style.display = "inline";
        buttonElement.addEventListener("click", function() {
            enterFullscreen(renderer.domElement);
        });
      }
    });

    // Resize the WebGL canvas when we resize and also when we change modes.
    window.addEventListener("resize", onResize);
    window.addEventListener("vrdisplaypresentchange", onVRDisplayPresentChange);
    window.addEventListener("vrdisplayconnect", onVRDisplayConnect);
    
    // Mouse Events
    var bodyElement = document.querySelector("Body");
    bodyElement.addEventListener("click", () => {
      var camPos = new THREE.Vector3();
      camera.getWorldPosition(camPos);
      console.log("Camera Positon: ",camPos);
      if(inVR){
        submit = true;
      }
    });
    // Gamepad events
    var gamepad = null;
    var gamepadIndex = 0;
    window.addEventListener("gamepadconnected", function(e) {
      console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length
      );
      gamepad = e.gamepad;
      if (gamepad) {
        if (gamepad.mapping === "standard") {
          console.log("Standard Gamepad");
        } else if (
          gamepad.pose &&
          gamepad.pose.hasOrientation &&
          gamepad.pose.hasPosition
        ) {
          console.log("6DOF: Pointing and position");
        } else if (gamepad.pose && gamepad.pose.hasOrientation) {
          console.log("3DOF: Pointing only");
        } else {
          console.log("0DOF Clicker, or other");
        }
      }
    });
    window.addEventListener("gamepaddisconnected", function(e) {
      console.log(
        "Gamepad disconnected from index %d: %s",
        e.gamepad.index,
        e.gamepad.id
      );
    });


    
    if (process.env.NODE_ENV == "development") {
      // RenderStats
      var rendererStats = new RendererStats();
      rendererStats.domElement.style.position = "absolute";
      rendererStats.domElement.style.left = "0px";
      rendererStats.domElement.style.bottom = "0px";
      document.body.appendChild(rendererStats.domElement);
      // Stats
      var stats = new Stats();
      stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);
      // Three JS  Inspector
      window.scene = scene;
      window.THREE = THREE;
    }

    if (!("ongamepadconnected" in window)) {
      // No gamepad events available, poll instead.
      // interval = setInterval(pollGamepads, 500);
      console.log("no gamepad events available");
    }

    const cubeTex = new THREE.CubeTextureLoader().load(cubeImgs);
    cubeTex.format = THREE.RGBFormat;
    cubeTex.encoding = THREE.sRGBEncoding;
    scene.background = 0x000000;
    var fogColor = 0xffffff;
    scene.fog = new THREE.Fog(fogColor, 150, 500);
    // Load textures
    var textureLoader = new THREE.TextureLoader();
    var testTex = textureLoader.load(testImg)
    var testMat = new THREE.MeshBasicMaterial({color: 0xffffff, visible: false}); 
    var floorTex = textureLoader.load(floorImg);
    floorTex.flipY = false;
    // floorTex.encoding = THREE.sRGBEncoding;
    var centerTex = textureLoader.load(centerImg);
    centerTex.flipY = false;
    // centerTex.encoding = THREE.sRGBEncoding;
    var sideTex = textureLoader.load(sideImg);
    // sideTex.encoding = THREE.sRGBEncoding;
    sideTex.flipY = false;
    var centerMat = new THREE.MeshBasicMaterial({map: centerTex})          
    var sideMat = new THREE.MeshBasicMaterial({map: sideTex});
    var floorMat = new THREE.MeshBasicMaterial({map: floorTex, envMap: cubeTex, combine: THREE.AddOperation,reflectivity: 0.5});
    var navmesh = null;
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
                        case 'side001':
                            child.material = sideMat;
                            break;
                        case 'side002':
                            child.material = sideMat;
                            break;
                          case 'floor':
                            child.material = floorMat;
                            break;
                        case 'center001':
                            child.material = centerMat;
                            break;
                        case 'navmesh':
                            navmesh = child;
                            child.renderOrder = -1;
                            break;
                    }
                });
                // gltf.scene.position.setY(camHeight * -1);
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
    // Create mesh to use as teleport marker
    var ringGeometry = new THREE.RingGeometry( 0.2, 0.5, 32 );
    var ringMat = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    var reticle = new THREE.Mesh( ringGeometry, ringMat );
    reticle.rotateX(Math.PI * 0.5);
    reticle.visible = false;
    scene.add(reticle);

    // Spacebar event for non vr input
    document.body.onkeyup = function(e){
        if(e.keyCode == 32){
            move();
        }
    }
    // Clock to get delta time for PointerLock
    var clock = new THREE.Clock();
    // Submit flag to check for teleport input
    var submit = false;

    function move(){
      var cubePos = new THREE.Vector3();
      reticle.getWorldPosition(cubePos);

      user.position.set(cubePos.x, cubePos.y + camHeight, cubePos.z);
      console.log("Cube Position: ", cubePos);
    }
    function onResize() {
      // The delay ensures the browser has a chance to layout
      // the page and update the clientWidth/clientHeight.
      // This problem particularly crops up under iOS.
      if (!onResize.resizeDelay) {
        onResize.resizeDelay = setTimeout(function() {
          onResize.resizeDelay = null;
          console.log(
            "Resizing to %s x %s.",
            canvas.clientWidth,
            canvas.clientHeight
          );
          effect.setSize(canvas.clientWidth, canvas.clientHeight, false);
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }, 250);
      }
    }
    function onVRDisplayPresentChange() {
      console.log("onVRDisplayPresentChange");
      onResize();
      buttons.hidden = vrDisplay.isPresenting;
      inVR = vrDisplay.isPresenting;
    }
    function onVRDisplayConnect(e) {
      console.log(
        "onVRDisplayConnect",
        e.display || (e.detail && e.detail.display)
      );
    }
    function enterFullscreen(el) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    }
    if (document.addEventListener)
    {
        document.addEventListener('webkitfullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);
    }

    function exitHandler()
    {
        if (document.fullscreenElement)
        {
          inVR = true;
        }else{
          inVR = false;
        }
        console.log("exitHandler: ",inVR);
    }
    function pollGamepads() {
      var gamepads = navigator.getGamepads
        ? navigator.getGamepads()
        : navigator.webkitGetGamepads
        ? navigator.webkitGetGamepads
        : [];
      if (gamepads) {
        gamepad = gamepads[gamepadIndex];
        for (var i = 0; i < gamepads.length; ++i) {
          var gp = gamepads[i];
          if (gp) {
            var info = "";
            info =
              "Gamepad " +
              gp.index +
              " (" +
              gp.id +
              ")" +
              "Associated with VR Display ID: " +
              gp.displayId +
              " ";
            if (gp.hapticActuators) {
              info +=
                "Available haptic actuators: " + gp.hapticActuators.length;
            }
            if (gp.pose) {
              info += "Gamepad associated with which hand: " + gp.hand;
              info +=
                "Gamepad can return position info: " + gp.pose.hasPosition;
              info +=
                "Gamepad can return orientation info: " +
                gp.pose.hasOrientation;
            }
            if (gp.buttons) {
              for (var j = 0; j < gp.buttons.length; ++j) {
                var val = gp.buttons[i];
                var pressed = val == 1.0;
                if (typeof val == "object") {
                  pressed = val.pressed;
                  val = val.value;
                }
                submit = pressed;
                info += "Button " + j + ":" + pressed + " ";
              }
            } else {
              info += "No buttons. ";
            }
            if (gp.axes) {
              for (i = 0; i < gp.axes.length; i++) {
                if (gp.axes[i]) {
                  var a = gp.axes[i];
                  info += " " + i + ": " + gp.axes[i].toFixed(4);
                }
              }
            } else {
              info += "No axes. ";
            }
          }
          console.log(info);
        }
      }
    }
    function animate(timestamp) {
      // Stats
      if (process.env.NODE_ENV == "development") {
        stats.begin();
      }
      lastRender = timestamp;
      // Update VR headset position and apply to camera.
      if(controls){
        controls.update();
      }
      // Render the scene.
      effect.render(scene, camera);
      // Gamepad 
      var gamepads = navigator.getGamepads
        ? navigator.getGamepads()
        : navigator.webkitGetGamepads
        ? navigator.webkitGetGmepads
        : [];
      if (gamepads) {
        gamepad = gamepads[gamepadIndex];
        for (var i = 0; i < gamepads.length; ++i) {
          var gp = gamepads[i];
          if (gp) {
            var info = "";
            info =
              "Gamepad " +
              gp.index +
              " (" +
              gp.id +
              ")" +
              "Associated with VR Display ID: " +
              gp.displayId +
              " ";
            if (gp.hapticActuators) {
              info +=
                "Available haptic actuators: " + gp.hapticActuators.length;
            }
            if (gp.pose) {
              info += "Gamepad associated with which hand: " + gp.hand;
              info +=
                "Gamepad can return position info: " + gp.pose.hasPosition;
              info +=
                "Gamepad can return orientation info: " +
                gp.pose.hasOrientation;
            }
            if (gp.buttons) {
              for (var j = 0; j < gp.buttons.length; ++j) {
                var val = gp.buttons[i];
                var pressed = val == 1.0;
                if (typeof val == "object") {
                  pressed = val.pressed;
                  val = val.value;
                }
                submit = pressed;
                info += "Button " + j + ":" + pressed + " ";
              }
            } else {
              info += "No buttons. ";
            }
            if (gp.axes) {
              for (i = 0; i < gp.axes.length; i++) {
                if (gp.axes[i]) {
                  var a = gp.axes[i];
                  info += " " + i + ": " + gp.axes[i].toFixed(4);
                }
              }
            } else {
              info += "No axes. ";
            }
            // console.log(info);
          }
        }
      }
      var delta = clock.getDelta();
      var fadeScalar = 2;
      if(submit){
        if(fade <= 0){
          fadeIn = true;
          fadeOut = false;
          fade = 0;
        }
      }
      if(fadeIn){
        fade += delta * fadeScalar; 
      }
      if(fadeOut){
        fade -= delta * fadeScalar;
      }
      if(fade >= 1){
        move();
        fadeIn = false;
        fadeOut = true;
      }
      if(fade >= 0 | fade <=1){
        sphereMat.opacity = fade;
      }
      // Raycast onto navmesh and move cube
      var wpVector = new THREE.Vector3();
      camera.getWorldPosition(wpVector);
      var wdVector = new THREE.Vector3();
      camera.getWorldDirection(wdVector);
      raycaster.set(wpVector, wdVector);
      if(navmesh){
        var intersects = raycaster.intersectObject(navmesh);
        if(intersects.length > 0){
          var hit = intersects[0].point;
          if(!fadeIn){
            reticle.position.set(hit.x, hit.y +1, hit.z);
          }
          reticle.visible = true;
        }else{
            reticle.visible = false;
        }
      }
      submit = false;
      // Keep looping; if using a VRDisplay, call its requestAnimationFrame,
      // otherwise call window.requestAnimationFrame.
      if (vrDisplay) {
        vrDisplay.requestAnimationFrame(animate);
      } else {
        requestAnimationFrame(animate);
      }
      // Stats
      if (process.env.NODE_ENV === "development") {
        rendererStats.update(renderer);
        stats.end();
      }
    }
  }
}
