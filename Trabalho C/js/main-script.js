import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const radialSegments = 16;
const parametricSurfacesSegments = 12;

const wireframe = false;

const cylinderHeight = 100;
const cylinderRadius = 10;
const ringRadius = 30;
const heightDiff = cylinderHeight / 4;
const innerRingHeight = cylinderHeight - heightDiff;
const innerRingInnerRadius = cylinderRadius;
const innerRingOuterRadius = innerRingInnerRadius + ringRadius;
const middleRingHeight = innerRingHeight - heightDiff;
const middleRingInnerRadius = innerRingOuterRadius;
const middleRingOuterRadius = middleRingInnerRadius + ringRadius;
const outerRingHeight = middleRingHeight - heightDiff;
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
    /*
    createCentralCylinder(carousel, 0, 0, 0);
    createRing(carousel, 0, 0, 0, innerRingOuterRadius, innerRingInnerRadius, innerRingHeight, 0xff8000);
    createRing(carousel, 0, 0, 0, middleRingOuterRadius, middleRingInnerRadius, middleRingHeight, 0xcc0000);
    createRing(carousel, 0, 0, 0, outerRingOuterRadius, outerRingInnerRadius, outerRingHeight, 0x000000);
*/
    createParametricThinCylinder(carousel);

    scene.add(carousel);
}

function createCentralCylinder(parent, x, y, z) {
    var material = new THREE.MeshBasicMaterial({ color: 0x004d99, wireframe: wireframe, side: THREE.DoubleSide });

    var path = new VerticalLine();
    var tubeGeometry = new THREE.TubeGeometry(path, 1, cylinderRadius, radialSegments);
    var mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

class VerticalLine extends THREE.Curve {

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        return optionalTarget.set(0, t, 0).multiplyScalar(cylinderHeight);
    }

}

function createRing(parent, x, y, z, outerRadius, innerRadius, height, color) {
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe });

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

function createParametricCylinder(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var radius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var x = radius * Math.cos(theta);
        var z = radius * Math.sin(theta);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricDeformedCylinder(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var radius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var deformation = radius / 2;

        var x = radius * Math.cos(theta) + noise2D(u, u) * deformation;
        var z = radius * Math.sin(theta) + noise2D(u, u) * deformation;
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricDeformedTiltedCylinder(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var radius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;

        var distanceBetweenBases = radius;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var lowerCenterFromOrigin = -distanceBetweenBases / 2;
        var upperCenterFromOrigin = distanceBetweenBases / 2 - -distanceBetweenBases / 2;
        var x = lowerCenterFromOrigin + upperCenterFromOrigin * v;
        var z = lowerCenterFromOrigin + upperCenterFromOrigin * v;

        var deformation = radius / 2;

        x += radius * Math.cos(theta) + noise2D(u, u) * deformation;
        z += radius * Math.sin(theta) + noise2D(u, u) * deformation;
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricCone(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var radius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var x = radius * Math.cos(theta) * (1 - v);
        var z = radius * Math.sin(theta) * (1 - v);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricIncompleteCone(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var radius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var x = radius * Math.cos(theta) * (1 - v * 0.5);
        var z = radius * Math.sin(theta) * (1 - v * 0.5);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricDeformedTiltedCone(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var radius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var distanceBetweenBases = radius * 2 / 3;
        var lowerCenterFromOrigin = -distanceBetweenBases / 2;
        var upperCenterFromOrigin = distanceBetweenBases / 2 - -distanceBetweenBases / 2;
        var x = lowerCenterFromOrigin + upperCenterFromOrigin * v;
        var z = lowerCenterFromOrigin + upperCenterFromOrigin * v;

        var deformation = radius / 2;

        x += (radius * Math.cos(theta) + noise2D(u, u) * deformation) * (1 - v);
        z += (radius * Math.sin(theta) + noise2D(u, u) * deformation) * (1 - v);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricTiltedBaseCylinder(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var radius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var x = radius * Math.cos(theta);
        var z = radius * Math.sin(theta);

        if (y > height / 2) {
            var tiltAmount = 0.8;
            var tiltCenter = 0.7;
            var tiltDisplacement = height * tiltAmount * (v - tiltCenter) * (v - tiltCenter);

            var tilt = tiltDisplacement * (theta < Math.PI ? 1 : -1);
            y += tilt;
        }
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricFishFormatSurface(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var length = ringRadius * 3 / 4;
        var width = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;

        var line1_start = [0, 0, 0];
        var line1_end = [length, height * 3 / 4, 0];
        var line2_start = [0, height, width];
        var line2_end = [length, height * 2 / 4, width];
        
        var point1 = [
            line1_start[0] + u * (line1_end[0] - line1_start[0]),
            line1_start[1] + u * (line1_end[1] - line1_start[1]),
            line1_start[2] + u * (line1_end[2] - line1_start[2])
        ];
        var point2 = [
            line2_start[0] + u * (line2_end[0] - line2_start[0]),
            line2_start[1] + u * (line2_end[1] - line2_start[1]),
            line2_start[2] + u * (line2_end[2] - line2_start[2])
        ];
        
        var x = point1[0] + v * (point2[0] - point1[0]);
        var y = point1[1] + v * (point2[1] - point1[1]);
        var z = point1[2] + v * (point2[2] - point1[2]);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = 10;
    var segmentsV = 10;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function createParametricThinCylinder(parent) {
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    function parametricFunction(u, v, target) {
        var baseRadius = ringRadius * 1 / 4;
        var height = heightDiff * 3 / 4;
        
        var theta = u * Math.PI * 2;
        var y = v * height;
        
        var radius = baseRadius * Math.cos(Math.PI * v);
        
        var x = radius * Math.cos(theta);
        var z = radius * Math.sin(theta);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
}

function noise2D(x, y) {
    var n = x + y * 57;
    n = (n << 13) ^ n;
    return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
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