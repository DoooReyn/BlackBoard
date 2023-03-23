// import { Sprite } from 'pixi.js';
// import { blackboard, BoundaryBox, SizeBox } from '../engine';
//
// const game = blackboard.instance( {
//     canvasFallbacks: [ '#black-board', '.black-board', 'canvas' ],
//     resolution: window.devicePixelRatio || 1,
//     autoDensity: true,
//     autoStart: true,
//     backgroundColor: 0x6495ed,
//     width: 960,
//     height: 640,
//     debugMode: true,
//     maxFPS: 60,
//     minFPS: 30
// } );
//
// const panel = new BoundaryBox( {
//     width: 200,
//     height: 200,
//     margin: {
//         top: 50, bottom: 50, left: 50, right: 50,
//     },
//     align: {
//         top: true, bottom: true, left: true, right: true,
//     },
//     anchorX: 0.5,
//     anchorY: 0.5,
//     backgroundColor: 0xeeee55,
//     backgroundAlpha: 0.85
// } );
//
// const panel2 = new BoundaryBox( {
//     width: 150,
//     height: 150,
//     anchorY: 0.5,
//     anchorX: 0.5,
//     margin: {
//         top: 50, bottom: 50, left: 50, right: 50,
//     },
//     align: {
//         top: true, bottom: true, left: true, right: true,
//     },
//     backgroundAlpha: 0.88,
//     backgroundColor: 0xee2222,
// } );
//
// panel.addChild( panel2 );
// game.scene.addChild( panel );
//
// const avatar = Sprite.from( '../../asset/image/github-avatar.png' );
// avatar.anchor.set( 0.5 );
// avatar.position.set( 320, 320 );
//
// const bunny = Sprite.from( '../../asset/image/bunny.png' );
// bunny.anchor.set( 0 );
// bunny.position.set( 0, 0 );
// avatar.addChild( bunny );
//
// game.scene.addChild( avatar );
//
// new SizeBox( { width: 10, height: 10 } );
//
// ( window as any ).panel = panel;
// ( window as any ).panel2 = panel2;
// ( window as any ).bunny = bunny;

import { Engine, MultiScreenSystem, RenderSystem } from '../engine';

const engine = new Engine( {
    canvasFallbacks: [ '#black-board', '.black-board', 'canvas' ],
    resolution     : window.devicePixelRatio || 1,
    autoDensity    : true,
    autoStart      : true,
    backgroundColor: 0x6495ed,
    width          : 960,
    height         : 640,
    debug          : true,
    maxFPS         : 60,
    minFPS         : 30,
} );
engine.mount( new MultiScreenSystem() );
engine.mount( new RenderSystem() );
engine.run();

( window as any ).engine = engine;