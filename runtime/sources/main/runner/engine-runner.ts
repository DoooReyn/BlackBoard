import {
    Button, Director, Engine, ISceneOptions, logger, NativeEventSystem, Scene,
    System, TStackOperation,
} from '../../engine';
import { SCENE1_LOAD_ITEMS } from '../config/scene1.loaditems.config';

class TestScene extends Scene {

    protected constructor( options : ISceneOptions ) {
        super( options );

        const button = new Button( {
                                       interactive: true,
                                       longPress: {
                                           enabled: true,
                                           interval: 0.25,
                                           trigger: 1.5,
                                       },
                                       state: 'normal',
                                       textures: {
                                           // disable: 'button',
                                           // hover: 'button-hover',
                                           // normal: 'button-normal',
                                           // press: 'button-down',
                                           disable: '/asset/button.png',
                                           hover: '/asset/button_over.png',
                                           normal: '/asset/button.png',
                                           press: '/asset/button_down.png',
                                       },
                                       zooming: {
                                           enabled: false,
                                           interval: 0,
                                           scale: 0.95,
                                       },
                                   } );
        this.addChild( button );
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