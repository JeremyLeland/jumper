import * as THREE from '../lib/three.module.js';

const BLOCK_WIDTH = 1;
const BLOCK_HEIGHT = 0.5;
const BLOCK_LENGTH = 2;

const SPAWN_Y = 5;

export class Level {
  title;
  cols;
  rows;
  blocks;
  mesh;

  spawnPosition;

  static createRandomContext() {
    const canvas = document.createElement( 'canvas' );
    canvas.width = 9;
    canvas.height = 300;
    
    const ctx = canvas.getContext( '2d' );

    const mid = canvas.width / 2;
    const amp = canvas.width / 2;
    const gap = 5;

    ctx.translate( 0, canvas.height );

    const rect = new Path2D( 'M -1,-1 L 1,-1 L 1,1 L -1,1 Z' );

    for ( let i = Math.random() < 0.5 ? 0 : Math.PI,
              hue = Math.random() * 360,
              z = canvas.height;
          z > 0;
          i += Math.random(),
          hue += Math.random() * 10 ) {
      
      const x = Math.round( mid + Math.sin( i ) * Math.random() * amp );
      const w = Math.ceil( Math.random() * 2 );
      const h = z < 15 ? z * 2 : 1 + Math.ceil( Math.random() * 4 );
      
      ctx.translate( 0, -h );

      ctx.fillStyle = `hsl( ${ hue }, ${ 15 + Math.random() * 60 }%, ${ 15 + Math.random() * 75 }% )`;
      
      ctx.save();
      ctx.translate( x, 0 );
      ctx.scale( w, h );

      ctx.fill( rect );

      ctx.restore();

      ctx.translate( 0, -h - gap );

      z -= 2 * h + gap;
    }

    return ctx;
  }

  static async fromImageSrc( { title, src } ) {
    const image = new Image();
    image.src = src;
    await image.decode();

    return new Level( title, getContextFromImage( image ) );
  }

  constructor( title, ctx ) {
    this.title = title;
    this.cols = ctx.canvas.width;
    this.rows = ctx.canvas.height;

    this.blocks = getBlocksFromContext( ctx );

    this.mesh = getMesh( this.cols, this.rows, this.blocks );
    this.mesh.scale.set( BLOCK_WIDTH, BLOCK_HEIGHT, BLOCK_LENGTH );
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;

    this.spawnPosition = new THREE.Vector3(
      ( this.cols / 2 ) * BLOCK_WIDTH, 
      SPAWN_Y, 
      ( this.rows - 0.5 ) * BLOCK_LENGTH
    );
  }

  isSolidAt( x, z ) {
    const col = Math.floor( x / BLOCK_WIDTH );
    const row = Math.floor( z / BLOCK_LENGTH );
    return 0 <= col && col < this.cols && 0 <= row && row < this.rows &&
      this.blocks[ col + row * this.cols ];
  }

  acrossFinishLine( z ) {
    return z < BLOCK_LENGTH;
  }
}

function getMesh( cols, rows, blocks ) {
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  
  let index = 0;
  const addIndexAndColors = ( block ) => {
    indices.push( index,     index + 1, index + 2 );
    indices.push( index + 2, index + 1, index + 3 );
    index += 4;

    for ( let i = 0; i < 4; i ++ ) {
      colors.push( block.b, block.g, block.r );   // colors are backwards for some reason
    }
  }

  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      const block = blocks[ col + row * cols ];

      if ( block ) {
        // Top
        [ 0, 1 ].forEach( z => {
          [ 1, 0 ].forEach( x => {
            positions.push( col + x, 0, row + z );
            normals.push( 0, 1, 0 );
          } );
        });
  
        addIndexAndColors( block );

        // Front
        if ( row == rows - 1 || !blocks[ col + ( row + 1 ) * cols ] ) {
          [ 0, -1 ].forEach( y => {
            [ 1, 0 ].forEach( x => {
              positions.push( col + x, y, row + 1 );
              normals.push( 0, 0, 1 );
            } );
          });
    
          addIndexAndColors( block );
        }

        // Left
        if ( col > ( cols / 2 ) && !blocks[ col - 1 + row * cols ] ) {
          [ 0, -1 ].forEach( y => {
            [ 1, 0 ].forEach( z => {
              positions.push( col, y, row + z );
              normals.push( -1, 0, 0 );
            } );
          });
    
          addIndexAndColors( block );
        }

        // Right
        if ( col < ( cols / 2 ) && !blocks[ col + 1 + row * cols ] ) {
          [ 0, -1 ].forEach( y => {
            [ 0, 1 ].forEach( z => {
              positions.push( col + 1, y, row + z );
              normals.push( 1, 0, 0 );
            } );
          });
    
          addIndexAndColors( block );
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
  geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  geometry.setIndex( indices );

  const material = new THREE.MeshPhongMaterial( {
    //color: 0xC7C7C7,
    flatShading: true,
    vertexColors: true,
  } );

  return new THREE.Mesh( geometry, material );
}

function getContextFromImage( image ) {
  const canvas = document.createElement( 'canvas' );
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext( '2d' );
  ctx.drawImage( image, 0, 0 );

  return ctx;
}

function getBlocksFromContext( ctx ) {
  const buffer = new Uint32Array(
    ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height ).data.buffer
  );

  return Array.from( buffer, 
    color => ( color & 0x00FFFFFF ) == 0 ? null : new THREE.Color( color )
  );
}