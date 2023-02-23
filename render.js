// References:
// Blender + Three.js: https://www.youtube.com/watch?v=vHHihuW0_4M&ab_channel=devaslife
// Video Texture: https://www.youtube.com/watch?v=OM5kgBvAj2c&ab_channel=TutorialsGuy
// https://www.youtube.com/watch?v=rxTb9ys834w&list=LL&index=1&t=165s&ab_channel=AndrewWoan


import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const modelPath = 'model.glb';
const clock = new THREE.Clock();
const distance = 2;
const theta = (25 / 180) * Math.PI;
const speedFactor = 0.06; // rps
let auto = true;
let scene;
let camera;
let renderer;
let controls;

let model;
let parts = {};



init();
animate();

function init() {
    const container = document.createElement('div')
    document.body.appendChild(container)

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = distance * Math.sin(theta);
    camera.position.x = distance * Math.cos(theta) * Math.cos(0.3 * Math.PI);
    camera.position.z = distance * Math.cos(theta) * Math.sin(0.3 * Math.PI);
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xcccccc, 3.0);
    scene.add(ambientLight);

    controls = new OrbitControls(camera, renderer.domElement);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.149.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    // loader.load(modelPath, function (gltf) {

    //     scene.add(gltf.scene);

    // }, undefined, function (error) {

    //     console.error(error);

    // });

    // Load a glTF resource
    loader.load(
        // resource URL
        modelPath,
        // called when the resource is loaded
        function (gltf) {
            model = gltf.scene;
            scene.add(gltf.scene);

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
            ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr', 'chassis_alu'].forEach(nm => parts[nm] = gltf.scene.getObjectByName(nm));
            console.log(parts);

        },
        // called while loading is progressing
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            $('#progBar').attr('value', (xhr.loaded / xhr.total * 100));
        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');
        }
    );

}

function animate() {
    clock.getDelta();
    let time = clock.elapsedTime.toFixed(3);


    time *= speedFactor;
    if (auto) {
        camera.position.x = distance * Math.cos(theta) * Math.cos((time * 1000) % 1000 / 999.0 * 2 * Math.PI);
        camera.position.z = distance * Math.cos(theta) * Math.sin((time * 1000) % 1000 / 999.0 * 2 * Math.PI);
        camera.position.y = distance * Math.sin(theta);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

    }

    if (!auto)
        controls.update();


    if (parts.wheel_fl) {
        rotateAboutPoint(parts.wheel_fl, new THREE.Vector3(0.21, 0.076, 0), new THREE.Vector3(0, 0, 1), 0.3, false);
    }

    if (parts.wheel_fr) {
        rotateAboutPoint(parts.wheel_fr, new THREE.Vector3(0.21, 0.076, 0), new THREE.Vector3(0, 0, 1), 0.3, false);
    }

    if (parts.wheel_rl) {
        rotateAboutPoint(parts.wheel_rl, new THREE.Vector3(-0.21, 0.076, 0), new THREE.Vector3(0, 0, 1), 0.3, false);
    }

    if (parts.wheel_rr) {
        rotateAboutPoint(parts.wheel_rr, new THREE.Vector3(-0.21, 0.076, 0), new THREE.Vector3(0, 0, 1), 0.3, false);
    }

    if (parts.chassis_alu)
        parts.chassis_alu.position.y = (Math.cos((time * 20 * 1000) % 1000 / 999.0 * 2 * Math.PI) + 1) / 6;
    //<pose>0.21 0.277 0.076 1.5708 -0 0</pose>


    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

    if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}


$("#btn_auto").click(function () {
    auto = true;
});


$("#btn_manual").click(function () {
    auto = false;
});