export type TStates = 'primitive';

type TStateRules<T> = [ Partial<T>, Partial<T>, Function, any ][];

export class State<T> {
    private readonly _rules : TStateRules<T>;

    constructor( primitive : Partial<T>, rules : TStateRules<T> ) {
        this._state = primitive;
        this._rules = rules;
    }

    private _state : Partial<T>;

    get state() {
        return this._state;
    }

    can( next : Partial<T> ) {
        return this._at( next ) > -1;
    }

    transit( next : Partial<T> ) {
        const at = this._at( next );
        if ( at > -1 ) {
            this._state = next;
            const fn = this._rules[ at ][ 2 ];
            const ctx = this._rules[ at ][ 3 ];
            fn && fn.call( ctx );
        }
        return this;
    }

    is( state : Partial<T> ) {
        return this._state === state;
    }

    not( state : Partial<T> ) {
        return this._state !== state;
    }

    private _at( next : Partial<T> ) {
        for ( let i = 0; i < this._rules.length; i++ ) {
            const [ s1, s2 ] = this._rules[ i ];
            if ( this._state === s1 && next === s2 && s1 !== s2 ) {
                return i;
            }
        }
        return -1;
    }
}

