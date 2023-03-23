import { Graphics, ObservablePoint } from 'pixi.js';
import { ESystemEvent } from '../../enum';
import { SizeData } from '../../interface';
import { Lovely, prefills, Size } from '../util';
import { BaseBox } from './base-box';

export interface ISizeBoxOptions extends SizeData {
    anchorX? : number;
    anchorY? : number;
    backgroundColor? : number;
    backgroundAlpha? : number;
}

/**
 * SizeBox 拥有尺寸属性，但是不会随着屏幕尺寸变化自动适配
 */
export class SizeBox extends BaseBox<ISizeBoxOptions> {
    protected _size : Size;
    public anchor : ObservablePoint<this>;
    protected _sizeLovely : Lovely;
    protected _anchorLovely : Lovely;
    protected _positionLovely : Lovely;
    private _sketch : Graphics;
    private _backgroundColor : number;
    private _backgroundAlpha : number;
    private _offset : ObservablePoint;

    constructor( options : ISizeBoxOptions ) {
        super( options );

        prefills( options, [
            [ 'anchorX', 0 ], [ 'anchorY', 0 ], [ 'backgroundColor', 0xfcfcfc ], [ 'backgroundAlpha', 0 ]
        ] );

        this._sizeLovely = new Lovely();
        this._anchorLovely = new Lovely();
        this._positionLovely = new Lovely();
        this._offset = new ObservablePoint<this>( this._onPositionChanged, this, 0, 0 );
        this._size = new Size( options.width, options.height );
        this.anchor = new ObservablePoint<this>( this._onAnchorChanged, this, options.anchorX, options.anchorY );
        this._sketch = new Graphics();
        this.backgroundColor = options.backgroundColor;
        this.backgroundAlpha = options.backgroundAlpha;
        this._offset.set( 0 );
    }

    private _onPositionChanged() {
        this._positionLovely.trick();
    }

    /**
     * 隐藏 `pivot`
     * @returns {ObservablePoint}
     * @protected
     */
    // protected override get pivot() : ObservablePoint {
    //     return super.pivot;
    // }

    protected override _onInit() {
        this.addChild( this._sketch );
        this.subscriber.subscribe( ESystemEvent.Resize, this._onWindowResized, this );
        this._refresh();
        this._positionLovely.trick();
    }

    protected override _onRemoved() {
        this._sketch.removeFromParent();
        super._onRemoved();
    }

    protected override _onDestroyed() {
        this._sketch = null;
        super._onDestroyed();
    }

    protected _onWindowResized() {
        console.log( '_onWindowResized', this.name );
        this._sizeLovely.trick();
        this._refresh();
    }

    protected _onAnchorChanged() {
        this._anchorLovely.trick();
    }

    set backgroundColor( c : number ) {
        this._backgroundColor = c;
    }

    set backgroundAlpha( c : number ) {
        this._backgroundAlpha = Math.min( 1, Math.max( 0, c ) );
    }

    protected _draw() {
        // if ( this._backgroundAlpha === 0 ) return;

        this._sketch.clear();
        this._sketch.lineStyle( {
            width: 1, color: 0x444, alpha: 1
        } );
        this._sketch.beginFill( this._backgroundColor, this._backgroundAlpha );
        this._sketch.drawRect( 0, 0, this.width, this.height );
        this._sketch.endFill();
    }

    override get width() {
        return this._size.width;
    }

    override get height() {
        return this._size.height;
    }

    override set width( v : number ) {
        this._size.width = v;
        this._sizeLovely.trick();
    }

    override set height( v : number ) {
        this._size.height = v;
        this._sizeLovely.trick();
    }

    public resize( w : number, h : number ) {
        this._size.resize( w, h );
    }

    public override get x() : number {
        return this._offset.x;
    }

    public override get y() : number {
        return this._offset.y;
    }

    public override set x( value : number ) {
        this._offset.x = value;
        this._positionLovely.trick();
    }

    public override set y( value : number ) {
        this._offset.y = value;
        this._positionLovely.trick();
    }

    protected _refresh() {
        let ok = false;
        const px = this._size.width * this.anchor.x;
        const py = this._size.height * this.anchor.y;
        if ( this.transform.pivot.x !== px ) {
            this.transform.pivot.x = px;
            ok = true;
        }
        if ( this.transform.pivot.y !== py ) {
            this.transform.pivot.y = py;
            ok = true;
        }
        const x = this._offset.x + this.parent.transform.pivot.x;
        const y = this._offset.y + this.parent.transform.pivot.y;
        if ( this.transform.position.x !== x ) {
            this.transform.position.x = x;
            ok = true;
        }
        if ( this.transform.position.y !== y ) {
            this.transform.position.y = y;
            ok = true;
        }

        // ok && this._draw();
        ok;
        this._draw();
    }

    protected override _update( _delta : number ) {
        if ( this._anchorLovely.angry || this._sizeLovely.angry || this._positionLovely.angry ) {
            this._anchorLovely.treat();
            this._sizeLovely.treat();
            this._positionLovely.treat();
            this._draw();
        }

        this._refresh();
    }
}
