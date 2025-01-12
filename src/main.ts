import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { 
  AbstractParticleGroup,
  SpreadParticleGroup,
  NovaGroup
} from './particle-group';

function initObjMTL(scene: THREE.Scene) {
  function onProgress( xhr: any ) {
    if ( xhr.lengthComputable ) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( 'model ' + percentComplete.toFixed( 2 ) + '% downloaded' );
    }
  }
  function onError() {}

  new MTLLoader()
    .setPath('models/shuttle/')
    .load('shuttle.mtl', function (materials) {
      materials.preload();
      console.log('hihi', materials);

      new OBJLoader() 
        .setMaterials(materials)
        .setPath('models/shuttle/')
        .load('shuttle.obj', function (object) { 
          object.scale.setScalar(0.02);
          object.rotateY(-90 * Math.PI / 180);
          scene.add(object);
        }, onProgress, onError);
    });
}

function initialize() {
  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.y = 10.0
  camera.position.z = 20.0;

  const scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
  scene.add( ambientLight );
  
  const pointLight = new THREE.PointLight( 0xffffff, 2);
  camera.add( pointLight );

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 10);
  scene.add(light);

  scene.add(camera);

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 1;
  controls.maxDistance = 40;
  return { renderer, camera, scene, controls }
}

// common stuff
const { renderer, camera, scene, controls } = initialize();
const particleGroups: AbstractParticleGroup[] = [];

const renderLoop = () => {
  renderer.render(scene, camera)
}

// Debug
const axesHelper = new THREE.AxesHelper( 50 );
scene.add(axesHelper)

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x888888} );
for (let i = -200; i < 200; i += 10) {
  const geometry = new THREE.BufferGeometry().setFromPoints([ 
    new THREE.Vector3(-100, 0, -i),
    new THREE.Vector3(100, 0, -i)
  ]);
  const line = new THREE.Line( geometry, lineMaterial );
  scene.add( line );
}

// Testing
// TODO: 
// See: maybe https://github.com/mkkellogg/TrailRendererJS?tab=readme-ov-file
// See: https://discourse.threejs.org/t/how-would-you-implement-bullet-trails/67644/2
// See: https://codepen.io/boytchev/pen/QWzjOMx

initObjMTL(scene);

// function path( buf, t, i, rnd ) {
//   // t += 10*rnd;
//   var x = (0.1+3*rnd)*Math.sin(t+13*rnd) + 2*rnd*Math.cos(3.2*t+3);
//   var y = (3-3*rnd)*Math.cos(t) + 2*rnd*Math.cos(4.5*t-7*rnd);
//   var z = (3*rnd**2)*Math.sin(2.7*t-4*rnd);
//   buf.setXYZ( i, x, y, z );
// }

function update(t) {
  /*
  for (let i = 0; i < L; i++) {
    const pos = particleLineGeometries[i].getAttribute('position')
    for( var j = 0; j < N; j++ ) {
      path( pos, t/3000 - j/50, j, particleRnds[i]);
    }
    pos.needsUpdate = true;
  }
  */

  particleGroups.forEach(group => {
    group.update(scene)
  });
}

// Attach to DOM
function keyHandler(event: KeyboardEvent) {
  const keyCode = event.which;

  /*
  if (keyCode === 32) { // space
    console.log('space pressed');
    const newParticlegroup = new SpreadParticleGroup();
    newParticlegroup.init();
    particleGroups.push(newParticlegroup);
    // register
    scene.add(newParticlegroup.getGroup());
  }
  */
  if (keyCode === 49) { // num-1
    console.log('space pressed');
    const newParticlegroup = new SpreadParticleGroup();
    newParticlegroup.init();
    particleGroups.push(newParticlegroup);
    // register
    scene.add(newParticlegroup.getGroup());
  }

  if (keyCode === 50) { // num-2
    console.log('space pressed');
    const newParticlegroup = new NovaGroup();
    newParticlegroup.init();
    particleGroups.push(newParticlegroup);
    scene.add(newParticlegroup.getGroup());
  }
}

controls.addEventListener( 'change', renderLoop );
document.body.appendChild( renderer.domElement );
document.addEventListener('keydown', keyHandler, false);

function animate(t) {
  update(t);
  renderLoop();
}
renderer.setAnimationLoop( animate );

