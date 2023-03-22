import { Application, Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { IGame, IGameOptions, IScene, IStats, IView } from '../../interface';
import { logger, progressive } from '../util';
import { Scene } from './scene';
import { Stats } from './stats';

class Game implements IGame {
    protected readonly _app : Application;
    private readonly _debug : boolean;

    constructor( options : IGameOptions ) {
        const { width, height, canvasFallbacks, debugMode } = options;

        debugMode ? logger.enable() : logger.disable();
        debugMode && ( ( window as any ).BlackBoard = this );
        this._debug = debugMode || false;

        if ( !options.view && canvasFallbacks ) {
            options.view = progressive<HTMLCanvasElement, string>( canvasFallbacks, document.querySelector, document );
        }

        const app = new Application( options );
        this._app = app;
        const { renderer, view, screen } = app;

        !options.view && document.body.appendChild( view as HTMLCanvasElement );

        this.ticker = app.ticker;
        this.ticker.maxFPS = options.maxFPS;
        this.ticker.minFPS = options.minFPS;

        this.view = {
            resolution: { width, height }, canvas: view, renderer, screen,
        };
        this.stats = new Stats( this );
        this.scene = new Scene( this );

        app.stage.addChild( this.scene );
        app.stage.addChild( this.stats );
        app.ticker.add( ( dt : number ) => {
            this.stats.update( dt );
        }, this, UPDATE_PRIORITY.UTILITY );
    }

    get debug() {
        return this._debug;
    }

    readonly scene : IScene;
    readonly stats : IStats;
    ticker : Ticker;
    view : IView;
}

function BlackBoard() {
    let _instance : Game = null;
    return {
        instance( options? : IGameOptions ) {
            if ( !_instance ) _instance = new Game( options );
            return _instance;
        },
    };
}

export const blackboard = BlackBoard();
