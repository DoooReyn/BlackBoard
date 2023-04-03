import { Engine } from '../engine';
import { KeyboardState } from '../util';
import { ESystemPriority, System } from './system';

export class InputSystem extends System {
    keyboard : KeyboardState;

    constructor() {
        super();
        this.keyboard = new KeyboardState();
    }

    private static _shared : InputSystem = null;

    public static get shared() {
        if ( !InputSystem._shared ) {
            InputSystem._shared = new InputSystem();
        }
        return InputSystem._shared;
    }

    protected _onAttached( _engine : Engine ) : void {
    }

    protected _onDetached( _engine : Engine ) : void {
    }

    protected _onPaused( _engine : Engine ) : void {
        this.keyboard.enabled = false;
    }

    protected _onResumed( _engine : Engine ) : void {
        this.keyboard.enabled = true;
    }

    protected _onStarted( _engine : Engine ) : void {
        this.keyboard.enabled = true;
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
    }

    public get priority() : number {
        return ESystemPriority.Input;
    }

    public secUpdate( _engine : Engine, _delta : number ) : void {
    }
}