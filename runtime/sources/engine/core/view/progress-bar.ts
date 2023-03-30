import TWEEN, { Tween } from '@tweenjs/tween.js';
import { Rectangle, Sprite } from 'pixi.js';
import {
    changeTexture, math, pickKeysFromObject, responsive, Signals,
} from '../util';
import { View } from './view';

export type TProgressBarTrigger = ( bar : ProgressBar, progress : number ) => void;

export interface IProgressBarBaseOptions {
    progress : number;
    background : string;
    foreground : string;
}

export interface IProgressBarTriggerOptions {
    onProgressChanged? : TProgressBarTrigger;
}

export interface IProgressBarOptions extends IProgressBarBaseOptions,
                                             IProgressBarTriggerOptions {}

export class ProgressBar extends View {
    public onProgressChanged : Signals<TProgressBarTrigger>;
    protected _background : Sprite;
    protected _foreground : Sprite;
    protected _options : IProgressBarBaseOptions;
    protected _tween : Tween<{ progress : number; }>;

    constructor( options : IProgressBarOptions ) {
        super();

        this.onProgressChanged = new Signals<TProgressBarTrigger>();
        options.onProgressChanged && this.onProgressChanged.connect( options.onProgressChanged );

        this._progress = options.progress = math.clamp( options.progress, 0, 1 );

        this._background = new Sprite();
        this._foreground = new Sprite();
        this._background.anchor.set( 0, 0.5 );
        this._foreground.anchor.set( 0, 0.5 );
        this.addChild( this._background, this._foreground );

        this._options = pickKeysFromObject( options, [
            'background', 'foreground', 'progress',
        ] ) as IProgressBarBaseOptions;
    }

    private _progress : number;

    get progress() {
        return this._progress;
    }

    set progress( v : number ) {
        this._progress = math.clamp( v, 0, 1 );
        this._onProgressChanged();
        this.onProgressChanged.emit( this, this._progress );
    }

    stop() {
        if ( this._tween ) {
            TWEEN.remove( this._tween );
            this._tween = null;
        }
    }

    to( ended : number, duration : number ) {
        this.stop();

        let target = { progress: this.progress };
        let to = math.clamp( ended, 0, 1 );
        this._tween = new Tween<{ progress : number }>( target );
        this._tween.to( { progress: to }, duration * 1000 )
            .onUpdate( () => this.progress = target.progress )
            .onComplete( () => this.stop() )
            .start();
    }

    protected _onProgressChanged() {
        // TODO: line-bar
        const {
            width,
            height,
        } = this._foreground.texture.baseTexture;
        this._foreground.texture.frame = new Rectangle( 0, 0, width * this._progress, height );
    }

    protected _onTextureLoaded() {
        this.pivot.set( this._background.width * 0.5, this._background.height * 0.5 );
        this._background.position.set( 0 );
        // TODO: line-bar
        const texture = this._foreground.texture;
        texture.frame.width = texture.baseTexture.width * this._progress;
        this._foreground.position.x = ( this._background.width - texture.baseTexture.width ) * 0.5;
    }

    protected override _onInit() {
        super._onInit();

        let res = responsive( 2 );
        res.connect( () => {
            if ( res.read() <= 0 ) {
                this._onTextureLoaded();
                res = null;
            }
        } );

        function next() {
            res.write( res.read() - 1 );
        }

        changeTexture( this._background, this._options.background, next );
        changeTexture( this._foreground, this._options.foreground, next );
    }

    protected override _onReset() {
        super._onReset();

        this.stop();
    }
}