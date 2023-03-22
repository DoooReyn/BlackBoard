/**
 * @en execute progressively and return valid result of `execute`
 * @zh 渐进式递补执行并获取执行结果
 * @param {any[]} fallbacks
 * @param {(arg: any) => (any | undefined)} execute
 * @param {any} ctx
 * @returns {any | undefined}
 */
export function progressive<T extends any, K extends any>( fallbacks : K[], execute : ( arg : K ) => T | undefined, ctx : any ) : T | undefined {
    let result = undefined;
    for ( let i = 0; i < fallbacks.length; i++ ) {
        result = execute.call( ctx, fallbacks[ i ] );
        if ( result ) {
            return result as T;
        }
    }
    return undefined;
}

/**
 * 预填充
 * @param options 选项
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
 * 深拷贝
 * @param o 对象
 * @returns {any}
 */
export function clone( o : any ) {
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