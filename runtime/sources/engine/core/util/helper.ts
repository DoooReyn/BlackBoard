/**
 * Executing in progressive and returning a valid result
 * @param {any[]} fallbacks
 * @param {(arg: any) => (any | undefined)} execute
 * @param {any} ctx
 * @returns {any | undefined}
 */
import { Sprite, Texture } from 'pixi.js';

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

export function intersectionOfArrays( arr1 : any[], arr2 : any[] ) {
    return arr1.filter( x => arr2.includes( x ) );
}

export function differenceOfArrays( arr1 : any[], arr2 : any[] ) {
    return arr1.filter( x => !arr2.includes( x ) );
}

export function symmetricDifferenceOfArrays( arr1 : any[], arr2 : any[] ) {
    return differenceOfArrays( arr1, arr2 ).concat( differenceOfArrays( arr2, arr1 ) );
}

export function validityOfMap( map : any ) {
    return Object.keys( map ).filter( v => map[ v ] !== null && map[ v ] !== undefined );
}

export function removeInvalidOfMap( map : Record<string, any> ) {
    let fails : string[] = null;
    Object.keys( map ).forEach( k => {
        if ( map[ k ] === undefined || map[ k ] === null ) {
            if ( !fails ) fails = [];
            fails.push( k );
            delete map[ k ];
        }
    } );
    return {
        passes: map,
        fails,
    };
}

export function pickKeysFromObject( o : Record<string, any>, keys : string[] ) {
    let r : Record<string, any> = Object.create( null );
    keys.forEach( k => {
        const v = o[ k ];
        if ( v !== undefined ) {
            r[ k ] = clone( v );
        }
    } );
    return r;
}

export function changeTexture( sprite : Sprite, source : string, fn? : ( texture : Texture ) => void ) {
    const texture = Texture.from( source );
    if ( texture.width === 1 && texture.height === 1 ) {
        texture.baseTexture.once( 'loaded', () => {
            sprite.texture = texture;
            fn && fn.call( null, texture );
        } );
    } else {
        sprite.texture = texture;
        fn && fn.call( null, texture );
    }
}