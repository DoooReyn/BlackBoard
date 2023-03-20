/**
 * @en execute progressively and return valid result of `execute`
 * @zh 渐进式递补执行并获取执行结果
 * @param {any[]} fallbacks
 * @param {(arg: any) => (any | undefined)} execute
 * @returns {any | undefined}
 */
export function progressive<T extends any, K extends any>( fallbacks : K[], execute : ( arg : K ) => T | undefined ) : T | undefined {
    let result = undefined;
    for ( let i = 0; i < fallbacks.length; i++ ) {
        result = execute( fallbacks[ i ] );
        if ( result ) {
            return result as T;
        }
    }
    return undefined;
}

export function applyOptions( options : any, values : [ string, any ][] ) {
    values.forEach( v => {
        const [ key, val ] = v;
        if ( options[ key ] === undefined ) {
            options[ key ] = val;
        }
    } );
}
