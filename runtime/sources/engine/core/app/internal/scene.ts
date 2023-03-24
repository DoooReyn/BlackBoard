import { Container } from 'pixi.js';
import { ESystemEvent } from '../../../enum';
import { Audience } from '../../event/audience';
import { logger, NextIDGenerator } from '../../util';
import { NewsSystem } from '../system/news-system';

export class Scene extends Container {
    private _audience : Audience;

    constructor() {
        super();

        this.name = NextIDGenerator.nextWithKey( 'Scene' );

        this._audience = new Audience( this._onDataReceived, this );

        this.on( 'added', this._onInit, this );
        this.on( 'removed', this._onReset, this );
        this.on( 'destroyed', this._onCleanup, this );
    }

    public update( _delta : number ) {

    }

    protected _onInit() {
        NewsSystem.shared.subscribe( this._audience, ESystemEvent.Resize );
    }

    protected _onReset() {
        NewsSystem.shared.unsubscribe( this._audience, ESystemEvent.Resize );
        NewsSystem.shared.unregister( this._audience );
    }

    protected _onCleanup() {
        this.off( 'added', this._onInit, this );
        this.off( 'removed', this._onReset, this );
        this.off( 'destroyed', this._onCleanup, this );
        this._onReset();
        this._audience = null;
    }

    protected _onWindowResized() {
        logger.debug( this.name, 'window resized' );
    }

    protected _onDataReceived( channel : string, data : any, next : Function ) {
        logger.debug( this.name, 'receive', channel, data );

        switch ( channel ) {
            case ESystemEvent.Resize:
                this._onWindowResized();
                break;
            default:
                break;
        }

        next();
    }
}