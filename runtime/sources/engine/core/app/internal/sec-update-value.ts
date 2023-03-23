/**
 * A value should be updated in per second
 */
export class SecUpdateValue {
    protected _count : number;
    protected _lastTime : number;

    constructor() {
        this._count = this._value = 0;
        this._lastTime = SecUpdateValue.now;
    }

    /**
     * Current time
     * @returns {number}
     */
    public static get now() {
        return Date.now();
    }

    private _value : number;

    /**
     * The real value of `count`
     * @returns {number}
     */
    public get value() : number {
        return this._value;
    }

    /**
     * Updating in per second
     */
    update() : void {
        if ( SecUpdateValue.now - this._lastTime >= 1000 ) {
            this._value = this._count;
            this._count = 0;
            this._lastTime = SecUpdateValue.now;
        }
    }
}
