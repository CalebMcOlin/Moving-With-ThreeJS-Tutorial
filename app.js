import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

// Global variables
let scene, camera, renderer, controls, clickMouse, moveMouse, raycaster, draggableModel;

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

/** 
 * Adds a simple to the scene
 * 
 * @param {string} dir Folder name that holds the .gltf file.
 * @param {Object} pos object containing position data { x: number, y: number, z: number }
 */
function addModel(dir, pos) {
    const loader = new GLTFLoader();
    loader.load(`res/${dir}/scene.gltf`, (gltf) => {
        const model = gltf.scene;
        model.position.set(pos.x, pos.y, pos.z);
        model.isDraggable = true;
        scene.add(model);
    });
}

/**
 * Checks if the user is 'holding' and model.
 * If true, function updates model's location based on mouse postion
 * If false, function does nothing
 */
function dragModel() {
    // If 'holding' an model, move the model
    if (draggableModel) {
        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if (found.length > 0) {
            for (let i of found) {
                draggableModel.position.x = i.point.x;
                draggableModel.position.z = i.point.z;
            }
        }
    }
};

// Allows user to pick up and drop models on-click events
window.addEventListener('click', event => {
    // If 'holding' model on-click, set container to <undefined> to 'drop' the model.
    if (draggableModel) {
        draggableModel = undefined;
        return;
    }

    // If NOT 'holding' model on-click, set container to <object> to 'pickup' the model.
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera);
    const found = raycaster.intersectObjects(scene.children, true);
    if (found.length) {
        // Cycle upwards through every parent until it reaches the topmost layer
        // This top layer is the group created by the GLTFLoader function
        let current = found[0].object;
        while (current.parent.parent !== null) {
            current = current.parent;
        }
        if (current.isDraggable) {
            draggableModel = current;
        }
    }
});

// Constantly updates the mouse location for use in `dragModel()`
window.addEventListener('mousemove', event => {
    dragModel(); // Allows the model to move alongside the mouse as it moves
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

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
    addModel('saturnV', { x: 0, y: 10, z: 0 });
    animate();
})();