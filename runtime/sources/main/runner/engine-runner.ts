import { Sprite, Texture } from 'pixi.js';
import {
    CheckBox, Director, ELineBarDirection, ELineBarLayout, Engine,
    ISceneOptions, LineBar, logger, LongPressButton, NativeEventSystem, Scene,
    System, TStackOperation,
} from '../../engine';
import { SCENE1_LOAD_ITEMS } from '../config/scene1.loaditems.config';

class TestScene extends Scene {

    protected constructor( options : ISceneOptions ) {
        super( options );

        const longPressOptions = {
            interactive: true,
            longPress: {
                enabled: true,
                interval: 0.2,
                trigger: 1.0,
            },
            textures: {
                disable: 'button',
                hover: 'button-hover',
                normal: 'button-normal',
                press: 'button-down',
            },
            zooming: {
                enabled: true,
                scale: 0.95,
            },
        } as const;
        const longPressButton = new LongPressButton( longPressOptions );

        const checkBoxOptions = {
            onCheckedChanged( box : CheckBox<Sprite>, checked : boolean ) : void {
                logger.info( checked, box.name );
            },
            interactive: true,
            textures: { normal: 'check-box' },
            zooming: {
                enabled: false,
                scale: 0.95,
            },
            checkedMark: Sprite.from( Texture.from( 'check-box-mark' ) ),
        } as const;
        const checkBox = new CheckBox<Sprite>( checkBoxOptions );
        checkBox.position.y = 120;
        checkBox.checkedMark.anchor.set( 0.5 );

        const lineBarOptions = {
            progress: 0,
            background: 'bar-bg',
            foreground: 'bar-fg',
            direction: ELineBarDirection.Positive,
            layout: ELineBarLayout.Horizontal
        } as const;
        const lineBar = new LineBar( lineBarOptions );
        lineBar.position.y = 150;
        lineBar.to( 1.0, 3 );

        this.addChild( longPressButton, checkBox, lineBar );
    }
}

function onSceneStackChanged( type : TStackOperation, current : Scene, prev : Scene ) {
    const prevInfo = `${ prev ? ( 'prev<' + prev.name + '>' ) : '' }`;
    logger.info( `SceneStack Operation [${ type }], current<${ current.name }> ${ prevInfo }` );
}

export function onEngineStarted( _engine : Engine ) {
    Director.shared.onStackSignal.connect( onSceneStackChanged );

    TestScene.create( {
                          preloads: SCENE1_LOAD_ITEMS,
                          useLoadingLayer: true,
                      } ).then( ( scene ) => {
        Director.shared.runScene( scene );
    } );
}

export function onSystemMounted( engine : Engine, system : System ) {
    logger.debug( `System<${ system.name }> Priority<${ system.priority }>` );
    if ( system instanceof NativeEventSystem ) {
        // Applying your own screen adaption strategy here
        NativeEventSystem.shared.onWindowResized.connect( () => {
            NativeEventSystem.shared.applyScreenAdaption( engine );
        } );

        // Game Visibility
        let lastTime = performance.now();
        NativeEventSystem.shared.onWindowEntered.connect( () => {
            logger.info( 'app entered', ( ( performance.now() - lastTime ) / 1000 ).toFixed( 2 ) + 's' );
        } );
        NativeEventSystem.shared.onWindowExited.connect( () => {
            lastTime = performance.now();
            logger.info( 'app exited' );
        } );

        // Applying at once
        NativeEventSystem.shared.onWindowEntered.emit();
        NativeEventSystem.shared.onWindowResized.emit();
    }
}