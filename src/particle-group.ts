import * as THREE from 'three';

export abstract class AbstractParticleGroup {
  group = new THREE.Group();

  getGroup() { return this.group; }

  abstract init(): void
  abstract update(scene: THREE.Scene): void
}

export class SpreadParticleGroup extends AbstractParticleGroup {
  readonly L = 10; // number of lines
  readonly N = 150; // number of vertices in a line

  // Particle
  spheres: THREE.Vector3[] = [];
  directions: THREE.Vector3[] = [];
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
    }

    this.group.add(...this.particleLines);
  }

  update(scene: THREE.Scene) {
    // console.log(scene);
    let speed = 0.10;
    // Update position and buffer
    for (let i = 0; i < this.L; i++) {
      this.spheres[i].x += speed * this.directions[i].x;
      this.spheres[i].y += speed * this.directions[i].y;
      this.spheres[i].z += speed * this.directions[i].z;
      const test = this.targetDirections[i].clone().sub(this.directions[i]);
      this.directions[i].addScaledVector(test, 0.03);

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
}
