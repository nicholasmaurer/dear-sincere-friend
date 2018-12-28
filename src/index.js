import WebVRScene from "./WebVRScene";

console.log("Hello world, this is me, life shoudle be, fun for everyone");

let example = new WebVRScene();

//I think this disables some touch events
document.addEventListener('touchmove', function(e) {
  e.preventDefault();
});



 