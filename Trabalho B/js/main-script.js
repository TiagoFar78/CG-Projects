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

const angleStep = Math.PI / 180; // Adjust as needed
const angle1Range = { min: -Math.PI / 4, max: Math.PI / 4 }; // Example range

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;

var superiorCrane;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    createCrane();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    //Kiko muda
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
    var trolleyGroup = new THREE.Object3D();
    // mudar a altura porque não é bem clawSize que é suposto tar ali
    createHook(trolleyGroup, 0, -clawSize / 2 - baseHookHeight / 2 - cableInitialHeight, 0);
    createCable(trolleyGroup, 0, -cableInitialHeight / 2, 0);
    createTrolley(trolleyGroup, trolleyX, trolleyY, trolleyZ);
    trolleyGroup.position.set(x, y, z);

    parent.add(trolleyGroup);
}

function createHook(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var dedo1 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo1.position.set(clawDistanceFromCenter, 0, 0);
    var dedo2 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo2.position.set(clawDistanceFromCenter, 0, clawDistanceFromCenter);
    var dedo3 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo3.position.set(0, 0, clawDistanceFromCenter);
    var dedo4 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo4.position.set(0, 0, 0);

    var baseGarra = new THREE.Mesh(new THREE.BoxGeometry(clawDistanceFromCenter, baseHookHeight, clawDistanceFromCenter), material);
    // mudar a altura porque não é bem clawSize que é suposto estar ali.
    baseGarra.position.set(clawDistanceFromCenter / 2, clawSize + baseHookHeight / 2, clawDistanceFromCenter / 2);

    var hook = new THREE.Object3D();
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

    var cables = new THREE.Object3D();
    cables.add(cable1);
    cables.add(cable2);

    cables.position.set(x, y, z);

    parent.add(cables);
}

function createTrolley(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var trolley = new THREE.Mesh(new THREE.BoxGeometry(trolleyWidth, trolleyHeight, trolleyWidth), material);
    trolley.position.set(x, y, z);

    // TODO fazer rodas

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
function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
    case 81: //Q
    case 113: //q
        var keyQ = document.getElementById('keyQ');
        keyQ.classList.toggle('active', true);
        if ((superiorCrane.rotation.y + angleStep) != angle1Range.max) {
            const rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), angleStep);
            superiorCrane.applyMatrix4(rotationMatrix);
        }
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
        break;
    default:
  }

}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

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
    default:
  }
}

init();
animate();