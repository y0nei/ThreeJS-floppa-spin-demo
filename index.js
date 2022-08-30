import {GLTFLoader} from "./js/GLTFLoader.js";

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);
var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setViewport(0, 200, window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var obj;
var loader = new GLTFLoader();
loader.load('./models/floppa.gltf', function(gltf){
    obj = gltf.scene;
    gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true; }
    });
    scene.add(gltf.scene);
});

var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set( 0, 10, 5 );
spotLight.angle = 0.23;
spotLight.shadowMapVisible = true;
spotLight.castShadow = true;
spotLight.penumbra = 0.3;
spotLight.intensity = 1.5;
scene.add(spotLight);

var light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const planeGeometry = new THREE.PlaneGeometry( 10, 15 );
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x242424, side: THREE.DoubleSide } )
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
plane.rotation.x = 1.6;
plane.position.y = -0.3;
plane.position.z = 0;
scene.add( plane );

camera.position.set(0,2,5);
function animate() {
    requestAnimationFrame(animate);
    obj.rotation.y += 0.01;
    renderer.render(scene,camera);
}
animate();