export class Lovely {
    private _grumpy : number;

    constructor() {
        this._grumpy = 0;
    }

    get lovely() {
        return this._grumpy > 0;
    }

    treat() {
        this._grumpy = 0;
    }

    trick() {
        this._grumpy++;
    }
}