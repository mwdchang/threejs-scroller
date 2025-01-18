import * as THREE from 'three';
import { AbstractParticleGroup } from './particle-group';

/**
 * Nova burst effect
**/
export class NovaGroup extends AbstractParticleGroup {
  readonly SEGMENTS = 120 
  readonly NUM_RINGS = 4

  position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  speed: Number = 0.01

  cnt = 0

  particleLines: THREE.Line[] = [];
  particleLineGeometries: THREE.BufferGeometry[] = [];

  init() {
    const colors = [];
    for( var i = 0; i < this.SEGMENTS + 1; i++ ) {
      const color = new THREE.Color();
      color.setRGB(0.2, 0.7, 0.8);
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
        // radius = ring-index + current counter + random
        const x = (0.05 * i + 0.05 * this.cnt + Math.random() * i * 0.15) * Math.sin(angle * Math.PI / 180.0);
        const z = (0.05 * i + 0.05 * this.cnt + Math.random() * i * 0.15) * Math.cos(angle * Math.PI / 180.0);

        pos.setXYZ( j, x, 0.0, z );
        angle += inc;
      }
      pos.needsUpdate = true;
    }
    this.cnt ++;
    this.group.rotateX((this.cnt * 0.5) * Math.PI / 180);
    this.group.rotateY((this.cnt * 0.5) * Math.PI / 180);
    if (this.cnt > 100) {
      console.log('nova done');
      this.done = true;
    }
  }

  dispose() {}
}
