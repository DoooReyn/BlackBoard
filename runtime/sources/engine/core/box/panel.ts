import { Graphics } from 'pixi.js';
import { applyOptions, logger } from '../util';
import { Box } from './box';

export interface IPanelOptions {
    backgroundColor? : number;
    backgroundAlpha? : number;
    anchorX? : number;
    anchorY? : number;
    width : number;
    height : number;
    top? : number;
    bottom? : number;
    left? : number;
    right? : number;
}

/**
 * @recommend Use `anchor` instead of `pivot`
 * @recommend Use `size` instead of `width/height`
 * @warn 更改父节点的 `pivot` 不会对子节点造成影响，子节点不会以父节点的 `pivot` 作为原点，而是继续保持父节点的左上角为原点
 */
export class Panel extends Box {
    private readonly _sketch : Graphics;
    private _backgroundColor : number;
    private _backgroundAlpha : number;

    constructor( options : IPanelOptions ) {
        super( options );

        applyOptions( options, [
            [ 'backgroundColor', 0xfcfcfc ],
            [ 'backgroundAlpha', 0 ],
        ] );

        this._sketch = new Graphics();
        this.backgroundColor = options.backgroundColor;
        this.backgroundAlpha = options.backgroundAlpha;
        this.addChild( this._sketch );
    }

    set backgroundColor( c : number ) {
        this._backgroundColor = c;
    }

    set backgroundAlpha( c : number ) {
        this._backgroundAlpha = Math.min( 1, Math.max( 0, c ) );
    }

    protected draw() {
        this._sketch.clear();
        if ( this._backgroundAlpha === 0 ) {
            return;
        }

        this._sketch.lineStyle( {
            width: 1,
            color: 0x444,
            alpha: 1
        } );
        this._sketch.beginFill( this._backgroundColor, this._backgroundAlpha );
        this._sketch.drawRect( 0, 0, this.size.width, this.size.height );
        this._sketch.endFill();

        logger.info( this.name, 'draw' );
    }

    protected override onresize() {
        super.onresize();
        this.draw();
    }
}