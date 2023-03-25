export class TimeCounter {
    private _lastTime : number;

    constructor() {
        this._lastTime = TimeCounter.now;
    }

    static get now() {
        return Date.now();
    }

    get last() {
        return this._lastTime;
    }

    get elapsed() {
        return TimeCounter.now - this._lastTime;
    }

    update() {
        this._lastTime = TimeCounter.now;
    }
}