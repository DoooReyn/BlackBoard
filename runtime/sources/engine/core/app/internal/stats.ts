import { Container, Renderer, Text } from 'pixi.js';
import { Drawcall } from './drawcall';
import { FPS } from './fps';

/**
 * The statistics container
 * - About Drawcall
 * - About FPS
 * - About Textures' count
 */
export class Stats extends Container {
    private _textFPS : Text;
    private _textDrawcall : Text;
    private _textTextures : Text;
    private _fps : FPS;
    private _drawcall : Drawcall;
    private _renderer : Renderer;

    constructor() {
        super();

        this._fps = new FPS();
        this._drawcall = new Drawcall();
        ( this._textFPS = Stats._makeText() ).setParent( this );
        ( this._textDrawcall = Stats._makeText() ).setParent( this );
        ( this._textTextures = Stats._makeText() ).setParent( this );
    }

    protected get _textures() {
        return this._renderer.texture ? this._renderer.texture.managedTextures.length : 0;
    }

    private static _makeText() {
        return new Text( '', {
            fontSize  : 14, fill: 0x323130, fontFamily: 'Monaco',
            fontWeight: 'bold',
        } );
    }

    init( renderer : Renderer ) {
        this._renderer = renderer;
        this._drawcall.bindRenderer( renderer );

        [
            this._textFPS, this._textDrawcall, this._textTextures,
        ].forEach( ( v, i ) => {
            v.position.set( 4, 4 + i * 18 );
        } );
    }

    update() {
        if ( this.renderable ) {
            this._fps.update();
            this._drawcall.update();
            this._textFPS.text = `FPS: ${ this._fps.value }`;
            this._textDrawcall.text = `DC: ${ this._drawcall.value }`;
            this._textTextures.text = `TC: ${ this._textures }`;

            this.position.set( this._renderer.width * 0.5, this._renderer.height * 0.5 );
        }
    }
}
