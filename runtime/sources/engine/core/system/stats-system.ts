import { Container, Graphics, Renderer, Text } from 'pixi.js';
import { EZIndex } from '../../enum';
import { Engine } from '../engine';
import { ESystemPriority, System } from './system';

function makeText() {
    return new Text( '', {
        fontSize: 14,
        fill: 0x323130,
        fontFamily: 'Monaco',
        fontWeight: 'bold',
    } );
}

class Stats extends Container {
    private readonly _textFPS : Text;
    private readonly _textDrawcall : Text;
    private readonly _textTextures : Text;
    private readonly _frameGraphics : Graphics;

    constructor() {
        super();

        this._textFPS = makeText();
        this._textDrawcall = makeText();
        this._textTextures = makeText();
        this._frameGraphics = new Graphics();
        this.addChild( this._frameGraphics, this._textFPS, this._textDrawcall, this._textTextures );
    }

    init() {
        this._frameGraphics.beginFill( 0x99e329, 0.2 );
        this._frameGraphics.lineStyle( { width: 0 } );
        this._frameGraphics.drawRect( 0, 0, 64, 64 );
        this._frameGraphics.endFill();
        [
            this._textFPS, this._textDrawcall, this._textTextures,
        ].forEach( ( v, i ) => {
            v.position.set( 4, 4 + i * 18 );
        } );
    }

    update( fps : number, drawcalls : number, textures : number ) {
        this._textFPS.text = `FPS: ${ fps }`;
        this._textDrawcall.text = `DC: ${ drawcalls }`;
        this._textTextures.text = `TC: ${ textures }`;
    }
}

export class StatsSystem extends System {
    private _fps : number;
    private _drawcall : number;
    private _stats : Stats;

    constructor() {
        super();

        this._fps = 0;
        this._drawcall = 0;
    }

    private static _shared : StatsSystem = null;

    public static get shared() {
        if ( !StatsSystem._shared ) {
            StatsSystem._shared = new StatsSystem();
        }
        return StatsSystem._shared;
    }

    /**
     * Showing the container of Stats
     */
    public showStats() {
        this._stats && ( this._stats.renderable = true );
    }

    /**
     * Hiding the container of Stats
     */
    public hideStats() {
        this._stats && ( this._stats.renderable = false );
    }

    protected _onAttached( engine : Engine ) : void {
        if ( engine.debug && !this._stats ) {
            this._stats = new Stats();
            this._stats.setParent( engine.root );
            this._stats.zIndex = EZIndex.Stats;
            this._stats.init();
            this._bindRenderer( engine );
        }
    }

    protected _onDetached( engine : Engine ) : void {
        if ( this._stats ) {
            this._unbindRenderer( engine );
            this._stats.destroy();
            this._stats = null;
        }
    }

    protected _onPaused( _engine : Engine ) : void {
    }

    protected _onResumed( _engine : Engine ) : void {
    }

    protected _onStarted( _engine : Engine ) : void {
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
        ++this._fps;
        this._drawcall = 0;
    }

    public get priority() : number {
        return ESystemPriority.Stats;
    }

    public secUpdate( engine : Engine, _delta : number ) : void {
        if ( engine.debug && this._stats ) {
            this._stats.update( this._fps, this._drawcall, this._getRendererTextures( engine ) );
            this._fps = 0;
            this._drawcall = 0;
        }
    }

    private _bindRenderer( engine : Engine ) {
        const renderer = engine.renderer as Renderer;
        if ( renderer.gl ) {
            // @ts-ignore
            renderer.gl._drawElements = renderer.gl.drawElements;
            renderer.gl.drawElements = ( ...args : any[] ) => {
                // @ts-ignore
                renderer.gl._drawElements.call( renderer.gl, ...args );
                ++this._drawcall;
            };
        }
    }

    private _unbindRenderer( engine : Engine ) {
        const renderer = engine.renderer as Renderer;
        if ( renderer.gl ) {
            // @ts-ignore
            renderer.gl.drawElements = renderer.gl._drawElements;
        }
    }

    private _getRendererTextures( engine : Engine ) {
        if ( 'texture' in engine.renderer ) {
            //@ts-ignore
            return engine.renderer.texture.managedTextures.length;
        }
        return 0;
    }

}