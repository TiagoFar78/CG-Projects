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

const surfacesMaxLength = ringRadius * 1 / 4;
const surfacesMaxHeight = heightDiff * 2 / 4;

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;

var directionalLight, spotlights = [];
var directionalLightOn = true;

var carousel, layer1, layer2, layer3;

var surfaces = [], rotationAxis = [], rotationSpeed = [];

var keysPressed = {};

var clock, delta;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6ffe6);

    scene.add(new THREE.AxesHelper(10));

    createCarousel();
    createLights();

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

function createLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 1); 
    directionalLight.position.set(50, cylinderHeight + 50, 0); 
    directionalLight.target.position.set(0,0,0);

    var ambientLight = new THREE.AmbientLight(0xfd6f00, 0.2);

    scene.add(directionalLight);
    scene.add(ambientLight);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCarousel() {
    carousel = new THREE.Object3D();
    carousel.userData = { step: 0 };

    layer1 = new THREE.Object3D();
    layer2 = new THREE.Object3D();
    layer3 = new THREE.Object3D();
    
    createCentralCylinder(carousel, 0, 0, 0);
    createCarouselLayer(layer1, innerRingOuterRadius, innerRingInnerRadius, innerRingHeight, 0xfff73f);
    createCarouselLayer(layer2, middleRingOuterRadius, middleRingInnerRadius, middleRingHeight, 0xff5b05);
    createCarouselLayer(layer3, outerRingOuterRadius, outerRingInnerRadius, outerRingHeight, 0xed0a3f);

    carousel.add(layer1);
    carousel.add(layer2);
    carousel.add(layer3);

    scene.add(carousel);
}

function createCentralCylinder(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial({ color: 0x004d99, wireframe: wireframe, side: THREE.DoubleSide });

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

function createCarouselLayer(parent, ringOuterRadius, ringInnerRadius, ringHeight, ringColor) {
    createRing(parent, 0, 0, 0, ringOuterRadius, ringInnerRadius, ringHeight, ringColor);

    var distanceFromOrigin = (ringOuterRadius + ringInnerRadius) / 2;
    for (var i = 0; i < 2 * Math.PI; i += Math.PI / 4) {
        createRandomParametricSurface(parent, distanceFromOrigin * Math.sin(i), ringHeight, distanceFromOrigin * Math.cos(i));
    }
}

function createRing(parent, x, y, z, outerRadius, innerRadius, height, color) {
    var material = new THREE.MeshLambertMaterial({ color: color, wireframe: wireframe });

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

function createRandomParametricSurface(parent, x, y, z) {
    var max = 8;
    var min = 1;
    var randomIndex = Math.floor(Math.random() * (max - min)) + min;

    switch(randomIndex) {
        case 1:
            createParametricCylinder(parent, x, y, z);
            return;
        case 2:
            createParametricDeformedCylinder(parent, x, y, z);
            return;
        case 3:
            createParametricDeformedTiltedCylinder(parent, x, y, z);
            return;
        case 4:
            createParametricCone(parent, x, y, z);
            return;
        case 5:
            createParametricIncompleteCone(parent, x, y, z);
            return;
        case 6:
            createParametricDeformedTiltedCone(parent, x, y, z);
            return;
        case 7:
            createParametricFishFormatSurface(parent, x, y, z);
            return;
        case 8:
            createParametricThinCylinder(parent, x, y, z);
            return;
    }
}

function createParametricCylinder(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial ( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var radius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;
        
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
    mesh.position.set(x, y, z);

    mesh.userData = { step: 0 };
    var index = surfaces.length;
    surfaces[index] = mesh;
    rotationAxis[index] = 0;
    rotationSpeed[index] = 0.1;

    var spotLight = new THREE.SpotLight(0xfffffff, 1);
    spotLight.position.set(x, y, z);
    spotLight.target.position.set(x, y +  2, z);

    spotlights.push(spotLight);
    parent.add(spotLight);


    parent.add(mesh);
}

function createParametricDeformedCylinder(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var radius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;
        
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
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

function createParametricDeformedTiltedCylinder(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var radius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;

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
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

function createParametricCone(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var radius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;
        
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
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

function createParametricIncompleteCone(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var radius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;
        
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
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

function createParametricDeformedTiltedCone(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var radius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;
        
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
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

function createParametricTiltedBaseCylinder(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var radius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;
        
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
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

function createParametricFishFormatSurface(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var length = surfacesMaxLength;
        var width = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;

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
    mesh.position.set(x, y, z);

    parent.add(mesh);
}

function createParametricThinCylinder(parent, x, y, z) {
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide } );

    function parametricFunction(u, v, target) {
        var baseRadius = surfacesMaxLength / 2;
        var height = surfacesMaxHeight;
        
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
    mesh.position.set(x, y, z);

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
    delta = clock.getDelta();

    if (keysPressed['1']) {

    }

    if (keysPressed['2']) {

    }

    if (keysPressed['3']) {

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

    clock = new THREE.Clock();

    createScene();
    createCamera();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    update();
    rotateParametricSurfaces();
    rotateCarousel();
    render();
    requestAnimationFrame(animate);
}

function rotateCarousel() {
    var carouselRotationSpeed = 0.05;

    carousel.userData.step += carouselRotationSpeed * delta;
    carousel.rotation.y = Math.PI * carousel.userData.step;
}

function rotateParametricSurfaces() {
    for (var i = 0; i < surfaces.length; i++) {
        surfaces[i].userData.step += rotationSpeed[i] * delta;

        var axisCode = rotationAxis[i];
        switch (axisCode) {
            case 0:
                surfaces[i].rotation.x = Math.PI * surfaces[i].userData.step;
                break;
            case 1:
                surfaces[i].rotation.y = Math.PI * surfaces[i].userData.step;
                break;
            case 2:
                surfaces[i].rotation.z = Math.PI * surfaces[i].userData.step;
                break;
        }
    }
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
    keysPressed[e.keyCode] = true;

    switch (e.keyCode) {
    case 81: //Q
    case 113: //q
        if ((scene.rotation.y + angleStep) != angle1Range.max) {
            const rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), angleStep);
            scene.applyMatrix4(rotationMatrix);
        }
        break;
    case 68: //D
    case 110: //d
        directionalLightOn = !directionalLightOn;
        directionalLight.visible = directionalLightOn;
        break;
    
    default:
  }

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