import { FederatedPointerEvent, Sprite, Ticker } from 'pixi.js';
import { changeTexture, pickKeysFromObject, prefills, Signals } from '../util';
import { View } from './view';

export type TButtonTrigger = ( button : Button, event? : FederatedPointerEvent ) => void;

export interface IButtonBaseOptions {
    interactive? : boolean;
    textures : {
        normal : string; press : string; hover : string; disable : string;
    },
    zooming? : {
        enabled : boolean; scale : number;
    },
    longPress? : {
        enabled : boolean; interval : number; trigger : number;
    };
}

export interface IButtonTriggerOptions {
    onPressDown? : TButtonTrigger;
    onPressUp? : TButtonTrigger;
    onPressLeave? : TButtonTrigger;
    onPressTap? : TButtonTrigger;
    onHoverIn? : TButtonTrigger;
    onHoverOut? : TButtonTrigger;
    onLongPressDown? : TButtonTrigger;
    onLongPressUp? : TButtonTrigger;
    onLongPressLeave? : TButtonTrigger;
}

export interface IButtonOptions extends IButtonBaseOptions,
                                        IButtonTriggerOptions {}

export type TButtonState = 'normal' | 'disable' | 'press' | 'hover'

export class Button extends View {
    public onPressDown : Signals<TButtonTrigger>;
    public onPressUp : Signals<TButtonTrigger>;
    public onPressLeave : Signals<TButtonTrigger>;
    public onPressTap : Signals<TButtonTrigger>;
    public onHoverIn : Signals<TButtonTrigger>;
    public onHoverOut : Signals<TButtonTrigger>;
    public onLongPressDown : Signals<TButtonTrigger>;
    public onLongPressUp : Signals<TButtonTrigger>;
    public onLongPressLeave : Signals<TButtonTrigger>;

    protected _background : Sprite;
    protected _options : IButtonBaseOptions;
    protected _isDown : boolean;
    protected _isLongPressed : boolean;
    protected _longPressStartTime : number;
    protected _longTicker : Ticker;

    public constructor( options : IButtonOptions ) {
        super();

        options.zooming = options.zooming || {
            enabled: true,
            scale: 0.95,
        };

        options.longPress = options.longPress || {
            enabled: false,
            trigger: 1.0,
            interval: 0.1,
        };

        prefills( options, [
            [ 'interactive', true ], [ 'state', 'normal' ],
        ] );

        prefills( options.zooming, [
            [ 'enabled', true ], [ 'scale', 0.95 ], [ 'interval', 0.03 ],
        ] );

        prefills( options.longPress, [
            [ 'enabled', true ], [ 'trigger', 1.0 ], [ 'interval', 0.1 ],
        ] );

        this._options = pickKeysFromObject( options, [
            'textures', 'zooming', 'longPress', 'interactive', 'state',
        ] ) as IButtonBaseOptions;

        this.onPressDown = new Signals<TButtonTrigger>();
        this.onPressUp = new Signals<TButtonTrigger>();
        this.onPressLeave = new Signals<TButtonTrigger>();
        this.onPressTap = new Signals<TButtonTrigger>();
        this.onHoverIn = new Signals<TButtonTrigger>();
        this.onHoverOut = new Signals<TButtonTrigger>();
        this.onLongPressDown = new Signals<TButtonTrigger>();
        this.onLongPressUp = new Signals<TButtonTrigger>();
        this.onLongPressLeave = new Signals<TButtonTrigger>();
        options.onPressDown && this.onPressDown.connect( options.onPressDown );
        options.onPressUp && this.onPressUp.connect( options.onPressUp );
        options.onPressLeave && this.onPressLeave.connect( options.onPressLeave );
        options.onPressTap && this.onPressTap.connect( options.onPressTap );
        options.onHoverIn && this.onHoverIn.connect( options.onHoverIn );
        options.onHoverOut && this.onHoverOut.connect( options.onHoverOut );
        options.onLongPressDown && this.onLongPressDown.connect( options.onLongPressDown );
        options.onLongPressUp && this.onLongPressUp.connect( options.onLongPressUp );
        options.onLongPressLeave && this.onLongPressLeave.connect( options.onLongPressLeave );

        this._background = new Sprite();
        this.addChild( this._background );
        changeTexture( this._background, options.textures.normal, ( texture ) => {
            this.pivot.set( texture.width * 0.5, texture.height * 0.5 );
        } );

        this._longTicker = new Ticker();
        this._longTicker.autoStart = false;
        this._longTicker.add( this._longPressCounter, this );
    }

    protected _state : TButtonState;

    public set state( s : TButtonState ) {
        if ( this._state !== s ) {
            this._state = s;
            changeTexture( this._background, this._options.textures[ s ] );
        }
    }

    public get zoomEnabled() {
        return this._options.zooming.enabled;
    }

    public set zoomEnabled( e : boolean ) {
        this._options.zooming.enabled = e;
    }

    public get longPressEnabled() {
        return this._options.longPress.enabled;
    }

    public set longPressEnabled( e : boolean ) {
        this._options.longPress.enabled = e;
    }

    override set interactive( en : boolean ) {
        super.interactive = en;
        this.state = en ? 'normal' : 'disable';
    }

    public loadTextures( textures : { normal? : string; press? : string; hover? : string; disable? : string; } ) {
        for ( let key in textures ) {
            // @ts-ignore
            this._options.textures [ key ] = textures[ key ];
        }
    }

    protected override _onInit() {
        super._onInit();

        this._isDown = false;
        this._isLongPressed = false;
        this.state = 'normal';
        this.interactive = this._options.interactive;

        this.on( 'pointerdown', this._onPointerDown, this );
        this.on( 'pointerup', this._onPointerUp, this );
        this.on( 'pointerupoutside', this._onPointerCancel, this );
        this.on( 'pointerover', this._onPointerIn, this );
        this.on( 'pointerout', this._onPointerOut, this );
        this.on( 'pointertap', this._onPointerTap, this );
    }

    protected override _onReset() {
        super._onReset();

        this.off( 'pointerdown', this._onPointerDown, this );
        this.off( 'pointerup', this._onPointerUp, this );
        this.off( 'pointerupoutside', this._onPointerCancel, this );
        this.off( 'pointerover', this._onPointerIn, this );
        this.off( 'pointerout', this._onPointerOut, this );
        this.off( 'pointertap', this._onPointerTap, this );

        this._longTicker.stop();
    }

    protected _onPointerDown( e : FederatedPointerEvent ) {
        this.state = 'press';
        this._isDown = true;
        this._isLongPressed = false;
        this._zoomIn();
        this.onPressDown.emit( this, e );

        if ( this._options.longPress.enabled ) {
            this._longPressStartTime = 0;
            this._longTicker.start();
        }
    }

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

    protected _onPointerUp( e : FederatedPointerEvent ) {
        this.state = 'normal';
        this._isDown = false;
        this._isLongPressed = false;
        this._longTicker.stop();
        this._zoomOut();
        this.onPressUp.emit( this, e );
    }

    protected _onPointerIn( e : FederatedPointerEvent ) {
        if ( !this._isDown ) {
            this.state = 'hover';
            this.onHoverIn.emit( this, e );
        }
    }

    protected _onPointerOut( e : FederatedPointerEvent ) {
        if ( !this._isDown ) {
            this.state = 'normal';
            this._isDown = false;
            this._isLongPressed = false;
            this._longTicker.stop();
            this.onHoverOut.emit( this, e );
        }
    }

    protected _onPointerCancel( e : FederatedPointerEvent ) {
        this.state = 'normal';
        this._isDown = false;
        this._isLongPressed = false;
        this._longTicker.stop();
        this._zoomOut();
        this.onPressLeave.emit( this, e );
        this.onLongPressLeave.emit( this, e );
    }

    protected _onPointerTap( e : FederatedPointerEvent ) {
        this.onPressTap.emit( this, e );
    }

    protected _zoomIn() {
        this._options.zooming.enabled && this.scale.set( this._options.zooming.scale );
    }

    protected _zoomOut() {
        this._options.zooming.enabled && this.scale.set( 1 );
    }
}