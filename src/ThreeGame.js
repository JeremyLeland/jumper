import * as THREE from '../lib/three.module.js';

export class ThreeDemo {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );  
  renderer = new THREE.WebGLRenderer();
  
  constructor() {
    document.body.appendChild( this.renderer.domElement );

    window.onresize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.render();
    }
    window.onresize();
    
    let lastTime = null;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      this.update( now - lastTime );
      lastTime = now;
  
      this.renderer.render( this.scene, this.camera );
  
      requestAnimationFrame( animate );
    };

    requestAnimationFrame( animate );
  }

  update( dt ) {}
}
