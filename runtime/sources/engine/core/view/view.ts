import { Container } from 'pixi.js';
import { Engine } from '../engine';
import { Audience } from '../event/audience';
import { NewsSystem } from '../system/news-system';
import { logger, NextIDGenerator } from '../util';

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

    static get screenSize() {
        return Engine.shared.renderer.screen;
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }

    public renderIn() {
        this.renderable = true;
    }

    public renderOut() {
        this.renderable = false;
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

    protected onWindowResized() {}

    protected _onDataReceived( channel : string, data : any, next : Function ) : void {
        logger.debug( this.name, 'received', channel, data );
        next();
    }
}
