import { Container, ObservablePoint } from 'pixi.js';
import { SystemEvent } from '../../enum';
import {
    applyOptions,
    Boundary,
    logger,
    Subscriber,
    VirtualSize
} from '../util';

export interface IBoxOptions {
    width : number;
    height : number;
    anchorX? : number;
    anchorY? : number;
    top? : number;
    bottom? : number;
    left? : number;
    right? : number;
}

export abstract class Box extends Container {
    subscriber : Subscriber;
    size : VirtualSize;
    private _autoPositioning : boolean;
    public boundary : Boundary<this>;
    public anchor : ObservablePoint;
    private static _uid : number = 0;

    protected constructor( options : IBoxOptions ) {
        super();

        applyOptions( options, [
            [ 'anchorX', 0.5 ],
            [ 'anchorY', 0.5 ],
        ] );

        this.name = `${ this.constructor.name }.${ Box.getUid() }`;
        this.subscriber = new Subscriber();
        this.size = new VirtualSize();
        this.on( 'added', this.onadded, this );
        this.on( 'removed', this.onremoved, this );
        this.on( 'destroyed', this.ondestroyed, this );

        this.anchor = new ObservablePoint( this._onAnchorChanged, this, options.anchorX, options.anchorY );
        this.size.resize( options.width, options.height );

        this.boundary = new Boundary( this._onBoundaryChanged, this );
        this.boundary.set( {
            left: [ options.left !== undefined, options.left || 0 ],
            top: [ options.top !== undefined, options.top || 0 ],
            right: [ options.right !== undefined, options.right || 0 ],
            bottom: [ options.bottom !== undefined, options.bottom || 0 ],
        } );

        this.autoPositioning = true;
    }

    get isStretchWidth() {
        return this.boundary.left.enabled && this.boundary.right.enabled;
    }

    get isStretchHeight() {
        return this.boundary.top.enabled && this.boundary.bottom.enabled;
    }

    setStretchWidth() {
        this.boundary.set( {
            left: [ true, this.boundary.left.margin ],
            right: [ true, this.boundary.right.margin ]
        } );
    }

    setStretchHeight() {
        this.boundary.set( {
            top: [ true, this.boundary.top.margin ],
            bottom: [ true, this.boundary.bottom.margin ]
        } );
    }

    refreshBoundary() {
        this.boundary.refresh();
    }

    override get width() {
        return this.size.width;
    }

    override get height() {
        return this.size.height;
    }

    override set width( w : number ) {
        this.size.width = w;
    }

    override set height( h : number ) {
        this.size.height = h;
    }

    static getUid() {
        return ++Box._uid;
    }

    protected _onBoundaryChanged() {
        if ( !this.parent ) return;

        let width : number;
        let height : number;
        if ( 'size' in this.parent ) {
            width = ( this.parent.size as any ).width;
            height = ( this.parent.size as any ).height;
        } else {
            width = this.parent.width;
            height = this.parent.height;
        }

        const pw = width, ph = height;
        let stretch = false;
        if ( this.isStretchWidth ) {
            width -= this.boundary.left.margin;
            width -= this.boundary.right.margin;
            stretch = true;
        }
        if ( this.isStretchHeight ) {
            height -= this.boundary.top.margin;
            height -= this.boundary.bottom.margin;
            stretch = true;
        }
        if ( stretch ) {
            this.size.resize( width, height );
            logger.info( this.name, 'boundary changed', this.parent.constructor.name, pw, width, ph, height );
        }
    }

    protected _onAnchorChanged() {
        this.pivot.x = this.size.width * this.anchor.x;
        this.pivot.y = this.size.height * this.anchor.y;
        if ( this.parent ) {
            this.x = this.parent.pivot.x;
            this.y = this.parent.pivot.y;
            logger.info( this.name, 'anchor changed', this.x, this.y );
        }
    }

    set autoPositioning( en : boolean ) {
        if ( en ) {
            this._autoPositioning = en;
            this.subscriber.subscribe( SystemEvent.Resize, this.onresize, this );
        } else {
            this._autoPositioning = en;
            this.subscriber.unsubscribe( SystemEvent.Resize, this.onresize, this );
        }
    }

    get autoPositioning() {
        return this._autoPositioning;
    }

    protected onadded() {
        this.onresize();
    }

    protected onremoved() {
        this.subscriber.unsubscribeAll();
    }

    protected ondestroyed() {
        this.subscriber.unsubscribeAll();
        this.subscriber = null;
        this.size = null;
    }

    protected onresize() {
        this._onBoundaryChanged();
        this._onAnchorChanged();
    }
}