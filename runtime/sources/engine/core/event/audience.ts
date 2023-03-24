import { NextIDGenerator } from '../util';

type TReceiveFn = ( channel : string, data : any, next : Function ) => void;

export class Audience {
    protected _receiveFn : TReceiveFn;
    protected _receiveCtx : any;

    public constructor( fn : TReceiveFn, context : any ) {
        this._receiveFn = fn;
        this._receiveCtx = context;
        this._name = NextIDGenerator.nextWithKey( 'Audience' );
    }

    protected _name : string;

    get name() {
        return this._name;
    }

    public receive( channel : string, data : any, next : Function ) {
        this._receiveFn && this._receiveFn.call( this._receiveCtx, channel, data, next );
    }
}
