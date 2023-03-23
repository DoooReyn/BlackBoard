/**
 * A system for adapting to multiple screen sizes
 */
import { ENativeEvent } from '../../../enum';
import type { Engine } from '../engine';
import { SecUpdateValue } from '../internal/sec-update-value';
import { ESystemPriority, System } from './system';

export class MultiScreenSystem extends System {
    private _sizeChanged : boolean;
    private _lastTime : number;
    private readonly _onWindowResizeFn : Function;

    constructor() {
        super();

        this._sizeChanged = false;
        this._lastTime = SecUpdateValue.now;
        this._onWindowResizeFn = this._onWindowResize.bind( this );
    }

    protected override _onAttached( engine : Engine ) {
        super._onAttached( engine );

        // @ts-ignore
        window.addEventListener( ENativeEvent.Resize, this._onWindowResizeFn );
    }

    protected _onDetached() : void {
        // @ts-ignore
        window.removeEventListener( ENativeEvent.Resize, this._onWindowResizeFn );
    }

    protected _onPaused() : void {
    }

    protected _onResumed() : void {
    }

    protected _onStarted() : void {
        this._sizeChanged = true;
    }

    public get priority() : number {
        return ESystemPriority.MultiScreen;
    }

    public update( _ : number ) : void {
        if ( SecUpdateValue.now - this._lastTime >= 1000 ) {
            this._lastTime = SecUpdateValue.now;
            if ( this._sizeChanged ) {
                this._resize();
                this._sizeChanged = false;
            }
        }
    }

    protected _onWindowResize() {
        this._sizeChanged = true;
    }

    /**
     * Resizing to fit for multiple screen.
     * - Overriding this interface to apply your own solution
     * @protected
     */
    protected _resize() {
        const { clientWidth, clientHeight } = document.documentElement;
        this.app.stage.transform.pivot.set( clientWidth * 0.5, clientHeight * 0.5 );
        this.app.renderer.resize( clientWidth, clientHeight );
    }

}