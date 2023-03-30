import type { Engine } from '../engine';

export enum ESystemPriority {
    Input, News, Stats, Tween, Director
}

/**
 * A system is an instance which keeping updating loop.
 * It is recommended to specify well-managed priority for them.
 */
export abstract class System {
    private readonly _name : string;

    protected constructor() {
        this._name = this.constructor.name;
    }

    public get name() {
        return this._name;
    }

    /**
     * The priority of system
     * @returns {number}
     */
    public abstract get priority() : number;

    /**
     * Attached to the engine instance
     * @param {Engine} engine
     */
    public attach( engine : Engine ) {
        engine.onStartedSignal.connect( this._onStarted, this );
        engine.onPausedSignal.connect( this._onPaused, this );
        engine.onResumedSignal.connect( this._onResumed, this );
        engine.onSecUpdateSignal.connect( this.secUpdate, this );
        engine.onFrameUpdateSignal.connect( this.frameUpdate, this );
        this._onAttached( engine );
    }

    /**
     * Detach from the engine instance
     * @param {Engine} engine
     */
    public detach( engine : Engine ) {
        engine.onStartedSignal.disconnect( this._onStarted, this );
        engine.onPausedSignal.disconnect( this._onPaused, this );
        engine.onResumedSignal.disconnect( this._onResumed, this );
        engine.onSecUpdateSignal.disconnect( this.secUpdate, this );
        engine.onFrameUpdateSignal.disconnect( this.frameUpdate, this );
        this._onDetached( engine );
    }

    /**
     * Updating loop in frame
     * - Automatically called by engine instance
     * @param engine
     * @param {number} delta
     */
    public abstract frameUpdate( engine : Engine, delta : number ) : void;

    /**
     * Updating loop in second
     * @param {Engine} engine
     * @param {number} delta
     */
    public abstract secUpdate( engine : Engine, delta : number ) : void;

    /**
     * Attached to engine
     * - Automatically called by engine instance
     * - Get the initialization work done here
     * @param {Engine} engine
     * @protected
     */
    protected abstract _onAttached( engine : Engine ) : void;

    /**
     * Detached from engine
     * - Automatically called by engine instance
     * - Get destruction work done here
     * @param {Engine} engine
     * @protected
     */
    protected abstract _onDetached( engine : Engine ) : void;

    /**
     * Called when engine started
     * - Automatically called by engine instance
     * @param {Engine} engine
     * @protected
     */
    protected abstract _onStarted( engine : Engine ) : void;

    /**
     * Called when engine paused
     * - Automatically called by engine instance
     * @param {Engine} engine
     * @protected
     */
    protected abstract _onPaused( engine : Engine ) : void;

    /**
     * Called when engine resumed
     * - Automatically called by engine instance
     * @param {Engine} engine
     * @protected
     */
    protected abstract _onResumed( engine : Engine ) : void;
}
