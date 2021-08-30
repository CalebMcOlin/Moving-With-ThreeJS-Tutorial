import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

// Global variables
let scene, camera, renderer, controls, clickMouse, moveMouse, raycaster;

// Create Scene and lights
function init() {
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    // CAMERA
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(-80, 100, 200);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // CAMERA MOVEMENT CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 55, 0);
    controls.enableDamping = true;
    controls.update();

    // LIGHTS
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.30);
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-30, 50, 150);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // RAYCASTING (mouse functionality)
    raycaster = new THREE.Raycaster();
    clickMouse = new THREE.Vector2();
    moveMouse = new THREE.Vector2();

    // FLOOR
    let floor = new THREE.Mesh(
        new THREE.BoxBufferGeometry(2000, 3, 2000),
        new THREE.MeshPhongMaterial({ color: 0x1B8F06 })
    );
    floor.isDraggable = false;
    scene.add(floor);
};

// Recursive function to render the scene
function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

// Re-renders the scene upon window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the program
(function () {
    window.addEventListener('resize', onWindowResize, false);
    init();
    animate();
})();