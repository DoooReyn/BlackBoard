type TListener<V extends any> = ( cur? : V, pre? : V ) => void;

export type TSignal<T extends any> = {read : () => T, write : (v: T) => void, connect : (l: TListener<T>) => void, disconnect : (l: TListener<T>) => void, disconnectAll : () => void}

export function responsive<T>( val : T ): TSignal<T> {
    let listeners : Set<TListener<T>> = new Set<TListener<T>>();
    let temp : T = val;

    function read() {
        return val;
    }

    function write( v : T ) {
        temp = val;
        val = v;
        listeners.forEach( l => l.call( null, v, temp ) );
    }

    function connect( l : TListener<T> ) {
        listeners.add( l );
    }

    function disconnect( l : TListener<T> ) {
        listeners.delete( l );
    }

    function disconnectAll() {
        listeners.clear();
    }

    return {
        read,
        write,
        connect,
        disconnect,
        disconnectAll,
    };
}
