import { FederatedPointerEvent, Sprite } from 'pixi.js';
import { changeTexture, pickKeysFromObject, prefills, Signals } from '../util';
import { View } from './view';

export type TButtonTrigger = ( button : Button, event? : FederatedPointerEvent ) => void;

export interface IButtonBaseOptions {
    interactive? : boolean;
    textures : {
        normal : string; press? : string; hover? : string; disable? : string;
    },
    zooming? : {
        enabled : boolean; scale : number;
    },
}

export interface IButtonTriggerOptions {
    onPressDown? : TButtonTrigger;
    onPressUp? : TButtonTrigger;
    onPressLeave? : TButtonTrigger;
    onPressTap? : TButtonTrigger;
    onHoverIn? : TButtonTrigger;
    onHoverOut? : TButtonTrigger;
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

    protected _background : Sprite;
    protected _options : IButtonBaseOptions;
    protected _isDown : boolean;

    public constructor( options : IButtonOptions ) {
        super();

        options.zooming = options.zooming || {
            enabled: true,
            scale: 0.95,
        };

        prefills( options, [
            [ 'interactive', true ], [ 'state', 'normal' ],
        ] );

        prefills( options.zooming, [
            [ 'enabled', true ], [ 'scale', 0.95 ], [ 'interval', 0.03 ],
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
        options.onPressDown && this.onPressDown.connect( options.onPressDown );
        options.onPressUp && this.onPressUp.connect( options.onPressUp );
        options.onPressLeave && this.onPressLeave.connect( options.onPressLeave );
        options.onPressTap && this.onPressTap.connect( options.onPressTap );
        options.onHoverIn && this.onHoverIn.connect( options.onHoverIn );
        options.onHoverOut && this.onHoverOut.connect( options.onHoverOut );

        this._background = new Sprite();
        this.addChild( this._background );

        changeTexture( this._background, options.textures.normal, ( texture ) => {
            this.pivot.set( texture.width * 0.5, texture.height * 0.5 );
        } );
    }

    protected _state : TButtonState;

    public set state( s : TButtonState ) {
        if ( this._state !== s ) {
            this._state = s;
            const source = this._options.textures[ s ] || this._options.textures.normal;
            changeTexture( this._background, source );
        }
    }

    public get zoomEnabled() {
        return this._options.zooming.enabled;
    }

    public set zoomEnabled( e : boolean ) {
        this._options.zooming.enabled = e;
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

    }

    protected _onPointerDown( e : FederatedPointerEvent ) {
        this.state = 'press';
        this._isDown = true;
        this._zoomIn();
        this.onPressDown.emit( this, e );
    }

    protected _onPointerUp( e : FederatedPointerEvent ) {
        this.state = 'normal';
        this._isDown = false;
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
            this.onHoverOut.emit( this, e );
        }
    }

    protected _onPointerCancel( e : FederatedPointerEvent ) {
        this.state = 'normal';
        this._isDown = false;
        this._zoomOut();
        this.onPressLeave.emit( this, e );
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