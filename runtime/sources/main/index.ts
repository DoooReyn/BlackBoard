import {
    Engine, logger, NativeEventSystem, NewsSystem, Scene, StatsSystem, System,
} from '../engine';
import {
    Director, TStackOperation,
} from '../engine/core/app/internal/director';

new Engine( {
                canvasFallbacks: [ '#black-board', '.black-board', 'canvas' ],
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                autoStart: false,
                backgroundColor: 0x6495ed,
                width: 960,
                height: 640,
                maxFPS: 60,
                minFPS: 30,
                debug: true,
                systems: [
                    NativeEventSystem.shared,
                    NewsSystem.shared,
                    StatsSystem.shared,
                    Director.shared,
                ],
                onStarted: ( _engine : Engine ) => {
                    Director.shared.onStackSignal.connect( ( type : TStackOperation, current : Scene, prev : Scene ) => {
                        logger.info( 'SceneStack Operation: ', type, current.name, prev?.name );
                    } );
                    Director.shared.runScene( new Scene() );
                },
                onSystemMounted: ( engine : Engine, system : System ) => {
                    logger.debug( `System<${ system.name }> Priority<${ system.priority }>` );
                    if ( system instanceof NativeEventSystem ) {
                        // Applying your own screen adaption strategy here
                        NativeEventSystem.shared.onWindowResized.connect( () => {
                            const {
                                clientWidth: width, clientHeight: height,
                            } = document.documentElement;
                            engine.root.transform.pivot.set( width * 0.5, height * 0.5 );
                            engine.renderer.resize( width, height );
                            logger.info( 'screen resized', width, height );
                        } );
                        // Applying at once
                        NativeEventSystem.shared.onWindowResized.emit();
                    }
                },
            } ).run();

