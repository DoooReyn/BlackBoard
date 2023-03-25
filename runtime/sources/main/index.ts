import {
    Engine, logger, NewsSystem, RenderSystem, Scene, System,
} from '../engine';
import { Director } from '../engine/core/app/internal/director';

new Engine( {
                canvasFallbacks: [ '#black-board', '.black-board', 'canvas' ],
                resolution     : window.devicePixelRatio || 1,
                autoDensity    : true,
                autoStart      : false,
                backgroundColor: 0x6495ed,
                width          : 960,
                height         : 640,
                maxFPS         : 60,
                minFPS         : 30,
                debug          : true,
                systems        : [
                    NewsSystem.shared, RenderSystem.shared,
                ],
                onStarted      : ( engine : Engine ) => {
                    Director.shared.runScene( new Scene() );
                    logger.debug( `Engine<${ engine.state }>, Scene<${ Director.shared.runningScene?.name }>` );
                },
                onSystemMounted: ( engine : Engine, system : System ) => {
                    logger.debug( `Engine<${ engine.state }>, System<${ system.name },${ system.priority }>` );
                },
            } ).run();

