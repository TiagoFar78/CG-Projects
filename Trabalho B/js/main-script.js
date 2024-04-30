import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    createGrua();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    //Kiko muda
    'use strict';
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 150;
    camera.position.y = 150;
    camera.position.z = 150;
    camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createGrua() {
    'use strict';

    var clawSize = 5;
    var clawDistanceFromCenter = clawSize * 5;
    var baseHookHeight = clawDistanceFromCenter / 2;

    var cableHeight = 30;

    var superiorCraneWidth = 25;
    var superiorCraneHeight = superiorCraneWidth;

    var trolleyWidth = superiorCraneWidth;
    var trolleyHeight = superiorCraneHeight / 2;
    var trolleyX = 0;
    var trolleyY = trolleyHeight / 2;
    var trolleyZ = 0;

    var trolleyInitialDistance = 100;

    var lanceCarrierWidth = superiorCraneWidth;
    var lanceCarrierHeight = superiorCraneHeight * 3;
    var lanceCarrierX = 0;
    var lanceCarrierY = lanceCarrierHeight / 2;
    var lanceCarrierZ = 0;

    var lanceWidth = superiorCraneWidth;
    var lanceHeight = superiorCraneHeight;
    var lanceLength = superiorCraneWidth * 10
    var lanceX = lanceCarrierWidth / 2 + lanceLength / 2;
    var lanceY = lanceHeight / 2;
    var lanceZ = 0;

    var counterLanceWidth = superiorCraneWidth;
    var counterLanceHeight = superiorCraneHeight;
    var counterLanceLength = lanceLength / 3;
    var counterLanceX = -lanceCarrierWidth / 2 - counterLanceLength / 2;
    var counterLanceY = counterLanceHeight / 2;
    var counterLanceZ = 0;

    var trolleyGroup = new THREE.Object3D();
    // mudar a altura porque não é bem clawSize que é suposto tar ali
    createHook(trolleyGroup, clawSize, clawDistanceFromCenter, baseHookHeight, 0, -clawSize / 2 - baseHookHeight / 2 - cableHeight, 0);
    createCable(trolleyGroup, cableHeight, 0, -cableHeight / 2, 0);
    createTrolley(trolleyGroup, trolleyWidth, trolleyHeight, trolleyX, trolleyY, trolleyZ);
    trolleyGroup.position.set(trolleyInitialDistance + lanceCarrierWidth / 2 + trolleyWidth / 2, 0, 0);

    var superiorCrane = new THREE.Object3D();
    superiorCrane.add(trolleyGroup);
    createLanceCarrier(superiorCrane, lanceCarrierWidth, lanceCarrierHeight, lanceCarrierX, lanceCarrierY, lanceCarrierZ);
    createLance(superiorCrane, lanceWidth, lanceLength, lanceHeight, lanceX, lanceY, lanceZ);
    createCounterLance(superiorCrane, counterLanceWidth, counterLanceLength, counterLanceHeight, counterLanceX, counterLanceY, counterLanceZ);

/*

    // porta lanca

    var contraLancaWidth = lancaWidth;
    var contraLancaLength = lancaLength / 3;
    var contraLancaHeigth = lancaHeight;

    var contraLanca = new THREE.Mesh(new THREE.BoxGeometry(contraLancaLength, contraLancaHeigth, contraLancaWidth), material);
    contraLanca.position.set(-contraLancaLength / 2 - portaLancaWidth - lancaLength / 2, contraLancaHeigth / 2, 0);

    // cabine

    var cabineWidth = lancaWidth;
    var cabineLength = cabineWidth / 2;
    var cabineHeight = portaLancaHeigth / 2;

    var cabine = new THREE.Mesh(new THREE.BoxGeometry(cabineLength, cabineHeight, cabineWidth), material);
    cabine.position.set(cabineLength / 2 - lancaLength / 2, -cabineHeight / 2, 0);

    // Parte superior da grua (roda)

    var gruaSuperior = new THREE.Object3D();
    gruaSuperior.add(trolleyGroup);
    gruaSuperior.add(lanca);
    gruaSuperior.add(portaLanca);
    gruaSuperior.add(contraLanca);
    gruaSuperior.add(cabine);
    gruaSuperior.position.set(lancaLength / 2 + portaLancaWidth / 2, 0, 0);

    // torre

    var torreWidth = portaLancaWidth;
    var torreHeigth = lancaLength;

    var torre = new THREE.Mesh(new THREE.BoxGeometry(torreWidth, torreHeigth, torreWidth), material);
    torre.position.set(0, -torreHeigth / 2, 0);

    // base

    var baseWidth = torreWidth * 2.5;
    var baseHeigth = lancaHeight / 2;

    var base = new THREE.Mesh(new THREE.BoxGeometry(baseWidth, baseHeigth, baseWidth), material);
    base.position.set(0, baseHeigth / 2 - torreHeigth, 0);

    // Parte inferior da grua

    var gruaInferior = new THREE.Object3D();
    gruaInferior.add(torre);
    gruaInferior.add(base);

    var grua = new THREE.Object3D();
    grua.add(gruaSuperior);
    grua.add(gruaInferior);*/

    scene.add(superiorCrane);
}

function createHook(parent, clawSize, clawDistanceFromCenter, baseGarraHeight, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var dedo1 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo1.position.set(clawDistanceFromCenter, 0, 0);
    var dedo2 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo2.position.set(clawDistanceFromCenter, 0, clawDistanceFromCenter);
    var dedo3 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo3.position.set(0, 0, clawDistanceFromCenter);
    var dedo4 = new THREE.Mesh(new THREE.TetrahedronGeometry(clawSize), material);
    dedo4.position.set(0, 0, 0);

    var baseGarra = new THREE.Mesh(new THREE.BoxGeometry(clawDistanceFromCenter, baseGarraHeight, clawDistanceFromCenter), material);
    // mudar a altura porque não é bem clawSize que é suposto estar ali.
    baseGarra.position.set(clawDistanceFromCenter / 2, clawSize + baseGarraHeight / 2, clawDistanceFromCenter / 2);

    var hook = new THREE.Object3D();
    hook.add(baseGarra);
    hook.add(dedo1);
    hook.add(dedo2);
    hook.add(dedo3);
    hook.add(dedo4);

    hook.position.set(x - clawDistanceFromCenter / 2, y - clawSize - baseGarraHeight / 2, z - clawDistanceFromCenter / 2);

    parent.add(hook);
}

function createCable(parent, cableHeight, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var radius = 1;
    var distanceFromCenter = 3;

    var cable1 = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, cableHeight, 16), material);
    cable1.position.set(distanceFromCenter, 0, -distanceFromCenter);
    var cable2 = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, cableHeight, 16), material);
    cable2.position.set(-distanceFromCenter, 0, distanceFromCenter);

    var cables = new THREE.Object3D();
    cables.add(cable1);
    cables.add(cable2);

    cables.position.set(x, y, z);

    parent.add(cables);
}

function createTrolley(parent, width, height, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var trolley = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), material);
    trolley.position.set(x, y, z);

    // TODO fazer rodas

    parent.add(trolley);
}

function createLance(parent, width, length, height, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var lance = new THREE.Mesh(new THREE.BoxGeometry(length, height, width), material);
    lance.position.set(x, y, z);

    parent.add(lance);
}

function createCounterLance(parent, width, length, height, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var lance = new THREE.Mesh(new THREE.BoxGeometry(length, height, width), material);
    lance.position.set(x, y, z);

    parent.add(lance);

}

function createLanceCarrier(parent, width, height, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var lanceCarrier = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), material);
    lanceCarrier.position.set(x, y, z);

    parent.add(lanceCarrier);
}

function createCabin(parent) {

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