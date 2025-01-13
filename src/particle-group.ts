import * as THREE from 'three';
/*
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
*/

export abstract class AbstractParticleGroup {
  group = new THREE.Group();
  cnt = 0;
  done = false;

  getGroup() { return this.group; }

  abstract init(): void
  abstract update(scene: THREE.Scene): void
  abstract dispose(): void
}


