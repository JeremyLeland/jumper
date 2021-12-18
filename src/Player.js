import * as THREE from '../lib/three.module.js';

import { Level } from '../src/Level.js';

const SPEED = 0.01
const MAX_SPEED = 8
const ACCEL = 0.006
const SIDE_SPEED = 0.008
const JUMP_SPEED = 0.02
const SIZE = 0.4
const SPAWN_Y = 5.0
const GRAVITY = -0.0001
const COLLISION_FUDGE = 0.3
const FALL_NO_RETURN = -0.4
const FALL_END = -40
const DETAIL = 20;

export class Player {
  mesh = new THREE.Mesh(
    new THREE.SphereGeometry( SIZE, DETAIL, DETAIL ),
    new THREE.MeshPhongMaterial( {
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.8
    } )
  );

  position = this.mesh.position;
  velocity = new THREE.Vector3();

  speed = 0;
  #partialSpeed = 0;
  
  constructor() {
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
  }

  spawn( level ) {
    // TODO: Spawn higher so we fall from off screen
    this.position.set(
      ( level.cols / 2 ) * Level.BLOCK_WIDTH, 
      SIZE, 
      ( level.rows - 0.5 ) * Level.BLOCK_LENGTH 
    );
  }

  update( dt, keysPressed ) {
    if ( keysPressed.has( 'ArrowLeft' ) ) {
      this.velocity.x = -SIDE_SPEED;
    }
    else if ( keysPressed.has( 'ArrowRight' ) ) {
      this.velocity.x = SIDE_SPEED;
    }
    else {
      this.velocity.x = 0;
    }

    if ( keysPressed.has( 'ArrowUp' ) ) {
      if ( this.#partialSpeed == 0 ) {
        this.#partialSpeed = 1;
      }
      
      this.#partialSpeed += ACCEL * dt;

      if ( this.#partialSpeed > 1 ) {
        this.speed = Math.min( this.speed + 1, MAX_SPEED );
        this.#partialSpeed -= 1;
      }
    }
    else if ( keysPressed.has( 'ArrowDown' ) ) {
      if ( this.#partialSpeed == 0 ) {
        this.#partialSpeed = -1;
      }

      this.#partialSpeed -= ACCEL * dt;

      if (this.#partialSpeed < -1) {
        this.speed = Math.max( this.speed - 1, 0 );
        this.#partialSpeed += 1;
      }
    }
    else {
      this.#partialSpeed = 0;
    }

    this.velocity.z = -SPEED * this.speed;

    this.position.addScaledVector( this.velocity, dt );
  }
}