import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const clawSize = 5;
const clawDistanceFromCenter = 25;
const baseHookHeight = clawDistanceFromCenter / 2;

const cableInitialHeight = 30;

const craneWidth = 25;
const superiorCraneHeight = craneWidth;

const trolleyWidth = craneWidth;
const trolleyHeight = superiorCraneHeight / 2;
const trolleyX = 0;
const trolleyY = trolleyHeight / 2;
const trolleyZ = 0;

const trolleyInitialDistance = 100;

const lanceCarrierWidth = craneWidth;
const lanceCarrierHeight = superiorCraneHeight * 3;
const lanceCarrierX = 0;
const lanceCarrierY = lanceCarrierHeight / 2;
const lanceCarrierZ = 0;

const lanceWidth = craneWidth;
const lanceHeight = superiorCraneHeight;
const lanceLength = craneWidth * 10
const lanceX = lanceCarrierWidth / 2 + lanceLength / 2;
const lanceY = lanceHeight / 2;
const lanceZ = 0;

const counterLanceWidth = craneWidth;
const counterLanceHeight = superiorCraneHeight;
const counterLanceLength = lanceLength / 3;
const counterLanceX = -lanceCarrierWidth / 2 - counterLanceLength / 2;
const counterLanceY = counterLanceHeight / 2;
const counterLanceZ = 0;

const rodRadius = 1;

const counterWeightWidth = craneWidth;
const counterWeightHeight = counterLanceWidth;
const counterWeightX = counterLanceX;
const counterWeightY = counterLanceY - counterLanceHeight / 2 - counterWeightHeight / 2;
const counterWeightZ = 0;

const cabineWidth = craneWidth;
const cabineLength = cabineWidth / 2;
const cabineHeight = lanceCarrierHeight / 2;
const cabineX = lanceCarrierWidth / 2 + cabineLength / 2;
const cabineY = -cabineHeight / 2;
const cabineZ = 0;

const baseWidth = craneWidth * 2.5;
const baseHeigth = superiorCraneHeight / 2;
const baseX = 0;
const baseY = baseHeigth / 2;
const baseZ = 0;

const towerWidth = craneWidth;
const towerHeight = lanceLength;
const towerX = 0;
const towerY = towerHeight / 2 + baseHeigth;
const towerZ = 0;

const containerWidth = 60;
const containerLength = 100;
const containerHeight = 60;
const containerX = 150;
const containerY = containerHeight / 2;
const containerZ = 150;

const cargoMaxWidth = 40;
const cargoMinWidth = 15;
const cargoMaxLength = 75;
const cargoMinLength = 30;
const cargoMaxHeight = 70;
const cargoMinHeight = 25;
const cargoMaxDistanceFromBase = lanceLength * 8 / 10;
const cargoAmount = 5;

const superiorCraneStep = Math.PI / 3;
const trolleyStep = 50;
const trolleyLeftLimit = lanceCarrierWidth / 2 + trolleyWidth / 2;
const trolleyRightLimit = lanceLength;
const hookStep = 50;
const cablesStep = hookStep/2;
const cablesScale = cablesStep/15;
const hookUpperLimit = -clawSize / 2 - baseHookHeight / 2 - cableInitialHeight;
const hookLowerLimit = -(towerHeight + baseHeigth - clawSize);
const clawStep = Math.PI / 4;
const clawUpperLimit = Math.PI / 3;
const clawLowerLimit = 0;

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer, clock, materialBasic, materialTransparent;

var superiorCrane, trolleyGroup, hook, cables, claws = [], cargos = [];

var cargoLowerXCorners = [];
var cargoLowerZCorners = [];
var cargoUpperXCorners = [];
var cargoUpperZCorners = [];

var keysPressed = {};

var mobileCameraEnabled = false;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();

    // Set background color to white
    scene.background = new THREE.Color(0xffffff); // TODO escolher outra cor clara?

    scene.add(new THREE.AxesHelper(10));

    createCrane();
    createContainer();

    for (var i = 0; i < cargoAmount; i++) {
        createCargo();
    }
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    // TODO dúvida: camera inicial = ??
    'use strict';
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 300;
    camera.position.y = 500;
    camera.position.z = 300;
    camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    'use strict';

    var crane = new THREE.Object3D();
    createSuperiorCrane(crane, 0, baseHeigth + towerHeight, 0);
    createInferiorCrane(crane, 0, 0, 0);

    scene.add(crane);
}

function createSuperiorCrane(parent, x, y, z) {
    superiorCrane = new THREE.Object3D();
    createTrolleyGroup(superiorCrane, trolleyInitialDistance + lanceCarrierWidth / 2 + trolleyWidth / 2, 0, 0);
    createLanceCarrier(superiorCrane, lanceCarrierX, lanceCarrierY, lanceCarrierZ);
    createLance(superiorCrane, lanceX, lanceY, lanceZ);
    createCounterLance(superiorCrane, counterLanceX, counterLanceY, counterLanceZ);
    createRod(superiorCrane, lanceCarrierX + lanceCarrierWidth / 2, lanceCarrierY + lanceCarrierHeight / 2, lanceCarrierZ + lanceWidth / 2, -Math.PI * 2 / 3);
    createRod(superiorCrane, lanceCarrierX + lanceCarrierWidth / 2, lanceCarrierY + lanceCarrierHeight / 2, lanceCarrierZ - lanceWidth / 2, -Math.PI * 2 / 3);
    createRod(superiorCrane, lanceCarrierX - lanceCarrierWidth / 2, lanceCarrierY + lanceCarrierHeight / 2, lanceCarrierZ + lanceWidth / 2, Math.PI * 3 / 4);
    createRod(superiorCrane, lanceCarrierX - lanceCarrierWidth / 2, lanceCarrierY + lanceCarrierHeight / 2, lanceCarrierZ - lanceWidth / 2, Math.PI * 3 / 4);
    createCounterWeight(superiorCrane, counterWeightX, counterWeightY, counterWeightZ);
    createCabin(superiorCrane, cabineX, cabineY, cabineZ);
    superiorCrane.position.set(x, y, z);

    parent.add(superiorCrane)
}

function createTrolleyGroup(parent, x, y, z) {
    trolleyGroup = new THREE.Object3D();
    createHook(trolleyGroup, 0, -clawSize / 2 - baseHookHeight / 2 - cableInitialHeight, 0);
    createCable(trolleyGroup, 0, -cableInitialHeight / 2, 0);
    createTrolley(trolleyGroup, trolleyX, trolleyY, trolleyZ);
    trolleyGroup.position.set(x, y, z);

    parent.add(trolleyGroup);
}

function createHook(parent, x, y, z) {
    var clawHeight = Math.sqrt(Math.pow(clawSize, 2) / 2);
    var baseHook = new THREE.Mesh(new THREE.BoxGeometry(clawDistanceFromCenter, baseHookHeight, clawDistanceFromCenter), materialBasic);
    baseHook.position.set(0, clawHeight * 2 + baseHookHeight / 2, 0);

    hook = new THREE.Object3D();
    hook.add(baseHook);

    var clawPivot1 = new THREE.Object3D();
    clawPivot1.position.set(0, clawHeight * 2, clawDistanceFromCenter / 2);
    hook.add(clawPivot1);
    createClaw(clawPivot1, 0, -(clawHeight * 2), 0);

    var clawPivot2 = new THREE.Object3D();
    clawPivot2.position.set(clawDistanceFromCenter / 2, clawHeight * 2, 0);
    hook.add(clawPivot2);
    createClaw(clawPivot2, 0, -(clawHeight * 2), 0);

    var clawPivot3 = new THREE.Object3D();
    clawPivot3.position.set(0, clawHeight * 2, -clawDistanceFromCenter / 2);
    hook.add(clawPivot3);
    createClaw(clawPivot3, 0, -(clawHeight * 2), 0);

    var clawPivot4 = new THREE.Object3D();
    clawPivot4.position.set(-clawDistanceFromCenter / 2, clawHeight * 2, 0);
    hook.add(clawPivot4);
    createClaw(clawPivot4, 0, -(clawHeight * 2), 0);

    hook.position.set(x, y - clawSize - baseHookHeight / 2, z);

    // Create a bounding sphere for the hook
    var hookGeometry = new THREE.SphereGeometry(clawDistanceFromCenter / 2);
    var hookBoundingSphere = new THREE.Mesh(hookGeometry, materialBasic);
    hookBoundingSphere.position.copy(hook.position); // Set the position of the bounding sphere to match the hook
    hookBoundingSphere.visible = false; // Hide the bounding sphere
    hook.add(hookBoundingSphere); // Add the bounding sphere to the hook

    parent.add(hook);
}

function createClaw(parent, x, y, z) {
    var clawHeight = Math.sqrt(Math.pow(clawSize, 2) / 2);
    var angleAlignedWithFloor = Math.PI * 54.5 / 180;

    var clawSuperior = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), materialBasic);
    clawSuperior.rotation.set(angleAlignedWithFloor, -Math.PI / 4, 0);
    clawSuperior.position.set(0, clawHeight / 2, 0);

    var clawInferior = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), materialBasic);
    clawInferior.rotation.set(-angleAlignedWithFloor + Math.PI, -Math.PI / 4, 0);
    clawInferior.position.set(0, -clawHeight / 2, 0);

    var claw = new THREE.Object3D();
    claw.add(clawSuperior);
    claw.add(clawInferior);
    claw.position.set(x, y, z);
    claw.rotation.set(0, 0, 0);

    parent.add(claw);
    claws.push(claw);

}

function createCable(parent, x, y, z) {
    var radius = 1;
    var distanceFromCenter = 3;

    var cable1 = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, cableInitialHeight, 16), materialBasic);
    cable1.position.set(distanceFromCenter, 0, -distanceFromCenter);
    var cable2 = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, cableInitialHeight, 16), materialBasic);
    cable2.position.set(-distanceFromCenter, 0, distanceFromCenter);

    cables = new THREE.Object3D();
    cables.add(cable1);
    cables.add(cable2);

    cables.position.set(x, y, z);

    parent.add(cables);
}

function createTrolley(parent, x, y, z) {
    var boxHeight = trolleyHeight * 4 / 5;
    var wheelHeigth = trolleyHeight * 1 / 5;

    var box = new THREE.Mesh(new THREE.BoxGeometry(trolleyWidth, boxHeight, trolleyWidth), materialBasic);
    box.position.set(0, trolleyHeight / 2 - boxHeight / 2, 0);

    var wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(wheelHeigth / 2, wheelHeigth / 2, trolleyWidth), materialBasic);
    wheel1.rotation.set(Math.PI / 2, 0, 0);
    wheel1.position.set(-trolleyWidth / 2 + wheelHeigth / 2, -trolleyHeight / 2 + wheelHeigth / 2, 0);

    var wheel2 = new THREE.Mesh(new THREE.CylinderGeometry(wheelHeigth / 2, wheelHeigth / 2, trolleyWidth), materialBasic);
    wheel2.rotation.set(Math.PI / 2, 0, 0);
    wheel2.position.set(trolleyWidth / 2 - wheelHeigth / 2, -trolleyHeight / 2 + wheelHeigth / 2, 0);
    
    var trolley = new THREE.Object3D();
    trolley.add(box);
    trolley.add(wheel1);
    trolley.add(wheel2);
    trolley.position.set(x, y, z);   

    parent.add(trolley);
}

function createLance(parent, x, y, z) {
    var lance = new THREE.Mesh(new THREE.BoxGeometry(lanceLength, lanceHeight, lanceWidth), materialBasic);
    lance.position.set(x, y, z);

    parent.add(lance);
}

function createCounterLance(parent, x, y, z) {
    var counterLance = new THREE.Mesh(new THREE.BoxGeometry(counterLanceLength, counterLanceHeight, counterLanceWidth), materialBasic);
    counterLance.position.set(x, y, z);

    parent.add(counterLance);
}

function createCounterWeight(parent, x, y, z) {
    var counterWeight = new THREE.Mesh(new THREE.BoxGeometry(counterWeightWidth, counterWeightHeight, counterWeightWidth), materialBasic);
    counterWeight.position.set(x, y, z);

    parent.add(counterWeight);
}

function createLanceCarrier(parent, x, y, z) {
    var lanceCarrier = new THREE.Mesh(new THREE.BoxGeometry(lanceCarrierWidth, lanceCarrierHeight, lanceCarrierWidth), materialBasic);
    lanceCarrier.position.set(x, y, z);

    parent.add(lanceCarrier);
}

function createRod(parent, x, y, z, rotationZ) {
    var size = (y - lanceHeight) / Math.cos(rotationZ);
    var sideLength = Math.tan(rotationZ) * (y - lanceHeight);
    
    var rod = new THREE.Mesh(new THREE.CylinderGeometry(rodRadius, rodRadius, size, 8), materialBasic);
    rod.rotation.set(0, 0, rotationZ);
    rod.position.set(x + sideLength / 2, y - (y - lanceHeight) / 2, z);

    parent.add(rod);
}

function createCabin(parent, x, y, z) {
    var cabine = new THREE.Mesh(new THREE.BoxGeometry(cabineLength, cabineHeight, cabineWidth), materialBasic);
    cabine.position.set(x, y, z);

    parent.add(cabine);
}

function createInferiorCrane(parent, x, y, z) {
    var inferiorCrane = new THREE.Object3D();
    createTower(inferiorCrane, towerX, towerY, towerZ);
    createBase(inferiorCrane, baseX, baseY, baseZ);
    inferiorCrane.position.set(x, y, z);

    parent.add(inferiorCrane);
}

function createTower(parent, x, y, z) {
    var tower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, towerHeight, towerWidth), materialBasic);
    tower.position.set(x, y, z);

    parent.add(tower);
}

function createBase(parent, x, y, z) {
    var base = new THREE.Mesh(new THREE.BoxGeometry(baseWidth, baseHeigth, baseWidth), materialBasic);
    base.position.set(x, y, z);

    parent.add(base);
}

function createContainer() {
    var materialBasics = [materialBasic, materialBasic, materialTransparent, materialBasic, materialBasic, materialBasic];

    var mesh = new THREE.Mesh(new THREE.BoxGeometry(containerLength, containerHeight, containerWidth), materialBasics);
    mesh.position.set(containerX, containerY, containerZ);
    
    scene.add(mesh);
}

function createCargo() {
    var length = generateRandomNumber(cargoMaxLength, cargoMinLength);
    var width = generateRandomNumber(cargoMaxWidth, cargoMinWidth);

    var x = generateRandomNumber(cargoMaxDistanceFromBase, -cargoMaxDistanceFromBase);
    var z = generateRandomNumber(cargoMaxDistanceFromBase, -cargoMaxDistanceFromBase);

    if (!isValidCargoPosition(x - length / 2, z - width / 2, x + length / 2, z + width / 2)) {
        createCargo();
        return;
    }

    var height = generateRandomNumber(cargoMaxHeight, cargoMinHeight);

    var mesh = createRandomCargo(length, height, width, x, z, materialBasic);

    var index = cargoLowerXCorners.length;
    cargoLowerXCorners[index] = x - length / 2;
    cargoLowerZCorners[index] = z - width / 2;
    cargoUpperXCorners[index] = x + length / 2;
    cargoUpperZCorners[index] = z + width / 2;

    // Create a bounding sphere for the cargo
    var cargoBoundingSphereGeometry = new THREE.SphereGeometry(Math.max(length, width, height) / 2);
    var cargoBoundingSphere = new THREE.Mesh(cargoBoundingSphereGeometry, materialBasic);
    cargoBoundingSphere.position.copy(mesh.position);
    cargoBoundingSphere.visible = false;
    mesh.add(cargoBoundingSphere);

    cargos.push(mesh);

    scene.add(mesh);
}

function isValidCargoPosition(lowerXCorner, lowerZCorner, upperXCorner, upperZCorner) {
    for (var i = 0; i < cargoLowerXCorners.length; i++) {
        if (isInContact(lowerXCorner, lowerZCorner, upperXCorner, upperZCorner, 
                cargoLowerXCorners[i], cargoLowerZCorners[i], cargoUpperXCorners[i], cargoUpperZCorners[i])) {
            return false;
        }
    }

    var baseLowerX = baseX - baseWidth / 2;
    var baseLowerZ = baseZ - baseWidth / 2;
    var baseUpperX = baseX + baseWidth / 2;
    var baseUpperZ = baseZ + baseWidth / 2;
    var isInsideBase = isInContact(lowerXCorner, lowerZCorner, upperXCorner, upperZCorner, baseLowerX, baseLowerZ, baseUpperX, baseUpperZ);

    var containerLowerX = containerX - containerLength / 2;
    var containerLowerZ = containerZ - containerWidth / 2;
    var containerUpperX = containerX + containerLength / 2;
    var containerUpperZ = containerZ + containerWidth / 2;
    var isInsideContainer = isInContact(lowerXCorner, lowerZCorner, upperXCorner, upperZCorner, 
            containerLowerX, containerLowerZ, containerUpperX, containerUpperZ);

    return !isInsideBase && !isInsideContainer;
}

function isInContact(lowerXCorner1, lowerZCorner1, upperXCorner1, upperZCorner1, lowerXCorner2, lowerZCorner2, upperXCorner2, upperZCorner2) {
    var isXOverlap = upperXCorner1 >= lowerXCorner2 && lowerXCorner1 <= upperXCorner2;
    var isZOverlap = upperZCorner1 >= lowerZCorner2 && lowerZCorner1 <= upperZCorner2;

    return isXOverlap && isZOverlap;
}

function createRandomCargo(length, height, width, x, z, materialBasic) {
    var randomValue = generateRandomNumber(cargoAmount, 0);
    var geometry;
    var y;

    switch(randomValue) {
        case 0:
            geometry = new THREE.BoxGeometry(length, height, width);
            y = height / 2;
            break;
        case 1:
            geometry = new THREE.DodecahedronGeometry(width);
            y = width - dodecahedronY(width);
            break;
        case 2:
            geometry = new THREE.IcosahedronGeometry(width);
            y = width - icosahedronY(width);
            break;
        case 3:
            geometry = new THREE.TorusGeometry(width / 2 / 1.4, width * 0.4 / 2 / 1.4);
            y = torusY(width / 2 / 1.4, width * 0.4 / 2 / 1.4);
            break;
        case 4:
            geometry = new THREE.TorusKnotGeometry(width / 2 / 1.4, width * 0.4 / 2 / 1.4);
            y = torusKnotY(width / 2 / 1.4, width * 0.4 / 2 / 1.4);
            break;
    }

    var mesh = new THREE.Mesh(geometry, materialBasic);
    mesh.position.set(x, y, z);

    return mesh;
}

function dodecahedronY(radius) {
    var edge = (Math.sqrt(5) - 1) * radius / Math.sqrt(3);
    var cathet = Math.sqrt(Math.pow(radius, 2) - Math.pow(edge / 2, 2));
    return radius - cathet;
}

function icosahedronY(radius) {
    var edge = radius / Math.sin(2 * Math.PI / 5);
    var cathet = Math.sqrt(Math.pow(radius, 2) - Math.pow(edge / 2, 2));
    return radius - cathet;
}

function torusY(radius, tubeRadius) {
    return radius + tubeRadius;
}

function torusKnotY(radius, tubeRadius) {
    return radius + tubeRadius * 2;
}

function generateRandomNumber(max, min) {
    return Math.floor(Math.random() * (max - min) + 1) + min;
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    var hookPosition = new THREE.Vector3();
    hook.getWorldPosition(hookPosition);

    var hookBoundingSphereRadius = hook.children[5].geometry.parameters.radius;

    for (var i = 0; i < cargos.length; i++) {
        var cargo = cargos[i];
        var cargoPosition = new THREE.Vector3();
        cargo.getWorldPosition(cargoPosition);
        var distance = hookPosition.distanceTo(cargoPosition);

        var cargoBoundingSphereRadius = cargo.children[0].geometry.parameters.radius;
        
        if (distance < hookBoundingSphereRadius + cargoBoundingSphereRadius) {
            console.log("Collision detected between hook and cargo " + i);
            handleCollisions();
        }
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';
    // TODO: animação
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

    var delta = clock.getDelta();

    if (keysPressed[81] || keysPressed[113]) { // Q
        rotateSuperiorCraneLeft(delta);
    }

    if (keysPressed[65] || keysPressed[97]) { // A
        rotateSuperiorCraneRight(delta);
    }
    
    if (keysPressed[87] || keysPressed[119]) { // W
        moveTrolleyLeft(delta);
    }
    
    if (keysPressed[83] || keysPressed[115]) { // S
        moveTrolleyRight(delta);
    }
    
    if (keysPressed[69] || keysPressed[101]) { // E
        moveHookDown(delta);
    }
    
    if (keysPressed[68] || keysPressed[100]) { // D
        moveHookUp(delta);
    }
    
    if (keysPressed[82] || keysPressed[114]) { // R
        closeClaw(delta);
    }
    
    if (keysPressed[70] || keysPressed[102]) { // F
        openClaw(delta);
    }
    if(mobileCameraEnabled){
        createMobileCamera();
    }
    checkCollisions();
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    materialBasic = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materialTransparent = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide });


    createScene();
    createCamera();

    render();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    update();

    render();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////

function createFrontalCamera() {
    'use strict';

    // Define the parameters for frontal camera
    var width = window.innerWidth;
    var height = window.innerHeight;
    var near = 1;
    var far = 1000;

    // Create frontal camera
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far);
    // Set camera position and orientation
    camera.position.set(0, 0, 200);
    camera.lookAt(scene.position);

    mobileCameraEnabled = false;
}

function createLateralCamera() {
    'use strict';

    // Define the parameters for lateral camera
    var width = window.innerWidth / 2; // Half the window width
    var height = window.innerHeight;
    var near = 1;
    var far = 1000;

    // Create lateral camera
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far);
    // Set camera position and orientation
    camera.position.set(200, 0, 0);
    camera.lookAt(scene.position);

    mobileCameraEnabled = false;
}

function createTopCamera() {
    'use strict';

    // Define the parameters for top camera
    var width = window.innerWidth;
    var height = window.innerHeight / 2; // Half the window height
    var near = 1;
    var far = 1000;

    // Create top camera
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far);
    // Set camera position and orientation
    camera.position.set(0, 400, 0);
    camera.lookAt(scene.position);

    mobileCameraEnabled = false;
}

function createFixedOrthogonalCamera() {
    'use strict';
    var near = 1;
    var far = 1000;

    // Create orthogonal camera
    camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, near, far);
    // Set camera position and orientation
    camera.position.set(300, 500, 300);
    camera.lookAt(scene.position);

    mobileCameraEnabled = false;
}


function createFixedPerspectiveCamera() {
    'use strict';
    var near = 1;
    var far = 1000;

    // Create perspective camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, near, far);
    // Set camera position and orientation
    camera.position.set(300, 500, 300);
    camera.lookAt(scene.position);

    mobileCameraEnabled = false;
}

function createMobileCamera() {
    'use strict';

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);

    var hookGlobalPosition = new THREE.Vector3();
    hook.getWorldPosition(hookGlobalPosition);

    camera.position.set(hookGlobalPosition.x, hookGlobalPosition.y, hookGlobalPosition.z);
    camera.lookAt(scene.position);

    mobileCameraEnabled = true;
}


function rotateSuperiorCraneLeft(delta) {
    'use strict';
    
    var rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), -superiorCraneStep * delta);
    superiorCrane.applyMatrix4(rotationMatrix);
}

function rotateSuperiorCraneRight(delta) {
    'use strict';

    var rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), superiorCraneStep * delta);
    superiorCrane.applyMatrix4(rotationMatrix);
}

function moveTrolleyLeft(delta) {
    'use strict';

    if((trolleyGroup.position.x - trolleyStep * delta) >= trolleyLeftLimit) {
        trolleyGroup.position.x -= trolleyStep * delta;
    }
}

function moveTrolleyRight(delta) {
    'use strict';

    if((trolleyGroup.position.x + trolleyStep * delta) <= trolleyRightLimit) {
        trolleyGroup.position.x += trolleyStep * delta;
    }
}

function moveHookDown(delta) {
    'use strict';

    if((hook.position.y - hookStep * delta) >= hookLowerLimit) {
        hook.position.y -= hookStep * delta;
        cables.position.y -= cablesStep * delta;
        cables.scale.y += cablesScale * delta;
    }
}

function moveHookUp(delta) {
    'use strict';

    if((hook.position.y + hookStep * delta) <= hookUpperLimit) {
        hook.position.y += hookStep * delta;
        cables.position.y += cablesStep * delta;
        cables.scale.y -= cablesScale * delta;
    }
}

function closeClaw(delta) {
    'use strict';
    
    if((claws[0].rotation.x + clawStep * delta) <= clawUpperLimit) {
        var rotationMatrixX0 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), clawStep * delta);
        claws[0].applyMatrix4(rotationMatrixX0);
    }
    
    if((claws[1].rotation.z - clawStep * delta) >= -clawUpperLimit) {
        var rotationMatrixZ1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), -clawStep * delta);
        claws[1].applyMatrix4(rotationMatrixZ1);
    }

    if((claws[2].rotation.x - clawStep * delta) >= -clawUpperLimit) {
        var rotationMatrixX2 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), -clawStep * delta);
        claws[2].applyMatrix4(rotationMatrixX2);
    }

    if((claws[3].rotation.z + clawStep * delta) <= clawUpperLimit) { 
        var rotationMatrixZ3 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), clawStep * delta);
        claws[3].applyMatrix4(rotationMatrixZ3);
    }
}

function openClaw(delta) {
    'use strict';

    if((claws[0].rotation.x - clawStep * delta) >= clawLowerLimit) {
        var rotationMatrixX0 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), -clawStep * delta);
        claws[0].applyMatrix4(rotationMatrixX0);
    }
    
    if((claws[1].rotation.z + clawStep * delta) <= clawLowerLimit) {
        var rotationMatrixZ1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), clawStep * delta);
        claws[1].applyMatrix4(rotationMatrixZ1);
    }

    if((claws[2].rotation.x + clawStep * delta) <= clawLowerLimit) {
        var rotationMatrixX2 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), clawStep * delta);
        claws[2].applyMatrix4(rotationMatrixX2);
    }

    if((claws[3].rotation.z - clawStep * delta) >= clawLowerLimit) { 
        var rotationMatrixZ3 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), -clawStep * delta);
        claws[3].applyMatrix4(rotationMatrixZ3);
    }
}

function onKeyDown(e) {
    'use strict';

    keysPressed[e.keyCode] = true;

    switch (e.keyCode) {
    case 81: //Q
    case 113: //q
        var keyQ = document.getElementById('keyQ');
        keyQ.classList.toggle('active', true);
        break;
    case 65: //A
    case 97: //a
        var keyA = document.getElementById('keyA');
        keyA.classList.toggle('active', true);
        break;
    case 87: //W
    case 119: //w
        var keyW = document.getElementById('keyW');
        keyW.classList.toggle('active', true);
        break;
    case 83: //S
    case 115: //s
        var keyS = document.getElementById('keyS');
        keyS.classList.toggle('active', true);
        break;
    case 69: //E
    case 101: //e
        var keyE = document.getElementById('keyE');
        keyE.classList.toggle('active', true);
        break;
    case 68: //D
    case 100: //d
        var keyD = document.getElementById('keyD');
        keyD.classList.toggle('active', true);
        break;
    case 82: //R
    case 114: //r
        var keyR = document.getElementById('keyR');
        keyR.classList.toggle('active', true);
        break;
    case 70: //F
    case 102: //f
        var keyF = document.getElementById('keyF');
        keyF.classList.toggle('active', true);
        break;
    case 49: //1
        var key1 = document.getElementById('key1');
        key1.classList.toggle('active', true);
        createFrontalCamera();
        break;
    case 50: //2
        var key2 = document.getElementById('key2');
        key2.classList.toggle('active', true);
        createLateralCamera();
        break;
    case 51: //3
        var key3 = document.getElementById('key3');
        key3.classList.toggle('active', true);
        createTopCamera();
        break;
    case 52: //4
        var key4 = document.getElementById('key4');
        key4.classList.toggle('active', true);
        createFixedOrthogonalCamera();
        break;
    case 53: //5
        var key5 = document.getElementById('key5');
        key5.classList.toggle('active', true);
        createFixedPerspectiveCamera();
        break;
    case 54: //6
        var key6 = document.getElementById('key6');
        key6.classList.toggle('active', true);
        createMobileCamera();
        break;
    case 55: //7
        var key7 = document.getElementById('key7');
        key7.classList.toggle('active', true);
        materialBasic.wireframe = !materialBasic.wireframe;
        break;
  }

}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    keysPressed[e.keyCode] = false;

    switch (e.keyCode) {
    case 81: //Q
    case 113: //q
        var keyQ = document.getElementById('keyQ');
        keyQ.classList.toggle('active', false);
        break;
    case 65: //A
    case 97: //a
        var keyA = document.getElementById('keyA');
        keyA.classList.toggle('active', false);
        break;
    case 87: //W
    case 119: //w
        var keyW = document.getElementById('keyW');
        keyW.classList.toggle('active', false);
        break;
    case 83: //S
    case 115: //s
        var keyS = document.getElementById('keyS');
        keyS.classList.toggle('active', false);
        break;
    case 69: //E
    case 101: //e
        var keyE = document.getElementById('keyE');
        keyE.classList.toggle('active', false);
        break;
    case 68: //D
    case 100: //d
        var keyD = document.getElementById('keyD');
        keyD.classList.toggle('active', false);
        break;
    case 82: //R
    case 114: //r
        var keyR = document.getElementById('keyR');
        keyR.classList.toggle('active', false);
        break;
    case 70: //F
    case 102: //f
        var keyF = document.getElementById('keyF');
        keyF.classList.toggle('active', false);
        break;
    case 49: //1
        var key1 = document.getElementById('key1');
        key1.classList.toggle('active', false);
        break;
    case 50: //2
        var key2 = document.getElementById('key2');
        key2.classList.toggle('active', false);
        break;
    case 51: //3
        var key3 = document.getElementById('key3');
        key3.classList.toggle('active', false);
        break;
    case 52: //4
        var key4 = document.getElementById('key4');
        key4.classList.toggle('active', false);
        break;
    case 53: //5
        var key5 = document.getElementById('key5');
        key5.classList.toggle('active', false);
        break;
    case 54: //6
        var key6 = document.getElementById('key6');
        key6.classList.toggle('active', false);
        break;
    case 55: //7
        var key7 = document.getElementById('key7');
        key7.classList.toggle('active', false);
        break;
  }
}

init();
animate();