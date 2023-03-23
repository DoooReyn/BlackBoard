import { ESystemPriority, System } from './system';

export class InputSystem extends System {
    protected _onDetached() : void {
    }

    protected _onPaused() : void {
    }

    protected _onResumed() : void {
    }

    protected _onStarted() : void {
    }

    public get priority() : number {
        return ESystemPriority.Input;
    }

    public update( _delta : number ) : void {
    }
}