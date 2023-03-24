import { Application, IApplicationOptions } from 'pixi.js';
import { logger, Lovely, prefills, progressive } from '../util';
import { State, TStates } from '../util/state';
import { System } from './system/system';

/**
 * Engine states
 */
type TEngineStates = TStates | 'running' | 'paused';

/**
 * Engine events
 */
export enum EngineEvent {
    OnStarted = '_onStartedCb',
    OnPaused = '_onPausedCb',
    OnResumed = '_onResumedCb',
    OnSystemMounted = '_onSystemMountedCb',
    OnSystemUnmounted = '_onSystemUnmountedCb'
}

/**
 * Engine actions
 */
export type TEngineActions =
    'onStarted'
    | 'onPaused'
    | 'onResumed'
    | 'onAttached'
    | 'onDetached'

/**
 * Options for constructing engine instance
 */
export interface IEngineOptions extends IApplicationOptions {
    // Fallbacks of the canvas element in DOM
    canvasFallbacks? : string[];
    debug? : boolean;
    width : number;
    height : number;
    maxFPS : number;
    minFPS : number;
}

/**
 * Engine
 * - Game entry
 * - Game loop
 */
export class Engine {
    /**
     * Updating systems
     * @type {System[]}
     * @private
     */
    private _systems : System[];

    /**
     * A dirty flag for sorting systems
     * @type {Lovely}
     * @private
     */
    private _lovely : Lovely;

    /**
     * PixiJS App instance
     * @type {Application}
     * @private
     */
    private _app : Application;

    /**
     * A flag to specify whether it is debug mode or not
     * @type {boolean}
     * @private
     */
    private readonly _debug : boolean;
    /**
     * The designed width of screen
     * @type {number}
     * @private
     */
    private readonly _designWidth : number;
    /**
     * The designed height of screen
     * @type {number}
     * @private
     */
    private readonly _designHeight : number;

    private _onStartedCb : ( engine : Engine ) => void;
    private _onPausedCb : ( engine : Engine ) => void;
    private _onResumedCb : ( engine : Engine ) => void;
    private _onSystemMountedCb : ( engine : Engine, sys : System ) => void;
    private _onSystemUnmountedCb : ( engine : Engine, sys : System ) => void;

    public constructor( options : IEngineOptions ) {
        prefills( options, [ [ 'debug', false ] ] );

        if ( !options.view && options.canvasFallbacks ) {
            const {
                querySelector, body,
            } = document;
            const view = progressive( options.canvasFallbacks, querySelector, document ) as HTMLCanvasElement;
            body.appendChild( view as HTMLCanvasElement );
            options.view = view;
        }

        // Initializing logger
        options.debug ? logger.enable() : logger.disable();

        this._designWidth = options.width;
        this._designHeight = options.height;
        this._systems = [];
        this._debug = options.debug;
        this._lovely = new Lovely();

        // Construction of PixiJs application instance
        this._app = new Application( options );
        this._app.stage.name = '<Engine>Stage';
        this._app.ticker.autoStart = false;
        this._app.ticker.minFPS = options.minFPS;
        this._app.ticker.maxFPS = options.maxFPS;
        this._app.ticker.add( this._update, this );

        // Initializing states for engine instance
        this._state = new State<TEngineStates>( 'primitive', [
            [ 'primitive', 'running', this._onStarted, this ],
            [ 'running', 'paused', this._onPaused, this ],
            [ 'paused', 'running', this._onResumed, this ],
        ] );

        // Keeping stage in the center of screen
        this._app.stage.transform.pivot.set( this._designWidth * 0.5, this._designHeight * 0.5 );
    }

    get designWidth() : number {
        return this._designWidth;
    }

    get designHeight() : number {
        return this._designHeight;
    }

    /**
     * Whether debug mode or not
     * @returns {boolean}
     */
    public get debug() {
        return this._debug;
    }

    /**
     * Instance of engine state
     * @type {State<TEngineStates>}
     * @private
     */
    private _state : State<TEngineStates>;

    /**
     * Engine's current state
     * @returns {Partial<TEngineStates>}
     */
    public get state() {
        return this._state.state;
    }

    /**
     * Mounting `System` with specified priority to manage its own state,
     * such as rendering and animation.
     * @param systems
     */
    public mount( ...systems : System[] ) {
        for ( let i = 0; i < systems.length; i++ ) {
            const sys = systems[ i ];
            if ( this._systems.indexOf( sys ) === -1 ) {
                this._systems.push( sys );
                this._lovely.trick();
                sys.notify( 'onAttached', this );
                this._onSystemMountedCb && this._onSystemMountedCb( this, sys );
            }
        }
        return this;
    }

    /**
     * Unmounting `System`
     * @param {System} sys
     */
    public unmount( sys : System ) {
        let i = this._systems.indexOf( sys );
        if ( i > -1 ) {
            this._systems.splice( i, 1 );
            this._lovely.trick();
            sys.notify( 'onDetached' );
            this._onSystemUnmountedCb && this._onSystemUnmountedCb( this, sys );
        }
    }

    /**
     * Running engine to start updating loop
     */
    public run() {
        this._state.is( 'primitive' ) && this._state.transit( 'running' );
    }

    /**
     * Pausing engine to pause updating loop
     */
    public pause() {
        this._state.is( 'running' ) && this._state.transit( 'paused' );
    }

    /**
     * Resuming engine to resume updating loop
     */
    public resume() {
        this._state.is( 'paused' ) && this._state.transit( 'running' );
    }

    /**
     * When to do
     * @param {EngineEvent} event
     * @param {(engine: Engine) => void} fn
     * @param context
     * @returns {this}
     */
    public when( event : EngineEvent, fn : ( engine : Engine, ...args : any[] ) => void, context? : any ) {
        this[ event ] = fn.bind( context );
        return this;
    }

    /**
     * Called when engine started
     * @protected
     */
    protected _onStarted() {
        this._app.ticker.start();
        this._systems.forEach( v => v.notify( 'onStarted' ) );
        this._onStartedCb && this._onStartedCb( this );
    }

    /**
     * Called when engine paused
     * @protected
     */
    protected _onPaused() {
        this._app.ticker.stop();
        this._systems.forEach( v => v.notify( 'onPaused' ) );
        this._onPausedCb && this._onPausedCb( this );
    }

    /**
     * Called when engine resumed
     * @protected
     */
    protected _onResumed() {
        this._app.ticker.start();
        this._systems.forEach( v => v.notify( 'onResumed' ) );
        this._onResumedCb && this._onResumedCb( this );
    }

    /**
     * Before updating loop, sorting systems by priority in descending order
     * will be done.
     * @param {number} delta
     * @private
     */
    private _update( delta : number ) {
        if ( this._state.not( 'running' ) ) return;

        if ( this._lovely.angry ) {
            this._lovely.treat();
            this._systems.sort( ( v1, v2 ) => {
                return v1.priority - v2.priority;
            } );
        }

        this._systems.forEach( v => v.update( delta ) );
    }
}
