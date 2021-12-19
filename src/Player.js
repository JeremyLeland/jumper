import * as THREE from '../lib/three.module.js';

const SPEED = 0.01;
const MAX_SPEED = 8;
const ACCEL = 0.006;
const SIDE_SPEED = 0.008;
const JUMP_SPEED = 0.02;
const SIZE = 0.4;
const GRAVITY = -0.0001;
const COLLISION_FUDGE = 0.3;
const FALL_NO_RETURN = -0.4;
const FALL_END = -40;
const DETAIL = 40;

const speedUI = document.getElementById( 'speed' );
const titleUI = document.getElementById( 'title' );

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

  completedLevel = false;
  
  constructor() {
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
  }

  spawn( level ) {
    this.position.copy( level.spawnPosition );
    this.velocity.set( 0, 0, 0 );
    this.speed = 0;
    this.#partialSpeed = 0;
    this.completedLevel = false;

    titleUI.innerText = level.title;
  }

  update( { dt, level, keysPressed } ) {
    if ( keysPressed.has( 'ArrowLeft' ) ) {
      this.velocity.x = -SIDE_SPEED;
    }
    else if ( keysPressed.has( 'ArrowRight' ) ) {
      this.velocity.x = SIDE_SPEED;
    }
    else {
      this.velocity.x = 0;
    }

    this.velocity.y += GRAVITY * dt;

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
    speedUI.innerText = this.speed;
    if ( this.speed > 0 ) {
      titleUI.innerText = '';  
    }

    this.position.addScaledVector( this.velocity, dt );

    if ( FALL_NO_RETURN < this.position.y && this.position.y < SIZE && 
        [ -1, 1 ].some( x =>
          [ -1, 1 ].some( z =>
            level.isSolidAt( 
              this.position.x + x * COLLISION_FUDGE, 
              this.position.z + z * COLLISION_FUDGE
            )
          )
        ) ) {
      this.position.y = SIZE;
      this.velocity.y = keysPressed.has( ' ' ) ? JUMP_SPEED : 0;

      // TODO: Test this in Level instead?
      if ( level.acrossFinishLine( this.position.z ) ) {
        this.completedLevel = true;
        titleUI.innerText = 'Level Complete!';
      }
    }
    else if ( this.position.y < FALL_END ) {
      this.spawn( level );
    }
  }
}