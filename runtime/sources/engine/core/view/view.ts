import { Container } from 'pixi.js';
import { Audience } from '../event/audience';
import { NextIDGenerator } from '../util';
import { NewsSystem } from '../system/news-system';

export abstract class View extends Container {
    protected _audience : Audience;

    protected constructor() {
        super();

        this.name = NextIDGenerator.nextWithKey( this.constructor.name );
        this._audience = new Audience( this._onDataReceived, this );
        this.on( 'added', this._onInit, this );
        this.on( 'removed', this._onReset, this );
        this.on( 'destroyed', this._onCleanup, this );
    }

    public secUpdate( _delta : number ) {
    }

    public frameUpdate( _delta : number ) {
    }

    protected _onInit() : void {

    }

    protected _onReset() : void {
        NewsSystem.shared.unregister( this._audience );
    }

    protected _onCleanup() : void {
        this.off( 'added', this._onInit, this );
        this.off( 'removed', this._onReset, this );
        this.off( 'destroyed', this._onCleanup, this );
        this._onReset();
        this._audience = null;
    }

    protected abstract _onDataReceived( channel : string, data : any, next : Function ) : void;
}
