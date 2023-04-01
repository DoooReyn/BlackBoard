import * as TWEEN from '@tweenjs/tween.js';
import { Engine } from '../engine';
import { ESystemPriority, System } from './system';

/**
 * TODO: Adding support for the 'Groups'
 */
export class TweenSystem extends System {
    private _lastTime : number;

    protected constructor() {
        super();

        this._lastTime = TWEEN.now();
    }

    private static _shared : TweenSystem = null;

    public static get shared() {
        if ( !TweenSystem._shared ) {
            TweenSystem._shared = new TweenSystem();
        }
        return TweenSystem._shared;
    }

    protected _onAttached( _engine : Engine ) : void {
    }

    protected _onDetached( _engine : Engine ) : void {
        TWEEN.removeAll();
    }

    protected _onPaused( _engine : Engine ) : void {}

    protected _onResumed( _engine : Engine ) : void {}

    protected _onStarted( _engine : Engine ) : void {
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
        this._lastTime += _engine.ticker.deltaMS;
        TWEEN.update( this._lastTime );
    }

    public get priority() : number {
        return ESystemPriority.Tween;
    }

    public secUpdate( _engine : Engine, _delta : number ) : void {
    }

}