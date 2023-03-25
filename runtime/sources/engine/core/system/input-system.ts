import { Engine } from '../engine';
import { ESystemPriority, System } from './system';

export class InputSystem extends System {
    protected _onAttached( _engine : Engine ) : void {
    }

    protected _onDetached(_engine : Engine) : void {
    }

    protected _onPaused(_engine : Engine) : void {
    }

    protected _onResumed(_engine : Engine) : void {
    }

    protected _onStarted(_engine : Engine) : void {
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
    }

    public get priority() : number {
        return ESystemPriority.Input;
    }

    public secUpdate( _engine : Engine, _delta : number ) : void {
    }
}