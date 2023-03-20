import { logger } from './logger';

export class BoundaryPoint {
    private _enabled : boolean;
    private _margin : number;

    constructor( enabled : boolean, margin : number ) {
        this._enabled = enabled;
        this._margin = margin;
    }

    get margin() {
        return this._margin;
    }

    get enabled() {
        return this._enabled;
    }

    set margin( m : number ) {
        this._margin = m;
    }

    set enabled( en : boolean ) {
        this._enabled = en;
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this._enabled = false;
    }

    clone() {
        return new BoundaryPoint( this.enabled, this.margin );
    }

    valueOf() {
        return { enabled: this._enabled, margin: this._margin };
    }
}

type IMarginData = [ boolean, number ];

export interface IMargin {
    left? : IMarginData;
    top? : IMarginData;
    right? : IMarginData;
    bottom? : IMarginData;
}

export class Boundary<T> {
    private readonly _top : BoundaryPoint;
    private readonly _bottom : BoundaryPoint;
    private readonly _left : BoundaryPoint;
    private readonly _right : BoundaryPoint;
    private _dirty : boolean;
    public cb : ( this : T ) => any;
    public scope : any;

    constructor( cb : ( this : T ) => any, scope : T ) {
        this.cb = cb;
        this.scope = scope;
        this._dirty = false;
        this._left = new BoundaryPoint( false, 0 );
        this._top = new BoundaryPoint( false, 0 );
        this._right = new BoundaryPoint( false, 0 );
        this._bottom = new BoundaryPoint( false, 0 );
    }

    set( on : IMargin ) {
        on.left !== undefined && this._set( this._left, on.left[ 0 ], on.left[ 1 ] );
        on.top !== undefined && this._set( this._top, on.top[ 0 ], on.top[ 1 ] );
        on.right !== undefined && this._set( this._right, on.right[ 0 ], on.right[ 1 ] );
        on.bottom !== undefined && this._set( this._bottom, on.bottom[ 0 ], on.bottom[ 1 ] );
    }

    get() {
        return {
            left: this._left.valueOf(),
            top: this._top.valueOf(),
            right: this._right.valueOf(),
            bottom: this._bottom.valueOf(),
        };
    }

    get top() {
        return { enabled: this._top.enabled, margin: this._top.margin };
    }

    get bottom() {
        return { enabled: this._bottom.enabled, margin: this._bottom.margin };
    }

    get left() {
        return { enabled: this._left.enabled, margin: this._left.margin };
    }

    get right() {
        return { enabled: this._right.enabled, margin: this._right.margin };
    }

    private _set( point : BoundaryPoint, enabled : boolean, margin : number ) {
        if ( point.enabled != enabled ) {
            this._dirty = true;
            point.enabled = enabled;
        }
        if ( point.margin != margin ) {
            point.margin = margin;
            this._dirty = true;
        }
    }

    refresh() {
        if ( this._dirty ) {
            logger.info( 'boundary dirty', this.get() );
            this._dirty = false;
            this.cb.call( this.scope );
        }
    }
}