import { Sprite } from 'pixi.js';
import { blackboard, Panel } from '../engine';

const game = blackboard.instance( {
    canvasFallbacks: [ '#black-board', '.black-board', 'canvas' ],
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    autoStart: true,
    backgroundColor: 0x6495ed,
    width: 960,
    height: 640,
    debugMode: true,
    maxFPS: 60,
    minFPS: 30
} );

const panel = new Panel( {
    width: 200,
    height: 200,
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
    backgroundAlpha: 1,
    backgroundColor: 0xffff00,
    anchorY: 0.5,
    anchorX: 0.5
} );

const panel2 = new Panel( {
    width: 50,
    height: 50,
    top: 30,
    bottom: 30,
    left: 50,
    right: 50,
    backgroundAlpha: 0.5,
    backgroundColor: 0xff00ff,
    anchorY: 0.5,
    anchorX: 0.5
} );
panel.addChild( panel2 );

const bunny = Sprite.from("../../asset/image/bunny.png");
bunny.anchor.set(0.5);
panel.addChild(bunny);

game.scene.addChild( panel );

( window as any ).panel = panel;
( window as any ).panel2 = panel2;