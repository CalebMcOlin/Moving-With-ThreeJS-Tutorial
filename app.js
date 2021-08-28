import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls, clickMouse, moveMouse, raycaster, draggableItem;

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
 * Adding simple item in the scene
 * 
 * @param {number} radius of the item
 * @param {Object} pos object containing position data { x: number, y: number, z: number }
 */
function addItem(radius, pos) {
    let item = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(radius, radius, 10, 50),
        new THREE.MeshPhongMaterial({ color: '#FF0000' })
    );
    item.position.set(pos.x, pos.y, pos.z);
    item.isDraggable = true;
    scene.add(item);
};

/**
 * Checks if the user is 'holding' and item.
 * If true, function updates item's location based on mouse postion
 * If false, function does nothing
 */
function dragObject() {
    // If 'holding' item, move item
    if (draggableItem) {
        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if (found.length > 0) {
            for (let o of found) {
                if (!o.object.name === 'GROUND')
                    continue
                draggableItem.position.x = o.point.x;
                draggableItem.position.z = o.point.z;
            }
        }
    }
};

// Allows user to pick up and drop items on-click events
window.addEventListener('click', event => {
    // If 'holding' an item on-click, set to <undefined> to 'drop' the item.
    if (draggableItem) {
        draggableItem = undefined;
        return;
    }

    // If NOT 'holding' an item on-click, set to <object> to 'pickup' the item.
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera);
    const found = raycaster.intersectObjects(scene.children, true);
    if (found.length > 0 && found[0].object.isDraggable) {
        draggableItem = found[0].object;
    }
});

// Constantly updates the mouse location for use in `dragObject()`
window.addEventListener('mousemove', event => {
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Recursive function to render the scene
function renderScene() {
    dragObject(); // Constantly calling this allows the object to be moved every render
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(renderScene);
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
    addItem(8, { x: 0, y: 6, z: 0 });
    renderScene();
})();