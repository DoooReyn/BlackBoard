type TAudienceOrder = [ string, number, number ];

export class Channel {
    private readonly _audience : TAudienceOrder[];
    private _dirty : boolean;
    private _arrival : number;

    constructor() {
        this._audience = [];
        this._dirty = false;
        this._arrival = 0;
    }

    public get audiences() {
        return this._audience.length;
    }

    public add( name : string, priority : number ) {
        this._dirty = true;
        const at = this._at( name );
        if ( at > -1 ) {
            this._audience[ at ][ 1 ] = priority;
        } else {
            ++this._arrival;
            this._audience.push( [ name, priority, this._arrival ] );
        }
    }

    public del( name : string ) {
        const at = this._at( name );
        if ( at > -1 ) {
            this._audience.splice( at, 1 );
            this._dirty = true;
        }
    }

    public sort() {
        if ( this._dirty ) {
            this._audience.sort( ( a1, a2 ) => {
                const [ _n1, p1, o1 ] = a1, [ _n2, p2, o2 ] = a2;
                return ( p1 === p2 ) ? ( o1 - o2 ) : ( p1 - p2 );
            } );
            this._dirty = false;
        }
        return this._audience.map( v => v[ 0 ] );
    }

    protected _at( name : string ) : number {
        for ( let i = 0; i < this._audience.length; i++ ) {
            if ( this._audience[ i ][ 0 ] === name ) {
                return i;
            }
        }
        return -1;
    }
}
