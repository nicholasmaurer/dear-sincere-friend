import './style.css';
import printMe from "./print";
import WebVRScene from "./WebVRScene";

console.log("Hello world, this is me, life shoudle be, fun for everyone");

var markup = `
    <div id="buttons">
      <h1>Dear Sincere Friend</h1>
      <p>An alternate vision of the Deveen Gallery at the British Museum stripped of the Elgin Marbles.</p>
      <button id="fullscreen">Fullscreen</button>
      <button id="vr">VR (WebVR/Mobile only)</button>
    </div>`
;
document.body.innerHTML = markup;

let example = new WebVRScene();

//I think this disables some teouch events
document.addEventListener('touchmove', function(e) {
  e.preventDefault();
});



 