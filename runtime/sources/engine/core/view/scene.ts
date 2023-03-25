import { logger, Signals } from '../util';
import { NativeEventSystem } from '../system/native-event-system';
import { View } from './view';

export type TSceneOperation = 'squeezed' | 'restored' | 'purged';

export type TSceneTrigger = ( type : TSceneOperation ) => void;

export class Scene extends View {
    public onStackOperatedSignal : Signals<TSceneTrigger>;

    constructor() {
        super();

        this.onStackOperatedSignal = new Signals<TSceneTrigger>();
        this._running = false;
    }

    private _running : boolean;

    public get running() {
        return this._running;
    }

    protected _onStackOperated( type : TSceneOperation ) {
        switch ( type ) {
            case 'squeezed':
                this._onSqueezed();
                break;
            case 'restored':
                this._onRestored();
                break;
            case 'purged':
                this._onPurged();
                break;
        }
    }

    protected _onSqueezed() {
        this._running = false;
        this.renderable = false;
    }

    protected _onRestored() {
        this._running = true;
        this.renderable = true;
    }

    protected _onPurged() {
        this._running = false;
        this.renderable = false;
        this.destroy();
    }

    protected override _onCleanup() {
        this._onReset();
    }

    protected _onDataReceived( channel : string, data : any, next : Function ) {
        logger.debug( this.name, 'received', channel, data );
        next();
    }

    protected override _onInit() {
        this.onStackOperatedSignal.connect( this._onSqueezed, this );
        NativeEventSystem.shared.onWindowResized.connect( this._onWindowResized, this );
    }

    protected override _onReset() {
        this.onStackOperatedSignal.disconnect( this._onSqueezed, this );
        NativeEventSystem.shared.onWindowResized.disconnect( this._onWindowResized, this );
    }

    protected _onWindowResized() {
        logger.debug( this.name, 'window resized' );
    }
}