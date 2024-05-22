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

const layersStep = 0.08;

// [ ID, axisCode, rotationSpeed ]
const layer1Surfaces = [
    [1, 0, 0.1],
    [2, 0, 0.3],
    [3, 1, 0.2],
    [4, 2, 0.3],
    [5, 0, 0.2],
    [6, 1, 0.4],
    [7, 1, 0.5],
    [8, 2, 0.5]
];
const layer2Surfaces = [
    [6, 0, 0.1],
    [8, 1, 0.1],
    [2, 1, 0.3],
    [1, 2, 0.5],
    [4, 0, 0.4],
    [3, 0, 0.2],
    [7, 0, 0.2],
    [5, 1, 0.5]
];
const layer3Surfaces = [
    [8, 0, 0.1],
    [3, 2, 0.5],
    [7, 2, 0.2],
    [4, 1, 0.4],
    [2, 2, 0.3],
    [5, 2, 0.2],
    [6, 2, 0.1],
    [1, 1, 0.2]
];

const mobiusRadius = middleRingOuterRadius;
const mobiusWidth = 25;
const mobiusSegments = 25;

const materialTypeSurfaces = {
  lambert: new THREE.MeshLambertMaterial({ color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide }),
  phong: new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide }),
  toon: new THREE.MeshToonMaterial({ color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide }),
  normal: new THREE.MeshNormalMaterial({ wireframe: wireframe, side: THREE.DoubleSide }),
  basic: new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: wireframe, side: THREE.DoubleSide })
};

const materialTypeRing1 = {
    lambert: new THREE.MeshLambertMaterial({ color: 0xfff73f, wireframe: wireframe }),
    phong: new THREE.MeshPhongMaterial({ color: 0xfff73f, wireframe: wireframe }),
    toon: new THREE.MeshToonMaterial({ color: 0xfff73f, wireframe: wireframe }),
    normal: new THREE.MeshNormalMaterial({ wireframe: wireframe }),
    basic: new THREE.MeshBasicMaterial({ color: 0xfff73f, wireframe: wireframe })
};

const materialTypeRing2 = {
    lambert: new THREE.MeshLambertMaterial({ color: 0xff5b05, wireframe: wireframe }),
    phong: new THREE.MeshPhongMaterial({ color: 0xff5b05, wireframe: wireframe }),
    toon: new THREE.MeshToonMaterial({ color: 0xff5b05, wireframe: wireframe }),
    normal: new THREE.MeshNormalMaterial({ wireframe: wireframe }),
    basic: new THREE.MeshBasicMaterial({ color: 0xff5b05, wireframe: wireframe })
};

const materialTypeRing3 = {
    lambert: new THREE.MeshLambertMaterial({ color: 0xed0a3f, wireframe: wireframe }),
    phong: new THREE.MeshPhongMaterial({ color: 0xed0a3f, wireframe: wireframe }),
    toon: new THREE.MeshToonMaterial({ color: 0xed0a3f, wireframe: wireframe }),
    normal: new THREE.MeshNormalMaterial({ wireframe: wireframe }),
    basic: new THREE.MeshBasicMaterial({ color: 0xed0a3f, wireframe: wireframe })
};

const materialTypeMobius = {
    lambert: new THREE.MeshLambertMaterial({ color: 0x0FD2CC, wireframe: wireframe, side: THREE.DoubleSide }),
    phong: new THREE.MeshPhongMaterial({ color: 0x0FD2CC, wireframe: wireframe, side: THREE.DoubleSide }),
    toon: new THREE.MeshToonMaterial({ color: 0x0FD2CC, wireframe: wireframe, side: THREE.DoubleSide }),
    normal: new THREE.MeshNormalMaterial({ 0x0FD2CC: wireframe, side: THREE.DoubleSide }),
    basic: new THREE.MeshBasicMaterial({ color: 0x0FD2CC, wireframe: wireframe, side: THREE.DoubleSide })
};

const materialTypeCylinder = {
    lambert: new THREE.MeshLambertMaterial({ color: 0x004d99, wireframe: wireframe, side: THREE.DoubleSide }),
    phong: new THREE.MeshPhongMaterial({ color: 0x004d99, wireframe: wireframe, side: THREE.DoubleSide }),
    toon: new THREE.MeshToonMaterial({ color: 0x004d99, wireframe: wireframe, side: THREE.DoubleSide }),
    normal: new THREE.MeshNormalMaterial({ 0x004d99: wireframe, side: THREE.DoubleSide }),
    basic: new THREE.MeshBasicMaterial({ color: 0x004d99, wireframe: wireframe, side: THREE.DoubleSide })
};

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;

var directionalLight;
var directionalLightOn = true;

var spotlights = [];
var spotlightsOn = true;

var currentMaterialType = 'lambert';

var carousel, layer1, layer2, layer3;

var centralCylinder, skydome, mobiusStrip;

var surfaces = [];

var rings = [];

const mobiusVertices = [];
const mobiusIndices = [];

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
    createMobiusStrip();
    createSkydome();
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
    camera.position.x = 150;
    camera.position.y = 200;
    camera.position.z = 150;
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
    layer1.userData = { step: 0 };
    layer2 = new THREE.Object3D();
    layer2.userData = { step: 0 };
    layer3 = new THREE.Object3D();
    layer3.userData = { step: 0 };
    
    createCentralCylinder(carousel, 0, 0, 0);
    createCarouselLayer(layer1, innerRingOuterRadius, innerRingInnerRadius, innerRingHeight, materialTypeRing1[currentMaterialType].clone(), layer1Surfaces);
    createCarouselLayer(layer2, middleRingOuterRadius, middleRingInnerRadius, middleRingHeight, materialTypeRing2[currentMaterialType].clone(), layer2Surfaces);
    createCarouselLayer(layer3, outerRingOuterRadius, outerRingInnerRadius, outerRingHeight, materialTypeRing3[currentMaterialType].clone(), layer3Surfaces);

    carousel.add(layer1);
    carousel.add(layer2);
    carousel.add(layer3);

    scene.add(carousel);
}

function createCentralCylinder(parent, x, y, z) {
    var material = materialTypeCylinder[currentMaterialType].clone();

    var path = new VerticalLine();
    var tubeGeometry = new THREE.TubeGeometry(path, 1, cylinderRadius, radialSegments);
    centralCylinder = new THREE.Mesh(tubeGeometry, material);
    centralCylinder.position.set(x, y, z);

    parent.add(centralCylinder);
}

class VerticalLine extends THREE.Curve {

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        return optionalTarget.set(0, t, 0).multiplyScalar(cylinderHeight);
    }

}

function createCarouselLayer(parent, ringOuterRadius, ringInnerRadius, ringHeight, material, surfaces) {
    createRing(parent, 0, 0, 0, ringOuterRadius, ringInnerRadius, ringHeight, material);

    var distanceFromOrigin = (ringOuterRadius + ringInnerRadius) / 2;
    for (var i = 0; i < 2 * Math.PI; i += Math.PI / 4) {
        var index = i / (Math.PI / 4);
        var x = distanceFromOrigin * Math.sin(i);
        var y = ringHeight;
        var z = distanceFromOrigin * Math.cos(i);
        createParametricSurface(parent, x, y, z, surfaces[index][0]);
        addSpotlight(parent, x, y + surfacesMaxHeight / 2, z);
    }
}

function createRing(parent, x, y, z, outerRadius, innerRadius, height, material) {
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
    rings.push(mesh);
}

function createParametricSurface(parent, x, y, z, surfaceId) {
    switch(surfaceId) {
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

function addSpotlight(parent, x, y, z) {
    const spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.set(x, y, z);
    spotLight.target.position.set(x, y + surfacesMaxHeight , z);
    spotLight.distance = 15;
    spotLight.angle = Math.PI / 4;


    parent.add(spotLight);
    parent.add(spotLight.target);

    //const spotlightHelper = new THREE.SpotLightHelper(spotLight);
    //scene.add(spotlightHelper);

    spotlights.push(spotLight);
}

function createParametricCylinder(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var radius = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;

    function parametricFunction(u, v, target) {
        var theta = u * Math.PI * 2;
        var y = (v - 0.5) * height;
        
        var x = radius * Math.cos(theta);
        var z = radius * Math.sin(theta);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function createParametricDeformedCylinder(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var radius = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;

    function parametricFunction(u, v, target) {    
        var theta = u * Math.PI * 2;
        var y = (v - 0.5) * height;
        
        var deformation = radius / 2;

        var x = radius * Math.cos(theta) + noise2D(u, u) * deformation;
        var z = radius * Math.sin(theta) + noise2D(u, u) * deformation;
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function createParametricDeformedTiltedCylinder(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var radius = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;

    function parametricFunction(u, v, target) {
        var distanceBetweenBases = radius;
        
        var theta = u * Math.PI * 2;
        var y = (v - 0.5) * height;
        
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
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function createParametricCone(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var radius = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;
    
    function parametricFunction(u, v, target) {
        var theta = u * Math.PI * 2;
        var y = (v - 0.5) * height;
        
        var x = radius * Math.cos(theta) * (1 - v);
        var z = radius * Math.sin(theta) * (1 - v);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function createParametricIncompleteCone(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var radius = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;
    
    function parametricFunction(u, v, target) {
        var theta = u * Math.PI * 2;
        var y = (v - 0.5) * height;
        
        var x = radius * Math.cos(theta) * (1 - v * 0.5);
        var z = radius * Math.sin(theta) * (1 - v * 0.5);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function createParametricDeformedTiltedCone(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var radius = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;
    
    function parametricFunction(u, v, target) {
        var theta = u * Math.PI * 2;
        var y = (v - 0.5) * height;
        
        var distanceBetweenBases = radius * 2 / 3;
        var lowerCenterFromOrigin = -distanceBetweenBases / 2;
        var upperCenterFromOrigin = distanceBetweenBases / 2 - -distanceBetweenBases / 2;
        var x = lowerCenterFromOrigin + upperCenterFromOrigin * (v - 0.5);
        var z = lowerCenterFromOrigin + upperCenterFromOrigin * (v - 0.5);

        var deformation = radius / 2;

        x += (radius * Math.cos(theta) + noise2D(u, u) * deformation) * (1 - v + 0.5);
        z += (radius * Math.sin(theta) + noise2D(u, u) * deformation) * (1 - v + 0.5);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}


function createParametricTiltedBaseCylinder(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

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

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function createParametricFishFormatSurface(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var length = surfacesMaxLength;
    var width = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;

    function parametricFunction(u, v, target) {
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
        
        var x = point1[0] + (v - 0.5) * (point2[0] - point1[0]);
        var y = point1[1] + (v - 0.5) * (point2[1] - point1[1]);
        var z = point1[2] + (v - 0.5) * (point2[2] - point1[2]);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = 10;
    var segmentsV = 10;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function createParametricThinCylinder(parent, x, y, z) {
    var material = materialTypeSurfaces[currentMaterialType].clone();

    var baseRadius = surfacesMaxLength / 2;
    var height = surfacesMaxHeight;
    
    function parametricFunction(u, v, target) {
        var theta = u * Math.PI * 2;
        var y = (v - 0.5) * height;
        
        var radius = baseRadius * Math.cos(Math.PI * v);
        
        var x = radius * Math.cos(theta);
        var z = radius * Math.sin(theta);
        
        return target.set(x, y, z);
    }
    
    var segmentsU = parametricSurfacesSegments;
    var segmentsV = 1;
    var geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + height / 2, z);

    var index = surfaces.length;
    mesh.userData = { step: 0, index: index };
    surfaces[index] = mesh;

    parent.add(mesh);
}

function noise2D(x, y) {
    var n = x + y * 57;
    n = (n << 13) ^ n;
    return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
}


function createMobiusStrip() {
    mobiusVertices = [
        new THREE.Vector3(57.5, 0, -0),
        new THREE.Vector3(82.5, 0, 0),
        new THREE.Vector3(56.073904528730026, 14.397331638404115, -3.108623589560685),
        new THREE.Vector3(79.52773802927832, 20.419252564675556, 3.108623589560685),
        new THREE.Vector3(51.74255013445172, 28.445707652732477, -6.0219209262714415),
        new THREE.Vector3(70.94038507168918, 38.99980672150767, 6.0219209262714415),
        new THREE.Vector3(44.3853631724406, 41.680630362331506, -8.556838824108608),
        new THREE.Vector3(57.67024466655702, 54.155964467684896, 8.556838824108608),
        new THREE.Vector3(33.918996220811465, 53.447785707228434, -10.554099068775189),
        new THREE.Vector3(41.09675507624805, 64.75812386305368, 10.554099068775189),
        new THREE.Vector3(20.437545821089746, 62.90029831383279, -11.888206453689419),
        new THREE.Vector3(22.824833391402898, 70.2476139674887, 11.888206453689419),
        new THREE.Vector3(4.346053250267433, 69.07853828020211, -12.475334105353394),
        new THREE.Vector3(4.444619483836461, 70.64520369975591, 12.475334105353394),
        new THREE.Vector3(-13.555588984199169, 71.06088600528744, -12.278590634108607),
        new THREE.Vector3(-12.677795057802307, 66.45932909672896, 12.278590634108607),
        new THREE.Vector3(-32.070650473625776, 68.15360143997005, -11.310338155825244),
        new THREE.Vector3(-27.5384503454844, 58.52218590527268, 11.310338155825244),
        new THREE.Vector3(-49.6985460662475, 60.075222311359546, -9.631415534697366),
        new THREE.Vector3(-39.54081249856906, 47.79663167725094, 9.631415534697366),
        new THREE.Vector3(-64.81254582108973, 47.08907088731784, -7.347315653655915),
        new THREE.Vector3(-48.4498333914029, 35.20086443362842, 7.347315653655915),
        new THREE.Vector3(-75.8904079335614, 30.047138099981776, -4.601556908558477),
        new THREE.Vector3(-54.27830009079378, 21.490299275873166, 4.601556908558477),
        new THREE.Vector3(-81.75167384906739, 10.327638144281662, -1.5666654195538068),
        new THREE.Vector3(-57.144384334959504, 7.219014554720972, 1.5666654195538068),
        new THREE.Vector3(-81.75167384906739, -10.327638144281643, 1.5666654195538037),
        new THREE.Vector3(-57.14438433495951, -7.219014554720958, -1.5666654195538037),
        new THREE.Vector3(-75.8904079335614, -30.047138099981787, 4.601556908558479),
        new THREE.Vector3(-54.27830009079377, -21.490299275873173, -4.601556908558479),
        new THREE.Vector3(-64.81254582108974, -47.08907088731782, 7.3473156536559125),
        new THREE.Vector3(-48.449833391402905, -35.200864433628404, -7.3473156536559125),
        new THREE.Vector3(-49.69854606624748, -60.07522231135956, 9.631415534697368),
        new THREE.Vector3(-39.54081249856905, -47.79663167725096, -9.631415534697368),
        new THREE.Vector3(-32.07065047362574, -68.15360143997007, 11.310338155825248),
        new THREE.Vector3(-27.538450345484364, -58.5221859052727, -11.310338155825248),
        new THREE.Vector3(-13.55558898419915, -71.06088600528744, 12.278590634108609),
        new THREE.Vector3(-12.677795057802296, -66.45932909672898, -12.278590634108609),
        new THREE.Vector3(4.346053250267386, -69.07853828020212, 12.475334105353394),
        new THREE.Vector3(4.44461948383641, -70.6452036997559, -12.475334105353394),
        new THREE.Vector3(20.43754582108973, -62.900298313832806, 11.88820645368942),
        new THREE.Vector3(22.824833391402883, -70.2476139674887, -11.88820645368942),
        new THREE.Vector3(33.91899622081143, -53.44778570722847, 10.554099068775194),
        new THREE.Vector3(41.096755076248, -64.7581238630537, -10.554099068775194),
        new THREE.Vector3(44.38536317244058, -41.68063036233153, 8.556838824108612),
        new THREE.Vector3(57.67024466655699, -54.155964467684925, -8.556838824108612),
        new THREE.Vector3(51.74255013445172, -28.445707652732477, 6.0219209262714415),
        new THREE.Vector3(70.94038507168918, -38.99980672150767, -6.0219209262714415),
        new THREE.Vector3(56.07390452873002, -14.397331638404147, 3.108623589560692),
        new THREE.Vector3(79.52773802927831, -20.419252564675602, -3.108623589560692),
        new THREE.Vector3(57.5, -1.4083438190194563e-14, 3.061616997868383e-15),
        new THREE.Vector3(82.5, -2.0206672185931328e-14, -3.061616997868383e-15)
    ];

    // Generate faces (triangles)
    for (let i = 0; i < mobiusSegments; i++) {
        const a = 2 * i;
        const b = 2 * i + 1;
        const c = 2 * (i + 1);
        const d = 2 * (i + 1) + 1;

        mobiusIndices.push(a, b, d);
        mobiusIndices.push(a, d, c);
    }

    // Create geometry and mesh
    const geometry = new THREE.BufferGeometry();
    const mobiusVerticesArray = new Float32Array(mobiusVertices.length * 3);
    mobiusVertices.forEach((v, i) => {
        mobiusVerticesArray[i * 3] = v.x;
        mobiusVerticesArray[i * 3 + 1] = v.y;
        mobiusVerticesArray[i * 3 + 2] = v.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(mobiusVerticesArray, 3));
    geometry.setIndex(mobiusIndices);
    geometry.computeVertexNormals();

    // Rotate the geometry to place it horizontally
    geometry.rotateX(-Math.PI / 2);

    const material = materialTypeMobius[currentMaterialType].clone();
    mobiusStrip = new THREE.Mesh(geometry, material);

    mobiusStrip.position.set(0, 100, 0);

    scene.add(mobiusStrip);
}

function createSkydome() {
    const skydomeRadius = outerRingOuterRadius + 50;

    // Define the angle for the spherical cap
    const phiStart = 0;
    const phiLength = Math.PI * 2;
    const thetaStart = 0;
    const thetaLength = Math.PI / 2;

    // Skydome Geometry
    const geometry = new THREE.SphereGeometry(skydomeRadius, 60, 40, phiStart, phiLength, thetaStart, thetaLength);
    geometry.scale(-1, 1, 1);

    // Load Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('./img/teste.png', function(texture) {
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.15
        });
        const skydome = new THREE.Mesh(geometry, material);
        scene.add(skydome);
    });
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

    if (keysPressed[49]) {
        layer1.userData.step += layersStep * delta;
        layer1.position.y = Math.sin(layer1.userData.step * Math.PI * 2) * (cylinderHeight - innerRingHeight);
    }

    if (keysPressed[50]) {
        layer2.userData.step += layersStep * delta;
        layer2.position.y = Math.sin(layer2.userData.step * Math.PI * 2) * (cylinderHeight - middleRingHeight);
    }

    if (keysPressed[51]) {
        layer3.userData.step += layersStep * delta;
        layer3.position.y = Math.sin(layer3.userData.step * Math.PI * 2) * (cylinderHeight - outerRingHeight);
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();

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
        var surfacesIndex = surfaces[i].userData.index;
        var layer = surfacesIndex / 3 + 1;
        var layerIndex = surfacesIndex % 8;

        var layerSurfaces;
        switch (layer) {
            case 1:
                layerSurfaces = layer1Surfaces;
                break;
            case 2:
                layerSurfaces = layer2Surfaces;
                break;
            case 3:
                layerSurfaces = layer3Surfaces;
                break;            
        }

        var axisCode = layerSurfaces[layerIndex][1];
        var rotationSpeed = layerSurfaces[layerIndex][2];

        surfaces[i].userData.step += rotationSpeed * delta;

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

function updateMaterials() {
    for (var i = 0; i < surfaces.length; i++) {
        surfaces[i].material = materialTypeSurfaces[currentMaterialType].clone();
    }

    rings[0].material = materialTypeRing1[currentMaterialType].clone();
    rings[1].material = materialTypeRing2[currentMaterialType].clone();
    rings[2].material = materialTypeRing3[currentMaterialType].clone();
    mobiusStrip.material = materialTypeMobius[currentMaterialType].clone();
    centralCylinder.material = materialTypeCylinder[currentMaterialType].clone();
}

function onKeyDown(e) {
    'use strict';
    keysPressed[e.keyCode] = true;

    switch (e.keyCode) {
    case 68: //D
    case 110: //d
        directionalLightOn = !directionalLightOn;
        directionalLight.visible = directionalLightOn;
        break;
    case 83: //S
    case 115: //s
        spotlightsOn = !spotlightsOn;
        spotlights.forEach(function (spotlight) {
            spotlight.visible = spotlightsOn;
        });
        break;
    case 81: //Q
    case 113: //q
        currentMaterialType = 'lambert';
        updateMaterials();
        break;
    case 87: //W
    case 119: //w
        currentMaterialType = 'phong';
        updateMaterials();
        break;
    case 69: //E
    case 101: //e
        currentMaterialType = 'toon';
        updateMaterials();
        break;
    case 82: // R
    case 114: //r
        currentMaterialType = 'normal';
        updateMaterials();
        break;
    case 84: //T
    case 116: //t
        currentMaterialType = 'basic';
        updateMaterials();
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