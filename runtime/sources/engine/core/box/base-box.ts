import { Container, Ticker } from 'pixi.js';
import { NextIDGenerator, Subscriber } from '../util';

export abstract class BaseBox<OPTIONS extends any> extends Container {
    public subscriber : Subscriber;
    public ticker : Ticker;
    private _ready : boolean;
    protected _options : OPTIONS;

    protected constructor( _options : OPTIONS ) {
        super();

        this._options = _options;
        this.name = NextIDGenerator.nextWithKey( this.constructor.name );
        this.ticker = Ticker.shared;
        this._ready = false;
        this.subscriber = new Subscriber();

        this.on( 'added', this._onAdded, this );
        this.on( 'removed', this._onRemoved, this );
        this.on( 'destroyed', this._onDestroyed, this );
    }

    protected get isReady() {
        return this._ready;
    }

    /**
     * 初始化
     * @virtual
     * @protected
     */
    protected _onInit() : void {
    }

    /**
     * 内部更新
     * @param {number} _delta 间隔
     * @virtual
     * @protected
     */
    protected _update( _delta : number ) : void {
    };

    /**
     * 更新之前
     * @param {number} delta 间隔
     * @protected
     */
    protected _onBeforeUpdate( delta : number ) : void {
        if ( this._ready ) {
            this._update( delta );
        }
    }

    /**
     * 被添加到视图中
     * @protected
     */
    protected _onAdded() {
        this._ready = true;
        this._onInit();
        this.ticker.add( this._onBeforeUpdate, this );
    }

    /**
     * 从视图中移除
     * @protected
     */
    protected _onRemoved() {
        this.ticker.remove( this._onBeforeUpdate, this );
        this.subscriber.unsubscribeAll();
        this._ready = false;
    }

    /**
     * 销毁
     * @protected
     */
    protected _onDestroyed() {
        this.ticker.remove( this._onBeforeUpdate, this );
        this.subscriber.unsubscribeAll();
        this._ready = false;
        this.subscriber = null;
    }
}