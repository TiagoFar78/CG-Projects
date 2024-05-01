import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const clawSize = 5;
const clawDistanceFromCenter = clawSize * 5;
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

const superiorCraneStep = Math.PI / 180;
const trolleyStep = 1;
const hookStep = 2;
const cablesStep = hookStep/2;
const cablesScale = cablesStep/15;

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;

var superiorCrane, trolleyGroup, hook, cables, dedo1, dedo2, dedo3, dedo4;

var keysPressed = {};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    // Set background color to white
    scene.background = new THREE.Color(0xffffff); // TODO escolher cor clara?

    scene.add(new THREE.AxesHelper(10));

    createCrane();
    createContainer();
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
    createCounterWeight(superiorCrane, counterWeightX, counterWeightY, counterWeightZ);
    createCabin(superiorCrane, cabineX, cabineY, cabineZ);
    superiorCrane.position.set(x, y, z);

    parent.add(superiorCrane)
}

function createTrolleyGroup(parent, x, y, z) {
    trolleyGroup = new THREE.Object3D();
    // mudar a altura porque não é bem clawSize que é suposto tar ali
    createHook(trolleyGroup, 0, -clawSize / 2 - baseHookHeight / 2 - cableInitialHeight, 0);
    createCable(trolleyGroup, 0, -cableInitialHeight / 2, 0);
    createTrolley(trolleyGroup, trolleyX, trolleyY, trolleyZ);
    trolleyGroup.position.set(x, y, z);

    parent.add(trolleyGroup);
}

function createHook(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    dedo1 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo1.position.set(clawDistanceFromCenter, 0, 0);
    dedo2 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo2.position.set(clawDistanceFromCenter, 0, clawDistanceFromCenter);
    dedo3 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo3.position.set(0, 0, clawDistanceFromCenter);
    dedo4 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo4.position.set(0, 0, 0);

    var baseGarra = new THREE.Mesh(new THREE.BoxGeometry(clawDistanceFromCenter, baseHookHeight, clawDistanceFromCenter), material);
    // mudar a altura porque não é bem clawSize que é suposto estar ali.
    baseGarra.position.set(clawDistanceFromCenter / 2, clawSize + baseHookHeight / 2, clawDistanceFromCenter / 2);

    hook = new THREE.Object3D();
    hook.add(baseGarra);
    hook.add(dedo1);
    hook.add(dedo2);
    hook.add(dedo3);
    hook.add(dedo4);

    hook.position.set(x - clawDistanceFromCenter / 2, y - clawSize - baseHookHeight / 2, z - clawDistanceFromCenter / 2);

    parent.add(hook);
}

function createCable(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var radius = 1;
    var distanceFromCenter = 3;

    var cable1 = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, cableInitialHeight, 16), material);
    cable1.position.set(distanceFromCenter, 0, -distanceFromCenter);
    var cable2 = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, cableInitialHeight, 16), material);
    cable2.position.set(-distanceFromCenter, 0, distanceFromCenter);

    cables = new THREE.Object3D();
    cables.add(cable1);
    cables.add(cable2);

    cables.position.set(x, y, z);

    parent.add(cables);
}

function createTrolley(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var boxHeight = trolleyHeight * 4 / 5;
    var wheelHeigth = trolleyHeight * 1 / 5;

    var box = new THREE.Mesh(new THREE.BoxGeometry(trolleyWidth, boxHeight, trolleyWidth), material);
    box.position.set(0, trolleyHeight / 2 - boxHeight / 2, 0);

    var wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(wheelHeigth / 2, wheelHeigth / 2, trolleyWidth), material);
    wheel1.rotation.set(Math.PI / 2, 0, 0);
    wheel1.position.set(-trolleyWidth / 2 + wheelHeigth / 2, -trolleyHeight / 2 + wheelHeigth / 2, 0);

    var wheel2 = new THREE.Mesh(new THREE.CylinderGeometry(wheelHeigth / 2, wheelHeigth / 2, trolleyWidth), material);
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
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var lance = new THREE.Mesh(new THREE.BoxGeometry(lanceLength, lanceHeight, lanceWidth), material);
    lance.position.set(x, y, z);

    parent.add(lance);
}

function createCounterLance(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var counterLance = new THREE.Mesh(new THREE.BoxGeometry(counterLanceLength, counterLanceHeight, counterLanceWidth), material);
    counterLance.position.set(x, y, z);

    parent.add(counterLance);
}

function createCounterWeight(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var counterWeight = new THREE.Mesh(new THREE.BoxGeometry(counterWeightWidth, counterWeightHeight, counterWeightWidth), material);
    counterWeight.position.set(x, y, z);

    parent.add(counterWeight);
}

function createLanceCarrier(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var lanceCarrier = new THREE.Mesh(new THREE.BoxGeometry(lanceCarrierWidth, lanceCarrierHeight, lanceCarrierWidth), material);
    lanceCarrier.position.set(x, y, z);

    parent.add(lanceCarrier);
}

function createCabin(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var cabine = new THREE.Mesh(new THREE.BoxGeometry(cabineLength, cabineHeight, cabineWidth), material);
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
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var tower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, towerHeight, towerWidth), material);
    tower.position.set(x, y, z);

    parent.add(tower);
}

function createBase(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var base = new THREE.Mesh(new THREE.BoxGeometry(baseWidth, baseHeigth, baseWidth), material);
    base.position.set(x, y, z);

    parent.add(base);
}

function createContainer() {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    var materialTransparent = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide });

    var materials = [material, material, materialTransparent, material, material, material];

    var mesh = new THREE.Mesh(new THREE.BoxGeometry(containerLength, containerHeight, containerWidth), materials);
    mesh.position.set(containerX, containerY, containerZ);
    
    scene.add(mesh);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

    if (keysPressed[81] || keysPressed[113]) { // Q
        pressKeyQ();
    }
    if (!keysPressed[81] || !keysPressed[113]) {
        var keyQ = document.getElementById('keyQ');
        keyQ.classList.toggle('active', false);
    }
    if (keysPressed[65] || keysPressed[97]) { // A
        pressKeyA();
    }
    if (!keysPressed[65] || !keysPressed[97]) {
        var keyA = document.getElementById('keyA');
        keyA.classList.toggle('active', false);
    }
    if (keysPressed[87] || keysPressed[119]) { // W
        pressKeyW();
    }
    if (!keysPressed[87] || !keysPressed[119]) {
        var keyW = document.getElementById('keyW');
        keyW.classList.toggle('active', false);
    }
    if (keysPressed[83] || keysPressed[115]) { // S
        pressKeyS();
    }
    if (!keysPressed[83] || !keysPressed[115]) {
        var keyS = document.getElementById('keyS');
        keyS.classList.toggle('active', false);
    }
    if (keysPressed[69] || keysPressed[101]) { // E
        pressKeyE();
    }
    if (!keysPressed[69] || !keysPressed[101]) {
        var keyE = document.getElementById('keyE');
        keyE.classList.toggle('active', false);
    }
    if (keysPressed[68] || keysPressed[100]) { // D
        pressKeyD();
    }
    if (!keysPressed[68] || !keysPressed[100]) {
        var keyD = document.getElementById('keyD');
        keyD.classList.toggle('active', false);
    }
    if (keysPressed[82] || keysPressed[114]) { // R
        pressKeyR();
    }
    if (!keysPressed[82] || !keysPressed[114]) {
        var keyR = document.getElementById('keyR');
        keyR.classList.toggle('active', false);
    }
    if (keysPressed[70] || keysPressed[102]) { // F
        pressKeyF();
    }
    if (!keysPressed[70] || !keysPressed[102]) {
        var keyF = document.getElementById('keyF');
        keyF.classList.toggle('active', false);
    }
    if (keysPressed[49]) { // 1
        pressKey1();
    }
    if (!keysPressed[49]) {
        var key1 = document.getElementById('key1');
        key1.classList.toggle('active', false);
    }
    if (keysPressed[50]) { // 2
        pressKey2();
    }
    if (!keysPressed[50]) {
        var key2 = document.getElementById('key2');
        key2.classList.toggle('active', false);
    }
    if (keysPressed[51]) { // 3
        pressKey3();
    }
    if (!keysPressed[51]) {
        var key3 = document.getElementById('key3');
        key3.classList.toggle('active', false);
    }
    if (keysPressed[52]) { // 4
        pressKey4();
    }
    if (!keysPressed[52]) {
        var key4 = document.getElementById('key4');
        key4.classList.toggle('active', false);
    }


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

function pressKey2() {
    'use strict';

    var key2 = document.getElementById('key2');
    key2.classList.toggle('active', true);

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
}

function pressKey3() {
    'use strict';

    var key3 = document.getElementById('key3');
    key3.classList.toggle('active', true);

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
}

function pressKey4() {
    'use strict';

    var key4 = document.getElementById('key4');
    key4.classList.toggle('active', true);

    // Define the parameters for top camera
    var width = window.innerWidth;
    var height = window.innerHeight / 2; // Half the window height
    var near = 1;
    var far = 1000;

    // Create top camera
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far);
    // Set camera position and orientation
    camera.position.set(0, 200, 0);
    camera.lookAt(scene.position);
}

function pressKeyQ() {
    'use strict';
    var keyQ = document.getElementById('keyQ');
    keyQ.classList.toggle('active', true);
    var rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), -superiorCraneStep);
    superiorCrane.applyMatrix4(rotationMatrix);
}

function pressKeyA() {
    var keyA = document.getElementById('keyA');
    keyA.classList.toggle('active', true);
    var rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), superiorCraneStep);
    superiorCrane.applyMatrix4(rotationMatrix);
}

function pressKeyW() {
    var keyW = document.getElementById('keyW');
    keyW.classList.toggle('active', true);
    if((trolleyGroup.position.x - trolleyStep) >= (lanceCarrierWidth / 2 + trolleyWidth / 2)) {
        trolleyGroup.position.x -= trolleyStep;
    }
}

function pressKeyS() {
    var keyS = document.getElementById('keyS');
    keyS.classList.toggle('active', true);
    if((trolleyGroup.position.x + trolleyStep) <= lanceLength) {
        trolleyGroup.position.x += trolleyStep;
    }
}

function pressKeyE() {
    var keyE = document.getElementById('keyE');
    keyE.classList.toggle('active', true);
    if((hook.position.y - hookStep) >= -(towerHeight + baseHeigth - clawSize)) {
        hook.position.y -= hookStep;
        cables.position.y -= cablesStep;
        cables.scale.y += cablesScale;
    }
}

function pressKeyD() {
    var keyD = document.getElementById('keyD');
    keyD.classList.toggle('active', true);
    if((hook.position.y + hookStep) <= -clawSize / 2 - baseHookHeight / 2 - cableInitialHeight) {
        hook.position.y += hookStep;
        cables.position.y += cablesStep;
        cables.scale.y -= cablesScale;
    }
}

function pressKeyR() {
    var keyR = document.getElementById('keyR');
    keyR.classList.toggle('active', true);
}

function pressKeyF() {
    var keyF = document.getElementById('keyF');
    keyF.classList.toggle('active', true);
}

function pressKey1() {
    var key1 = document.getElementById('key1');
    key1.classList.toggle('active', true);
    scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            node.material.wireframe = !node.material.wireframe;
        }
    });
}

function onKeyDown(e) {
    'use strict';
    keysPressed[e.keyCode] = true;

}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    keysPressed[e.keyCode] = false;

}

init();
animate();