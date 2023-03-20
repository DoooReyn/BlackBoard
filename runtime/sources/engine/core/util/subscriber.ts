import { EventBus, IEventListener } from './event-bus';

interface IListener {
    event : string;
    listener : IEventListener;
}

/**
 * 事件订阅者
 */
export class Subscriber {
    private _listeners : IListener[] = [];

    private _indexOf( event : string, listener : IEventListener ) {
        for ( let i = 0; i < this._listeners.length; i++ ) {
            if ( this._listeners[ i ].event === event ) {
                if ( EventBus.isSameListener( this._listeners[ i ].listener, listener ) ) {
                    return i;
                }
            }
        }
        return -1;
    }

    subscribe( event : string, invoke : Function, context : any, once : boolean = false ) : void {
        const listener = { invoke, context, once };
        if ( this._indexOf( event, listener ) === -1 ) {
            this._listeners.push( { event, listener } );
            EventBus.shared.on( event, listener );
        }
    }

    unsubscribe( event : string, invoke : Function, context : any ) : void {
        const listener = { invoke, context };
        const index = this._indexOf( event, listener );
        if ( index > -1 ) {
            this._listeners.splice( index, 1 );
            EventBus.shared.off( event, listener );
        }
    }

    unsubscribeAll() : void {
        this._listeners.forEach( listener => {
            EventBus.shared.off( listener.event, listener.listener );
        } );
        this._listeners.length = 0;
    }
}