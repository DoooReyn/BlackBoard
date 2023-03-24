import { ENativeEvent, ESystemEvent } from '../../../enum';
import type { Audience } from '../../event/audience';
import { Channel } from '../../event/channel';
import { KeyMap, Signals } from '../../util';
import { Engine } from '../engine';
import { SecUpdateValue } from '../internal/sec-update-value';
import { ESystemPriority, System } from './system';

/**
 * News information
 * - channel: string
 * - data: any
 */
type TNewsInfo = [ string, any ];

/**
 * A system for event delivery and management
 */
export class NewsSystem extends System {
    public onResizeSignal : Signals<() => void>;
    protected _onVisibilityChanged : () => void;
    protected _onWindowSizeChanged : () => void;
    private _sizeChanged : boolean;
    private _lastTime : number;
    /**
     * Channels of the news center
     * @type {KeyMap<Channel>}
     * @private
     */
    private _channels : KeyMap<Channel>;
    /**
     * All audiences an any channel
     * @type {KeyMap<Audience>}
     * @private
     */
    private _audiences : KeyMap<Audience>;
    /**
     * The news waited to display
     * @type {TNewsInfo[]}
     * @private
     */
    private readonly _news : TNewsInfo[];

    protected constructor() {
        super();

        this._news = [];
        this._sizeChanged = false;
        this._lastTime = SecUpdateValue.now;
        this._channels = new KeyMap<Channel>();
        this._audiences = new KeyMap<Audience>();
        this.onResizeSignal = new Signals<() => void>();
    }

    private static _shared : NewsSystem = null;

    public static get shared() {
        if ( !NewsSystem._shared ) {
            NewsSystem._shared = new NewsSystem();
        }
        return NewsSystem._shared;
    }

    /**
     * Audience register to the news center
     * @param {Audience} audience
     * @returns {Audience}
     */
    public register( audience : Audience ) {
        this._audiences.set( audience.name, audience );
        return audience;
    }

    /**
     * Audience unregister from the news center
     * @param {Audience} audience
     * @returns {Audience}
     */
    public unregister( audience : Audience ) {
        this._audiences.remove( audience.name );
    }

    /**
     * Audience subscribe channel from the news center
     * @param {Audience} audience
     * @param {string} channel
     * @param {number} priority
     */
    public subscribe( audience : Audience, channel : string, priority : number = 0 ) {
        if ( !this._audiences.has( audience.name ) ) {
            this.register( audience );
        }
        let channelInstance = this._channels.get( channel );
        if ( !channelInstance ) {
            channelInstance = new Channel();
            this._channels.set( channel, channelInstance );
        }
        channelInstance.add( audience.name, priority );
    }

    /**
     * Audience unsubscribe channel from the news center
     * @param {Audience} audience
     * @param {string} channel
     */
    public unsubscribe( audience : Audience, channel : string ) {
        let channelInstance = this._channels.get( channel );
        if ( channelInstance ) {
            channelInstance.del( audience.name );
        }
    }

    /**
     * Pushing rather than sending news
     * @param {string} channel
     * @param data
     */
    public push( channel : string, data : any ) {
        const last = this._news[ this._news.length - 1 ];
        if ( last && last[ 0 ] === channel && last[ 1 ] === data ) {
            // avoid pushing duplicated data
            return;
        }
        this._news.push( [ channel, data ] );
    }

    protected override _onAttached( engine : Engine ) {
        super._onAttached( engine );

        this._sizeChanged = true;

        this._onVisibilityChanged = () => {
            const visibility = document.visibilityState === 'visible' ? ESystemEvent.Enter : ESystemEvent.Exit;
            this.push( ESystemEvent.Visibility, visibility );
        };
        document.addEventListener( ENativeEvent.Visibility, this._onVisibilityChanged );

        this._onWindowSizeChanged = () => {
            this._sizeChanged = true;
        };

        window.addEventListener( ENativeEvent.Resize, this._onWindowSizeChanged );
    }

    protected _onDetached() : void {
        document.removeEventListener( ENativeEvent.Visibility, this._onVisibilityChanged );
        window.removeEventListener( ENativeEvent.Visibility, this._onWindowSizeChanged );
        this._channels.clear();
        this._audiences.clear();
        this._news.length = 0;
        this._onVisibilityChanged = null;
        this._onWindowSizeChanged = null;
    }

    protected _onPaused() : void {
    }

    protected _onResumed() : void {
    }

    protected _onStarted() : void {
    }

    public get priority() : number {
        return ESystemPriority.News;
    }

    public update( _delta : number ) : void {
        if ( SecUpdateValue.now - this._lastTime >= 1000 ) {
            this._lastTime = SecUpdateValue.now;
            if ( this._sizeChanged ) {
                this._sizeChanged = false;

                const {
                    clientWidth: width, clientHeight: height,
                } = document.documentElement;
                this.app.stage.transform.pivot.set( width * 0.5, height * 0.5 );
                this.app.renderer.resize( width, height );
                this.push( ESystemEvent.Resize, null );
                this.onResizeSignal.emit();
            }
        }

        if ( this._news.length > 0 ) {
            let sent = [];

            for ( let i = 0; i < this._news.length; i++ ) {
                const [ channel, data ] = this._news[ i ];
                const instance = this._channels.get( channel );
                if ( !instance ) continue;
                sent.unshift( i );
                if ( instance.audiences === 0 ) continue;
                this._send( instance, channel, data );
            }

            if ( sent.length > 0 ) {
                sent.forEach( v => {
                    this._news.splice( v, 1 );
                } );
            }
        }
    }

    /**
     * Sending a pieces of news
     * @param {Channel} instance
     * @param {string} channel
     * @param {any} data
     * @protected
     */
    protected _send( instance : Channel, channel : string, data : any ) {
        const audiences = instance.sort();
        const next = () => {
            const name = audiences.shift();
            if ( name ) {
                const audience = this._audiences.get( name );
                audience && audience.receive( channel, data, next );
            }
        };
        next();
    }
}