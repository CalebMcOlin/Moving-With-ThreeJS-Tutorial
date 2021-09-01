import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls, clickMouse, moveMouse, raycaster, draggableObject;

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
        new THREE.BoxBufferGeometry(200, 3, 200),
        new THREE.MeshPhongMaterial({ color: 0x1B8F06 })
    );
    floor.isDraggable = false;
    scene.add(floor);
};

/**
 * Adding simple object in the scene
 * 
 * @param {number} radius of the object
 * @param {Object} pos object containing position data { x: number, y: number, z: number }
 * @param {Color} color hex code for color of object
 */
function addObject(radius, pos, color) {
    let object = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(radius, radius, 10, 50),
        new THREE.MeshPhongMaterial({ color: color})
    );
    object.position.set(pos.x, pos.y, pos.z);
    object.isDraggable = true;
    scene.add(object);
};

/**
 * Checks if the user is 'holding' an object.
 * If true, function updates object's location based on mouse postion
 * If false, function does nothing
 */
function dragObject() {
    // If 'holding' an object, move the object
    if (draggableObject) {
        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if (found.length > 0) {
            for (let i of found) {
                draggableObject.position.x = i.point.x;
                draggableObject.position.z = i.point.z;
            }
        }
    }
};

// Allows user to pick up and drop objects on-click events
window.addEventListener('click', event => {
    // If 'holding' object on-click, set container to <undefined> to 'drop' the object.
    if (draggableObject) {
        draggableObject = undefined;
        return;
    }

    // If NOT 'holding' object on-click, set container to <object> to 'pickup' the object.
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera);
    const found = raycaster.intersectObjects(scene.children, true);
    if (found.length > 0 && found[0].object.isDraggable) {
        draggableObject = found[0].object;
    }
});

// Constantly updates the mouse location for use in `dragObject()`
window.addEventListener('mousemove', event => {
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Recursive function to render the scene
function animate() {
    dragObject(); // Constantly calling this allows the object to be moved every render
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
    // Adding multiple objects
    addObject(8, { x: 0, y: 6, z: 0 }, '#FF0000');
    addObject(8, { x: 15, y: 6, z: 15 }, '#313DF8');
    addObject(8, { x: -15, y: 6, z: -15 }, '#000000');
    addObject(8, { x: -15, y: 6, z: 15 }, '#EF0A61');
    addObject(8, { x: 15, y: 6, z: -15 }, '#CAB21D');
    animate();
})();