import { Container, DisplayObject, Graphics, Text } from 'pixi.js';
import { IGame, IStats } from '../../interface';

export class Stats extends Container implements IStats {
    context : IGame;

    private readonly _fpTxt : Text;
    private readonly _dcTxt : Text;
    private readonly _tcTxt : Text;
    private readonly _sketch : Graphics;
    private _dcCounter : number;
    private _drawcalls : number;
    private _sec : number;

    constructor( context : IGame ) {
        super();

        this.context = context;
        this._sec = 0;
        this._drawcalls = 0;
        this._dcCounter = 0;

        this._fpTxt = Stats._createText();
        this._dcTxt = Stats._createText();
        this._tcTxt = Stats._createText();
        this._sketch = new Graphics();
        this.addChild( this._fpTxt, this._dcTxt, this._tcTxt, this._sketch );

        this._initStats();
    }

    private static _createText() {
        return new Text( '', {
            fontSize: 14,
            fill: 0xf00,
            fontFamily: 'Monaco',
            fontWeight: 'bold',
        } );
    }

    private _initStats() {
        const renderer : any = this.context.view.renderer;
        if ( renderer.gl ) {
            const { drawElements } = renderer.gl;
            renderer.gl.drawElements = ( ...args : any[] ) => {
                drawElements.call( renderer.gl, ...args );
                this._dcCounter++;
            };
        }

        [ this._fpTxt, this._dcTxt, this._tcTxt ].forEach( ( v, i ) => v.pivot.y = -i * 18 );
    }

    public drawTarget( o : DisplayObject ) {
        const { x, y, width, height } = o.getBounds();
        this._sketch.clear();
        this._sketch.lineStyle( 2, 0xffffff, 1 );
        this._sketch.drawRect( x, y, width, height );
    }

    public clearDraw() {
        this._sketch.clear();
    }

    public get textureUsed() {
        const renderer : any = this.context.view.renderer;
        if ( renderer.texture ) {
            return renderer.texture.managedTextures.length;
        }
        return 0;
    }

    public get drawcalls() {
        return this._drawcalls;
    }

    public get fps() {
        return this.context.ticker.FPS;
    }

    public show() {
        this.renderable = true;
    }

    public hide() {
        this.renderable = false;
    }

    public update( delta : number ) {
        const next = this._sec + delta / this.context.ticker.maxFPS;
        if ( ( next | 0 ) > this._sec ) {
            this._sec = next - this._sec;
            this._fpTxt.text = `FPS(${ this.fps | 0 })`;
            this._tcTxt.text = `TC(${ this.textureUsed })`;
            this._dcTxt.text = `DC(${ this.drawcalls })`;
            this._drawcalls = this._dcCounter;
        }
        this._sec = next;
        this._dcCounter = 0;
    }
}