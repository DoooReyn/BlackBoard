import type { Engine, TEngineActions } from './engine';

/**
 * A system is an instance which keeping updating loop.
 * It is recommended to specify well-managed priority for them.
 */
export abstract class System {
    /**
     * Reference of engine instance
     * @type {Engine}
     * @protected
     */
    protected _engine : Engine;

    /**
     * The priority of system
     * @returns {number}
     */
    public abstract get priority() : number;

    /**
     * Notice comes from engine instance.
     * - It should be called internally by engine in general.
     * @param {TEngineActions} action
     * @param args
     */
    public notify( action : TEngineActions, ...args : any[] ) {
        if ( typeof action === 'string' ) {
            // @ts-ignore
            const api = this[ `_${ action }` ];
            if ( typeof api === 'function' ) {
                // @ts-ignore
                api.apply( this, args );
            }
        }
    }

    /**
     * Updating loop
     * - Automatically called by engine instance
     * @param {number} delta
     */
    public abstract update( delta : number ) : void;

    /**
     * Attached to engine
     * - Automatically called by engine instance
     * @param {Engine} engine
     */
    protected _onAttached( engine : Engine ) {
        this._engine = engine;
    }

    /**
     * Detached from engine
     * - Automatically called by engine instance
     */
    protected abstract _onDetached() : void;

    /**
     * Called when engine started
     * - Automatically called by engine instance
     * @protected
     */
    protected abstract _onStarted() : void;

    /**
     * Called when engine paused
     * - Automatically called by engine instance
     * @protected
     */
    protected abstract _onPaused() : void;

    /**
     * Called when engine resumed
     * - Automatically called by engine instance
     * @protected
     */
    protected abstract _onResumed() : void;
}
