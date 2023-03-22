import { System } from './system';

export class InputSystem extends System {
    public get priority() : number {
        return 0;
    }

    public update( _delta : number ) : void {
    }

    protected _onDetached() : void {
    }

    protected _onPaused() : void {
    }

    protected _onResumed() : void {
    }

    protected _onStarted() : void {
    }
}