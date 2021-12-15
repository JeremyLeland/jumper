import * as THREE from '../lib/three.module.js';

export class ThreeGame {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );  
  
  constructor() {
    const renderer = new THREE.WebGLRenderer();
    document.body.appendChild( renderer.domElement );

    window.onresize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.onresize();
    
    
    let lastTime = null;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      this.update( now - lastTime );
      lastTime = now;
  
      renderer.render( this.scene, this.camera );
  
      //requestAnimationFrame( animate );
    };

    requestAnimationFrame( animate );
  }

  update( dt ) {}
}
