export namespace math {
    /**
     * 比较两个数是否近似相等
     * @param {number} a 数 a
     * @param {number} b 数 b
     * @param {number} precision 精度
     * @returns {boolean}
     */
    export function equals( a : number, b : number, precision : number = 6 ) {
        return Math.abs( a - b ) * Math.pow( 10, precision ) <= 1;
    }

    export function clamp( v : number, min : number, max : number ) {
        return Math.max( min, Math.min( v, max ) );
    }
}
