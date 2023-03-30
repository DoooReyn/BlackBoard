import * as TWEEN from '@tweenjs/tween.js';
import { Engine } from '../engine';
import { ESystemPriority, System } from './system';

export class TweenSystem extends System {

    /**
     * Because pausing 'tween' will remove it from the 'group'.
     * And only it could resume itself.
     * Therefore, it is necessary to keep them when the 'director' paused,
     * and to resume them when the 'director' resumed.
     * @type {Tween<any>[]}
     * @private
     */
    private _pauses : TWEEN.Tween<any>[] = null;

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

    protected _onPaused( _engine : Engine ) : void {
        TWEEN.getAll().forEach( v => {
            if ( v.isPlaying() ) {
                this._pauses = this._pauses || [];
                this._pauses.push( v );
                v.pause();
            }
        } );
    }

    protected _onResumed( _engine : Engine ) : void {
        if ( this._pauses && this._pauses.length > 0 ) {
            this._pauses.forEach( v => v.resume() );
            this._pauses = null;
        }
    }

    protected _onStarted( _engine : Engine ) : void {
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
        TWEEN.update();
    }

    public get priority() : number {
        return ESystemPriority.Tween;
    }

    public secUpdate( _engine : Engine, _delta : number ) : void {
    }

}