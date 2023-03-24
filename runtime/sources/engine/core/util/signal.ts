export type TSignalTrigger<T extends Function> = [ T, any? ];

export class Signal<T extends Function> {
    private _trigger : T;
    private _context : any;

    constructor() {
        this._trigger = null;
        this._context = null;
    }

    connect( fn : T, context? : any ) {
        this._trigger = fn;
        this._context = context || null;
    }

    disconnect() {
        this._trigger = null;
        this._context = null;
    }

    emit( ...args : any[] ) {
        this._trigger && this._trigger.apply( this._context, args );
    }
}

export class Signals<T extends Function> {
    private readonly _triggers : TSignalTrigger<T>[];

    constructor() {
        this._triggers = [];
    }

    connect( fn : T, context : any = null ) {
        const at = this._at( fn, context );
        if ( at === -1 ) {
            this._triggers.push( [ fn, context ] );
        }
    }

    disconnect( fn : T, context : any = null ) {
        const at = this._at( fn, context );
        if ( at > -1 ) {
            this._triggers.splice( at, 1 );
        }
    }

    disconnectAll() {
        this._triggers.length = 0;
    }

    emit( ...args : any[] ) {
        if ( this._triggers.length > 0 ) {
            this._triggers.forEach( v => {
                const [ tr, ctx ] = v;
                tr.apply( ctx, args );
            } );
        }
    }

    private _at( fn : T, context : any = null ) {
        for ( let i = 0; i < this._triggers.length; i++ ) {
            const [ tr, ctx ] = this._triggers[ i ];
            if ( fn === tr && context === ctx ) {
                return i;
            }
        }
        return -1;
    }
}