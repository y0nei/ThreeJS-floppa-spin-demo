import {GLTFLoader} from "./js/GLTFLoader.js";

var INTERSECTED;
var cursor = document.getElementById("cursor");
var lightColor = 0xffffff;
var radioHoverColor = 0xfA5220;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer( { 
    antialias: true, 
    alpha: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setViewport(0, 200, window.innerWidth, window.innerHeight); // Center everything
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Model loader
function loadModel(url) {
    return new Promise(resolve => {
        new GLTFLoader().load(url, resolve);
    });
}

let floppaModel, radioModel;
let m1 = loadModel('models/floppa.gltf').then(result => {  floppaModel = result.scene.children[0]; });
let m2 = loadModel('models/radio.gltf').then(result => {  radioModel = result.scene.children[0]; });

Promise.all([m1,m2]).then(() => {
    // floppaModel.position.set(0,0.034,0);
    floppaModel.position.set(0,0.025,0);
    radioModel.position.set(1.4,-0.5,1.2);
    radioModel.rotation.z = 0.3;
    
    floppaModel.castShadow = true;
    radioModel.traverse(function(node) {
        if (node.isMesh){ 
            node.castShadow = true;
        }
    })
    // const switchLight = new THREE.PointLight(0xfff000, 2, 2)
    // switchLight.intensity = 2;
    // radioModel.add(switchLight);

    scene.add(floppaModel);
    scene.add(radioModel);
    renderer.render(scene,camera);    
});

var radioMusic = document.getElementById('audio-player');
radioMusic.loop = true;
radioMusic.volume = 0.15;

var clickSound = document.getElementById('click');
clickSound.setAttribute("preload", "auto");
clickSound.autobuffer = true;
clickSound.volume = 0.2;

// var concreteScrape = document.getElementById('concrete');
// concreteScrape.loop = true;
// concreteScrape.volume = 0.3;
// concreteScrape.setAttribute("preload", "auto");
// concreteScrape.play();

var radioOn = true;
function radioPlayPause() {
    if ( radioOn == true ) {
        radioOn = false;
        radioMusic.play();
    } else {
        radioOn = true;
        radioMusic.pause();
    }
}
radioPlayPause();

// Unique function to load and loop scraping sound
// # Default js .loop(); has wierd delay after end 
var actx = new (AudioContext || webkitAudioContext)(),
    src = "sound/concrete-quiet.mp3",
    srcNode;  // global so we can access them from handlers

// Load some audio (CORS need to be allowed or we won't be able to decode the data)
fetch(src, {mode: "cors"}).then(function(resp) {return resp.arrayBuffer()}).then(decode);
// Decode the audio file, then start the show
function decode(buffer) {
    actx.decodeAudioData(buffer, playLoop);
}
// Sets up a new source node as needed as stopping will render current invalid
function playLoop(abuffer) {
  srcNode = actx.createBufferSource();  // create audio source
  srcNode.buffer = abuffer;             // use decoded buffer
  srcNode.connect(actx.destination);    // create output
  srcNode.loop = true;
  srcNode.start();
}

renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );

function onDocumentMouseMove(event) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

renderer.domElement.addEventListener('click', onClick, false);
renderer.domElement.addEventListener('mousemove', onHover, false);

// Mouse click event -> raycaster 
function onClick(event) {
    event.preventDefault();
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObject( radioModel );
    
    if ( intersects.length > 0 ) {
        if ( intersects[0] != INTERSECTED )
            clickSound.play();
            radioPlayPause();
            INTERSECTED = intersects[0].object;
    } 
}

// https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Mouse-Over.html
// Mouse hover event -> raycaster 
function onHover(event) {
    event.preventDefault();
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObject( radioModel );
    
    if ( intersects.length > 0 ) {
        if ( intersects[0].object != INTERSECTED ) {
            if ( INTERSECTED ) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            }
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(radioHoverColor);
            cursor.style.cursor = "pointer";
        }
    }
    else {
        if ( INTERSECTED ) {
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        }
        INTERSECTED = null;
        cursor.style.cursor = "default";
    }
}

// Spotlight
var spotLight = new THREE.SpotLight(lightColor);
spotLight.position.set(0, 10, 5);
spotLight.angle = 0.23;
spotLight.shadowMapVisible = true;
spotLight.castShadow = true;
spotLight.penumbra = 0.5;
spotLight.intensity = 2;
scene.add(spotLight);

// Ambient Light
var light = new THREE.AmbientLight(lightColor, 1);
scene.add(light);

// Plane
const planeGeometry = new THREE.PlaneGeometry(10, 15);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x242424, side: THREE.DoubleSide })
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotation.x = Math.PI / 2;
plane.position.y = -0.5;
plane.position.z = 0;
scene.add(plane);

camera.position.set(0,2,5);
function animate() {
    requestAnimationFrame(animate);
    floppaModel.rotation.y += 0.01;
    renderer.render(scene,camera);
}
animate();