import { SizeData, SizeLike } from '../../interface';

/**
 * 尺寸
 */
export class Size {
    private readonly _size : SizeData;

    public onresize: ( _size : Size ) => void;

    protected static _correct( v : number ) {
        return Math.max( 0, v | 0 );
    }

    public static from( w : number, h : number ) {
        return new Size( w, h );
    }

    public constructor( w : number = 0, h : number = 0 ) {
        this._size = { width: 0, height: 0 };
        this.resize( w, h );
    }

    public clone() : Size {
        return new Size( this.width, this.height );
    }

    public get height() : number {
        return this._size.height;
    }

    set height( v : number ) {
        this._size.height = Size._correct( v );
    }

    public get size() : SizeData {
        const { width, height } = this._size;
        return { width, height };
    }

    public get width() : number {
        return this._size.width;
    }

    set width( v : number ) {
        this._size.width = Size._correct( v );
    }

    public resize( w : number | SizeLike, h? : number ) : void {
        if ( typeof w === 'number' ) {
            this.width = w;
            this.height = h;
        } else {
            if ( 'size' in w ) {
                this.width = w.size.width;
                this.height = w.size.height;
            } else {
                this.width = w.width;
                this.height = w.height;
            }
        }
        this.onresize && this.onresize(this);
    }
}

export class VirtualSize extends Size {
    constructor( w : number = 0, h : number = 0 ) {
        super( w, h );
    }
}