import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

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

const { renderer, camera, scene, controls } = initialize()

const renderLoop = () => {
  renderer.render(scene, camera)
}

// Debug
const axesHelper = new THREE.AxesHelper( 50 );
scene.add(axesHelper)

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x00ffff } );
for (let i = 10; i < 200; i += 10) {
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
const L = 10; // number of lines
const N = 70; // number of vertices in a line

const colors = [];
const color = new THREE.Color();
for( var i = 0; i < N; i++ ) {
  color.setHSL( 0.6, 1, (1-i/(N-1))**4 );
  colors.push( color.r, color.g, color.b );
}
const particleLineMaterial = new THREE.LineBasicMaterial( {
  vertexColors: true,
  blending: THREE.AdditiveBlending,
});
const particleLines: THREE.Line[] = [];
const particleLineGeometries: THREE.BufferGeometry[] = [];
const particleRnds: number[] = [];
const particlePositionBuffers: THREE.Vector3[][] = [];

for( let i = 0; i < L; i++ ) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( colors, 3 ));
  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));
  particleLineGeometries.push(geometry)
  particleRnds.push(Math.random());
  particlePositionBuffers.push([]);

  const line: any = new THREE.Line( geometry, particleLineMaterial );
  particleLines.push( line );
}
scene.add( ...particleLines);

// function path( buf, t, i, rnd ) {
//   // t += 10*rnd;
//   var x = (0.1+3*rnd)*Math.sin(t+13*rnd) + 2*rnd*Math.cos(3.2*t+3);
//   var y = (3-3*rnd)*Math.cos(t) + 2*rnd*Math.cos(4.5*t-7*rnd);
//   var z = (3*rnd**2)*Math.sin(2.7*t-4*rnd);
//   buf.setXYZ( i, x, y, z );
// }


const geometry = new THREE.SphereGeometry( 0.5, 16, 16 );
const material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );

const group = new THREE.Group();

const spheres: THREE.Mesh[] = [];
const directions: THREE.Vector3[] = [];
const targetDirections: THREE.Vector3[] = [];

for (let i = 0; i < L; i++) {
  const sphere = new THREE.Mesh( geometry, material );
  const direction = new THREE.Vector3(Math.random() - 0.5, 0, 1);
  const targetDirection = new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, -1);
  spheres.push(sphere);
  directions.push(direction);
  targetDirections.push(targetDirection);
}
group.add(...spheres);
// scene.add(group);


let speed = 0.10;
function update(t) {
  for (let i = 0; i < L; i++) {
    spheres[i].position.x += speed * directions[i].x;
    spheres[i].position.y += speed * directions[i].y;
    spheres[i].position.z += speed * directions[i].z;
    const test = targetDirections[i].clone().sub(directions[i]);
    directions[i].addScaledVector(test, 0.03);

    particlePositionBuffers[i].unshift(spheres[i].position.clone());
    if (particlePositionBuffers[i].length > N) {
      particlePositionBuffers[i] = particlePositionBuffers[i].slice(0, N);
    }
  }

  for (let i = 0; i < L; i++) {
    const pos = particleLineGeometries[i].getAttribute('position');
    const list = particlePositionBuffers[i];
    for(let j = 0; j < list.length; j++ ) {
      pos.setXYZ( j, list[j].x, list[j].y, list[j].z );
    }
    pos.needsUpdate = true;
  }

  /*
  for (let i = 0; i < L; i++) {
    const pos = particleLineGeometries[i].getAttribute('position')
    for( var j = 0; j < N; j++ ) {
      path( pos, t/3000 - j/50, j, particleRnds[i]);
    }
    pos.needsUpdate = true;
  }
  */

  speed += 0.001
}

// Attach to DOM
controls.addEventListener( 'change', renderLoop );

document.body.appendChild( renderer.domElement );

function animate(t) {
  update(t);
  renderLoop();
}
renderer.setAnimationLoop( animate );



