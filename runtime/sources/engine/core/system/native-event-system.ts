import { ENativeEvent } from '../../enum';
import { Signals } from '../util';
import { Engine } from '../engine';
import { System } from './system';

export type TNativeEventTrigger = () => void;

export class NativeEventSystem extends System {
    public onWindowResized : Signals<TNativeEventTrigger>;
    public onWindowEntered : Signals<TNativeEventTrigger>;
    public onWindowExited : Signals<TNativeEventTrigger>;
    private readonly _onWindowSizeChangedBinding : () => void;
    private readonly _windowVisibilityChangedBinding : () => void;
    private _sizeChanged : boolean;

    protected constructor() {
        super();

        this._sizeChanged = false;
        this.onWindowResized = new Signals<TNativeEventTrigger>();
        this.onWindowEntered = new Signals<TNativeEventTrigger>();
        this.onWindowExited = new Signals<TNativeEventTrigger>();
        this._onWindowSizeChangedBinding = this._onWindowSizeChanged.bind( this );
        this._windowVisibilityChangedBinding = this._windowVisibilityChanged.bind( this );
    }

    private static _shared : NativeEventSystem = null;

    public static get shared() {
        if ( !NativeEventSystem._shared ) {
            NativeEventSystem._shared = new NativeEventSystem();
        }
        return NativeEventSystem._shared;
    }

    protected _onAttached( _engine : Engine ) : void {
        window.addEventListener( ENativeEvent.Resize, this._onWindowSizeChangedBinding );
        document.addEventListener( ENativeEvent.Visibility, this._windowVisibilityChangedBinding );
    }

    protected _onDetached( _engine : Engine ) : void {
        window.removeEventListener( ENativeEvent.Resize, this._onWindowSizeChangedBinding );
        document.removeEventListener( ENativeEvent.Visibility, this._windowVisibilityChangedBinding );
    }

    protected _onPaused( _engine : Engine ) : void {
    }

    protected _onResumed( _engine : Engine ) : void {
    }

    protected _onStarted( _engine : Engine ) : void {
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
    }

    public get priority() : number {
        return 0;
    }

    public secUpdate( _engine : Engine, _delta : number ) : void {
        if ( this._sizeChanged ) {
            this._sizeChanged = false;
            this.onWindowResized.emit();
        }
    }

    protected _windowVisibilityChanged() {
        if ( document.visibilityState === 'visible' ) {
            this.onWindowEntered.emit();
            Engine.shared.resume();
        } else {
            this.onWindowExited.emit();
            Engine.shared.pause();
        }
    }

    protected _onWindowSizeChanged() {
        this._sizeChanged = true;
    }

}