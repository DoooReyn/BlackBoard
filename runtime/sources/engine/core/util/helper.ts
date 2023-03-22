/**
 * Executing in progressive and returning a valid result
 * @param {any[]} fallbacks
 * @param {(arg: any) => (any | undefined)} execute
 * @param {any} ctx
 * @returns {any | undefined}
 */
export function progressive<T extends any, K extends any>( fallbacks : K[], execute : ( arg : K ) => T | undefined, ctx : any ) : T | undefined {
    let result = undefined;
    for ( let i = 0; i < fallbacks.length; i++ ) {
        result = execute.call( ctx, fallbacks[ i ] );
        if ( result === undefined || result === null || result === false ) continue;
        return result as T;
    }
    return undefined;
}

/**
 * Pre-filled undefined options with default value in separately
 * @param options
 * @param {[string, any][]} values
 */
export function prefills( options : any, values : [ string, any ][] ) {
    values.forEach( v => {
        const [ key, val ] = v;
        if ( options[ key ] === undefined ) {
            options[ key ] = val;
        }
    } );
}

/**
 * Deep clone for any value
 * @param o
 * @returns {any}
 */
export function clone( o : any ) : any {
    let buf : any;
    if ( o instanceof Array ) {
        buf = [];
        let i = o.length;
        while ( i-- ) {
            buf[ i ] = clone( o[ i ] );
        }
        return buf;
    } else if ( o instanceof Map ) {
        buf = new Map();
        o.forEach( ( v, k ) => {
            buf.set( k, v );
        } );
        return buf;
    } else if ( o instanceof Object ) {
        buf = {};
        for ( let k in o ) {
            buf[ k ] = clone( o[ k ] );
        }
        return buf;
    } else {
        return o;
    }
}