
import * as THREE from '../three/build/three.module.js';
import Stats from '../three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from '../three/examples/jsm/loaders/FBXLoader.js';


var scene, renderer, camera;
var controls;
var mixer;

var container = document.getElementById("container");
const stats = new Stats();
container.appendChild(stats.dom);


init();


function init() {
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#eee");

    // camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 70);

    // lights
    const light1 = new THREE.DirectionalLight("#ffffff", 3);
    light1.position.set(0, 30, 70);
    scene.add(light1);

    const light2 = new THREE.AmbientLight("#808080");
    scene.add(light2);


    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    LoadSky();
    LoadGround();
    LoadModel();
    raf();
}




// load model
function LoadModel() {
    const loader = new FBXLoader();

    loader.load('../resources/3d-models/remy.fbx', (fbx) => {
        fbx.scale.setScalar(0.1);
        fbx.traverse(c => {
            c.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('../resources/3d-models/Dancing.fbx', (anim) => {
            mixer = new THREE.AnimationMixer(fbx);
            const idle = mixer.clipAction(anim.animations[0]);
            idle.play();
        });

        scene.add(fbx);
    }, undefined, function (error) {
        console.error(error);
    });
}



// load sky cube
function LoadSky() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '/three/examples/textures/cube/skyboxsun25deg/px.jpg',
        '/three/examples/textures/cube/skyboxsun25deg/nx.jpg',
        '/three/examples/textures/cube/skyboxsun25deg/py.jpg',
        '/three/examples/textures/cube/skyboxsun25deg/ny.jpg',
        '/three/examples/textures/cube/skyboxsun25deg/pz.jpg',
        '/three/examples/textures/cube/skyboxsun25deg/nz.jpg',
    ]);
    scene.background = texture;
}

//  GROUND
function LoadGround() {
    const gt = new THREE.TextureLoader().load("/resources/textures/ground2.png");
    const gg = new THREE.PlaneGeometry(100, 100);
    const gm = new THREE.MeshPhongMaterial({ color: 0xffffff, map: gt });

    const ground = new THREE.Mesh(gg, gm);
    ground.rotation.x = - Math.PI / 2;
    ground.material.map.repeat.set(8, 8);
    ground.material.map.wrapS = THREE.RepeatWrapping;
    ground.material.map.wrapT = THREE.RepeatWrapping;
    ground.material.map.encoding = THREE.sRGBEncoding;
    // note that because the ground does not cast a shadow, .castShadow is left false
    ground.receiveShadow = true;
    ground.scale.set(1.2, 1.2);

    scene.add(ground);
}










function raf() {
    requestAnimationFrame(() => {
        controls.update();
        stats.update();
        renderer.render(scene, camera);
        raf();
    });
}


window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
