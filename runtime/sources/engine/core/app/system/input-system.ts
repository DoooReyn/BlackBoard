import { Engine } from '../engine';
import { ESystemPriority, System } from './system';

export class InputSystem extends System {
    protected _onAttached( _engine : Engine ) : void {
    }

    protected _onDetached() : void {
    }

    protected _onPaused() : void {
    }

    protected _onResumed() : void {
    }

    protected _onStarted() : void {
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
    }

    public get priority() : number {
        return ESystemPriority.Input;
    }

    public secUpdate( _engine : Engine, _delta : number ) : void {
    }
}