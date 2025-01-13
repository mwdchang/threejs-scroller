import * as THREE from 'three';
import { AbstractParticleGroup } from "./particle-group";

/**
 * Spread. The particles initially fires "backwards" before arcing
 * back into the forward direction
 *
 * Inspired by: https://codepen.io/boytchev/pen/QWzjOMx
**/
export class SpreadParticleGroup extends AbstractParticleGroup {
  readonly L = 10; // number of lines
  readonly N = 150; // number of vertices in a line

  // Particle
  spheres: THREE.Vector3[] = [];
  directions: THREE.Vector3[] = [];
  speeds: number[] = [];
  targetDirections: THREE.Vector3[] = [];

  // Trail effect
  particleLines: THREE.Line[] = [];
  particleLineGeometries: THREE.BufferGeometry[] = [];
  particlePositionBuffers: THREE.Vector3[][] = [];

  init() {
    const colors = [];
    const color = new THREE.Color();
    for( var i = 0; i < this.N; i++ ) {
      color.setHSL( 0.6, 1, (1 - i/(this.N - 1))**4 );
      colors.push( color.r, color.g, color.b );
    }

    const particleLineMaterial = new THREE.LineBasicMaterial( {
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });
    // matLineDashed = new THREE.LineDashedMaterial( { vertexColors: true, scale: 2, dashSize: 1, gapSize: 1 } );

    // Set up trails geometry buffers
    for( let i = 0; i < this.L; i++ ) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( colors, 3 ));
      geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));
      this.particleLineGeometries.push(geometry)
      this.particlePositionBuffers.push([]);

      const line: any = new THREE.Line( geometry, particleLineMaterial );
      this.particleLines.push( line );
    }

    // Set up particles and directions
    for (let i = 0; i < this.L; i++) {
      const sphere = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3(Math.random() - 0.5, 0, 1.5);
      const targetDirection = new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, -1);
      this.spheres.push(sphere);
      this.directions.push(direction);
      this.targetDirections.push(targetDirection);
      this.speeds.push(Math.random() * 0.05 + 0.05);
    }

    this.group.add(...this.particleLines);
  }

  update(scene: THREE.Scene) {
    // console.log(scene);
    // Update position and buffer
    for (let i = 0; i < this.L; i++) {
      this.spheres[i].x += this.speeds[i] * this.directions[i].x;
      this.spheres[i].y += this.speeds[i] * this.directions[i].y;
      this.spheres[i].z += this.speeds[i] * this.directions[i].z;
      const test = this.targetDirections[i].clone().sub(this.directions[i]);
      // this.directions[i].addScaledVector(test, 0.03);
      this.directions[i].addScaledVector(test, 0.02);

      this.particlePositionBuffers[i].unshift(this.spheres[i].clone());
      if (this.particlePositionBuffers[i].length > this.N) {
        this.particlePositionBuffers[i] = this.particlePositionBuffers[i].slice(0, this.N);
      }
    }

    // Reset/resend buffer
    for (let i = 0; i < this.L; i++) {
      const pos = this.particleLineGeometries[i].getAttribute('position');
      const list = this.particlePositionBuffers[i];
      for(let j = 0; j < list.length; j++ ) {
        pos.setXYZ( j, list[j].x, list[j].y, list[j].z );
      }
      pos.needsUpdate = true;
    }

    this.cnt ++;
    if (this.cnt > 500) {
      console.log('spread done');
      this.done = true;
    }
  }

  dispose() {
    // TODO
  }
}
