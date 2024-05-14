import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const radialSegments = 16;

const cylinderHeight = 100;
const cylinderRadius = 10;
const ringRadius = 30;
const innerRingHeight = cylinderHeight * 3 / 4;
const innerRingInnerRadius = cylinderRadius;
const innerRingOuterRadius = innerRingInnerRadius + ringRadius;
const middleRingHeight = cylinderHeight * 2 / 4;
const middleRingInnerRadius = innerRingOuterRadius;
const middleRingOuterRadius = middleRingInnerRadius + ringRadius;
const outerRingHeight = cylinderHeight * 1 / 4;
const outerRingInnerRadius = middleRingOuterRadius;
const outerRingOuterRadius = outerRingInnerRadius + ringRadius;

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
    scene.background = new THREE.Color(0xe6ffe6);

    scene.add(new THREE.AxesHelper(10));

    createCarousel();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';

    // FIZ ESTA BOMBA SÒ PARA TESTAR, MUDEM DEPOIS

    var width = window.innerWidth;
    var height = window.innerHeight;
    var near = 1;
    var far = 1000;
    var fov = 70;
    camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    camera.position.x = 100;
    camera.position.y = 150;
    camera.position.z = 100;
    camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCarousel() {
    var carousel = new THREE.Object3D();

    createCentralCylinder(carousel, 0, 0, 0);
    createRing(carousel, 0, 0, 0, innerRingOuterRadius, innerRingInnerRadius, innerRingHeight);
    createRing(carousel, 0, 0, 0, middleRingOuterRadius, middleRingInnerRadius, middleRingHeight);
    createRing(carousel, 0, 0, 0, outerRingOuterRadius, outerRingInnerRadius, outerRingHeight);

    scene.add(carousel);
}

function createCentralCylinder(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var path = new VerticalLine();
    var tubeGeometry = new THREE.TubeGeometry(path, 1, cylinderRadius, radialSegments, false);
    var mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

class VerticalLine extends THREE.Curve {

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        return optionalTarget.set(0, t, 0).multiplyScalar(cylinderHeight);
    }

}

function createRing(parent, x, y, z, outerRadius, innerRadius, height) {
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    var outerCircle = new THREE.Shape();
    outerCircle.absarc(x, z, outerRadius);

    var innerCircle = new THREE.Shape();
    innerCircle.absarc(x, z, innerRadius);

    outerCircle.holes.push(innerCircle);

    var geometry = new THREE.ExtrudeGeometry(outerCircle, { depth: height });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(-Math.PI / 2, 0, 0);
    mesh.position.set(x, y, z);

    parent.add(mesh);
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
const angleStep = Math.PI / 180; // Adjust as needed
const angle1Range = { min: -Math.PI / 4, max: Math.PI / 4 }; // Example range
function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
    case 81: //Q
    case 113: //q
        if ((scene.rotation.y + angleStep) != angle1Range.max) {
            const rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), angleStep);
            scene.applyMatrix4(rotationMatrix);
        }
        break;
    default:
  }

}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();