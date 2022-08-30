import {GLTFLoader} from "./js/GLTFLoader.js";

var lightColor = 0xffffff;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setViewport(0, 200, window.innerWidth, window.innerHeight); // Center everything
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

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

    // Model shadows
    floppaModel.castShadow = true;
    radioModel.traverse(function(node){
        if (node.isMesh){ node.castShadow = true; }
    })
    
    scene.add(floppaModel);
    scene.add(radioModel);
    
    renderer.render(scene,camera);
});

var spotLight = new THREE.SpotLight(lightColor);
spotLight.position.set(0, 10, 5);
spotLight.angle = 0.23;
spotLight.shadowMapVisible = true;
spotLight.castShadow = true;
spotLight.penumbra = 0.5;
spotLight.intensity = 2;
scene.add(spotLight);

var light = new THREE.AmbientLight(lightColor, 1);
scene.add(light);

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