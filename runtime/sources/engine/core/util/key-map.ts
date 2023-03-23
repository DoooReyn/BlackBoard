export class KeyMap<V> {
    private readonly _map : any;

    constructor() {
        this._map = Object.create( null );
    }

    get( key : string ) : V | undefined {
        return this._map[ key ];
    }

    has( key : string ) {
        return this._map[ key ] !== undefined;
    }

    set( key : string, val : V ) {
        if ( val !== undefined ) {
            this._map[ key ] = val;
        }
    }

    remove( key : string ) {
        delete this._map[ key ];
    }

    clear() {
        for (const key in this._map) {
            delete this._map[key];
        }
    }
}