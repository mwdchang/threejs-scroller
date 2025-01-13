import * as THREE  from "three";
import { AbstractParticleGroup } from "./particle-group";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

export class Spread2 extends AbstractParticleGroup {
  readonly L = 10; // number of lines
  readonly N = 200; // number of vertices in a line

  positions: number[] = [];
  colors: number[] = [];
  geometry: LineGeometry = new LineGeometry();
  line: Line2 | null = null; 

  // Particle
  spheres: THREE.Vector3[] = [];
  directions: THREE.Vector3[] = [];
  speeds: number[] = [];
  targetDirections: THREE.Vector3[] = [];
  particlePositionBuffers: THREE.Vector3[][] = [];
  lines: Line2[] = [];

  init() {
    const color = new THREE.Color();
    for( var i = 0; i < this.N; i++ ) {
      color.setHSL( 0.6, 1, (1 - i/(this.N - 1))**4 );
      this.colors.push( color.r, color.g, color.b );
    }

    for (let i = 0; i < this.L; i++) {
      const geo = new LineGeometry();
      this.particlePositionBuffers.push([]);

      const matLine = new LineMaterial( {
        color: 0xffffff,
        // linewidth: 2, // in world units with size attenuation, pixels otherwise
        linewidth: Math.random() * 3,
        vertexColors: true,
        dashed: false,
        alphaToCoverage: true,
      });


      const line = new Line2(geo, matLine);
      this.lines.push(line);
    }

    // Set up particles and directions
    for (let i = 0; i < this.L; i++) {
      const sphere = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3( (Math.random() - 0.5) * 2, 0, 1.5);
      const targetDirection = new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, -1);
      this.spheres.push(sphere);
      this.directions.push(direction);
      this.targetDirections.push(targetDirection);
      this.speeds.push(Math.random() * 0.08 + 0.05);
    }

    this.group.add(...this.lines);
  }

  // https://discourse.threejs.org/t/adding-points-drawcount-for-line2-dynamically/48980/4
  update(scene: THREE.Scene) {
    // Update position and buffer
    for (let i = 0; i < this.L; i++) {
      this.spheres[i].x += this.speeds[i] * this.directions[i].x;
      this.spheres[i].y += this.speeds[i] * this.directions[i].y;
      this.spheres[i].z += this.speeds[i] * this.directions[i].z;
      const test = this.targetDirections[i].clone().sub(this.directions[i]);
      this.directions[i].addScaledVector(test, 0.02);

      this.particlePositionBuffers[i].unshift(this.spheres[i].clone());
      if (this.particlePositionBuffers[i].length > this.N) {
        this.particlePositionBuffers[i] = this.particlePositionBuffers[i].slice(0, this.N);
      }
    }

    for (let i = 0; i < this.L; i++) {
      const line = this.lines[i];
      const newPositions: number[] = [];

      this.particlePositionBuffers[i].forEach(v => {
        newPositions.push(v.x, v.y, v.z);
      });
      line.geometry = new LineGeometry();
      line.geometry.setPositions(newPositions);
      line.geometry.setColors(this.colors);
    }
    
    this.cnt ++; 
    if (this.cnt > 500) {
      console.log('spread2 done');
      this.done = true;
    }
  }

  dispose() {
  }
}
