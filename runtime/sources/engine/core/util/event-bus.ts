/**
 * 事件监听员接口
 * - invoke 事件触发回调
 * - context 监听实体引用
 * - once 是否一次性
 */
export interface IEventListener {
    invoke : Function;
    context : any;
    once? : boolean;
}



/**
 * 事件中心，主要负责
 * - 创建监听
 * - 解除监听
 * - 触发事件
 */
export class EventBus {
    private static _shared : EventBus = null;

    private readonly _listeners : Record<string, Array<IEventListener>>;

    static get shared() : EventBus {
        if ( !EventBus._shared ) {
            EventBus._shared = new EventBus();
        }
        return EventBus._shared;
    }

    static destroy() {
        if ( EventBus._shared ) {
            EventBus._shared = null;
        }
    }

    /**
     * 比较两个监听者是否相同
     * @param {IEventListener} l1 监听员1号
     * @param {IEventListener} l2 监听员2号
     * @returns {boolean}
     */
    static isSameListener( l1 : IEventListener, l2 : IEventListener ) {
        return l1.context === l2.context && l1.invoke === l2.invoke;
    }

    private constructor() {
        this._listeners = {};
    }

    public has( event : string, listener : IEventListener ) {
        const all = this._listeners[ event ];
        if ( all && all.length > 0 ) {
            for ( let i = 0; i < all.length; i++ ) {
                if ( EventBus.isSameListener( all[ i ].context, listener ) ) {
                    return true;
                }
            }
        }
        return false;
    }

    private _indexOf( event : string, listener : IEventListener ) {
        const all = this._listeners[ event ];
        if ( all && all.length > 0 ) {
            for ( let i = 0; i < all.length; i++ ) {
                if ( EventBus.isSameListener( all[ i ].context, listener ) ) {
                    return i;
                }
            }
        }
        return -1;
    }

    public emit( event : string, ...args : any[] ) {
        const all = this._listeners[ event ];
        if ( all && all.length > 0 ) {
            let waitToOff : number[] = [];

            all.forEach( ( v, i ) => {
                v.invoke.apply( v.context, args );
                if ( v.once ) waitToOff.push( i );
            } );

            if ( waitToOff.length > 0 ) {
                waitToOff.reverse().forEach( i => {
                    all.splice( i, 1 );
                } );
            }
        }
    }

    public on( event : string, listener : IEventListener ) {
        if ( !this.has( event, listener ) ) {
            this._listeners[ event ] = this._listeners[ event ] || [];
            this._listeners[ event ].push( listener );
            return true;
        }
        return false;
    }

    public off( event : string, listener : IEventListener ) {
        const all = this._listeners[ event ];
        if ( all && all.length > 0 ) {
            const index = this._indexOf( event, listener );
            if ( index > -1 ) {
                all.splice( index, 1 );
                return true;
            }
        }
        return false;
    }

    public offEvent( event : string ) {
        const all = this._listeners[ event ];
        if ( all && all.length > 0 ) {
            all.splice( 0, all.length );
        }
    }

    public offContext( context : any ) {
        for ( let event in this._listeners ) {
            let all = this._listeners[ event ];
            for ( let i = all.length - 1; i >= 0; i++ ) {
                if ( all[ i ].context === context ) {
                    all.splice( i, 1 );
                }
            }
        }
    }

    public offAll() {
        for ( let event in this._listeners ) {
            let all = this._listeners[ event ];
            all.splice( 0, all.length );
        }
    }
}