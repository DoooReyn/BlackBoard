import { Application, IApplicationOptions } from 'pixi.js';
import { logger, Lovely, prefills, progressive } from '../util';
import { State, TStates } from '../util/state';
import { System } from './system';

/**
 * Engine states
 */
type TEngineStates = TStates | 'running' | 'paused';

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

    public constructor( options : IEngineOptions ) {
        prefills( options, [ [ 'debug', false ] ] );

        if ( !options.view && options.canvasFallbacks ) {
            const { querySelector, body } = document;
            const view = progressive( options.canvasFallbacks, querySelector, document ) as HTMLCanvasElement;
            body.appendChild( view as HTMLCanvasElement );
            options.view = view;
        }

        options.debug ? logger.enable() : logger.disable();

        this._systems = [];
        this._app = new Application( options );
        this._app.ticker.autoStart = false;
        this._app.ticker.minFPS = options.minFPS;
        this._app.ticker.maxFPS = options.maxFPS;
        this._app.ticker.add( this._update, this );
        this._debug = options.debug;
        this._lovely = new Lovely();
        this._state = new State<TEngineStates>( 'primitive', [
            [ 'primitive', 'running', this._onStarted, this ],
            [ 'running', 'paused', this._onPaused, this ],
            [ 'paused', 'running', this._onResumed, this ],
        ] );
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
     * @param {System} sys
     */
    public mount( sys : System ) {
        if ( this._systems.indexOf( sys ) === -1 ) {
            this._systems.push( sys );
            this._lovely.trick();
            sys.notify( 'onAttached', this );
        }
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
        this._systems.forEach( v => v.notify( 'onStarted' ) );
    }

    /**
     * Called when engine paused
     * @protected
     */
    protected _onPaused() {
        this._app.ticker.stop();
        this._systems.forEach( v => v.notify( 'onPaused' ) );
    }

    /**
     * Called when engine resumed
     * @protected
     */
    protected _onResumed() {
        this._app.ticker.start();
        this._systems.forEach( v => v.notify( 'onResumed' ) );
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