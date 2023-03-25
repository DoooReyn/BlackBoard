/**
 * A value should be updated in per second
 */
import { TimeCounter } from '../../util';

export class SecUpdateValue {
    protected _count : number;
    protected _timeCounter : TimeCounter;

    constructor() {
        this._count = this._value = 0;
        this._timeCounter = new TimeCounter();
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
        if ( this._timeCounter.elapsed >= 1000 ) {
            this._value = this._count;
            this._count = 0;
            this._timeCounter.update();
        }
    }
}
