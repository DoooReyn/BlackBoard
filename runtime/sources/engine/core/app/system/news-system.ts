import type { Audience } from '../../event/audience';
import { Channel } from '../../event/channel';
import { KeyMap } from '../../util';
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
        this._channels = new KeyMap<Channel>();
        this._audiences = new KeyMap<Audience>();
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

    protected _onDetached() : void {
        this._news.length = 0;
        this._channels.clear();
        this._audiences.clear();
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