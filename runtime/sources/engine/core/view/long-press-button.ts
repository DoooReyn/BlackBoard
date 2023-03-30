import { FederatedPointerEvent, Ticker } from 'pixi.js';
import { prefills, Signals } from '../util';
import {
    Button, IButtonBaseOptions, IButtonTriggerOptions, TButtonTrigger,
} from './button';

export interface ILongPressButtonBaseOptions extends IButtonBaseOptions {
    longPress? : {
        enabled : boolean; interval : number; trigger : number;
    };
}

export interface ILongPressButtonTriggerOptions extends IButtonTriggerOptions {
    onLongPressDown? : TButtonTrigger;
    onLongPressUp? : TButtonTrigger;
    onLongPressLeave? : TButtonTrigger;
}

export interface ILongPressButtonOptions extends ILongPressButtonBaseOptions,
                                                 ILongPressButtonTriggerOptions {}

export class LongPressButton extends Button {

    public onLongPressDown : Signals<TButtonTrigger>;
    public onLongPressUp : Signals<TButtonTrigger>;
    public onLongPressLeave : Signals<TButtonTrigger>;
    protected _isLongPressed : boolean;
    protected _longPressStartTime : number;
    protected _longTicker : Ticker;

    public constructor( options : ILongPressButtonOptions ) {
        super( options );

        options.longPress = options.longPress || {
            enabled: false,
            trigger: 1.0,
            interval: 0.1,
        };

        prefills( options.longPress, [
            [ 'enabled', true ], [ 'trigger', 1.0 ], [ 'interval', 0.1 ],
        ] );

        this.onLongPressDown = new Signals<TButtonTrigger>();
        this.onLongPressUp = new Signals<TButtonTrigger>();
        this.onLongPressLeave = new Signals<TButtonTrigger>();
        options.onLongPressDown && this.onLongPressDown.connect( options.onLongPressDown );
        options.onLongPressUp && this.onLongPressUp.connect( options.onLongPressUp );
        options.onLongPressLeave && this.onLongPressLeave.connect( options.onLongPressLeave );

        this._longTicker = new Ticker();
        this._longTicker.autoStart = false;
        this._longTicker.add( this._longPressCounter, this );
    }

    public get longPressEnabled() {
        return this._options.longPress.enabled;
    }

    public set longPressEnabled( e : boolean ) {
        this._options.longPress.enabled = e;
    }

    protected override _onInit() {
        super._onInit();

        this._isLongPressed = false;
    }

    protected override _onPointerCancel( e : FederatedPointerEvent ) {
        super._onPointerCancel( e );

        this._isLongPressed = false;
        this._longTicker.stop();
        this.onLongPressLeave.emit( this, e );
    }

    protected override _onPointerDown( e : FederatedPointerEvent ) {
        super._onPointerDown( e );

        this._isLongPressed = false;
        if ( this._options.longPress.enabled ) {
            this._longPressStartTime = 0;
            this._longTicker.start();
        }
    }

    protected override _onPointerOut( e : FederatedPointerEvent ) {
        super._onPointerOut( e );

        if ( !this._isDown ) {
            this._isLongPressed = false;
            this._longTicker.stop();
        }
    }

    protected override _onPointerUp( e : FederatedPointerEvent ) {
        super._onPointerUp( e );

        this._isLongPressed = false;
        this._longTicker.stop();
    }

    protected override _onReset() {
        super._onReset();

        this._longTicker.stop();
    }

    protected override _options : ILongPressButtonBaseOptions;

    protected _longPressCounter( _dt : number ) {
        this._longPressStartTime += this._longTicker.deltaMS / 1000;
        if ( this._isLongPressed ) {
            if ( this._longPressStartTime >= this._options.longPress.interval ) {
                this._longPressStartTime = 0;
                this.onLongPressDown.emit( this );
            }
        } else {
            if ( this._longPressStartTime >= this._options.longPress.trigger ) {
                this._longPressStartTime = 0;
                this._isLongPressed = true;
                this.onLongPressDown.emit( this );
            }
        }
    }
}