import { clone, Lovely, prefills } from '../util';
import { ISizeBoxOptions, SizeBox } from './size-box';

export interface IBoundaryMargin {
    top? : number;
    left? : number;
    right? : number;
    bottom? : number;
}

export interface IBoundaryAlign {
    top? : boolean;
    left? : boolean;
    right? : boolean;
    bottom? : boolean;
}

export interface IBoundaryBoxOptions extends ISizeBoxOptions {
    margin? : IBoundaryMargin,
    align? : IBoundaryAlign
}

export class BoundaryBox extends SizeBox {
    protected _margin : IBoundaryMargin;
    protected _align : IBoundaryAlign;
    protected _marginLovely : Lovely;
    protected _alignLovely : Lovely;

    constructor( options : IBoundaryBoxOptions ) {
        super( options );

        prefills( options, [
            [
                'margin', { top: 0, left: 0, right: 0, bottom: 0 }
            ], [
                'align', {
                    top: false, left: false, right: false, bottom: false
                }
            ],
        ] );
        prefills( options.margin, [ [ 'top', 0 ], [ 'left', 0 ], [ 'right', 0 ], [ 'bottom', 0 ], ] );
        prefills( options.align, [ [ 'top', false ], [ 'left', false ], [ 'right', false ], [ 'bottom', false ] ] );

        this._marginLovely = new Lovely();
        this._alignLovely = new Lovely();
        this._margin = clone( options.margin );
        this._align = clone( options.align );
    }

    public override resize( _w : number, _h : number ) {
        // super.resize( w, h );
        throw new Error( '[BoundaryBox] `resize` is not allowed' );
    }

    public override set width( _v : number ) {
        throw new Error( '[BoundaryBox] `width.setter` is not allowed' );
    }

    public override set height( _v : number ) {
        throw new Error( '[BoundaryBox] `height.setter` is not allowed' );
    }

    public override get width() : number {
        return super.width;
    }

    public override get height() : number {
        return super.height;
    }

    set alignTop( v : boolean ) {
        if ( this._align.top !== v ) {
            this.alignTop = v;
            this._alignLovely.trick();
        }
    }

    set alignLeft( v : boolean ) {
        if ( this._align.left !== v ) {
            this.alignLeft = v;
            this._alignLovely.trick();
        }
    }

    set alignRight( v : boolean ) {
        if ( this._align.right !== v ) {
            this.alignRight = v;
            this._alignLovely.trick();
        }
    }

    set alignBottom( v : boolean ) {
        if ( this._align.bottom !== v ) {
            this.alignBottom = v;
            this._alignLovely.trick();
        }
    }

    get alignTop() {
        return this._align.top;
    }

    get alignLeft() {
        return this._align.left;
    }

    get alignRight() {
        return this._align.right;
    }

    get alignBottom() {
        return this._align.bottom;
    }

    set marginTop( v : number ) {
        if ( this._margin.top !== v ) {
            this._margin.top = v;
            this._marginLovely.trick();
        }
    }

    set marginLeft( v : number ) {
        if ( this._margin.left !== v ) {
            this._margin.left = v;
            this._marginLovely.trick();
        }
    }

    set marginRight( v : number ) {
        if ( this._margin.right !== v ) {
            this._margin.right = v;
            this._marginLovely.trick();
        }
    }

    set marginBottom( v : number ) {
        if ( this._margin.bottom !== v ) {
            this._margin.bottom = v;
            this._marginLovely.trick();
        }
    }

    get marginTop() {
        return this._margin.top;
    }

    get marginLeft() {
        return this._margin.left;
    }

    get marginRight() {
        return this._margin.right;
    }

    get marginBottom() {
        return this._margin.bottom;
    }

    get isStretchWidth() {
        return this.alignLeft && this.alignRight;
    }

    get isStretchHeight() {
        return this.alignTop && this.alignBottom;
    }

    get isStretchAll() {
        return this.isStretchWidth && this.isStretchHeight;
    }

    set isStretchWidth( v : boolean ) {
        this.alignLeft = v;
        this.alignRight = v;
    }

    set isStretchHeight( v : boolean ) {
        this.alignTop = v;
        this.alignBottom = v;
    }

    set isStretchAll( v : boolean ) {
        this.isStretchWidth = v;
        this.isStretchHeight = v;
    }

    protected override _onWindowResized() {
        super._onWindowResized();
        this._marginLovely.trick();
        this._alignLovely.trick();
    }

    protected override _refresh() {
        if ( this.isStretchWidth ) {
            this._size.width = this.parent.width - this.marginLeft - this.marginRight;
            this._sizeLovely.trick();
        }

        if ( this.isStretchHeight ) {
            this._size.height = this.parent.height - this.marginTop - this.marginBottom;
            this._sizeLovely.trick();
        }

        super._refresh();
    }

    // protected override _update( _delta : number ) {
    //     if ( this._marginLovely.angry || this._alignLovely.angry ) {
    //         this._alignLovely.treat();
    //         this._marginLovely.treat();
    //         // this.refreshBoundary();
    //         this._draw();
    //     }
    //
    //     super._update( _delta );
    // }
}