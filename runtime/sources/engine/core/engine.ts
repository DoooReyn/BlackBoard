import {
    Application, Container, IApplicationOptions, IRenderer, Ticker,
} from 'pixi.js';
import { System } from './system/system';
import {
    logger, Lovely, prefills, progressive, Signals, State, TimeCounter, TStates,
} from './util';

/**
 *
 * Engine states
 */
type TEngineStates = TStates | 'running' | 'paused';

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
    systems? : System[],
    onStarted? : TEngineTrigger;
    onPaused? : TEngineTrigger;
    onResumed? : TEngineTrigger;
    onSystemMounted? : TEngineTrigger;
    onSystemUnmounted? : TEngineTrigger;
    onSecUpdate? : TEngineUpdate;
    onFrameUpdate? : TEngineUpdate;
}

export type TEngineTrigger = ( engine : Engine, ...args : any[] ) => void;
export type TEngineUpdate = ( engine : Engine, delta : number ) => void;

/**
 * Engine
 * - Game entry
 * - Game loop
 */
export class Engine {
    public static shared : Engine = null;
    public onStartedSignal : Signals<TEngineTrigger>;
    public onPausedSignal : Signals<TEngineTrigger>;
    public onResumedSignal : Signals<TEngineTrigger>;
    public onSystemMountedSignal : Signals<TEngineTrigger>;
    public onSystemUnmountedSignal : Signals<TEngineTrigger>;
    public onSecUpdateSignal : Signals<TEngineUpdate>;
    public onFrameUpdateSignal : Signals<TEngineUpdate>;

    public renderer : IRenderer;
    public root : Container;
    public ticker: Ticker;

    private _timeCounter : TimeCounter;

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

    public constructor( options : IEngineOptions ) {
        Engine.shared = this;

        prefills( options, [
            [ 'debug', false ],
            [ 'minFPS', 30 ],
            [ 'maxFPS', 0 ],
        ] );

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
        this._timeCounter = new TimeCounter();
        this._lovely = new Lovely();

        // Construction of PixiJs application instance
        this._app = new Application( options );
        this._app.stage.name = '<Engine>Stage';
        this._app.ticker.autoStart = false;
        this._app.ticker.minFPS = options.minFPS;
        this._app.ticker.maxFPS = options.maxFPS;
        this._app.ticker.add( this._update, this );
        this.renderer = this._app.renderer;
        this.ticker = this._app.ticker;
        this.root = this._app.stage;
        this.root.sortableChildren = true;

        // pixi-inspector
        options.debug && ((window as any).__PIXI_APP__ = this._app);

        // Initializing states for engine instance
        this._state = new State<TEngineStates>( 'primitive', [
            [
                'primitive', 'running', this._onStarted, this,
            ], [
                'running', 'paused', this._onPaused, this,
            ], [
                'paused', 'running', this._onResumed, this,
            ],
        ] );

        // Keeping stage in the center of screen
        this._app.stage.transform.pivot.set( this._designWidth * 0.5, this._designHeight * 0.5 );

        // Construction of signals
        this.onStartedSignal = new Signals<TEngineTrigger>();
        this.onPausedSignal = new Signals<TEngineTrigger>();
        this.onResumedSignal = new Signals<TEngineTrigger>();
        this.onSystemMountedSignal = new Signals<TEngineTrigger>();
        this.onSystemUnmountedSignal = new Signals<TEngineTrigger>();
        this.onSecUpdateSignal = new Signals<TEngineUpdate>();
        this.onFrameUpdateSignal = new Signals<TEngineUpdate>();
        options.onStarted && this.onStartedSignal.connect( options.onStarted );
        options.onPaused && this.onPausedSignal.connect( options.onPaused );
        options.onResumed && this.onResumedSignal.connect( options.onResumed );
        options.onSystemMounted && this.onSystemMountedSignal.connect( options.onSystemMounted );
        options.onSystemUnmounted && this.onSystemUnmountedSignal.connect( options.onSystemUnmounted );
        options.onSecUpdate && this.onSecUpdateSignal.connect( options.onSecUpdate );
        options.onFrameUpdate && this.onFrameUpdateSignal.connect( options.onFrameUpdate );

        // Mounting systems
        if ( options.systems && options.systems.length > 0 ) {
            this.mount( ...options.systems );
        }
    }

    public get running() {
        return this._state.is( 'running' );
    }

    public get designWidth() : number {
        return this._designWidth;
    }

    public get designHeight() : number {
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
                sys.attach( this );
                this.onSystemMountedSignal.emit( this, sys );
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
            sys.detach( this );
            this.onSystemUnmountedSignal.emit( this, sys );
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
     * Called when engine started
     * @protected
     */
    protected _onStarted() {
        this._app.ticker.start();
        this.onStartedSignal.emit( this );
    }

    /**
     * Called when engine paused
     * @protected
     */
    protected _onPaused() {
        this._app.ticker.stop();
        this.onPausedSignal.emit( this );
    }

    /**
     * Called when engine resumed
     * @protected
     */
    protected _onResumed() {
        this._app.ticker.start();
        this.onResumedSignal.emit( this );
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

        const elapsed = this._timeCounter.elapsed;
        if ( elapsed >= 1000 ) {
            this._timeCounter.update();
            this.onSecUpdateSignal.emit( this, elapsed );
        }

        this.onFrameUpdateSignal.emit( this, delta );
    }
}
