export function isAsyncFunction( fn : Function ) {
    return fn.constructor.name === 'AsyncFunction';
}
