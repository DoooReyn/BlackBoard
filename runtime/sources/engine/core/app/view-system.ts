import { System } from './system';

export class ViewSystem extends System {
    public get priority() : number {
        return 1;
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