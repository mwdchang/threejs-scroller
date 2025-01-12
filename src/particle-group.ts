import * as THREE from 'three';

export abstract class AbstractParticleGroup {
  group = new THREE.Group();
  getGroup() { return this.group; }

  abstract init(): void
  abstract update(scene: THREE.Scene): void
  abstract dispose(): void
}

/**
 * Nova burst effect
**/
export class NovaGroup extends AbstractParticleGroup {
  readonly SEGMENTS = 60
  readonly NUM_RINGS = 5

  position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  speed: Number = 0.01

  cnt = 0

  particleLines: THREE.Line[] = [];
  particleLineGeometries: THREE.BufferGeometry[] = [];

  init() {
    const colors = [];
    const color = new THREE.Color();
    for( var i = 0; i < this.SEGMENTS + 1; i++ ) {
      color.setRGB(0.2, 0.7, 0.9);
      colors.push( color.r, color.g, color.b );
    }
    const particleLineMaterial = new THREE.LineBasicMaterial( {
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    // Set up trails geometry buffers
    for( let i = 0; i < this.NUM_RINGS; i++ ) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( colors, 3 ));
      geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));
      this.particleLineGeometries.push(geometry)

      const line: any = new THREE.Line( geometry, particleLineMaterial );
      this.particleLines.push( line );
    }
    this.group.add(...this.particleLines);
  }

  update(scene: THREE.Scene) {
    const inc = 360 / this.SEGMENTS;
    for (let i = 0; i < this.NUM_RINGS; i++) {
      let angle = 0;
      const pos = this.particleLineGeometries[i].getAttribute('position');
      for (let j = 0; j <= this.SEGMENTS; j++) {
        const x = (0.10 * i + 0.05 * this.cnt + Math.random() * 0.5) * Math.sin(angle * Math.PI / 180.0);
        const z = (0.10 * i + 0.05 * this.cnt + Math.random() * 0.5) * Math.cos(angle * Math.PI / 180.0);

        pos.setXYZ( j, x, 0.0, z );
        angle += inc;
      }
      pos.needsUpdate = true;
    }
    this.cnt = this.cnt + 1;
    console.log(this.cnt);
  }

  dispose() {}
}

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
  }

  dispose() {
    // TODO
  }
}
